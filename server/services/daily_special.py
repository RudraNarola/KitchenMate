from typing import List, Dict, Any, Union
import json
import os
from bson import ObjectId
from datetime import datetime
from .get_special_dishes import optimize_menu
from utils.db import db  # Using the correct path to database

api_key = os.getenv("GEMINI_API_KEY")

def process_daily_specials(ingredients: Dict[str, Dict[str, int]]) -> List[Dict[str, Any]]:
    try:
        # Print the received ingredients for debugging
        # print("\n=== Received Ingredients from localStorage ===")
        # print(json.dumps(ingredients, indent=2))
        # print("===========================================\n")

        # Get the summary data
        summary = ingredients.get("summary", {})
        
        common_ingredients = {
            "Tomato": 5,"Onion": 4,"Potato": 6,"Carrot": 3,"Cabbage": 2,"Capsicum": 3,"Green Chilli": 4,"Ginger": 2,"Garlic": 3,"Coriander": 2,"Lemon": 3,"Rice": 5,"Wheat": 4,"Lentil": 3,"Black Gram": 2,"Green Gram": 3,"Coconut": 2,"Turmeric": 1,"Cumin": 1,"Salt": 1,"Garlic": 3,"Coriander": 2,"Lemon": 3,"Rice": 5,"Wheat": 4,"Lentil": 3,"Black Gram": 2,"Green Gram": 3,"Coconut": 2,"Turmeric": 1,"Cumin": 1,"Salt": 1
        }

        
        # Merge with existing ingredient counts
        ingredient_counts = {}
        for ingredient, counts in summary.items():
            total_count = counts.get("Fresh", 0) + counts.get("Spoiled", 0) + counts.get("Unknown", 0)
            ingredient_counts[ingredient] = total_count
            
        # Add common ingredients
        ingredient_counts.update(common_ingredients)
            
        # Write ingredient counts to JSON file
        with open("fresh_ingredients.json", "w") as f:
            json.dump(ingredient_counts, f, indent=2)

        # Fetch menu data from database
        menus_collection = db.menus
        dishes_collection = db.dishes
        
        # Get all menu documents
        menu_docs = list(menus_collection.find())
        
        # Convert ObjectId and datetime to string for JSON serialization
        for menu_doc in menu_docs:
            menu_doc['_id'] = str(menu_doc['_id'])
            if 'dishes' in menu_doc:
                menu_doc['dishes'] = [str(dish_id) for dish_id in menu_doc['dishes']]
            if 'created_at' in menu_doc:
                menu_doc['created_at'] = menu_doc['created_at'].isoformat()
            if 'updated_at' in menu_doc:
                menu_doc['updated_at'] = menu_doc['updated_at'].isoformat()
        
        # print("\n=== Menu Documents ===")
        # print(json.dumps(menu_docs, indent=2))
        # print("=====================\n")
        
        if not menu_docs:
            raise Exception("No menus found in database")
            
        # Process all menus
        all_dish_ids = []
        for menu_doc in menu_docs:
            # print(f"Processing menu: {menu_doc.get('name')}")
            # print(f"Dishes in menu: {menu_doc.get('dishes', [])}")
            all_dish_ids.extend(menu_doc.get("dishes", []))
        
        # print("\n=== All Dish IDs ===")
        # print(all_dish_ids)
        # print("===================\n")
        
        # Remove duplicates
        all_dish_ids = list(set(all_dish_ids))
        
        # Fetch all dishes and format them
        menu = {}
        for dish_id in all_dish_ids:
            # print(f"Fetching dish with ID: {dish_id}")
            dish = dishes_collection.find_one({"_id": ObjectId(dish_id)})
            if dish:
                # Convert ObjectId and datetime to string
                dish['_id'] = str(dish['_id'])
                if 'created_at' in dish:
                    dish['created_at'] = dish['created_at'].isoformat()
                if 'updated_at' in dish:
                    dish['updated_at'] = dish['updated_at'].isoformat()
                # print(f"Found dish: {dish}")
                # Convert ingredients array to dictionary format
                ingredients_dict = {}
                for ingredient in dish.get("ingredients", []):
                    ingredients_dict[ingredient["name"]] = ingredient["quantity"]
                
                menu[dish["name"]] = {
                    "ingredients": ingredients_dict
                }
        
        # print("\n=== Menu Data ===")
        # print(json.dumps(menu, indent=2))
        # print("================\n")
        # print(f"Menu: {menu}")
        # Get special dishes recommendations
        special_dishes = optimize_menu(api_key, ingredient_counts, menu)
        
        # Return the special dishes directly
        # print(f"Special dishes: {special_dishes}")
        return special_dishes.get("dishes", [])
        
    except Exception as e:
        print(f"Error processing daily specials: {str(e)}")
        raise 