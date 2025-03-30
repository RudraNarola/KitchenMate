from flask import Flask
from flask_cors import CORS
from api import api_bp
import config
from config import DEBUG, PORT, HOST

def create_app():
    app = Flask(__name__)
    
    # Register configuration
    app.config['MAX_CONTENT_LENGTH'] = config.MAX_CONTENT_LENGTH
    
    # Enable CORS
    CORS(app)
    
    # Register API blueprint
    app.register_blueprint(api_bp)
    
    return app

if __name__ == "__main__":
    app = create_app()
    print(f"Server running on http://{HOST}:{PORT}")
    # print(f"Videos will be saved to: {config.VIDEO_FOLDER}")
    # print(f"Live frames will be saved to: {config.LIVE_FOLDER}")
    # print(f"Images will be saved to: {config.IMAGE_FOLDER}")
    app.run(host=HOST, port=PORT, debug=DEBUG)