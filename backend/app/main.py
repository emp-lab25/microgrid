from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from .database import Base, engine
from .routers import production
from .routers import storage
from .routers import distribution
from .routers import consumers
from .routers import network_quality

from ingest_csv import import_csvs_to_db

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
app.include_router(network_quality.router)

#tester DB
# DATABASE_URL = "postgresql+psycopg2://microgrid_admin:123@localhost/microgrid_db"
DATABASE_URL ="postgresql://microgrid_admin:123@microgrid-postgres:5432/microgrid_db" #in prod

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, text

def test_db_connection():
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print(f"Test query result: {result.scalar()}")
        print("Connexion réussie à la base de données PostgreSQL!")
    except Exception as e:
        print(f"Erreur de connexion à la base de données : {e}")

print("---------------------------------------------------------------------------------------------")
test_db_connection()
print("---------------------------------------------------------------------------------------------")



if __name__ == "__main__":
    
    fichiers = ["data/Sep_2022.csv", "data/Dec_2022.csv"]
    import_csvs_to_db(fichiers)
    uvicorn.run(app, host="0.0.0.0", port=8011)
