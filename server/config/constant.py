# filepath: /Users/jaivik/Downloads/mit-main/server/config.py
import os
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Base directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STORAGE_DIR = os.path.join(BASE_DIR, "storage")

# Storage directories
VIDEO_FOLDER = os.path.join(STORAGE_DIR, "uploaded_videos")
LIVE_FOLDER = os.path.join(STORAGE_DIR, "live_frames")
IMAGE_FOLDER = os.path.join(STORAGE_DIR, "uploaded_images")
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'jpg', 'jpeg', 'png', 'mp4', 'avi', 'mov'}
GRAPH_FOLDER = os.path.join(STORAGE_DIR, "graph_images")

# API Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL_NAME = "gemini-2.0-flash"

# Flask Configuration
DEBUG = os.getenv("DEBUG", "True").lower() == "true"
PORT = int(os.getenv("PORT", "8080"))
HOST = os.getenv("HOST", "0.0.0.0")
MAX_CONTENT_LENGTH = 160 * 1024 * 1024  # 16MB

# Database Configuration
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")

# High risk ingredients
HIGH_RISK_INGREDIENTS = {
    "chicken", "beef", "fish", "eggs", "milk", "cheese",
    "shellfish", "nuts", "peanuts", "soy", "wheat"
}

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Create required directories
for folder in [UPLOAD_FOLDER, VIDEO_FOLDER, LIVE_FOLDER, IMAGE_FOLDER, STORAGE_DIR, GRAPH_FOLDER]:
    os.makedirs(folder, exist_ok=True)
# Get absolute path to the server folder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")


# Define each model’s path
OBJECT_DETECTION_MODEL = os.path.join(
    MODELS_DIR, "weight", "custom_mix_dataset_yolov8_e10.pt")

SPOILAGE_CLASSIFIER_MODEL = os.path.join(
    MODELS_DIR, "weight", "resnet50_modify_fruit_spoilage.pth")
