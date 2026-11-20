# AfriHate – Project Setup

## Prerequisites

Ensure you have the following installed:

- Python 3.13+
- Node.js and npm
- Git

## 1. Clone the Repository

```bash
git clone https://github.com/gagandeepsingh21/aml_afriHate_114736.git
cd aml_afriHate_114736
```

## 2. Set Up the Backend

Create and activate a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install the Python dependencies:

```bash
pip install -r requirements.txt
```

**Run all the cells in the notebook** 

Start the FastAPI backend:

```bash
uvicorn app.main:app --reload
```

Backend URL: `http://127.0.0.1:8000`

API documentation: `http://127.0.0.1:8000/docs`

## 3. Set Up the Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Create a `.env.local` file inside the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Restart the development server from your root directory
```bash
uvicorn app.main:app --reload
```

Start the frontend:

```bash
npm run dev
```

Frontend URL: `http://localhost:3000`

## 4. Run the Application

Ensure both the backend and frontend servers are running in separate terminals.

Open `http://localhost:3000` in your browser to access the AfriHate application.


## Implementation Note

The initial project approach included exploring **AfroXLMR** for multilingual hate-speech and abusive-language classification. However, due to limited computational resources, TF-IDF feature extraction combined with Logistic Regression was adopted as the main modelling approach.

This approach provided a computationally efficient alternative while allowing the project to investigate multilingual text classification across the selected African languages.