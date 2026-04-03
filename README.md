# 🛡️ BreachWatch

**BreachWatch** is a modern, responsive, and professional web application designed to help users check if their email address has been exposed in known data breaches. Powered by the **XposedOrNot** API, it provides real-time security insights with a focus on privacy and user experience.

---

## 🚀 Features

-   **Real-Time Scanning**: Instantly checks multiple breach databases.
-   **Risk Assessment**: Provides a calculated risk score (Safe, Low, Medium, High).
-   **Security Tips**: Offers actionable advice to fortify your digital identity.
-   **Privacy First**: Emails are not stored; they are only used for the API request.
-   **Modern UI**: Sleek, Bento-inspired design with dark mode support.
-   **Rate Limiting**: Built-in protection against automated abuse.

---

## 🛠️ Technology Stack

-   **Backend**: Python, Flask
-   **Frontend**: HTML5, Tailwind CSS, JavaScript
-   **API**: [XposedOrNot](https://xposedornot.com/)
-   **Deployment**: WSGI with Gunicorn

---

## 📦 Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/vision-dev1/BreachWatch.git
    cd BreachWatch
    ```

2.  **Create a virtual environment**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the application**:
    ```bash
    python app.py
    ```

---

## 🌐 Deployment

The project is deployment-ready for platforms like **Heroku**, **Render**, or **DigitalOcean App Platform**.

-   **Procfile**: Configured to run with Gunicorn: `web: gunicorn app:app`.
-   **Dynamic Port**: Bound to the `PORT` environment variable.

---

## 🛡️ Security Note

This tool is for educational and personal security awareness. Always follow best practices for online safety and never share sensitive credentials.

---

## LICENSE 
This tool is under GPL-3 License. See the [LICENSE](LICENSE) file for details

---

## Author
Vision KC<br>
[Github](https://github.com/vision-dev1)<br>
[Portfolio](https://visionkc.com.np)

---
