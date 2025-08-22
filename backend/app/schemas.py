from pydantic import BaseModel

class ConsumerCreate(BaseModel):
    name: str
    type: str
    latitude: float
    longitude: float

class ConsumerRead(BaseModel):
    id: int
    name: str
    type: str
    latitude: float
    longitude: float

    class Config:
        orm_mode = True
