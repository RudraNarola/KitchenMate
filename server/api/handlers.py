from venv import logger
from flask import jsonify, request
from models.SecondModule.predicit_ingredient import predict_ingredient
from services.ai_dish_service import generate_ai_response, get_surplus_ingredients
from utils.file_utils import save_uploaded_file
from services.ingredient_detector import IngredientDetector
from services.file_service import allowed_file, save_upload_file, process_excel_file
from services.menu_optimization import optimize_menu
from services.dish_service import add_dish, get_all_dishes, get_dish, delete_dish
from services.menu_service import analyze_image, create_menu, get_all_menus, get_menu, update_menu, delete_menu
from services.daily_special import process_daily_specials
from services.cost_effective import analyze_menu_costs
from utils.db import db
from bson import ObjectId

import json
import numpy as np

# Initialize the detector service
detector = IngredientDetector()


def upload_live_frame_handler():
    """Handler for live frame uploads"""
    try:
        if "frame" not in request.files:
            return jsonify({"error": "No frame provided"}), 400

        frame = request.files["frame"]

        # Save the frame
        filename, filepath = save_uploaded_file(frame, folder_type="live")

        # Detect ingredients
        detected_ingredients = detector.detect_from_image(filepath)
        
        return jsonify({
            "message": "Frame uploaded successfully",
            "filename": filename,
            "path": filepath,
            "ingredients": detected_ingredients
        })
    except Exception as e:
        from config.constant import logger
        logger.error(f"Error uploading frame: {str(e)}")
        return jsonify({"error": str(e)}), 500


def upload_image_handler():
    """Handler for image uploads"""
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image provided"}), 400

        image = request.files["image"]

        # Save the image
        filename, filepath = save_uploaded_file(image, folder_type="image")

        # Detect ingredients
        detected_ingredients = detector.detect_from_image(filepath)

        return jsonify({
            "message": "Image uploaded and analyzed successfully",
            "filename": filename,
            "path": filepath,
            "ingredients": detected_ingredients
        })
    except Exception as e:
        from config.constant import logger
        logger.error(f"Error uploading image: {str(e)}")
        return jsonify({"error": str(e)}), 500


def upload_video_handler():
    """Handler for video uploads"""
    try:
        if "video" not in request.files:
            return jsonify({"error": "No video provided"}), 400

        video = request.files["video"]

        # Save the video
        filename, filepath = save_uploaded_file(video, folder_type="video")

        # Process the video
        detected_ingredients = detector.detect_from_image(filepath)
        
        return jsonify({
            "message": "Video uploaded and analyzed successfully",
            "filename": filename,
            "path": filepath,
            "ingredients": detected_ingredients
        })
    except Exception as e:
        from config.constant import logger
        logger.error(f"Error uploading video: {str(e)}")
        return jsonify({"error": str(e)}), 500


def health_check_handler():
    """Health check endpoint"""
    return jsonify({"status": "ok"})

# New handlers converted from routes/api.py


def upload_file_handler():
    """Handler for Excel file uploads"""
    from config.constant import logger

    from config.constant import logger

    if request.method == "OPTIONS":
        return "", 200

    logger.debug("Received upload request")
    logger.debug(f"Request headers: {dict(request.headers)}")

    if "file" not in request.files:
        logger.error("No file in request")
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type. Only Excel files are allowed"}), 400

    try:
        # Save and process the file
        filepath = save_upload_file(file)
        logger.debug(f"File saved to: {filepath}")
        # print(f"File saved to")

        # Process the file (currently returns dummy data)
        result = predict_ingredient(filepath)

        logger.debug(f"Result: {result}")
        logger.debug(f"Type of result: {type(result)}")

        print(result["ingredient_requirements"])
        print(result["top_meal_details"])
        print(type(result["top_meal_details"]))
        print(type(result["ingredient_requirements"]))

        # Create a custom encoder to handle NumPy types
        class NumpyEncoder(json.JSONEncoder):
            def default(self, obj):
                if isinstance(obj, np.integer):
                    return int(obj)
                elif isinstance(obj, np.floating):
                    return float(obj)
                elif isinstance(obj, np.ndarray):
                    return obj.tolist()
                return super(NumpyEncoder, self).default(obj)

        # Convert NumPy types to native Python types
        ingredient_requirements = json.loads(json.dumps(
            result["ingredient_requirements"], cls=NumpyEncoder))
        top_meal_details = json.loads(json.dumps(
            result["top_meal_details"], cls=NumpyEncoder))

        # Return the processed result
        return jsonify({
            "success": True,
            "data": {
                "ingredient_requirements": ingredient_requirements,
                "top_meal_details": top_meal_details
            },
            "message": "File processed successfully"
        })

    except Exception as e:
        logger.error(f"Error processing file: {str(e)}")
        return jsonify({"error": str(e)}), 400

