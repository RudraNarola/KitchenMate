from ultralytics import YOLO
import cv2
import os
from config.constant import OBJECT_DETECTION_MODEL


def object_detection(image_path):
    # check if the image path is valid
    if not image_path or not isinstance(image_path, str) or os.path.isfile(image_path) is False:
        print("Invalid image path provided.")
        raise None

    image = cv2.imread(image_path)

    model = YOLO(OBJECT_DETECTION_MODEL)

    # Run inference
    results = model(image)

    return results

    # # run through the results and draw bounding boxes on the image and return the image
    # for result in results:
    #     for box in result.boxes:
    #         x1, y1, x2, y2 = map(int, box.xyxy[0])
    #         conf = box.conf[0]
    #         cls = int(box.cls[0])
    #         label = model.names[cls]

    #         print(
    #             f"Detected: {label} | Confidence: {conf:.2f} | BBox: {x1, y1, x2, y2}")

    #         # Draw bounding box and label on the image
    #         cv2.rectangle(image, (x1, y1), (x2, y2),
    #                       (0, 255, 0), 2)
    #         cv2.putText(image, f"{label} {conf:.2f}", (x1, y1 - 10),
    #                     cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    # return image


# Example usage
if __name__ == "__main__":
    image_path = "server/models/FirstModule/object_detection/images/1.jpg"
    image = object_detection(image_path)

    # show the image with detections
    cv2.imshow("Detections", image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
