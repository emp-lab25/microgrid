from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from .database import Base, engine
from .routers import production
from .routers import storage
from .routers import distribution
from .routers import consumers



import uvicorn

# Créer les tables si elles n’existent pas
Base.metadata.create_all(bind=engine)

# Initialisation de l'application
app = FastAPI(title="Smart Microgrid Monitoring API")

# Monitoring Prometheus
Instrumentator().instrument(app).expose(app)

# Middlewares
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# Inclure les routers
app.include_router(production.router)
app.include_router(storage.router)
app.include_router(distribution.router)
app.include_router(consumers.router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8011)
