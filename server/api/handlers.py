from venv import logger
from flask import jsonify, request
from utils.file_utils import save_uploaded_file
from services.ingredient_detector import IngredientDetector
from services.file_service import allowed_file, save_upload_file, process_excel_file
from services.menu_optimization import optimize_menu
from services.dish_service import add_dish, get_all_dishes, get_dish,delete_dish
from services.menu_service import analyze_image, create_menu, get_all_menus, get_menu, update_menu, delete_menu
from utils.db import db


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

        # Process the file (currently returns dummy data)
        result = process_excel_file(filepath)
        logger.debug(f"Successfully processed {len(result)} records")

        return jsonify(result)

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
   
