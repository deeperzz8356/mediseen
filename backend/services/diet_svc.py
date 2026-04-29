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

def generate_meal_plan(calories: float, disease_rules: DietRules, req: DietGenerateRequest) -> DietResponse:
    """
    Algorithm:
    1. Determine target macros.
    2. Filter food database by diet_type, budget, and disease.avoid.
    3. Construct meals.
    """
    # Default macros: 30% P, 40% C, 30% F
    # Adjust based on disease restrictions
    p_percent, c_percent, f_percent = 0.30, 0.40, 0.30
    
    if disease_rules.restrictions.carb_cap_percent:
        c_percent = disease_rules.restrictions.carb_cap_percent / 100
        # Re-balance remaining 
        rem = 1.0 - c_percent
        p_percent = rem * 0.5
        f_percent = rem * 0.5

    protein_g = (calories * p_percent) / 4
    carbs_g = (calories * c_percent) / 4
    fats_g = (calories * f_percent) / 9

    # Mock Meal Mapping (In production, this queries the Food DB)
    # We will simulate a response for now to demonstrate the flow
    meals = [
        MealItem(meal="Breakfast", items=["Oats with Nuts", "Banana"], calories=calories * 0.25),
        MealItem(meal="Lunch", items=["Brown Rice", "Dal", "Salad"], calories=calories * 0.35),
        MealItem(meal="Snack", items=["Greek Yogurt" if req.diet_type == "veg" else "Boiled Egg"], calories=calories * 0.15),
        MealItem(meal="Dinner", items=["Paneer Tikka" if req.diet_type == "veg" else "Grilled Chicken", "Sautéed Veggies"], calories=calories * 0.25),
    ]

    return DietResponse(
        calories=round(calories),
        macros={"protein": round(protein_g), "carbs": round(carbs_g), "fats": round(fats_g)},
        meals=meals,
        avoid=disease_rules.avoid,
        recommended=disease_rules.recommended
    )
