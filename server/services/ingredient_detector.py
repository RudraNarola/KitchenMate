from utils.mock_data import generate_mock_ingredients
from models.FirstModule import detect


class IngredientDetector:
    def __init__(self):
        # In a real app, you might initialize a ML model here
        pass

    def detect_from_image(self, image_path):
        result = detect.analyze_ingredients(image_path)
        # print("REsult", result)
        return result
        return generate_mock_ingredients(3, 6)

    def detect_from_frame(self, frame_path):
        result = detect.analyze_ingredients(frame_path)
        # print("REsult", result)
        return result

    def detect_from_video(self, video_path):
        result = detect.analyze_ingredients(video_path)
        # print("REsult", result)
        return result
