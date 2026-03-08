import os
import re
import time
from collections import defaultdict
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import requests

load_dotenv()

app = Flask(__name__)

# ---------------------------------------------------------------------------
# Simple in-memory rate limiter (per IP, 10 requests/minute)
# ---------------------------------------------------------------------------
RATE_LIMIT = 10
RATE_WINDOW = 60  # seconds
_request_log = defaultdict(list)


def _is_rate_limited(ip):
    now = time.time()
    _request_log[ip] = [t for t in _request_log[ip] if now - t < RATE_WINDOW]
    if len(_request_log[ip]) >= RATE_LIMIT:
        return True
    _request_log[ip].append(now)
    return False


# ---------------------------------------------------------------------------
# Email validation
# ---------------------------------------------------------------------------
EMAIL_RE = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


def _valid_email(email):
    return bool(EMAIL_RE.match(email))


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/check-email", methods=["POST"])
def check_email():
    # Rate limiting
    client_ip = request.remote_addr
    if _is_rate_limited(client_ip):
        return jsonify({"error": "Too many requests. Please wait a minute and try again."}), 429

    data = request.get_json(silent=True)
    if not data or not data.get("email"):
        return jsonify({"error": "Email is required."}), 400

    email = data["email"].strip().lower()

    if not _valid_email(email):
        return jsonify({"error": "Invalid email format."}), 400

    # Call XposedOrNot API
    api_url = f"https://api.xposedornot.com/v1/check-email/{email}"
    headers = {}
    api_key = os.getenv("XPOSEDORN_API_KEY")
    if api_key:
        headers["x-api-key"] = api_key

    try:
        resp = requests.get(api_url, headers=headers, timeout=15)
    except requests.exceptions.Timeout:
        return jsonify({"error": "The breach-check service timed out. Please try again later."}), 504
    except requests.exceptions.RequestException:
        return jsonify({"error": "Unable to reach the breach-check service. Please try again later."}), 502

    if resp.status_code == 404:
        # XposedOrNot returns 404 when the email is NOT found in breaches
        return jsonify({"breached": False, "message": "No breach found. Your email was not found in known breach datasets."})

    if resp.status_code != 200:
        return jsonify({"error": f"Breach-check service returned status {resp.status_code}."}), 502

    try:
        result = resp.json()
    except ValueError:
        return jsonify({"error": "Received an invalid response from the breach-check service."}), 502

    # Parse the XposedOrNot response
    breaches_details = result.get("ExposedBreaches", {}).get("breaches_details", [])
    breach_count = len(breaches_details)

    if breach_count == 0:
        return jsonify({"breached": False, "message": "No breach found. Your email was not found in known breach datasets."})

    breach_names = [b.get("breach", "Unknown") for b in breaches_details]

    return jsonify({
        "breached": True,
        "breach_count": breach_count,
        "breaches": breach_names,
        "message": f"Email found in {breach_count} breach(es)."
    })


# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True)
