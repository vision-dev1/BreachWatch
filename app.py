# Codes By Visionnn
import os
import re
import time
import requests
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
XPOSEDORNOT_API_URL = "https://api.xposedornot.com/v1/check-email/"
API_KEY = os.getenv("XPOSEDORNOT_API_KEY")

# In-memory rate limiting: {ip: [timestamps]}
rate_limit_storage = {}
RATE_LIMIT_MAX = 10
RATE_LIMIT_WINDOW = 60  # seconds

def is_valid_email(email):
    """Simple regex for email validation."""
    regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(regex, email) is not None

def check_rate_limit(ip):
    """Check if the IP has exceeded the rate limit."""
    now = time.time()
    if ip not in rate_limit_storage:
        rate_limit_storage[ip] = []
    
    # Filter out old timestamps
    rate_limit_storage[ip] = [t for t in rate_limit_storage[ip] if now - t < RATE_LIMIT_WINDOW]
    
    if len(rate_limit_storage[ip]) >= RATE_LIMIT_MAX:
        return False
    
    rate_limit_storage[ip].append(now)
    return True

def calculate_risk_score(breach_count):
    """Calculate risk score based on breach count."""
    if breach_count == 0:
        return "Safe"
    elif 1 <= breach_count <= 2:
        return "Low Risk"
    elif 3 <= breach_count <= 5:
        return "Medium Risk"
    else:
        return "High Risk"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/check', methods=['POST'])
def check_email():
    # Rate limiting
    client_ip = request.remote_addr
    if not check_rate_limit(client_ip):
        return jsonify({"error": "Rate limit exceeded. Max 10 requests per minute."}), 429

    data = request.get_json()
    if not data or 'email' not in data:
        return jsonify({"error": "Email is required"}), 400

    email = data['email'].strip().lower()

    # Server-side validation
    if not is_valid_email(email):
        return jsonify({"error": "Invalid email format"}), 400

    headers = {}
    if API_KEY:
        headers['x-api-key'] = API_KEY

    try:
        response = requests.get(f"{XPOSEDORNOT_API_URL}{email}", headers=headers, timeout=10)
        
        if response.status_code == 200:
            breaches_data = response.json()
            # The API returns a list of breaches under 'breaches' key or similar structure
            # Based on docs, it might return a dictionary with breach info directly or a list
            # parsed_breaches = []
            # We'll normalize the response as requested
            
            # Note: XposedOrNot API structure varies. 
            # If it's a 200, it means breaches were found.
            # Usually it returns a list of breach names or more detailed objects.
            # For this app, we will try to extract common fields.
            
            # XposedOrNot returns breaches as a list of names, or sometimes nested: {"breaches": [["A", "B"]]}
            breach_list = []
            if isinstance(breaches_data, dict) and 'breaches' in breaches_data:
                raw_list = breaches_data['breaches']
                # Flatten if it's a list containing a list
                if len(raw_list) > 0 and isinstance(raw_list[0], list):
                    breach_list = raw_list[0]
                else:
                    breach_list = raw_list
            elif isinstance(breaches_data, list):
                breach_list = breaches_data
            
            count = len(breach_list)
            risk = calculate_risk_score(count)
            
            formatted_breaches = []
            for b_name in breach_list:
                formatted_breaches.append({
                    "name": str(b_name),
                    "year": "N/A", # Summarized API doesn't always provide year
                    "data_exposed": []
                })

            return jsonify({
                "status": "success",
                "breaches_found": True,
                "count": count,
                "risk_score": risk,
                "breaches": formatted_breaches
            })

        elif response.status_code == 404:
           # 404 means no Data Breaches Found
            return jsonify({
                "status": "clean",
                "breaches_found": False,
                "risk_score": "Safe"
            })
        
        else:
            return jsonify({"error": f"API Error: {response.status_code}"}), 502

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Connection error: {str(e)}"}), 503

if __name__ == '__main__':
    app.run(debug=os.getenv("DEBUG", "False") == "True", port=5000)

