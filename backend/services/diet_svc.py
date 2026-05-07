from typing import List, Dict, Optional
import hashlib
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


def _clean_text(value: str) -> str:
    return (value or "").strip().lower()


def _food_text(food: FoodItem) -> str:
    return " ".join([food.name, food.type, " ".join(food.tags)]).lower()


def _matches_any(text: str, terms: List[str]) -> bool:
    return any(term and term in text for term in terms)


def _deterministic_offset(req: DietGenerateRequest, disease_rules: DietRules) -> int:
    seed = "|".join([
        req.user_id,
        req.disease,
        req.goal,
        req.diet_type,
        req.budget,
        ",".join(sorted(disease_rules.avoid)),
        ",".join(sorted(disease_rules.recommended)),
    ])
    digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()
    return int(digest[:8], 16)


def _meal_blueprint(meal_name: str, req: DietGenerateRequest, disease_rules: DietRules) -> dict:
    meal_lower = meal_name.lower()
    goal = _clean_text(req.goal)
    diet_type = _clean_text(req.diet_type)
    budget = _clean_text(req.budget)
    disease_lower = _clean_text(req.disease)

    base_weights = {
        "Breakfast": 0.25,
        "Lunch": 0.35,
        "Snack": 0.15,
        "Dinner": 0.25,
    }

    if meal_lower == "breakfast":
        tags = ["breakfast", "energy", "fruit", "easy-digest", "fiber"]
        exclusions = ["heavy", "fried"]
    elif meal_lower == "lunch":
        tags = ["protein", "staple", "fiber", "balanced", "lunch"]
        exclusions = ["sweet"]
    elif meal_lower == "snack":
        tags = ["snack", "fruit", "hydrating", "light", "cooling"]
        exclusions = ["heavy", "staple"]
    else:
        tags = ["dinner", "protein", "easy-digest", "staple", "vegetable"]
        exclusions = ["spicy", "fried"]

    if goal == "cutting":
        tags.extend(["lean", "low-calorie", "high-protein"])
    elif goal == "bulking":
        tags.extend(["energy-dense", "complex-carb", "protein"])
    else:
        tags.extend(["balanced", "whole-food"])

    if diet_type == "veg":
        tags.append("veg")
    else:
        tags.extend(["non-veg", "egg", "fish", "chicken"])

    if budget == "low":
        tags.extend(["low-budget", "budget"])
    elif budget == "high":
        tags.extend(["premium", "high-budget"])

    if "diabetes" in disease_lower:
        tags.append("low-gi")
    if "hypertension" in disease_lower:
        tags.append("low-sodium")
    if "acid" in disease_lower or "acidity" in disease_lower:
        tags.append("low-acid")

    if disease_rules.meal_rules:
        for rule in disease_rules.meal_rules:
            rule_text = _clean_text(rule)
            if rule_text:
                tags.append(rule_text)

    if disease_rules.lifestyle:
        for lifestyle_rule in disease_rules.lifestyle:
            rule_text = _clean_text(lifestyle_rule)
            if rule_text:
                tags.append(rule_text)

    return {
        "share": base_weights[meal_name],
        "tags": tags,
        "exclusions": exclusions,
    }


def _score_food_for_meal(food: FoodItem, req: DietGenerateRequest, disease_rules: DietRules, blueprint: dict) -> float:
    text = _food_text(food)
    score = 10.0

    budget = _clean_text(req.budget)
    goal = _clean_text(req.goal)
    diet_type = _clean_text(req.diet_type)
    disease = _clean_text(req.disease)

    avoid_terms = [_clean_text(item) for item in disease_rules.avoid]
    recommended_terms = [_clean_text(item) for item in disease_rules.recommended]
    blueprint_tags = [tag for tag in blueprint["tags"] if tag]

    if _matches_any(text, recommended_terms):
        score += 45
    if _matches_any(text, avoid_terms):
        score -= 120

    if _matches_any(text, blueprint_tags):
        score += 35

    food_tags = {tag.lower() for tag in food.tags}
    if diet_type == "veg" and "non-veg" in food_tags:
        score -= 200
    if diet_type == "non-veg" and any(tag in food_tags for tag in {"egg", "fish", "chicken", "meat"}):
        score += 10

    if budget == "low":
        if "low-budget" in food_tags or "budget" in food_tags:
            score += 25
        if "high-budget" in food_tags or "premium" in food_tags:
            score -= 10
    elif budget == "medium":
        if "low-budget" in food_tags or "high-budget" in food_tags:
            score += 4
    elif budget == "high":
        if "high-budget" in food_tags or "premium" in food_tags:
            score += 18

    if goal == "cutting":
        if any(tag in food_tags for tag in {"lean", "protein", "low-calorie", "high-protein"}):
            score += 18
        score -= max(0.0, food.calories / 50.0)
    elif goal == "bulking":
        if any(tag in food_tags for tag in {"energy-dense", "complex-carb", "protein"}):
            score += 18
        score += min(food.calories / 60.0, 15.0)
    else:
        if any(tag in food_tags for tag in {"balanced", "whole-food"}):
            score += 12

    if "diabetes" in disease:
        if any(tag in food_tags for tag in {"low-gi", "fiber"}):
            score += 25
        if any(tag in food_tags for tag in {"sugar", "sweet"}):
            score -= 25
    if "hypertension" in disease:
        if "low-sodium" in food_tags:
            score += 25
        if any(tag in food_tags for tag in {"salty", "processed"}):
            score -= 20
    if "acidity" in disease or "acid" in disease:
        if "low-acid" in food_tags or any(tag in food_tags for tag in {"cooling", "easy-digest"}):
            score += 18
        if any(tag in food_tags for tag in {"spicy", "fried"}):
            score -= 25

    if any(tag in food_tags for tag in {"breakfast", "energy", "fruit", "easy-digest"}) and blueprint["share"] == 0.25:
        score += 8
    if any(tag in food_tags for tag in {"protein", "staple", "fiber"}) and blueprint["share"] == 0.35:
        score += 8
    if any(tag in food_tags for tag in {"snack", "fruit", "hydrating", "light"}) and blueprint["share"] == 0.15:
        score += 8
    if any(tag in food_tags for tag in {"dinner", "easy-digest", "vegetable"}) and blueprint["share"] == 0.25:
        score += 8

    if _matches_any(text, blueprint["exclusions"]):
        score -= 15

    return score


