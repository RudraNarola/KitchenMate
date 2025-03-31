from flask import Blueprint
from api.handlers import (
    analyze_image_handler,
    dish_generation_handler,
    upload_live_frame_handler,
    upload_image_handler,
    upload_video_handler,
    upload_file_handler,
    optimize_menu_handler,
    health_check_handler,
    dish_handler,
    dish_detail_handler,
    menu_handler,
    menu_detail_handler,
    dish_delete_handler,
    serve_graph_image_handler,
    optimize_cost_handler,
    daily_specials_handler  # Add this import
)

# Create a blueprint for API routes
api_bp = Blueprint('api', __name__)

# Define routes for ingredient detection
api_bp.route("/upload_live_frame", methods=["POST"])(upload_live_frame_handler)
api_bp.route("/upload_image", methods=["POST"])(upload_image_handler)
api_bp.route("/upload_video", methods=["POST"])(upload_video_handler)

# Define routes for CSV data processing
api_bp.route("/upload_csv", methods=["POST", "OPTIONS"])(upload_file_handler)

api_bp.route("/optimize-menu", methods=["POST"])(optimize_menu_handler)

# Define routes for dishes
api_bp.route("/dishes", methods=["GET", "POST"])(dish_handler)
api_bp.route("/dishes/<dish_id>", methods=["GET"])(dish_detail_handler)
api_bp.route("/dishes/<dish_id>", methods=["DELETE"])(dish_delete_handler)
api_bp.route("/generate-dishes", methods=["POST"])(dish_generation_handler)

# Define routes for menus
api_bp.route("/menus", methods=["GET", "POST"])(menu_handler)
api_bp.route("/menus/<menu_id>", methods=["GET", "PUT", "DELETE"])(menu_detail_handler)
api_bp.route('/analyze-image', methods=['POST'])(analyze_image_handler)

# Route to serve graph images
api_bp.route('/graph_images/<filename>')(serve_graph_image_handler)

# Health check
api_bp.route("/health", methods=["GET"])(health_check_handler)

# Add backwards compatibility routes
api_bp.route("/get-dishes", methods=["GET"])(dish_handler)
api_bp.route("/add-dish", methods=["POST"])(dish_handler)

# Add cost optimization route
api_bp.route("/optimize-cost", methods=["POST"])(optimize_cost_handler)

# Add daily specials route
api_bp.route("/daily_specials", methods=["POST", "OPTIONS"])(daily_specials_handler)

@api_bp.route("/predict-ingredient", methods=["POST"])
def predict_ingredient():
    return predict_ingredient_handler()

@api_bp.route("/get-graphs", methods=["GET"])
def get_graphs():
    return get_graphs_handler()

@api_bp.route("/graphs/<path:graph_name>")
def get_graph(graph_name):
    return serve_graph(graph_name)