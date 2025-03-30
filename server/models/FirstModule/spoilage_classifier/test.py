# For using in another script
import glob
from inference import SpoilageClassifier
import os

classifier = SpoilageClassifier(
    "R:/Projects/hacknuthon/visual-inventory-tracking/spoilage_classifier/resnet50_fruit_spoilage.pth")

# # Single image prediction
result = classifier.predict(
    "R:/Projects/hacknuthon/visual-inventory-tracking/spoilage_classifier/images/FreshGrape (104).jpg")
print(
    f"The item is {result['class']} with {result['confidence']:.2f}% confidence")

# Process multiple images
# for img_path in glob.glob("images/*.jpg"):
# result = classifier.visualize_prediction(
#     img_path, f"results/{os.path.basename(img_path)}")
# print(f"{img_path}: {result['class']}")
