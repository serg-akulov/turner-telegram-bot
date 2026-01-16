from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

# Импорт роутеров
from routers import auth, orders, bot_config

# Загрузка переменных окружения
load_dotenv()

app = FastAPI(title="CRM API", description="API для управления заказами токарных работ")

# Список разрешенных источников
frontend_port = os.getenv("FRONTEND_PORT", "3000")
origins = [
    "http://localhost:3000",
    "http://frontend:3000",
    f"http://localhost:{frontend_port}",
    f"http://127.0.0.1:{frontend_port}",
    f"http://frontend:{frontend_port}",
    "*" # Попробуем разрешить всё для теста
]

print(f"DEBUG: Origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False, # С "*" нельзя True
    allow_methods=["*"],
    allow_headers=["*"],
)

# Безопасность
security = HTTPBearer()

# Включаем роутеры
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(bot_config.router, prefix="/api/bot-config", tags=["bot-config"])

@app.get("/")
async def root():
    return {"message": "CRM API для токарных работ"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("API_PORT", 8000)),
        reload=True
    )