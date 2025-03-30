from typing import List, Dict, Any
import os
from .get_special_dishes import optimize_menu
from utils.db import db

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
        
        # Analyze each dish
        for dish in menu_dishes:
            try:
                dish_cost = 0
                dish_optimizations = []
                
                # Calculate current cost and find optimization opportunities
                for ingredient in dish.get('ingredients', []):
                    try:
                        # Calculate cost based on ingredient quantity and price
                        current_price = ingredient.get('price', 0) # Get price from ingredient object
                        suggested_price = current_price * 0.9  # 10% potential savings
                        
                        ingredient_cost = current_price * ingredient['quantity']
                        potential_savings = (current_price - suggested_price) * ingredient['quantity']
                        
                        dish_cost += ingredient_cost
                        
                        if potential_savings > 0:
                            dish_optimizations.append({
                                'item': ingredient['name'],
                                'current_cost': current_price,
                                'suggested_cost': suggested_price,
                                'potential_savings': potential_savings,
                                'quantity': ingredient['quantity'],
                                'unit': ingredient['unit']
                            })
                    except Exception as e:
                        print(f"Error processing ingredient {ingredient.get('name', 'Unknown')}: {str(e)}")
                        continue
                
                total_current_cost += dish_cost
                # print(f"Dish optimizations for {dish_name}: {dish_optimizations}")
                # print(f"Dish cost: {dish_cost}")
                
                # Add dish-specific optimizations
                if dish_optimizations:
                    cost_optimizations.extend(dish_optimizations)
                    total_potential_savings += sum(opt['potential_savings'] for opt in dish_optimizations)
            except Exception as e:
                print(f"Error processing dish {dish.get('name', 'Unknown')}: {str(e)}")
                continue
        
        # Generate recommendations
        recommendations = {
            'cost_optimizations': cost_optimizations,
            'total_current_cost': total_current_cost,
            'total_potential_savings': total_potential_savings,
            'savings_percentage': (total_potential_savings / total_current_cost * 100) if total_current_cost > 0 else 0
        }
        # print("Final recommendations:", recommendations)
        return recommendations
        
    except Exception as e:
        print(f"Error analyzing menu costs: {str(e)}")
        raise 