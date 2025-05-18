from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from routers import stores, reviews, auth

# Load environment variables
load_dotenv()

app = FastAPI(
    title="We Accept Bitcoin API",
    description="API for Bitcoin-accepting store directory with verified reviews",
    version="1.0.0"
)

# Configure CORS
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,https://www.btcapproved.com").split(",")
print("CORS Origins from env:", cors_origins)  # Debug print

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Health check endpoint
@app.get("/")
async def root():
    return {"status": "healthy", "message": "We Accept Bitcoin API is running"}

# Include routers
app.include_router(stores.router, prefix="/api/stores", tags=["stores"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])
app.include_router(auth.router, prefix="", tags=["auth"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 