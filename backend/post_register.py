import requests
import sys

url = "http://127.0.0.1:8001/api/v1/auth/register"
payload = {
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "Aa!12345!",
    "confirm_password": "Aa!12345!",
}

try:
    r = requests.post(url, json=payload, timeout=10)
    print("STATUS", r.status_code)
    try:
        print(r.json())
    except Exception:
        print(r.text)
except Exception as e:
    print("REQUEST ERROR", e)
    sys.exit(1)