def _build_meal_items(
    ranked_foods: List[FoodItem],
    req: DietGenerateRequest,
    disease_rules: DietRules,
    meal_name: str,
    calorie_share: float,
    start_index: int,
    used_foods: set[str],
) -> tuple[List[str], int]:
    blueprint = _meal_blueprint(meal_name, req, disease_rules)
    meal_candidates = []

    for food in ranked_foods:
        text = _food_text(food)
        if _matches_any(text, disease_rules.avoid):
            continue
        if req.diet_type == "veg" and "non-veg" in {tag.lower() for tag in food.tags}:
            continue

        score = _score_food_for_meal(food, req, disease_rules, blueprint)
        meal_candidates.append((score, food))

    meal_candidates.sort(key=lambda item: item[0], reverse=True)

    if not meal_candidates:
        return ["Steamed vegetables", "Lentil soup", "Whole grains"], start_index

    ordered_foods = [food for _, food in meal_candidates]
    window = ordered_foods[start_index:] + ordered_foods[:start_index]

    selected: List[FoodItem] = []
    selected_ids: set[str] = set()

    def pick(preferred_terms: List[str]) -> Optional[FoodItem]:
        best_choice = None
        best_bonus = -9999.0
        for food in window:
            if food.id in selected_ids or food.id in used_foods:
                continue
            text = _food_text(food)
            bonus = 0.0
            if _matches_any(text, preferred_terms):
                bonus += 20.0
            if _matches_any(text, disease_rules.recommended):
                bonus += 15.0
            if _matches_any(text, disease_rules.avoid):
                bonus -= 100.0
            if bonus > best_bonus:
                best_bonus = bonus
                best_choice = food
        return best_choice

    primary = pick(["protein", "staple", "balanced", "lean", "egg", "chicken", "fish"])
    if primary:
        selected.append(primary)
        selected_ids.add(primary.id)

    secondary = pick(["fiber", "vegetable", "fruit", "carb", "whole", "salad"])
    if secondary and secondary.id not in selected_ids:
        selected.append(secondary)
        selected_ids.add(secondary.id)

    tertiary = pick(blueprint["tags"])
    if tertiary and tertiary.id not in selected_ids:
        selected.append(tertiary)
        selected_ids.add(tertiary.id)

    if not selected:
        selected = ordered_foods[:2]

    used_foods.update(food.id for food in selected)

    items = [food.name for food in selected[:3]]
    if len(items) < 2:
        items.extend(["Seasonal vegetables", "Whole grain side"][: 2 - len(items)])

    # Add a detailed but concise prep cue so the plan feels more specific.
    cue = "balanced"
    if calorie_share >= 0.35:
        cue = "larger portion"
    elif calorie_share <= 0.15:
        cue = "light portion"
    items[-1] = f"{items[-1]} ({cue})"

    return items[:3], (start_index + len(selected)) % max(len(ordered_foods), 1)

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
    if not db:
        return DietResponse(
            calories=round(calories),
            macros={"protein": round((calories * 0.3) / 4), "carbs": round((calories * 0.4) / 4), "fats": round((calories * 0.3) / 9)},
            meals=[
                MealItem(meal="Breakfast", items=["Oats with fruit", "Greek yogurt", "Seeds"], calories=round(calories * 0.25)),
                MealItem(meal="Lunch", items=["Brown rice", "Protein bowl", "Mixed vegetables"], calories=round(calories * 0.35)),
                MealItem(meal="Snack", items=["Fruit", "Nuts", "Herbal tea"], calories=round(calories * 0.15)),
                MealItem(meal="Dinner", items=["Soup", "Steamed vegetables", "Light protein"], calories=round(calories * 0.25)),
            ],
            avoid=disease_rules.avoid,
            recommended=disease_rules.recommended,
        )

    food_docs = db.collection("foods").get()
    all_foods: List[FoodItem] = []
    for doc in food_docs:
        data = doc.to_dict() or {}
        try:
            all_foods.append(FoodItem(id=doc.id, **data))
        except Exception:
            # Skip malformed records instead of failing the whole plan.
            continue

    if not all_foods:
        return DietResponse(
            calories=round(calories),
            macros={"protein": round((calories * 0.3) / 4), "carbs": round((calories * 0.4) / 4), "fats": round((calories * 0.3) / 9)},
            meals=[
                MealItem(meal="Breakfast", items=["Oats with fruit", "Greek yogurt", "Seeds"], calories=round(calories * 0.25)),
                MealItem(meal="Lunch", items=["Brown rice", "Protein bowl", "Mixed vegetables"], calories=round(calories * 0.35)),
                MealItem(meal="Snack", items=["Fruit", "Nuts", "Herbal tea"], calories=round(calories * 0.15)),
                MealItem(meal="Dinner", items=["Soup", "Steamed vegetables", "Light protein"], calories=round(calories * 0.25)),
            ],
            avoid=disease_rules.avoid,
            recommended=disease_rules.recommended,
        )

    # 1. Meal-specific scoring and diversity planning
    ranked_foods: List[FoodItem] = sorted(
        all_foods,
        key=lambda food: _score_food_for_meal(
            food,
            req,
            disease_rules,
            {"share": 0.25, "tags": [], "exclusions": []},
        ),
        reverse=True,
    )

    offset = _deterministic_offset(req, disease_rules) % len(ranked_foods)
    ranked_foods = ranked_foods[offset:] + ranked_foods[:offset]

    # 2. Macro Target Calculation
    p_percent, c_percent, f_percent = 0.30, 0.40, 0.30
    if disease_rules.restrictions.carb_cap_percent:
        c_percent = disease_rules.restrictions.carb_cap_percent / 100
        rem = 1.0 - c_percent
        p_percent = rem * 0.5
        f_percent = rem * 0.5

    if req.goal == "cutting":
        p_percent, c_percent, f_percent = 0.35, 0.30, 0.35
    elif req.goal == "bulking":
        p_percent, c_percent, f_percent = 0.30, 0.50, 0.20

    # Respect disease-specific restrictions when provided.
    if disease_rules.restrictions.protein_limit and req.weight > 0:
        max_protein_g = disease_rules.restrictions.protein_limit * req.weight
        protein_g = min((calories * p_percent) / 4, max_protein_g)
        remaining_calories = max(calories - (protein_g * 4), 0)
        carbs_g = (remaining_calories * (c_percent / max(c_percent + f_percent, 0.001))) / 4
        fats_g = (remaining_calories * (f_percent / max(c_percent + f_percent, 0.001))) / 9
    else:
        protein_g = (calories * p_percent) / 4
        carbs_g = (calories * c_percent) / 4
        fats_g = (calories * f_percent) / 9

    # 3. Meal Composition with diversity constraints
    meals: List[MealItem] = []
    used_food_ids: set[str] = set()
    meal_plan = [
        ("Breakfast", 0.25),
        ("Lunch", 0.35),
        ("Snack", 0.15),
        ("Dinner", 0.25),
    ]

    for meal_name, share in meal_plan:
        items, offset = _build_meal_items(
            ranked_foods,
            req,
            disease_rules,
            meal_name,
            share,
            offset,
            used_food_ids,
        )
        meals.append(MealItem(meal=meal_name, items=items, calories=round(calories * share)))

    # Validation: Check for empty meals
    for meal in meals:
        if not meal.items:
            meal.items = ["Steamed Vegetables", "Lentil Soup (Dal)"]

    # Improve the explanation density in the existing response shape by widening recommendations.
    recommended = list(dict.fromkeys(disease_rules.recommended + [
        "Hydrate throughout the day",
        "Prefer minimally processed foods",
    ]))
    avoid = list(dict.fromkeys(disease_rules.avoid))

    return DietResponse(
        calories=round(calories),
        macros={"protein": round(protein_g), "carbs": round(carbs_g), "fats": round(fats_g)},
        meals=meals,
        avoid=avoid,
        recommended=recommended
    )
