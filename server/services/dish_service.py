from flask import request, jsonify
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from bson.objectid import ObjectId
from config.constant import logger, UPLOAD_FOLDER
import json

def add_dish(db):
    """Add a new dish to the database"""
    try:
        # Process form data
        name = request.form.get('name')
        price = float(request.form.get('price', 0))
        ingredients_json = request.form.get('ingredients', '[]')
        
        # Parse ingredients as JSON if it's a JSON string
        try:
            ingredients = json.loads(ingredients_json)
        except:
            # Fall back to comma-separated string if JSON parsing fails
            ingredients = [i.strip() for i in ingredients_json.split(',') if i.strip()]
        
        # Check for required fields
        if not name:
            return jsonify({"success": False, "message": "Dish name is required"}), 400
            
        # Process photo if present
        photo_url = ''
        if 'photo_file' in request.files:
            photo = request.files['photo_file']
            if photo.filename:
                filename = secure_filename(f"{int(datetime.now().timestamp())}_{photo.filename}")
                photo_path = os.path.join(UPLOAD_FOLDER, filename)
                photo.save(photo_path)
                photo_url = f"/uploads/{filename}"
        elif request.form.get('photo_url'):
            photo_url = request.form.get('photo_url')
        
        # Get current timestamp        
        current_time = datetime.now()
        
        # Create dish document - removed description and category
        dish = {
            "name": name,
            "price": price,
            "ingredients": ingredients,
            "photo": photo_url,
            "created_at": current_time,
            "updated_at": current_time  # Added updated_at field
        }
        
        # Insert to database
        result = db.dishes.insert_one(dish)
        
        # Get the ID of the inserted document
        dish_id = str(result.inserted_id)
        
        # Add ID to the dish object for the response
        dish['_id'] = dish_id
        
        # Format datetime for JSON serialization
        dish['created_at'] = dish['created_at'].isoformat()
        dish['updated_at'] = dish['updated_at'].isoformat()
        
        return jsonify({
            "success": True, 
            "message": "Dish added successfully",
            "dish_id": dish_id,
            "dish": dish  # Include the entire dish object with the response
        }), 201
        
    except Exception as e:
        logger.error(f"Error adding dish: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
        
def get_all_dishes(db):
    """Get all dishes from the database"""
    try:
        dishes = list(db.dishes.find())
        
        # Convert ObjectId to string for JSON serialization
        for dish in dishes:
            dish['_id'] = str(dish['_id'])
            if 'created_at' in dish:
                dish['created_at'] = dish['created_at'].isoformat()
            if 'updated_at' in dish:
                dish['updated_at'] = dish['updated_at'].isoformat()
                
        return jsonify({
            "success": True,
            "dishes": dishes
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting dishes: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

def get_dish(db, dish_id):
    """Get a specific dish by ID"""
    try:
        # Convert string ID to ObjectId
        try:
            object_id = ObjectId(dish_id)
        except:
            return jsonify({"success": False, "message": "Invalid dish ID"}), 400
        
        # Find dish in database
        dish = db.dishes.find_one({"_id": object_id})
        
        if not dish:
            return jsonify({"success": False, "message": "Dish not found"}), 404
        
        # Convert ObjectId to string for JSON serialization
        dish['_id'] = str(dish['_id'])
        if 'created_at' in dish:
            dish['created_at'] = dish['created_at'].isoformat()
        if 'updated_at' in dish:
            dish['updated_at'] = dish['updated_at'].isoformat()
        
        return jsonify({"success": True, "dish": dish}), 200
    
    except Exception as e:
        logger.error(f"Error getting dish: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

def delete_dish(db, dish_id):
    """Delete a dish by ID"""
    try:
        # Convert string ID to ObjectId
        try:
            object_id = ObjectId(dish_id)
        except:
            return jsonify({"success": False, "message": "Invalid dish ID"}), 400
        
        # Find the dish first to check if it exists and get photo path
        dish = db.dishes.find_one({"_id": object_id})
        
        if not dish:
            return jsonify({"success": False, "message": "Dish not found"}), 404
        
        # Delete the dish from database
        result = db.dishes.delete_one({"_id": object_id})
        
        # Check if deletion was successful
        if result.deleted_count == 1:
            # If dish had a photo that wasn't a URL, delete the file
            if dish.get('photo') and not dish['photo'].startswith('http'):
                try:
                    photo_path = os.path.join(UPLOAD_FOLDER, os.path.basename(dish['photo']))
                    if os.path.exists(photo_path):
                        os.remove(photo_path)
                        logger.info(f"Deleted photo file: {photo_path}")
                except Exception as e:
                    logger.warning(f"Failed to delete photo file: {e}")
            
            return jsonify({
                "success": True,
                "message": "Dish deleted successfully",
                "dish_id": dish_id
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "Failed to delete dish"
            }), 500
            
    except Exception as e:
        logger.error(f"Error deleting dish: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
    
    
def update_dish(db, dish_id):
    """Update a specific dish by ID"""
    try:
        # Convert string ID to ObjectId
        try:
            object_id = ObjectId(dish_id)
        except:
            return jsonify({"success": False, "message": "Invalid dish ID"}), 400
        
        # Get updated data from form
        update_data = {}
        
        if 'name' in request.form:
            update_data['name'] = request.form.get('name')
            
        if 'price' in request.form:
            update_data['price'] = float(request.form.get('price', 0))
            
        if 'ingredients' in request.form:
            ingredients_json = request.form.get('ingredients')
            try:
                update_data['ingredients'] = json.loads(ingredients_json)
            except:
                update_data['ingredients'] = [i.strip() for i in ingredients_json.split(',') if i.strip()]
        
        # Handle photo update if provided
        if 'photo_file' in request.files:
            photo = request.files['photo_file']
            if photo.filename:
                filename = secure_filename(f"{int(datetime.now().timestamp())}_{photo.filename}")
                photo_path = os.path.join(UPLOAD_FOLDER, filename)
                photo.save(photo_path)
                update_data['photo'] = f"/uploads/{filename}"
        elif 'photo_url' in request.form:
            update_data['photo'] = request.form.get('photo_url')
            
        # Always update the updated_at timestamp
        update_data['updated_at'] = datetime.now()
        
        # Update the document
        result = db.dishes.update_one(
            {"_id": object_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            return jsonify({"success": False, "message": "Dish not found"}), 404
            
        # Get the updated dish
        updated_dish = db.dishes.find_one({"_id": object_id})
        
        # Format for JSON response
        updated_dish['_id'] = str(updated_dish['_id'])
        if 'created_at' in updated_dish:
            updated_dish['created_at'] = updated_dish['created_at'].isoformat()
        if 'updated_at' in updated_dish:
            updated_dish['updated_at'] = updated_dish['updated_at'].isoformat()
        
        return jsonify({
            "success": True,
            "message": "Dish updated successfully",
            "dish": updated_dish
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating dish: {e}")
        return jsonify({"success": False, "message": str(e)}), 500