from flask import Blueprint
from api.handlers import (
    upload_live_frame_handler,
    upload_image_handler,
    upload_video_handler,
    upload_file_handler,
    optimize_menu_handler,
    health_check_handler
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

# Health check
api_bp.route("/health", methods=["GET"])(health_check_handler)