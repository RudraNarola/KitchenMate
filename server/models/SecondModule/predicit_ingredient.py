import matplotlib
matplotlib.use('Agg')  # Use a non-interactive backend for matplotlib
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from prophet import Prophet
from config.constant import GRAPH_FOLDER
import os


# 1. Forecast orders by meal category
def forecast_orders_by_category(df, future_periods=1):
    """
    Forecast the number of orders for each category using Prophet.
    """
    # Aggregate orders by category and date
    category_orders = df.groupby(['date', 'category'])[
        'num_orders'].sum().reset_index()

    forecasts = {}
    figures = {}

    for category in category_orders['category'].unique():
        # Filter data for the current category
        category_data = category_orders[category_orders['category'] == category]

        # Prepare data for Prophet
        prophet_data = pd.DataFrame({
            'ds': category_data['date'],
            'y': category_data['num_orders']
        })

        # Initialize and fit the model
        model = Prophet(interval_width=0.95,
                        daily_seasonality=False, weekly_seasonality=True)
        model.fit(prophet_data)

        # Create future dataframe and make predictions
        future = model.make_future_dataframe(periods=future_periods, freq='W')
        forecast = model.predict(future)

        # Store forecast
        forecasts[category] = forecast

        # Create and store figure
        fig = model.plot(forecast)
        plt.title(f'Order Forecast for {category}')
        figures[category] = fig

    return forecasts, figures

# 2. Forecast ingredient consumption


def forecast_ingredients(df, ingredients, future_periods=1):
    """
    Forecast the consumption of each ingredient using Prophet.
    """
    # Aggregate ingredient usage by date
    ingredient_usage = df.groupby('date')[ingredients].sum().reset_index()

    forecasts = {}
    figures = {}

    for ingredient in ingredients:
        # Prepare data for Prophet
        prophet_data = pd.DataFrame({
            'ds': ingredient_usage['date'],
            'y': ingredient_usage[ingredient]
        })

        # Skip ingredients with no usage
        if prophet_data['y'].sum() == 0:
            continue

        # Initialize and fit the model
        model = Prophet(interval_width=0.95,
                        daily_seasonality=False, weekly_seasonality=True)
        model.fit(prophet_data)

        # Create future dataframe and make predictions
        future = model.make_future_dataframe(periods=future_periods, freq='W')
        forecast = model.predict(future)

        # Store forecast
        forecasts[ingredient] = forecast

        # Create and store figure
        fig = model.plot(forecast)
        plt.title(f'{ingredient.capitalize()} Consumption Forecast')
        figures[ingredient] = fig

    return forecasts, figures

# 3. Calculate ingredient requirements based on meal forecasts


def calculate_ingredient_requirements(df, category_forecasts):
    """
    Calculate ingredient requirements based on forecasted order quantities.
    """
    # Get the next week's forecast for each category
    next_week_forecasts = {}
    for category, forecast in category_forecasts.items():
        next_week_forecasts[category] = forecast.iloc[-1]['yhat']

    # Calculate average ingredient usage per order for each category
    category_ingredient_ratios = {}
    ingredients = ['garlic', 'spices', 'herbs', 'onion', 'ginger', 'cilantro',
                   'basil', 'vegetables', 'oil', 'water', 'chili', 'protein',
                   'pepper', 'sauce', 'acid', 'cardamom', 'salt', 'starch',
                   'seasoning', 'garnish', 'cinnamon', 'vegetable', 'bean sprouts',
                   'olive oil', 'coconut milk', 'cream', 'lemongrass', 'sugar',
                   'lime juice', 'cloves']

    for category in df['category'].unique():
        category_data = df[df['category'] == category]
        total_orders = category_data['num_orders'].sum()

        if total_orders > 0:
            # Calculate total ingredient usage for this category
            ingredient_usage = category_data[ingredients].mul(
                category_data['num_orders'], axis=0).sum()

            # Calculate average usage per order
            category_ingredient_ratios[category] = ingredient_usage / total_orders
        else:
            # Handle case with no orders
            category_ingredient_ratios[category] = pd.Series(
                0, index=ingredients)

    # Calculate expected ingredient requirements
    total_requirements = pd.Series(0, index=ingredients)
    for category, forecast_value in next_week_forecasts.items():
        if category in category_ingredient_ratios:
            total_requirements += category_ingredient_ratios[category] * \
                forecast_value

    # convert to pd.Series to dict
    # total_requirements = total_requirements.to_dict()
    return total_requirements, total_requirements.to_dict()

# 4. Forecast meal popularity for menu optimization


def forecast_meal_popularity(df, future_periods=1):
    """
    Forecast the popularity of each meal to suggest menu optimizations.
    """
    # Aggregate orders by meal_id and date
    meal_orders = df.groupby(['date', 'meal_id'])[
        'num_orders'].sum().reset_index()

    forecasts = {}
    top_meals = {}

    for meal_id in meal_orders['meal_id'].unique():
        # Filter data for the current meal
        meal_data = meal_orders[meal_orders['meal_id'] == meal_id]

        # Prepare data for Prophet
        prophet_data = pd.DataFrame({
            'ds': meal_data['date'],
            'y': meal_data['num_orders']
        })

        # Initialize and fit the model
        model = Prophet(interval_width=0.95,
                        daily_seasonality=False, weekly_seasonality=True)
        model.fit(prophet_data)

        # Create future dataframe and make predictions
        future = model.make_future_dataframe(periods=future_periods, freq='W')
        forecast = model.predict(future)

        # Store forecast
        forecasts[meal_id] = forecast

        # Store the forecasted value for the next period
        top_meals[meal_id] = forecast.iloc[-1]['yhat']

    # Sort meals by forecasted popularity
    sorted_meals = sorted(top_meals.items(), key=lambda x: x[1], reverse=True)

    return forecasts, sorted_meals


