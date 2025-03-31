from typing import List, Dict, Any
import os
from .get_special_dishes import optimize_menu
from utils.db import db
from .real_price import get_ingredient_prices
import google.generativeai as genai
import json

def analyze_menu_costs(menu_dishes: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyze menu costs and provide optimization recommendations.
    
    Args:
        menu_dishes: List of dishes from database with their ingredients and prices
        
    Returns:
        Dict containing cost optimization recommendations
    """
    try:
        # Initialize results
        cost_optimizations = []
        total_current_cost = 0
        total_potential_savings = 0
        
        # Create maps for both total ingredients and dishes with their ingredients
        ingredients_map = {}
        dishes_map = {}
        
        # Unit conversion factors to kilograms
        unit_conversions = {
            'grams': 0.001,
            'g': 0.001,
            'kilograms': 1,
            'kg': 1,
            'pounds': 0.453592,
            'lbs': 0.453592,
            'ounces': 0.0283495,
            'oz': 0.0283495,
            'milligrams': 0.000001,
            'pcs': 0.5,
            'mg': 0.000001,
            'units': 1  # Default conversion for unknown units
        }
        
        # First, create dishes map with their ingredients
        for dish in menu_dishes:
            dish_name = dish.get('name', 'Unknown')
            dishes_map[dish_name] = {
                'ingredients': [],
                'total_quantity_kg': 0
            }
            for ingredient in dish.get('ingredients', []):
                name = ingredient.get('name', 'Unknown')
                quantity = ingredient.get('quantity', 0)
                unit = ingredient.get('unit', 'units').lower()
                
                # Convert quantity to kilograms
                conversion_factor = unit_conversions.get(unit, 1)
                quantity_in_kg = quantity * conversion_factor
                
                # Add to dish's ingredients
                dishes_map[dish_name]['ingredients'].append({
                    'name': name,
                    'quantity': quantity,
                    'unit': unit,
                    'quantity_kg': quantity_in_kg
                })
                dishes_map[dish_name]['total_quantity_kg'] += quantity_in_kg
                
                # Add to total ingredients map
                if name in ingredients_map:
                    ingredients_map[name]['quantity'] += quantity_in_kg
                else:
                    ingredients_map[name] = {
                        'quantity': quantity_in_kg,
                        'unit': 'kg'
                    }
        
        # Get unique ingredient names for price fetching
        unique_ingredients = list(ingredients_map.keys())
        
        # Initialize Gemini API
        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Create prompt for Gemini
        prompt = f"""You are a price data provider. Provide current market prices per kg for these ingredients in India (in Indian Rupees):
        {', '.join(unique_ingredients)}
        
        IMPORTANT: Respond ONLY with a valid JSON array in this exact format:
        [
            {{"ingredient": "Ingredient Name", "price_per_kg": price_in_rupees}},
            ...
        ]
        
        Do not include any other text or explanation. Only return the JSON array.
        """
        
        # Get prices from Gemini
        response = model.generate_content(prompt)
        try:
            # Clean the response text to ensure it's valid JSON
            response_text = response.text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            ingredient_prices = json.loads(response_text)
            
            # Convert INR to USD (1 USD = 83 INR)
            USD_RATE = 83
            for item in ingredient_prices:
                item['price_per_kg'] = round(item['price_per_kg'] / USD_RATE, 2)
            
            
            # Create a map of ingredient prices
            price_map = {item['ingredient']: item['price_per_kg'] for item in ingredient_prices}

            # print(price_map)
            
            # Calculate costs for each dish
            for dish_name, dish_data in dishes_map.items():
                dish_cost = 0
                for ing in dish_data['ingredients']:
                    price_per_kg = price_map.get(ing['name'], 0)
                    ingredient_cost = price_per_kg * ing['quantity_kg']
                    ing['cost'] = ingredient_cost
                    dish_cost += ingredient_cost
                
                dishes_map[dish_name]['total_cost'] = dish_cost
                total_current_cost += dish_cost
            # Print the dishes map structure with costs
        except json.JSONDecodeError as e:
            print(f"Error parsing Gemini response: {e}")
            print("Raw response:", response.text)
        
        # Generate recommendations
        recommendations = {
            'dishes_map': dishes_map,
            'ingredients_map': ingredients_map,
            'cost_optimizations': cost_optimizations,
            'total_current_cost': total_current_cost,
            'total_potential_savings': total_potential_savings,
            'savings_percentage': (total_potential_savings / total_current_cost * 100) if total_current_cost > 0 else 0
        }
        return recommendations
        
    except Exception as e:
        print(f"Error analyzing menu costs: {str(e)}")
        raise 