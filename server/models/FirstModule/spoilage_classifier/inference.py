import torch
import torchvision.transforms as transforms
from PIL import Image
import matplotlib.pyplot as plt
import os
import argparse
from torchvision import models
import cv2
import numpy as np


class SpoilageClassifier:
    def __init__(self, model_path, device=None):
        if device is None:
            self.device = torch.device(
                "cuda" if torch.cuda.is_available() else "cpu")
        else:
            self.device = device

        print(f"Using device: {self.device}")

        # Load model
        self.model = self.load_model(model_path=model_path)
        self.model.eval()

        # Define image transforms
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[
                                 0.229, 0.224, 0.225]),
        ])

        # Class labels
        # Example - update with your actual classes
        self.classes = ['Fresh Apple', 'Rotten Apple', 'Fresh Banana',
                        'Rotten Banana', 'Fresh Bell Pepper', 'Rotten Bell Pepper',
                        'Fresh Carrot', 'Rotten Carrot', 'Fresh Cucumber', 'Rotten Cucumber',
                        'Fresh Grape', 'Rotten Grape', 'Fresh Guava', 'Rotten Guava',
                        'Fresh Jujube', 'Rotten Jujube', 'Fresh Mango', 'Rotten Mango',
                        'Fresh Orange', 'Rotten Orange', 'Fresh Pomegranate', 'Rotten Pomegranate',
                        'Fresh Potato', 'Rotten Potato', 'Fresh Strawberry', 'Rotten Strawberry', 'Fresh Tomato', 'Rotten Tomato',
                        ]

        # self.classes = ['Apple Healthy', 'Apple Rotten', 'Banana Healthy', 'Banana Rotten',
        #                 'Bell Pepper Healthy', 'Bell Pepper Rotten', 'Carrot Healthy', 'Carrot Rotten',
        #                 'Cucumber Healthy', 'Cucumber Rotten', 'Grape Healthy', 'Grape Rotten',
        #                 'Guava Healthy', 'Guava Rotten', 'Jujube Healthy', 'Jujube Rotten',
        #                 'Mango Healthy', 'Mango Rotten', 'Orange Healthy', 'Orange Rotten',
        #                 'Pomegranate Healthy', 'Pomegranate Rotten', 'Potato Healthy', 'Potato Rotten',
        #                 'Strawberry Healthy', 'Strawberry Rotten', 'Tomato Healthy', 'Tomato Rotten']

        # self.classes = ['Apple__Healthy', 'Apple__Rotten', 'Banana__Healthy', 'Banana__Rotten',
        #                 'Bell_Pepper__Healthy', 'Bell_Pepper__Rotten', 'Carrot__Healthy', 'Carrot__Rotten',
        #                 'Cucumber__Healthy', 'Cucumber__Rotten', 'Grape__Healthy', 'Grape__Rotten',
        #                 'Guava__Healthy', 'Guava__Rotten', 'Jujube__Healthy', 'Jujube__Rotten',
        #                 'Mango__Healthy', 'Mango__Rotten', 'Orange__Healthy', 'Orange__Rotten',
        #                 'Pomegranate__Healthy', 'Pomegranate__Rotten', 'Potato__Healthy', 'Potato__Rotten',
        #                 'Strawberry__Healthy', 'Strawberry__Rotten', 'Tomato__Healthy', 'Tomato__Rotten']

    def load_model(self, model_path):
        """Load the trained model"""
        # You may need to adjust this depending on your model architecture
        model = models.resnet50(pretrained=False)
        num_ftrs = model.fc.in_features
        # Assuming 2 classes: fresh and rotten
        model.fc = torch.nn.Linear(num_ftrs, 28)

        # Load the trained weights
        model.load_state_dict(torch.load(model_path, map_location=self.device))
        model = model.to(self.device)
        return model

    def preprocess_image(self, image_path):
        """Preprocess an image for model input"""
        image = Image.open(image_path).convert('RGB')
        return self.transform(image).unsqueeze(0).to(self.device)

    def predict(self, image_path):
        """Run inference on an image"""
        input_tensor = self.preprocess_image(image_path)

        with torch.no_grad():
            outputs = self.model(input_tensor)
            _, predicted = torch.max(outputs, 1)
            probs = torch.nn.functional.softmax(outputs, dim=1)

        class_idx = predicted.item()
        confidence = probs[0][class_idx].item()

        return {
            'class': self.classes[class_idx],
            'confidence': confidence * 100,
            'probabilities': {
                self.classes[i]: probs[0][i].item() * 100 for i in range(len(self.classes))
            }
        }

    def visualize_prediction(self, image_path, save_path=None):
        """Visualize the prediction on the image"""
        result = self.predict(image_path)

        # Load image with OpenCV
        img = cv2.imread(image_path)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # Prepare label text
        label = f"{result['class']}: {result['confidence']:.2f}%"
        color = (0, 255, 0) if result['class'] == 'Fresh' else (255, 0, 0)

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


def main():
    parser = argparse.ArgumentParser(
        description='Classify fruits/vegetables as fresh or rotten')
    parser.add_argument('--model', type=str, required=True,
                        help='Path to the trained model (.pth file)')
    parser.add_argument('--image', type=str, required=True,
                        help='Path to the input image')
    parser.add_argument('--save', type=str, default=None,
                        help='Path to save the output image (optional)')
    args = parser.parse_args()

    classifier = SpoilageClassifier(args.model)
    result = classifier.visualize_prediction(args.image, args.save)

    print("\nPrediction Details:")
    print(f"Class: {result['class']}")
    print(f"Confidence: {result['confidence']:.2f}%")
    print("\nClass Probabilities:")
    for cls, prob in result['probabilities'].items():
        print(f"  {cls}: {prob:.2f}%")


if __name__ == "__main__":
    main()
