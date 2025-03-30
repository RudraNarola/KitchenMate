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
UPLOAD_FOLDER = os.path.join(STORAGE_DIR, "uploaded_csv")
ALLOWED_EXTENSIONS = {'csv'}

# API Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL_NAME = "gemini-2.0-flash"

# Flask Configuration
DEBUG = True
PORT = 8080
HOST = '0.0.0.0'
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB

# Upload Configuration


# Create required directories
for folder in [UPLOAD_FOLDER, VIDEO_FOLDER, LIVE_FOLDER, IMAGE_FOLDER]:
    os.makedirs(folder, exist_ok=True)

# High risk ingredients
HIGH_RISK_INGREDIENTS = {
    "chicken", "beef", "fish", "eggs", "milk", "cheese",
    "shellfish", "nuts", "peanuts", "soy", "wheat"
}

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Get absolute path to the server folder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")


# Define each model’s path
OBJECT_DETECTION_MODEL = os.path.join(
    MODELS_DIR, "weight", "FridgeVision_Dataset_detection_n_2.pt")

SPOILAGE_CLASSIFIER_MODEL = os.path.join(
    MODELS_DIR, "weight", "resnet50_fruit_spoilage.pth")
