from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
import random


DUMMY_INGREDIENTS = {
    "pizza": [
        {"name": "Flour", "quantity": 250, "unit": "g"},
        {"name": "Tomato Sauce", "quantity": 100, "unit": "ml"},
        {"name": "Mozzarella", "quantity": 200, "unit": "g"},
        {"name": "Olive Oil", "quantity": 2, "unit": "tbsp"},
        {"name": "Basil", "quantity": 1, "unit": "tbsp"}
    ],
    "pasta": [
        {"name": "Pasta", "quantity": 300, "unit": "g"},
        {"name": "Tomato Sauce", "quantity": 150, "unit": "ml"},
        {"name": "Parmesan", "quantity": 50, "unit": "g"},
        {"name": "Olive Oil", "quantity": 2, "unit": "tbsp"},
        {"name": "Garlic", "quantity": 3, "unit": "cloves"}
    ],
    "salad": [
        {"name": "Lettuce", "quantity": 200, "unit": "g"},
        {"name": "Tomato", "quantity": 2, "unit": "pcs"},
        {"name": "Cucumber", "quantity": 1, "unit": "pcs"},
        {"name": "Olive Oil", "quantity": 2, "unit": "tbsp"},
        {"name": "Vinegar", "quantity": 1, "unit": "tbsp"}
    ],
    "burger": [
        {"name": "Beef Patty", "quantity": 150, "unit": "g"},
        {"name": "Bun", "quantity": 2, "unit": "pcs"},
        {"name": "Lettuce", "quantity": 2, "unit": "leaves"},
        {"name": "Tomato", "quantity": 2, "unit": "slices"},
        {"name": "Cheese", "quantity": 2, "unit": "slices"},
        {"name": "Ketchup", "quantity": 2, "unit": "tbsp"}
    ],
    "taco": [
        {"name": "Tortilla", "quantity": 4, "unit": "pcs"},
        {"name": "Ground Beef", "quantity": 300, "unit": "g"},
        {"name": "Lettuce", "quantity": 100, "unit": "g"},
        {"name": "Cheese", "quantity": 100, "unit": "g"},
        {"name": "Salsa", "quantity": 100, "unit": "ml"}
    ],
    "sushi": [
        {"name": "Rice", "quantity": 300, "unit": "g"},
        {"name": "Seaweed", "quantity": 4, "unit": "sheets"},
        {"name": "Fish", "quantity": 200, "unit": "g"},
        {"name": "Wasabi", "quantity": 1, "unit": "tbsp"},
        {"name": "Soy Sauce", "quantity": 2, "unit": "tbsp"}
    ],
    "soup": [
        {"name": "Broth", "quantity": 500, "unit": "ml"},
        {"name": "Vegetables", "quantity": 200, "unit": "g"},
        {"name": "Salt", "quantity": 1, "unit": "tsp"},
        {"name": "Herbs", "quantity": 1, "unit": "tbsp"},
        {"name": "Onion", "quantity": 1, "unit": "pcs"}
    ],
    "steak": [
        {"name": "Beef", "quantity": 200, "unit": "g"},
        {"name": "Salt", "quantity": 1, "unit": "tsp"},
        {"name": "Pepper", "quantity": 1, "unit": "tsp"},
        {"name": "Butter", "quantity": 2, "unit": "tbsp"},
        {"name": "Garlic", "quantity": 2, "unit": "cloves"}
    ],
    "cake": [
        {"name": "Flour", "quantity": 200, "unit": "g"},
        {"name": "Sugar", "quantity": 150, "unit": "g"},
        {"name": "Eggs", "quantity": 3, "unit": "pcs"},
        {"name": "Butter", "quantity": 100, "unit": "g"},
        {"name": "Vanilla", "quantity": 1, "unit": "tsp"}
    ],
    "sandwich": [
        {"name": "Bread", "quantity": 2, "unit": "slices"},
        {"name": "Cheese", "quantity": 2, "unit": "slices"},
        {"name": "Ham", "quantity": 2, "unit": "slices"},
        {"name": "Lettuce", "quantity": 2, "unit": "leaves"},
        {"name": "Tomato", "quantity": 2, "unit": "slices"}
    ]
}

def get_dummy_ingredients():
    # Randomly select a food type
    food_type = random.choice(list(DUMMY_INGREDIENTS.keys()))
    ingredients = DUMMY_INGREDIENTS[food_type]
    
    # Add 2-3 random ingredients from other food types
    other_food_types = random.sample(list(DUMMY_INGREDIENTS.keys()), 3)
    for food in other_food_types:
        if food != food_type:
            random_ingredient = random.choice(DUMMY_INGREDIENTS[food])
            ingredients.append(random_ingredient)
    
    # Remove duplicates based on ingredient name
    seen_names = set()
    unique_ingredients = []
    for ing in ingredients:
        if ing["name"] not in seen_names:
            seen_names.add(ing["name"])
            unique_ingredients.append(ing)
    
    # Sort by ingredient name
    return sorted(unique_ingredients, key=lambda x: x["name"])