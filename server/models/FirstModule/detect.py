import cv2
import os
import tempfile
from models.FirstModule.object_detection.inference import object_detection
from models.FirstModule.spoilage_classifier.inference import SpoilageClassifier
from config.constant import OBJECT_DETECTION_MODEL, SPOILAGE_CLASSIFIER_MODEL


# OBJECT_DETECTION_MODEL = 'server/models/FirstModule/object_detection/FridgeVision_Dataset_detection_n_2.pt'
# SPOILAGE_CLASSIFIER_MODEL = 'R:/Projects/hacknuthon/KitchenMate/server/models/FirstModule/spoilage_classifier/resnet50_fruit_spoilage.pth'


def analyze_ingredients(image_path):
    """
    Analyze an image to detect ingredients and classify their freshness

    Args:
        image_path: Path to the image to analyze

    Returns:
        Dict containing detection results and ingredient statistics
    """

    # Check if image exists
    if not os.path.exists(image_path):
        print(f"Image not found: {image_path}")
        raise None

    # Initialize the spoilage classifier
    classifier = SpoilageClassifier(SPOILAGE_CLASSIFIER_MODEL)
    if not classifier:
        print("Error loading spoilage classifier model")
        return None

    # Load image for visualization
    image = cv2.imread(image_path)
    if image is None:
        print(f"Error loading image: {image_path}")
        raise None

    # Detect objects
    results = object_detection(image_path)

    # Process results
    detected_objects = []
    summary = {}  # To keep track of counts by class and health status
    annotated_image = image.copy()

    for result in results:
        for box in result.boxes:
            # Get bounding box coordinates
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            conf = float(box.conf[0])
            cls = int(box.cls[0])
            label = result.names[cls]

            # Crop the detected object
            cropped_obj = image[y1:y2, x1:x2]

            # Use tempfile to save the cropped image temporarily
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_file:
                temp_crop_path = temp_file.name
                cv2.imwrite(temp_crop_path, cropped_obj)

            # Classify the spoilage status
            try:
                spoilage_result = classifier.predict(temp_crop_path)
                spoilage_class = spoilage_result['class']
                spoilage_conf = spoilage_result['confidence']
            except Exception as e:
                spoilage_class = "Unknown"
                spoilage_conf = 0
                print(f"Error classifying object: {e}")
            finally:
                # Remove temporary file
                if os.path.exists(temp_crop_path):
                    os.remove(temp_crop_path)

            # Map specific spoilage class to generic category
            generic_status = "Unknown"
            if spoilage_class.startswith("Fresh"):
                generic_status = "Fresh"
            elif spoilage_class.startswith("Rotten"):
                generic_status = "Spoiled"

            # Create the object details
            obj_details = {
                "ingredient": label,
                "detection_confidence": conf,
                "health_status": spoilage_class,
                "health_confidence": spoilage_conf,
                "bounding_box": (x1, y1, x2, y2)
            }
            detected_objects.append(obj_details)

            # Update the summary counts
            if label not in summary:
                summary[label] = {"Fresh": 0, "Spoiled": 0, "Unknown": 0}

            summary[label][generic_status] += 1

            # Annotate the image
            color = (0, 255, 0) if generic_status == "Fresh" else (0, 0, 255)
            cv2.rectangle(annotated_image, (x1, y1), (x2, y2), color, 2)
            cv2.putText(annotated_image, f"{label}: {spoilage_class}", (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

    # Calculate totals
    total_items = len(detected_objects)
    total_fresh = sum(s["Fresh"] for s in summary.values())
    total_spoiled = sum(s["Spoiled"] for s in summary.values())

    # Return the analysis results
    return {
        "detected_objects": detected_objects,
        "summary": summary,
        "total_items": total_items,
        "total_fresh": total_fresh,
        "total_spoiled": total_spoiled,
        # "annotated_image": annotated_image
    }


# Example usage
if __name__ == "__main__":
    image_path = "server/models/FirstModule/images/1.jpg"
    spoilage_model_path = "server/models/FirstModule/spoilage_classifier/resnet50_fruit_spoilage.pth"

    results = analyze_ingredients(image_path)

    # Print the summary
    print(f"Total items detected: {results['total_items']}")
    print(f"Fresh items: {results['total_fresh']}")
    print(f"Spoiled items: {results['total_spoiled']}")

    print("\nDetailed summary:")
    for ingredient, status in results['summary'].items():
        print(
            f"{ingredient}: {status['Fresh']} fresh, {status['Spoiled']} spoiled")

    # Display the annotated image
    cv2.imshow("Analyzed Ingredients", results["annotated_image"])
    cv2.waitKey(0)
    cv2.destroyAllWindows()
