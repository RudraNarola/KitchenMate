import random
from models.ingredient import Ingredient 

# Mock ingredients data for demonstration
MOCK_INGREDIENTS = [
    {"name": "Tomato", "unit": "piece"},
    {"name": "Onion", "unit": "piece"},
    {"name": "Potato", "unit": "piece"},
    {"name": "Carrot", "unit": "piece"},
    {"name": "Bell Pepper", "unit": "piece"},
    {"name": "Cucumber", "unit": "piece"},
    {"name": "Garlic", "unit": "clove"},
    {"name": "Lemon", "unit": "piece"},
    {"name": "Chicken", "unit": "gram"},
    {"name": "Rice", "unit": "cup"},
    {"name": "Pasta", "unit": "gram"},
    {"name": "Olive Oil", "unit": "tbsp"},
    {"name": "Salt", "unit": "tsp"},
    {"name": "Black Pepper", "unit": "tsp"}
]

def generate_mock_ingredients(min_count, max_count):
    """Generate mock ingredient detection data"""
    num_ingredients = random.randint(min_count, max_count)
    selected_ingredients = random.sample(MOCK_INGREDIENTS, num_ingredients)
    
    detected = []
    for ingredient in selected_ingredients:
        # Random confidence between 70-99%
        confidence = round(random.uniform(0.70, 0.99), 2)
        
        # Random quantity based on the unit type
        if ingredient["unit"] in ["piece", "clove"]:
            quantity = random.randint(1, 5)
        elif ingredient["unit"] in ["cup"]:
            quantity = round(random.uniform(0.25, 2.0), 2)
        elif ingredient["unit"] in ["tsp", "tbsp"]:
            quantity = round(random.uniform(0.5, 3.0), 1)
        else:  # grams
            quantity = random.randint(50, 500)
        
        ing = Ingredient(
            name=ingredient["name"],
            unit=ingredient["unit"],
            quantity=quantity,
            confidence=confidence
        )
        
        detected.append(ing.to_dict())
    
    return detected