import torch
import torchvision.transforms as transforms
from PIL import Image
import matplotlib.pyplot as plt
import os
import argparse
from torchvision import models
import cv2
import numpy as np
from config.constant import SPOILAGE_CLASSIFIER_MODEL

import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import matplotlib.pyplot as plt
import cv2
import numpy as np
import os


class SpoilageClassifier:
    def __init__(self, model_path):
        # Set device
        self.device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu")
        print(f"Using device: {self.device}")

        # Load the model architecture
        self.model = self.load_model()

        # Load the trained weights
        self.model.load_state_dict(torch.load(
            model_path, map_location=self.device))
        self.model.to(self.device)
        self.model.eval()

        # Define image preprocessing
        self.transform = transforms.Compose([
            transforms.Resize((128, 128)),
            transforms.ToTensor(),
            # No normalization in the notebook, so we don't apply it here
        ])

        # Class mapping
        self.classes = {0: "Rotten", 1: "Fresh"}

    def load_model(self):
        # Load pre-trained ResNet-50 model
        resnet = models.resnet50(pretrained=False)
        num_features = resnet.fc.in_features  # Should be 2048

        # Recreate the exact same FC structure as in training
        resnet.fc = nn.Sequential(
            nn.Linear(num_features, 1024),
            nn.ReLU(),
            nn.Dropout(0.4),

            nn.Linear(1024, 512),
            nn.ReLU(),
            nn.Dropout(0.3),

            nn.Linear(512, 128),
            nn.ReLU(),
            nn.Dropout(0.2),

            nn.Linear(128, 28),
            nn.ReLU(),
            nn.Dropout(0.1),

            nn.Linear(28, 1)  # No Sigmoid (BCEWithLogitsLoss was used)
        )

        return resnet

    def predict(self, image_path):
        """Predict whether an image contains fresh or rotten produce"""
        # Load and preprocess image
        image = Image.open(image_path).convert("RGB")
        image_tensor = self.transform(image).unsqueeze(0).to(self.device)

        # Make prediction
        with torch.no_grad():
            output = self.model(image_tensor)
            # Convert logit to probability
            probability = torch.sigmoid(output).item()
            # Threshold at 0.5
            prediction = 1 if probability >= 0.2 else 0

        return {
            'class': self.classes[prediction],
            'confidence': probability,
            'is_fresh': prediction == 1
        }

    def visualize_prediction(self, image_path, save_path=None):
        """Visualize the prediction on the image"""
        result = self.predict(image_path)

        # Load image with OpenCV
        img = cv2.imread(image_path)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # Prepare label text
        label = f"{result['class']}: {result['probability']*100:.2f}%"
        color = (0, 255, 0) if result['is_fresh'] else (255, 0, 0)

        # Put text
        font = cv2.FONT_HERSHEY_SIMPLEX
        cv2.putText(img, label, (10, 30), font, 0.8, color, 2)

        # Display or save
        plt.figure(figsize=(8, 8))
        plt.imshow(img)
        plt.axis('off')
        plt.title(label)

        if save_path:
            plt.savefig(save_path)
            print(f"Saved result to {save_path}")
        else:
            plt.show()

        return result


# Simple usage example
if __name__ == "__main__":
    # Set paths here
    model_path = "R:/Projects/hacknuthon/visual-inventory-tracking/spoilage_classifier/resnet50_modify_fruit_spoilage.pth"
    image_path = "R:/Projects/hacknuthon/visual-inventory-tracking/spoilage_classifier/images/FreshGrape (104).jpg"

    # Create classifier
    classifier = SpoilageClassifier(model_path)

    # Make prediction
    result = classifier.predict(image_path)
    print(f"Prediction: {result['class']}")
    print(f"Confidence: {result['probability']*100:.2f}%")

    # Visualize (optional)
    classifier.visualize_prediction(image_path)

    # Process multiple images (example)
    """
    image_folder = "R:/Projects/hacknuthon/visual-inventory-tracking/test_images/"
    for img_file in os.listdir(image_folder):
        if img_file.endswith(('.jpg', '.jpeg', '.png')):
            img_path = os.path.join(image_folder, img_file)
            result = classifier.predict(img_path)
            print(f"{img_file}: {result['class']} ({result['probability']*100:.2f}%)")
    """
