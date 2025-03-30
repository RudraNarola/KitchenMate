import json
import requests
import os

api_key = os.getenv("GEMINI_API_KEY")

def get_special_dishes(api_key, available_ingredients, menu):
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    
    prompt_text = f"""
    Based on these available ingredients: {available_ingredients}
    And this menu: {menu}

    Recommend 3-4 dishes that maximize the use of available ingredients. For each dish:
    1. Use multiple ingredients from the available list and if ingredients is 0 ingredient item not included in the dish this is not a valid dish
    2. mandotary to give atleast 2 dishes
    2. Only select dishes from the provided menu
    3. Include realistic quantities for each ingredient
    4. Prioritize dishes that use more of the available ingredients 
    5. Take all neccessary ingredients from the available list and take atleast 1 ingredient from the available list.

    IMPORTANT: Your response must be ONLY valid JSON with no markdown formatting, no code blocks, no backticks.
    Return just a JSON object with:
    - "dishes": a list of objects containing "name" and "ingredients" (with expected quantities)

    Example format:
    {{"dishes": [
        {{"name": "Dish Name", "ingredients": {{"ingredient1": quantity, "ingredient2": quantity}}}},
        {{"name": "Another Dish", "ingredients": {{"ingredient3": quantity, "ingredient4": quantity}}}}
    ]}}
    """
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": "You are an expert in restaurant menu optimization. You MUST respond with ONLY valid JSON."},
                    {"text": prompt_text}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 500,  # Increased for more dishes
            "topP": 0.95,
            "topK": 40
        }
    }   
    
    request_url = f"{url}?key={api_key}"
    headers = {"Content-Type": "application/json"}
    
    response = requests.post(request_url, headers=headers, json=payload)
    
    if response.status_code != 200:
        raise Exception(f"Error {response.status_code}: {response.text}")
    
    raw_text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
    
    if "```" in raw_text:
        raw_text = raw_text.replace("```json", "").replace("```", "").strip()
    
    return json.loads(raw_text)

def optimize_menu(api_key,available_ingredients, menu):
    
    try:
        # Load available ingredients from fresh_ingredients.json
        with open("fresh_ingredients.json", "r") as f:
            available_ingredients = json.load(f)
            
        special_dishes = get_special_dishes(api_key, available_ingredients, menu)
        
        # print("Special dishes recommended:")
        # print(json.dumps(special_dishes, indent=2))
        
        with open("special_dishes.json", "w") as json_file:
            json.dump(special_dishes, json_file, indent=4)
        # print("Special dishes saved to special_dishes.json")
        
        return special_dishes
        
    except json.JSONDecodeError as e:
        print(f"Failed to parse JSON: {e}")
        return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

