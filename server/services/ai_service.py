import google.generativeai as genai
import json
from config import GEMINI_API_KEY, GEMINI_MODEL_NAME

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)

# Initialize the AI model
try:
    model = genai.GenerativeModel(model_name=GEMINI_MODEL_NAME)
except Exception as e:
    print(f"Error initializing model: {e}")
    raise

def generate_ai_response(prompt):
    """
    Generate AI response based on the given prompt
    """
    try:
        response = model.generate_content(prompt)
        content = response.text.strip()

        # Ensure JSON response is well-formatted
        if content.startswith('```json'):
            content = content[7:]
        if content.endswith('```'):
            content = content[:-3]

        return json.loads(content)  # Convert to JSON
    except Exception as e:
        print(f"Error in generate_ai_response: {str(e)}")
        return {"error": str(e)}