def get_surplus_ingredients():
    return [
        {"name": "Chicken Breast", "quantity": 15, "expiry_date": "2024-03-25"},
        {"name": "Fresh Basil", "quantity": 8, "expiry_date": "2024-03-24"},
        {"name": "Mozzarella", "quantity": 12, "expiry_date": "2024-03-26"},
    ]

def get_current_menu():
    return [
        {
            "name": "Margherita Pizza",
            "ingredients": ["Dough", "Tomato Sauce", "Mozzarella", "Fresh Basil"],
            "cost": 8.50,
            "profit_margin": 30,
        },
        {
            "name": "Chicken Alfredo",
            "ingredients": ["Pasta", "Chicken Breast", "Cream", "Parmesan"],
            "cost": 12.75,
            "profit_margin": 25,
        },
    ]