import json
import os
from pathlib import Path

import joblib
import sklearn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from app.text_cleaning import clean_text

app = FastAPI(
    title="AfriHate Classification API",
    description="API for classifying African-language social media posts. A support tool for human moderators.",
    version="1.1.0"
)

# Load the trained model (MODEL_PATH can be overridden, for example inside Docker)
MODEL_PATH = Path(os.getenv("MODEL_PATH", Path(__file__).resolve().parent.parent / "models" / "baseline.joblib"))
model = joblib.load(MODEL_PATH)

# information saved next to the model: threshold, scores, scikit-learn version
info = {}
info_file = MODEL_PATH.with_name("baseline_info.json")
if info_file.exists():
    info = json.loads(info_file.read_text())
    trained_with = info.get("scikit_learn_version")
    if trained_with and trained_with != sklearn.__version__:
        print(f"WARNING: model trained with scikit-learn {trained_with}, but {sklearn.__version__} is installed")


REVIEW_THRESHOLD = float(info.get("review_threshold", 0.5))

classes = [str(c) for c in model.classes_]
normal_at = [c.lower() for c in classes].index("normal")


class TweetInput(BaseModel):
    text: str = Field(..., max_length=2000)


class BatchInput(BaseModel):
    texts: list[str] = Field(..., min_length=1, max_length=100)


origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
origins += [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def classify(texts):
    probs = model.predict_proba([clean_text(t) for t in texts])    # same cleaning as in training
    results = []
    for row in probs:
        label = classes[int(row.argmax())]
        p_normal = float(row[normal_at])
        results.append({
            "prediction": label,                                   # kept so the existing frontend keeps working
            "label": label,
            "probabilities": {c: round(float(p), 4) for c, p in zip(classes, row)},
            "harmful_score": round(1 - p_normal, 4),
            "needs_human_review": p_normal < REVIEW_THRESHOLD,
        })
    return results


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


@app.get("/model-info")
def model_info():
    return {
        "classes": classes,
        "review_threshold": REVIEW_THRESHOLD,
        "held_out_language": info.get("held_out_language"),
        "test_macro_f1": info.get("test_macro_f1"),
        "zero_shot_macro_f1": info.get("zero_shot_macro_f1"),
        "note": "Support tool for human moderators, not an automatic censor. "
                "Accuracy differs by language and is much weaker on languages it was not trained on.",
    }


@app.post("/predict")
def predict_tweet(data: TweetInput):

    if not data.text.strip():
        raise HTTPException(
            status_code=400,
            detail="Tweet text cannot be empty."
        )

    result = classify([data.text])[0]
    return {"text": data.text, **result}


@app.post("/predict_batch")
def predict_batch(data: BatchInput):
    return {"results": classify(data.texts)}