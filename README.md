# CloseLoop

> **"We don't only analyze calls. We execute them."**

CloseLoop is an execution-first B2B SaaS web application designed for sales teams. It leverages AI to generate and execute post-call workflows, including email drafts, CRM notes, and follow-up tasks, streamlining the entire sales process.

## 🌟 Key Features

* **AI-Powered Execution:** Automatically generates post-call emails, categorized CRM notes, tasks (with priorities, assignees, and due dates), and key moments using Gemini 3 Flash.
* **Call Review "Hero" Interface:** A specialized split-screen interface where reps can review call context (40%) and manage AI-generated execution items (60%).
* **Real Email Sending:** Integrated with Resend API for actual transactional and follow-up emails upon approval.
* **Role-Based Access Control & Teams:**
  * **Superuser:** Platform admin managing multiple workspaces and platform-wide statistics.
  * **Superadmin:** Company admin managing their team, reviewing performance, and controlling the Data Vault.
  * **Rep:** Sales representative who reviews and approves call outputs.
* **Data Vault:** Contextual document matching via trigger words to enhance AI outputs.

## 🏗 Tech Stack & Architecture

<p align="center"> <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" /> <img src="https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black" /> <img src="https://img.shields.io/badge/Database-MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" /> <img src="https://img.shields.io/badge/Auth-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" /> <img src="https://img.shields.io/badge/Email-Resend-EA4335?style=for-the-badge" /> <img src="https://img.shields.io/badge/AI-Gemini_3_Flash-4285F4?style=for-the-badge&logo=google" /> <img src="https://img.shields.io/badge/License-MIT-orange?style=for-the-badge" /> </p>

## 📁 Project Structure

* `/backend` - The FastAPI server, MongoDB models, and business logic.
* `/frontend` - The React user interface and state management.
* `/tests` - Automated testing assets and scripts (pytest).
* `/test_reports` - Detailed testing logs and iteration profiles.
* `/memory` - Holds Product Requirements Documents (PRDs) and initial system context.

## 🚀 Quick Start Guide

CloseLoop consists of separate frontend and backend services that need to run concurrently. 

**Prerequisites:** Node.js (v18+), Python 3.9+, and a local MongoDB instance running at `mongodb://localhost:27017`.

### 1. Backend Setup

For full details and environment variables, refer to the [Backend Setup Guide](./backend/README.md).

```bash
cd backend
python -m venv venv

# Activate Virtual Environment
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

pip install -r requirements.txt

# Create .env file with necessary keys (Supabase, Resend, Mongo, LLM)
uvicorn server:app --reload
```
The backend API will run on `http://localhost:8000`. API Docs are available at `http://localhost:8000/docs`.

### 2. Frontend Setup

For full details, refer to the [Frontend Setup Guide](./frontend/README.md).

```bash
cd frontend
npm install

# Create a .env file if needed to set REACT_APP_API_URL
npm start
```
The frontend application will be available at `http://localhost:3000`.

## 🧪 Testing

Both backend and frontend have their respective test suites. To run the backend tests:

```bash
cd backend
# With venv activated:
python -m pytest tests/
# Or use the root script:
# python backend_test.py
```

## 🔐 Demo Credentials

Use these for local testing:
* **Superuser:** `superadmin@closeloop.io` / `SuperPass123!`
* **Superadmin 1:** `sarah@technova.io` / `ClientPass123!`
* **Superadmin 2:** `demo_user@testdemo.com` / `DemoPass123!`

🐳 Docker Deployment
Example docker-compose.yml
version: "3.9"

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env
    depends_on:
      - mongo

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"

  mongo:
    image: mongo:6
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:

Run:

docker-compose up --build
☁️ Cloud Deployment Options
Railway (Recommended for Backend)

Deploy backend as a new service

Add environment variables

Add MongoDB plugin or paste URI

Deploy

Render

Build command: pip install -r requirements.txt

Start command:
uvicorn server:app --host 0.0.0.0 --port 8000

Frontend on Netlify/Vercel

Build: npm run build

Publish: build/

Env: REACT_APP_API_URL=<backend_url>

📜 License

This project is licensed under the MIT License.