def optimize_menu_handler():
    """Handle menu optimization requests."""
    try:
        result = optimize_menu()
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in optimize_menu: {str(e)}")
        return jsonify({"error": str(e)}), 500

def dish_handler():
    """Handle dish-related requests."""
    # logger.debug("Near dish handler")
    if request.method == 'POST':
        return add_dish(db)
    else:  # GET
        return get_all_dishes(db)

def dish_detail_handler(dish_id):
    """Handle requests for a specific dish."""
    return get_dish(db, dish_id)

def dish_delete_handler(dish_id):
    """Handle requests to delete a specific dish."""
    return delete_dish(db, dish_id)

def dish_generation_handler():
    if request.method == 'OPTIONS':
        return jsonify({"success": True})
        
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            })
            
        generation_type = data.get('type')
        message = data.get('message', '')
        
        if not generation_type:
            return jsonify({
                "success": False,
                "message": "Generation type is required"
            })
            
        if generation_type == 'inventory':
            # Generate dishes based on current inventory
            surplus_ingredients = get_surplus_ingredients()
            prompt = f"""Create 2 creative dishes using these surplus ingredients: {surplus_ingredients}.
            and recipe for creating this dish: {message}
            
            Guidelines:
            - mandatory is to create a recipe for the dish
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
            - mandatory is to create a recipe for the dish
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
        
        if not response or "dishes" not in response:
            return jsonify({
                "success": False,
                "message": "Failed to generate dishes"
            })

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





def menu_handler():
    """Handle menu-related requests."""
    if request.method == 'POST':
        logger.debug("Near menu handler")
        return create_menu(db)
    else:  # GET
        return get_all_menus(db)

def menu_detail_handler(menu_id):
    """Handle requests for a specific menu."""
    if request.method == 'GET':
        return get_menu(db, menu_id)
    elif request.method == 'PUT':
        return update_menu(db, menu_id)
    elif request.method == 'DELETE':
        return delete_menu(db, menu_id)

def health_check_handler():
    """Simple health check endpoint."""
    return jsonify({"status": "healthy", "message": "API is running"})


def analyze_image_handler():
    
        if 'image_file' in request.files:
            image_file = request.files['image_file']
            ingredients = analyze_image(image_file)
        elif 'image_url' in request.form:
            image_url = request.form['image_url']
            ingredients = analyze_image(image_url)
        else:
            return jsonify({"error": "No image provided"}), 400

        return jsonify({"ingredients": ingredients})
   

def daily_specials_handler():
    """Handle daily specials requests based on available ingredients."""
    try:
        data = request.get_json()
        if not data or 'ingredients' not in data:
            return jsonify({"error": "No ingredients provided"}), 400

        ingredients = data['ingredients']
        result = process_daily_specials(ingredients)
        
        return jsonify({
            "success": True,
            "daily_specials": result,
            "ingredients_processed": len(ingredients)
        })
        
    except Exception as e:
        logger.error(f"Error processing daily specials: {str(e)}")
        return jsonify({"error": str(e)}), 500
   

def optimize_cost_handler():
    """Handle cost optimization requests."""
    try:
        data = request.get_json()
        if not data or 'menu_id' not in data:
            return jsonify({
                "success": False,
                "error": "No menu ID provided"
            }), 400

        # Get the menu ID from the request and convert to ObjectId
        try:
            menu_id = ObjectId(data['menu_id'])
        except Exception as e:
            logger.error(f"Invalid menu ID format: {str(e)}")
            return jsonify({
                "success": False,
                "error": "Invalid menu ID format"
            }), 400
        
        # Get menu from database
        menu = db.menus.find_one({'_id': menu_id})
        if not menu:
            logger.error(f"Menu not found with ID: {menu_id}")
            return jsonify({
                "success": False,
                "error": "Menu not found"
            }), 404

        # Get all dishes for this menu
        try:
            # The dishes field in menu contains dish IDs directly
            dish_ids = menu.get('dishes', [])
            
            # Convert string IDs to ObjectId
            dish_object_ids = [ObjectId(dish_id) for dish_id in dish_ids]
            dishes = list(db.dishes.find({'_id': {'$in': dish_object_ids}}))
        except Exception as e:
            logger.error(f"Error fetching dishes: {str(e)}")
            return jsonify({
                "success": False,
                "error": "Error fetching dishes"
            }), 500
        
        if not dishes:
            logger.error(f"No dishes found for menu: {menu_id}")
            return jsonify({
                "success": False,
                "error": "No dishes found for this menu"
            }), 404

        # Analyze costs and get recommendations
        try:
            recommendations = analyze_menu_costs(dishes)
        except Exception as e:
            logger.error(f"Error in analyze_menu_costs: {str(e)}")
            return jsonify({
                "success": False,
                "error": f"Error analyzing costs: {str(e)}"
            }), 500
        
        return jsonify({
            "success": True,
            "data": recommendations
        })
        
    except Exception as e:
        logger.error(f"Unexpected error in optimize_cost: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
   
