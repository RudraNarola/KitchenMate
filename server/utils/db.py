# filepath: /Users/jaivik/Downloads/mit-main/server/utils/db.py
from pymongo import MongoClient
from config.constant import logger, MONGO_URI

def get_database_connection():
    """
    Creates a connection to the MongoDB database
    
    Returns:
        database: MongoDB database connection
    """
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI)
        
        # Return database connection
        db = client.menu_optimization
        logger.info("Successfully connected to MongoDB")
        return db
    
    except Exception as e:
        logger.error(f"Error connecting to database: {e}")
        return None
    
db = get_database_connection()
if db is None:
    logger.error("Failed to connect to the database.")
else:
    logger.info("Database connection established successfully.")