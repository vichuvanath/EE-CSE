from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import auth, team, project, file, submission, student, advisor

app = FastAPI(
    title="Student Project Management Portal API",
    version="1.0.0",
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(team.router, prefix="/api")
app.include_router(project.router, prefix="/api")
app.include_router(file.router, prefix="/api")
app.include_router(submission.router, prefix="/api")
app.include_router(student.router, prefix="/api")
app.include_router(advisor.router, prefix="/api")








@app.get("/health")
def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

