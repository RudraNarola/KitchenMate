# filepath: /Users/jaivik/Downloads/mit-main/server/services/menu_crud.py
from flask import request, jsonify
from bson.objectid import ObjectId
from datetime import datetime
from config.constant import logger
from services.get_dummydata import get_dummy_ingredients

def create_menu(db):
    try:
        data = request.get_json()
        menu = {
            "name": data.get("name"),
            "description": data.get("description", ""),
            "dishes": data.get("dishes", []),  # Array of dish IDs
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        result = db.menus.insert_one(menu)
        menu["_id"] = str(result.inserted_id)
        
        return jsonify({
            "success": True,
            "message": "Menu created successfully",
            "menu": menu
        })
    
    except Exception as e:
        logger.error(f"Error creating menu: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Failed to create menu",
            "error": str(e)
        }), 500
    

def get_all_menus(db):
    try:
        menus = list(db.menus.find())
        
        # Convert ObjectId to string and format timestamps
        for menu in menus:
            menu["_id"] = str(menu["_id"])
            menu["created_at"] = menu["created_at"].isoformat() if "created_at" in menu else None
            menu["updated_at"] = menu["updated_at"].isoformat() if "updated_at" in menu else None
            
            # Fetch dish details for each menu
            if "dishes" in menu:
                dish_ids = menu["dishes"]
                dishes = list(db.dishes.find({"_id": {"$in": [ObjectId(id) for id in dish_ids]}}))
                menu["dishes"] = [{
                    "_id": str(dish["_id"]),
                    "name": dish["name"],
                    "photo": dish["photo"],
                    "price": dish["price"],
                    "ingredients": dish["ingredients"]
                } for dish in dishes]
        
        return jsonify({
            "success": True,
            "menus": menus
        })
    except Exception as e:
        logger.error(f"Error fetching menus: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Failed to fetch menus",
            "error": str(e)
        }), 500



def get_menu(db, menu_id):
    try:
        menu = db.menus.find_one({"_id": ObjectId(menu_id)})
        if not menu:
            return jsonify({
                "success": False,
                "message": "Menu not found"
            }), 404
            
        menu["_id"] = str(menu["_id"])
        menu["created_at"] = menu["created_at"].isoformat() if "created_at" in menu else None
        menu["updated_at"] = menu["updated_at"].isoformat() if "updated_at" in menu else None
        
        # Fetch dish details
        if "dishes" in menu:
            dish_ids = menu["dishes"]
            dishes = list(db.dishes.find({"_id": {"$in": [ObjectId(id) for id in dish_ids]}}))
            menu["dishes"] = [{
                "_id": str(dish["_id"]),
                "name": dish["name"],
                "photo": dish["photo"],
                "price": dish["price"],
                "ingredients": dish["ingredients"]
            } for dish in dishes]
        
        return jsonify({
            "success": True,
            "menu": menu
        })
    except Exception as e:
        logger.error(f"Error fetching menu: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Failed to fetch menu",
            "error": str(e)
        }), 500

def update_menu(db, menu_id):
    try:
        data = request.get_json()
        update_data = {
            "name": data.get("name"),
            "description": data.get("description"),
            "dishes": data.get("dishes"),
            "updated_at": datetime.now()
        }
        
        result = db.menus.update_one(
            {"_id": ObjectId(menu_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            return jsonify({
                "success": False,
                "message": "Menu not found"
            }), 404
            
        return jsonify({
            "success": True,
            "message": "Menu updated successfully"
        })
    except Exception as e:
        logger.error(f"Error updating menu: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Failed to update menu",
            "error": str(e)
        }), 500
    

def delete_menu(db, menu_id):
    try:
        result = db.menus.delete_one({"_id": ObjectId(menu_id)})
        
        if result.deleted_count == 0:
            return jsonify({
                "success": False,
                "message": "Menu not found"
            }), 404
            
        return jsonify({
            "success": True,
            "message": "Menu deleted successfully"
        })
    except Exception as e:
        logger.error(f"Error deleting menu: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Failed to delete menu",
            "error": str(e)
        }), 500 
    

def analyze_image(image_data):
    try:
        # Simulate processing time
        import time
        time.sleep(1)
        
        # Return dummy ingredients with quantities and units
        return get_dummy_ingredients()

    except Exception as e:
        logger.error(f"Error analyzing image: {e}")
        return [
            {"name": "Ingredient 1", "quantity": 100, "unit": "g"},
            {"name": "Ingredient 2", "quantity": 2, "unit": "tbsp"},
            {"name": "Ingredient 3", "quantity": 1, "unit": "pcs"}
        ]