from typing import List, Dict, Optional
from pydantic import BaseModel, Field

# --- Database Models (Internal/Pydantic) ---

class NutritionRestrictions(BaseModel):
    max_salt: Optional[float] = None  # in g
    max_sugar: Optional[float] = None # in g
    protein_limit: Optional[float] = None # in g/kg
    carb_cap_percent: Optional[float] = None # percentage of total cal
    max_oil_ml: Optional[float] = None
    max_spice_level: Optional[float] = None
    min_water_liters: Optional[float] = None
    min_fiber_g: Optional[float] = None

class DietRules(BaseModel):
    description: str = ""
    triggers: List[str] = []
    avoid: List[str] = []
    recommended: List[str] = []
    meal_rules: List[str] = []
    lifestyle: List[str] = []
    restrictions: NutritionRestrictions = Field(default_factory=NutritionRestrictions)

class DiseaseData(BaseModel):
    id: str
    name: str
    symptoms: List[str] = []
    precautions: List[str] = []
    diet_rules: DietRules

class FoodItem(BaseModel):
    id: str
    name: str
    type: str  # "protein", "carb", "fat"
    calories: float
    protein: float
    carbs: float
    fats: float
    tags: List[str] = [] # ["veg", "non-veg", "low-budget", "high-budget"]

class MealTemplate(BaseModel):
    id: str
    goal: str
    diet_type: str
    meals: List[str] # ["breakfast", "lunch", "snack", "dinner"]

# --- API Request/Response Models ---

class DietGenerateRequest(BaseModel):
    user_id: str
    disease: str
    weight: float
    height: float
    age: int
    gender: str # "male" | "female"
    activity_level: float # 1.2, 1.375, etc.
    goal: str # "cutting" | "bulking" | "maintenance"
    diet_type: str # "veg" | "non-veg"
    budget: str # "low" | "medium" | "high"

class MealItem(BaseModel):
    meal: str
    items: List[str]
    calories: float

class DietResponse(BaseModel):
    calories: float
    macros: Dict[str, float] # {"protein": x, "carbs": y, "fats": z}
    meals: List[MealItem]
    avoid: List[str]
    recommended: List[str]

class SwapRequest(BaseModel):
    food_item: str
    disease: str
    goal: str

class SwapResponse(BaseModel):
    alternatives: List[str]

class GroceryRequest(BaseModel):
    meal_plan: List[MealItem]

class GroceryResponse(BaseModel):
    items: List[str]

class FeedbackRequest(BaseModel):
    user_id: str
    weight_change: float
    adherence_level: float
    symptoms: List[str]

# --- Service Logic ---

def calculate_calories(req: DietGenerateRequest) -> float:
    """Calculates TDEE based on Mifflin-St Jeor."""
    # BMR
    bmr = (10 * req.weight) + (6.25 * req.height) - (5 * req.age)
    bmr = bmr + 5 if req.gender == "male" else bmr - 161
    
    tdee = bmr * req.activity_level
    
    if req.goal == "cutting":
        return tdee - 500
    elif req.goal == "bulking":
        return tdee + 400
    return tdee

from backend.services.firebase_svc import get_db

def generate_meal_plan(calories: float, disease_rules: DietRules, req: DietGenerateRequest) -> DietResponse:
    """
    Algorithm:
    1. Fetch all food items from DB.
    2. Filter by diet_type (veg/non-veg) and avoid list.
    3. Score foods based on 'recommended' list and therapeutic tags.
    4. Balance meals across categories (Breakfast, Lunch, Snack, Dinner).
    """
    db = get_db()
    food_docs = db.collection("foods").get()
    all_foods = []
    for doc in food_docs:
        data = doc.to_dict()
        if not data: continue
        try:
            all_foods.append(FoodItem(id=doc.id, **data))
        except Exception as e:
            print(f"WARNING: Skipping malformed food item {doc.id}: {e}")

    # 1. Filter phase
    filtered_foods = []
    avoid_lower = [a.lower() for a in disease_rules.avoid]
    recommended_lower = [r.lower() for r in disease_rules.recommended]
    
    for food in all_foods:
        # Diet type check
        if req.diet_type == "veg" and "non-veg" in food.tags:
            continue
        
        # Avoid list check (name or tags)
        is_avoided = False
        for a in avoid_lower:
            if a in food.name.lower() or any(a in t.lower() for t in food.tags):
                is_avoided = True
                break
        if is_avoided:
            continue
            
        filtered_foods.append(food)

    # 2. Scoring phase
    # Higher score = more recommended
    scored_foods = []
    for food in filtered_foods:
        score = 10 # Base score
        # Priority for recommended items
        for r in recommended_lower:
            if r in food.name.lower() or any(r in t.lower() for t in food.tags):
                score += 50
        
        # Specific therapeutic tag matches (e.g. "low-acid" if acidity)
        if "acidity" in req.disease.lower() and "low-acid" in food.tags:
            score += 30
        if "diabetes" in req.disease.lower() and "low-gi" in food.tags:
            score += 30
        if "hypertension" in req.disease.lower() and "low-sodium" in food.tags:
            score += 30

        scored_foods.append((score, food))
    
    # Sort by score descending
    scored_foods.sort(key=lambda x: x[0], reverse=True)
    best_foods = [f for s, f in scored_foods]

    # 3. Macro Target Calculation
    p_percent, c_percent, f_percent = 0.30, 0.40, 0.30
    if disease_rules.restrictions.carb_cap_percent:
        c_percent = disease_rules.restrictions.carb_cap_percent / 100
        rem = 1.0 - c_percent
        p_percent = rem * 0.5
        f_percent = rem * 0.5

    protein_g = (calories * p_percent) / 4
    carbs_g = (calories * c_percent) / 4
    fats_g = (calories * f_percent) / 9

    # 4. Meal Composition (Simplified selection)
    def pick_items(category_tags, count=2):
        items = []
        for f in best_foods:
            if any(t in f.tags for t in category_tags):
                items.append(f.name)
                if len(items) >= count:
                    break
        return items if items else ["Safe Balanced Meal"]

    meals = [
        MealItem(
            meal="Breakfast", 
            items=pick_items(["breakfast", "energy", "fruit", "easy-digest"]), 
            calories=round(calories * 0.25)
        ),
        MealItem(
            meal="Lunch", 
            items=pick_items(["staple", "lunch", "protein", "fiber"], 3), 
            calories=round(calories * 0.35)
        ),
        MealItem(
            meal="Snack", 
            items=pick_items(["snack", "fruit", "cooling", "hydrating"], 1), 
            calories=round(calories * 0.15)
        ),
        MealItem(
            meal="Dinner", 
            items=pick_items(["staple", "dinner", "protein", "easy-digest"], 2), 
            calories=round(calories * 0.25)
        ),
    ]

    # Validation: Check for empty meals
    for meal in meals:
        if not meal.items:
            meal.items = ["Steamed Vegetables", "Lentil Soup (Dal)"]

    return DietResponse(
        calories=round(calories),
        macros={"protein": round(protein_g), "carbs": round(carbs_g), "fats": round(fats_g)},
        meals=meals,
        avoid=disease_rules.avoid,
        recommended=disease_rules.recommended
    )
