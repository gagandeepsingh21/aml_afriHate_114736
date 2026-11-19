
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(
    title="AfriHate Classification API",
    description="API for classifying African-language social media posts.",
    version="1.0.0"
)

# Load the trained model
MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "baseline.joblib"

model = joblib.load(MODEL_PATH)


class TweetInput(BaseModel):
    text: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def home():
    return {
        "message": "AfriHate Classification API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None
    }


@app.post("/predict")
def predict_tweet(data: TweetInput):

    if not data.text.strip():
        raise HTTPException(
            status_code=400,
            detail="Tweet text cannot be empty."
        )

    prediction = model.predict([data.text])[0]

    return {
        "text": data.text,
        "prediction": str(prediction)
    }
