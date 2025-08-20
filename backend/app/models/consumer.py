from sqlalchemy import Column, Integer, String, Float
from app.database import Base

class Consumer(Base):
    __tablename__ = "consumers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)    # longueur max 50
    type = Column(String(20), nullable=False)    # longueur max 20
    latitude = Column(Float, nullable=False)     # float pour latitude
    longitude = Column(Float, nullable=False)    # float pour longitude
