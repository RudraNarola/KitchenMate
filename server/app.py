# filepath: /Users/jaivik/Downloads/mit-main/server/app.py
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
from api import api_bp
from config.constant import DEBUG, PORT, HOST, MAX_CONTENT_LENGTH, UPLOAD_FOLDER

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)

    # Register configuration
    app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

    # Enable CORS
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Register API blueprint
    app.register_blueprint(api_bp)
    
    # Add route for static files
    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        return send_from_directory(UPLOAD_FOLDER, filename)
    
    # Add a root endpoint for health check
    @app.route('/')
    def index():
        return jsonify({
            "status": "running",
            "version": "1.0.0",
            "endpoints": [
                "/api/health",
                "/api/upload_image",
                "/api/upload_video",
                "/api/upload_live_frame",
                "/api/optimize-menu",
                "/api/menus",
                "/api/dishes"
            ]
        })

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=DEBUG, port=PORT, host=HOST)