<div align="center">

# 🛡️ BreachWatch

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.x-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue?style=for-the-badge&logo=gnu&logoColor=white)](https://www.gnu.org/licenses/gpl-3.0)
[![Security](https://img.shields.io/badge/Security-Hardened-2ea44f?style=for-the-badge&logo=shieldsdotio&logoColor=white)](https://github.com)
[![API](https://img.shields.io/badge/API-XposedOrNot-FF6F00?style=for-the-badge)](https://xposedornot.com/)

**BreachWatch** is a dark web email leak checker that lets users verify whether their email address has been exposed in known data breaches. It is powered by the [XposedOrNot](https://xposedornot.com/) breach database API.

</div>
---

## 📸 Preview

| Email Validation | Breach Results |
|:-:|:-:|
| Client & server-side format checks | Real-time breach data from XposedOrNot |

---

## ✨ Features

- **Breach Lookup** — Check any email against millions of breach records instantly
- **Real-time Results** — Dynamic result display with breach names and count
- **Input Validation** — Client-side and server-side email format checks
- **Rate Limiting** — In-memory throttle (10 requests/min per IP) to prevent abuse
- **Secure by Default** — API keys stored in `.env`, excluded via `.gitignore`
- **Production Ready** — Gunicorn support for deployment on Render, Railway, or any VPS

---

## 🗂️ Project Structure

```
BreachWatch/
│
├── app.py                  # Flask backend & API proxy
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (not committed)
├── .gitignore
│
├── templates/
│   └── index.html          # Main UI template
│
└── static/
    ├── css/
    │   └── style.css       # Stylesheet
    └── js/
        └── script.js       # Client-side logic
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10 or higher
- pip

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/BreachWatch.git
cd BreachWatch

# Create a virtual environment
python3 -m venv venv
source venv/bin/activate   # Linux / macOS
# venv\Scripts\activate    # Windows

# Install dependencies
pip install -r requirements.txt
```

### Configuration

Edit the `.env` file and add your XposedOrNot API key (optional — basic lookups work without one):

```env
XPOSEDORN_API_KEY=your_api_key_here
```

### Run Locally

```bash
python app.py
```

Open **http://127.0.0.1:5000** in your browser.

---

## 🌐 Deployment

BreachWatch ships with Gunicorn support and is ready for production:

```bash
gunicorn app:app
```

Deploy to any platform that supports Python WSGI apps:

| Platform | Notes |
|----------|-------|
| **Render** | Add `gunicorn app:app` as the start command |
| **Railway** | Auto-detects `requirements.txt` |
| **VPS** | Use Gunicorn behind Nginx as a reverse proxy |

---

## 🔒 Security

| Measure | Description |
|---------|-------------|
| Email Validation | Regex-based format check on client and server |
| Rate Limiting | 10 requests per minute per IP address |
| Environment Variables | API keys loaded from `.env`, never committed |
| Input Sanitization | All user input is HTML-escaped before rendering |

---

## 🛠️ Built With

- [Flask](https://flask.palletsprojects.com/) — Lightweight Python web framework
- [XposedOrNot API](https://xposedornot.com/) — Breach intelligence database
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS framework
- [Google Material Symbols](https://fonts.google.com/icons) — Icon set
- [Gunicorn](https://gunicorn.org/) — Production WSGI server

---

## 📄 License

This project is licensed under the **GNU General Public License v3.0** — see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---
## Author
Vision KC
