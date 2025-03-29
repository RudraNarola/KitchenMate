from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# MongoDB connection
try:
    client = MongoClient(os.getenv('MONGODB_URI'))
    db = client['kitchenmate']
    client.server_info()
    print("Successfully connected to MongoDB!")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    db = None

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify server and database status"""
    try:
        if db is not None:
            db_status = "connected"
            client.server_info()
        else:
            db_status = "disconnected"
        
        return jsonify({
            "status": "healthy",
            "server": "running",
            "database": db_status
        }), 200
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "server": "running",
            "database": "error",
            "message": str(e)
        }), 500

@app.route('/', methods=['GET'])
def home():
    """Root endpoint"""
    return jsonify({
        "message": "Welcome to KitchenMate API",
        "version": "1.0.0"
    }), 200

if __name__ == '__main__':
    # Run the app on localhost
    app.run(host='127.0.0.1', port=5000, debug=True)
