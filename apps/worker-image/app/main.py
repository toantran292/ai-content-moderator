from fastapi import FastAPI
from fastapi import UploadFile, File
from uuid import uuid4
from tempfile import NamedTemporaryFile
from .clip import classify_image

app = FastAPI(title="Worker-Image", version="0.1.0")

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/classify")
async def classify(file: UploadFile = File(...)):
    tmp = NamedTemporaryFile(delete=False)
    tmp.write(await file.read()); tmp.close()
    scores = classify_image(tmp.name)
    return {"scores": scores, "id": str(uuid4())}