# 5. Visualize the results
def visualize_ingredient_requirements(requirements):
    """
    Visualize the forecasted ingredient requirements.
    """
    # Filter non-zero requirements
    non_zero_requirements = requirements[requirements > 0]

    # Sort for better visualization
    sorted_requirements = non_zero_requirements.sort_values(ascending=False)

    plt.figure(figsize=(12, 8))
    bars = plt.bar(sorted_requirements.index, sorted_requirements.values)

    # Add values on top of bars
    for bar in bars:
        yval = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2, yval + 0.05, round(yval, 1),
                 ha='center', va='bottom', rotation=0)

    plt.title('Forecasted Ingredient Requirements for Next Week')
    plt.xlabel('Ingredient')
    plt.ylabel('Quantity Required')
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()

    return plt.gcf()

# 6. Main function to run the entire analysis


def analyze_and_forecast(df):
    """
    Run the entire analysis and forecasting pipeline.
    """
    # List of all ingredients
    ingredients = ['garlic', 'spices', 'herbs', 'onion', 'ginger', 'cilantro',
                   'basil', 'vegetables', 'oil', 'water', 'chili', 'protein',
                   'pepper', 'sauce', 'acid', 'cardamom', 'salt', 'starch',
                   'seasoning', 'garnish', 'cinnamon', 'vegetable', 'bean sprouts',
                   'olive oil', 'coconut milk', 'cream', 'lemongrass', 'sugar',
                   'lime juice', 'cloves']

    # Step 1: Forecast orders by category
    print("Forecasting orders by category...")
    category_forecasts, category_figures = forecast_orders_by_category(df)

    # Step 2: Forecast ingredient consumption directly
    print("Forecasting ingredient consumption...")
    ingredient_forecasts, ingredient_figures = forecast_ingredients(
        df, ingredients)

    # Step 3: Calculate ingredient requirements based on forecasted orders
    print("Calculating ingredient requirements...")
    ingredient_requirements, ingredient_requirements_dict = calculate_ingredient_requirements(
        df, category_forecasts)

    # Step 4: Forecast meal popularity
    print("Forecasting meal popularity...")
    meal_forecasts, top_meals = forecast_meal_popularity(df)

    # Step 5: Visualize the results
    print("Visualizing the results...")
    requirements_figure = visualize_ingredient_requirements(
        ingredient_requirements)

    # Display top 5 most popular meals for next week
    print("\nTop 5 Predicted Popular Meals for Next Week:")
    top_5_meals = top_meals[:5]
    meal_details = []
    for i, (meal_id, forecast) in enumerate(top_5_meals, 1):
        meal_info = df[df['meal_id'] == meal_id].iloc[0]
        print(f"{i}. Meal ID: {meal_id}, Category: {meal_info['category']}, "
              f"Cuisine: {meal_info['cuisine']}, Predicted Orders: {forecast:.2f}")
        meal_details.append(
            [meal_id, meal_info['category'], meal_info['cuisine'], forecast])

    # Print ingredient requirements
    print("\nPredicted Ingredient Requirements for Next Week:")
    predict_ingredient_list = []
    for ingredient, quantity in ingredient_requirements.sort_values(ascending=False).items():
        if quantity > 0:
            print(f"{ingredient.capitalize()}: {quantity:.2f}")
            predict_ingredient_list.append([ingredient, quantity])

    return ({
        # 'category_forecasts': category_forecasts,
        # 'ingredient_forecasts': ingredient_forecasts,
        # 'meal_forecasts': meal_forecasts,
        'ingredient_requirements': predict_ingredient_list,
        'top_meal_details': meal_details,
    }, {
        'figures': {
            'categories': category_figures,
            'ingredients': ingredient_figures,
            'requirements': requirements_figure
        }
    })


def predict_ingredient(path_to_csv):
    # Load the data
    df = pd.read_csv(path_to_csv)

    # Convert 'week' to datetime for Prophet
    # Assuming the weeks start from a specific date (e.g., Jan 1, 2023)
    start_date = '2023-01-01'
    df['date'] = pd.to_datetime(start_date) + \
        pd.to_timedelta(df['week'] * 7, unit='D')

    # forecasting for particular branch
    center_id = 55
    center_df = df[df['center_id'] == center_id].copy()

    print(center_df.shape)

    results, res_figure = analyze_and_forecast(center_df)

    # for key, value in results.items():
    #     print("types", key, type(key), type(value))
    #     for k, v in value.items():
    #         # print("key", k, "value", v)
    #         print("types", type(k), type(v))
    #         break

    # Save figures if needed
    for category, fig in res_figure['figures']['categories'].items():
        # path =
        path = os.path.join(GRAPH_FOLDER, f'category_forecast_{category}.png')
        fig.savefig(path)

    for ingredient, fig in res_figure['figures']['ingredients'].items():
        path = os.path.join(
            GRAPH_FOLDER, f'ingredient_forecast_{ingredient}.png')
        fig.savefig(path)

    path = os.path.join(GRAPH_FOLDER, 'ingredient_requirements.png')
    res_figure['figures']['requirements'].savefig(path)

    print("Figures saved successfully.")

    return results


if __name__ == "__main__":
    # Example usage
    path_to_csv = 'R:/Projects/hacknuthon/Demand & Waste Prediction/merged_daywise.csv'
    results = predict_ingredient(path_to_csv)
