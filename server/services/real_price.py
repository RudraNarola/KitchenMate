import requests
import json
import time
from datetime import datetime, timedelta

def fetch_market_data(api_key, commodity, state=None):
    """Fetch market data for a given commodity from the API."""
    base_url = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
    
    # Get yesterday's date in YYYY-MM-DD format
    yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
    
    params = {
        "api-key": api_key,
        "format": "json",
        "filters[arrival_date]": yesterday  # Add filter for yesterday's date
    }
    
    if state:
        params["filters[state]"] = state
    params["filters[commodity]"] = commodity
    
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error fetching data for {commodity}: HTTP {response.status_code}")
        return None

def convert_to_kg(price, state):
    """Convert price to per kg based on state."""
    if not price or price == "-":
        return None
    price = float(price)
    return round(price / 20, 2) if state.lower() == "gujarat" else round(price / 100, 2)

def get_ingredient_prices(api_key, ingredient_list):
    """Get average prices for a list of ingredients."""
    results = []
    for ingredient in ingredient_list:
        print(f"Fetching data for {ingredient}...")
        data = fetch_market_data(api_key, ingredient)
        modal_prices = []
        
        if data and "records" in data:
            for record in data["records"]:
                state = record.get("state", "")
                modal_price_kg = convert_to_kg(record.get("modal_price"), state)
                if modal_price_kg is not None:
                    modal_prices.append(modal_price_kg)
        
        avg_price = round(sum(modal_prices) / len(modal_prices), 2) if modal_prices else None
        results.append({"ingredient": ingredient, "price_per_kg": avg_price})
        time.sleep(1)  # Avoid rate limits
    return results