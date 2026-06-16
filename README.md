# BigQuery Release Notes Web App

A sleek, modern web application built to fetch and display the latest BigQuery release notes in a beautiful, premium dark-mode interface. 

![App Mockup](assets/bq_release_notes_mockup.jpg)

## 🌟 Features
- **Live Feed Parsing**: Fetches the official Google Cloud BigQuery release notes XML feed and parses it dynamically using Python.
- **Premium Aesthetics**: Glassmorphic UI cards, subtle gradients, and clean layouts to offer an excellent user experience.
- **Instant Refresh**: A clean, spinner-equipped refresh button that fetches the latest updates without a page reload.
- **Tweet Integrations**: 
  - Dedicated "Tweet" button per update.
  - Smart text selection: Highlight any text on the page, and a convenient floating tooltip will allow you to instantly share that snippet directly to Twitter with a backlink.

## 🚀 Tech Stack
- **Backend**: Python 3, Flask, Requests
- **Frontend**: Vanilla HTML, CSS, JavaScript (No heavy frontend frameworks)

## 🛠️ Setup Instructions

### 1. Prerequisites
Ensure you have Python 3.x installed on your machine.

### 2. Clone the Repository
```bash
git clone https://github.com/selvakumaran416-sketch/BigQuery-Release-Notes-.git
cd BigQuery-Release-Notes-
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Application
```bash
python app.py
```
The application will launch locally at `http://127.0.0.1:5000`.

## 👨‍💻 Developer
Developed by **SELVAKUMARAN M**
