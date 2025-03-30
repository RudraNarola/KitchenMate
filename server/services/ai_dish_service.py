import os
from dotenv import load_dotenv
import google.generativeai as genai
from flask import Blueprint, jsonify
import json

# Load environment variables
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Initialize the model
try:
    model = genai.GenerativeModel(model_name="gemini-2.0-flash")
except Exception as e:
    print(f"Error initializing model: {e}")
    exit()

ai_dish_bp = Blueprint('ai_dish', __name__)

def get_surplus_ingredients():
    """Get current surplus ingredients from inventory"""
    return [
        {"name": "Chicken Breast", "quantity": 15, "expiry_date": "2025-03-31"},
        {"name": "Fresh Basil", "quantity": 8, "expiry_date": "2025-03-30"},
        {"name": "Mozzarella", "quantity": 12, "expiry_date": "2025-04-01"},
        {"name": "Tomatoes", "quantity": 20, "expiry_date": "2025-03-29"},
        {"name": "Pasta", "quantity": 10, "expiry_date": "2025-04-06"},
    ]

def generate_ai_response(prompt):
    """Generate response from Gemini API"""
    try:
        response = model.generate_content(prompt)
        content = response.text.strip()

        # Clean up JSON response
        if content.startswith('```json'):
            content = content[7:]
        if content.endswith('```'):
            content = content[:-3]

        # Parse the JSON string into a Python object
        try:
            return json.loads(content)
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON response: {str(e)}")
            return {"dishes": []}
    except Exception as e:
        print(f"Error in generate_ai_response: {str(e)}")
        return {"dishes": []}

# @ai_dish_bp.route('/generate-dishes', methods=['POST'])
def generate_dishes_func(data):
    try:
        print("In generate dishes func")
        # data = request.get_json()
        generation_type = data.get('type')
        message = data.get('message', '')

        if generation_type == 'inventory':
            # Generate dishes based on current inventory
            surplus_ingredients = get_surplus_ingredients()
            prompt = f"""Create 2 creative dishes using these surplus ingredients: {surplus_ingredients}.
            and recipe for creating this dish: {message}

            Guidelines:
            - mandatory is to create a recipe for the with given ingredients
            - Use short, catchy names (max 3-4 words)
            - Use realistic market prices for ingredients
            - Include all ingredients, even small amounts
            - Cost should be between $10-30 per dish
            - Profit margin should be 20-35%
            - For each ingredient, specify exact quantity and unit (e.g., grams, cups, pieces)

            Format the response as JSON with this structure:
            {{
                "dishes": [
                    {{
                        "name": "string",
                        "description": "string",
                        "recipe": {{
                            "steps": [
                                "Step 1: ...",
                                "Step 2: ...",
                                "Step 3: ..."
                            ]
                        }},
                        "ingredients": [
                            {{
                                "name": "string",
                                "quantity": number,
                                "unit": "string"
                            }}
                        ],
                        "cost": number,
                        "profit_margin": number,
                        "special_occasion": boolean
                    }}
                ]
            }}"""

        elif generation_type == 'custom':
            # Generate dishes based on custom ingredients
            ingredients = data.get('ingredients', [])

            if not ingredients:
                return jsonify({
                    "success": False,
                    "message": "No ingredients provided"
                })

            prompt = f"""Create 2 creative dishes using these ingredients: {ingredients} and recipe for creating this dish: {message}

            Guidelines:
            - mandatory is to create a recipe for the with given ingredients and message
            - Use short, catchy names (max 3-4 words)
            - Use realistic market prices for ingredients
            - Include all ingredients, even small amounts
            - Cost should be between $10-30 per dish
            - Profit margin should be 20-35%

            Format the response as JSON with this structure:
            {{
                "dishes": [
                    {{
                        "name": "string",
                        "description": "string",
                        "recipe": {{
                            "steps": [
                                "Step 1: ...",
                                "Step 2: ...",
                                "Step 3: ..."
                            ]
                        }},
                        "ingredients": [
                            {{
                                "name": "string",
                                "quantity": number,
                                "unit": "string"
                            }}
                        ],
                        "cost": number,
                        "profit_margin": number,
                        "special_occasion": boolean
                    }}
                ]
            }}"""
        else:
            return jsonify({
                "success": False,
                "message": "Invalid generation type"
            })

        # Generate response from Gemini API
        response = generate_ai_response(prompt)
        print(response)
        if not response or "dishes" not in response:
            return jsonify({
                "success": False,
                "message": "Failed to generate dishes"
            })

        # Process each dish to ensure proper structure
        for dish in response["dishes"]:
            # Ensure recipe has proper structure
            if "recipe" not in dish:
                dish["recipe"] = {"steps": ["No recipe steps available."]}
            elif isinstance(dish["recipe"], str):
                # Convert string recipes to proper structure
                dish["recipe"] = {"steps": [dish["recipe"]]}
            elif not isinstance(dish["recipe"], dict):
                dish["recipe"] = {"steps": ["No recipe steps available."]}

            # Make sure steps exist in recipe
            # print(dish["recipe"])
            if "steps" not in dish["recipe"]:
                dish["recipe"]["steps"] = ["No steps provided."]

            # Handle ingredients
            if "ingredients" not in dish:
                dish["ingredients"] = []
            elif isinstance(dish["ingredients"], list):
                # Convert any string ingredients to proper structure
                dish["ingredients"] = [
                    {
                        "name": ing if isinstance(ing, str) else ing.get("name", ""),
                        "quantity": 1 if isinstance(ing, str) else ing.get("quantity", 1),
                        "unit": "unit" if isinstance(ing, str) else ing.get("unit", "unit")
                    }
                    for ing in dish["ingredients"]
                ]

            # Ensure other fields exist
            if "cost" not in dish:
                dish["cost"] = 0
            if "profit_margin" not in dish:
                dish["profit_margin"] = 0
            if "special_occasion" not in dish:
                dish["special_occasion"] = False

        return jsonify({
            "success": True,
            "dishes": response["dishes"]
        })

    except Exception as e:
        print(f"Error in generate_dishes: {str(e)}")
        return jsonify({
            "success": False,
            "message": str(e)
        })

