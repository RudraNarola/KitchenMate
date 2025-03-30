import json

from services.ai_service import generate_ai_response
from models.demand_ingredients import get_surplus_ingredients, get_current_menu  # Remove the "server." prefix

def create_daily_specials_prompt(surplus_ingredients):
    return f"""Create 2 daily special dishes using these surplus ingredients: {json.dumps(surplus_ingredients)}.
    Format the response as JSON with this structure:
    {{
        "daily_specials": [
            {{
                "name": "string",
                "ingredients": ["string"],
                "cost": number,
                "profit_margin": number,
                "special_occasion": true
            }}
        ]
    }}"""

def create_cost_optimization_prompt(current_menu):
    return f"""Suggest cost optimizations for this menu: {json.dumps(current_menu)}.
    Format the response as JSON with this structure:
    {{
        "cost_optimizations": [
            {{
                "item": "string",
                "current_cost": number,
                "suggested_cost": number,
                "potential_savings": number
            }}
        ]
    }}"""

def create_new_dishes_prompt(current_menu):
    return f"""Create 2 new dishes to complement this menu: {json.dumps(current_menu)}.
    Format the response as JSON with this structure:
    {{
        "new_dishes": [
            {{
                "name": "string",
                "ingredients": ["string"],
                "cost": number,
                "profit_margin": number,
                "special_occasion": false
            }}
        ]
    }}"""

def optimize_menu():
    """
    Generate menu optimizations using AI
    """
    try:
        surplus_ingredients = get_surplus_ingredients()
        current_menu = get_current_menu()

        # Generate AI responses with structured prompts
        daily_specials_prompt = create_daily_specials_prompt(surplus_ingredients)
        cost_optimization_prompt = create_cost_optimization_prompt(current_menu)
        new_dishes_prompt = create_new_dishes_prompt(current_menu)

        daily_specials = generate_ai_response(daily_specials_prompt)
        cost_optimizations = generate_ai_response(cost_optimization_prompt)
        new_dishes = generate_ai_response(new_dishes_prompt)

        result = {
            "daily_specials": daily_specials.get("daily_specials", []),
            "cost_optimizations": cost_optimizations.get("cost_optimizations", []),
            "new_dishes": new_dishes.get("new_dishes", [])
        }

        return result

    except Exception as e:
        print(f"Error in optimize_menu: {str(e)}")
        return {"error": str(e)}