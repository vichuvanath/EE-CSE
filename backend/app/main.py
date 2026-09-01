from fastapi import FastAPI
from app.core.config import settings

app = FastAPI(
    title="Student Project Management Portal API",
    version="1.0.0",
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
