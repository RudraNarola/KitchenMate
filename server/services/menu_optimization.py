import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Initialize the correct model
try:
    model = genai.GenerativeModel(model_name="gemini-2.0-flash")  # Ensure this model exists
except Exception as e:
    print(f"Error initializing model: {e}")
    exit()

def get_surplus_ingredients():
    return [
        {"name": "Chicken Breast", "quantity": 15, "expiry_date": "2024-03-25"},
        {"name": "Fresh Basil", "quantity": 8, "expiry_date": "2024-03-24"},
        {"name": "Mozzarella", "quantity": 12, "expiry_date": "2024-03-26"},
    ]

def get_current_menu():
    return [
        {
            "name": "Margherita Pizza",
            "ingredients": ["Dough", "Tomato Sauce", "Mozzarella", "Fresh Basil"],
            "cost": 8.50,
            "profit_margin": 30,
        },
        {
            "name": "Chicken Alfredo",
            "ingredients": ["Pasta", "Chicken Breast", "Cream", "Parmesan"],
            "cost": 12.75,
            "profit_margin": 25,
        },
    ]

def generate_ai_response(prompt):
    try:
        response = model.generate_content(prompt)  # Correct API call
        content = response.text.strip()

        # Ensure JSON response is well-formatted
        if content.startswith('```json'):
            content = content[7:]
        if content.endswith('```'):
            content = content[:-3]

        return json.loads(content)  # Convert to JSON
    except Exception as e:
        print(f"Error in generate_ai_response: {str(e)}")
        return {"error": str(e)}

def optimize_menu():
    try:
        surplus_ingredients = get_surplus_ingredients()
        current_menu = get_current_menu()

        # Generate AI responses with structured prompts
        daily_specials_prompt = f"""Create 2 daily special dishes using these surplus ingredients: {json.dumps(surplus_ingredients)}.
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

        cost_optimization_prompt = f"""Suggest cost optimizations for this menu: {json.dumps(current_menu)}.
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

        new_dishes_prompt = f"""Create 2 new dishes to complement this menu: {json.dumps(current_menu)}.
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
