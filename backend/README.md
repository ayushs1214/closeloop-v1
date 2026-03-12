# CloseLoop Backend

The backend of CloseLoop is a RESTful API built with **FastAPI** (Python 3.9+). It primarily interacts with **MongoDB** for data storage, **Supabase** for user authentication, and **Resend** for sending transactional emails. 

## 📁 Directory Structure
- `server.py` - The main FastAPI application file, containing all endpoints and business logic.
- `requirements.txt` - Python dependencies needed to run the backend.
- `.env` - Environment configurations (not checked into version control).
- `tests/` - Contains unit and integration tests (using `pytest`).

## 🛠 Prerequisites
- **Python 3.9+**
- **MongoDB** running locally (`mongodb://localhost:27017`) or via a cloud instance (e.g., MongoDB Atlas).
- API Keys for Supabase and Resend.

## 🚀 Local Setup & Installation

1. **Navigate to the backed directory:**
   ```bash
   cd backend
   ```

2. **Create a Python Virtual Environment:**
   Run the following to keep dependencies isolated:
   ```bash
   python -m venv venv
   
   # Activate the virtual environment (Windows):
   venv\Scripts\activate
   
   # Activate the virtual environment (macOS/Linux):
   source venv/bin/activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up Environment Variables:**
   Create a `.env` file in the `backend/` directory by copying any provided `.env.sample` (or setting it up manually). The file must contain:
   ```env
   MONGO_URL="mongodb://localhost:27017" # Replace if using Atlas
   DB_NAME="test_database"
   CORS_ORIGINS="*"
   EMERGENT_LLM_KEY="your_api_key_here"  # Only if needed
   SUPABASE_URL="https://your-project.supabase.co"
   SUPABASE_KEY="your_anon_key"
   SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
   RESEND_API_KEY="your_resend_api_key"
   SENDER_EMAIL="onboarding@resend.dev"
   ```

5. **Start the Development Server:**
   ```bash
   uvicorn server:app --reload
   ```
   The backend will now run on **http://localhost:8000**.

## 📖 API Documentation
FastAPI automatically generates interactive API documentation. While the server is running, visit:
- **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

## 🧪 Testing
We use `pytest` for the backend tests.
To run the test suite, ensure your virtual environment is activated and run:
```bash
python -m pytest tests/
# OR if you are using the main runner:
python backend_test.py
```
