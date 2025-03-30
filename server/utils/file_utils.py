import os
import datetime
from werkzeug.utils import secure_filename
from config.constant import logger, VIDEO_FOLDER, LIVE_FOLDER, IMAGE_FOLDER


def save_uploaded_file(file, folder_type="live"):
    """
    Saves an uploaded file to the appropriate directory.

    Args:
        file: The uploaded file from request.files
        folder_type: Type of folder to save to (live, image, or video)

    Returns:
        Tuple of (filename, filepath)
    """
    if not file or file.filename == '':
        raise ValueError("No file provided or empty filename")

    # Create a secure filename with timestamp
    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    base_filename = secure_filename(file.filename)
    extension = os.path.splitext(base_filename)[1]
    filename = f"{timestamp}_{folder_type}{extension}"

    # Determine the appropriate folder
    if folder_type == "live":
        folder = LIVE_FOLDER
    elif folder_type == "image":
        folder = LIVE_FOLDER
    elif folder_type == "video":
        folder = LIVE_FOLDER
    else:
        raise ValueError(f"Invalid folder type: {folder_type}")

    # Ensure the directory exists
    os.makedirs(folder, exist_ok=True)

    filepath = os.path.join(folder, filename)

    # Save the file
    file.save(filepath)
    logger.info(f"File saved: {filepath}")

    return filename, filepath
