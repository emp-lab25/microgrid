from app.database import Base, engine
from app.models.consumer import Consumer
from app.models.measurement import Measurement

Base.metadata.create_all(bind=engine)
print("Tables créées !")
