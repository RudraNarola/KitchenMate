import os
import pandas as pd
from werkzeug.utils import secure_filename
from config.constant import UPLOAD_FOLDER, ALLOWED_EXTENSIONS, HIGH_RISK_INGREDIENTS


def allowed_file(filename):
    """Check if the uploaded file has an allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def save_upload_file(file):
    """Save the uploaded file to the uploads folder"""
    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    return filepath


def process_excel_file(filepath):
    """Process the uploaded Excel file (currently returns dummy data)"""
    # In a real app, you would read the Excel file here
    # For now, we'll generate dummy data
    import datetime

    dummy_data = {
        'date': [datetime.date.today().isoformat()] * 5,
        'ingredient': ['chicken', 'rice', 'vegetables', 'fish', 'eggs'],
        'consumption': [100, 200, 150, 80, 120]
    }
    df = pd.DataFrame(dummy_data)

    # Add high risk flag and type
    df["high_risk"] = df["ingredient"].apply(
        lambda x: x.lower() in HIGH_RISK_INGREDIENTS)
    df["type"] = "daily"

    # Convert to records
    return df.to_dict(orient="records")
