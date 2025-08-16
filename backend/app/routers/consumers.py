from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db , engine ,Base
from app.models.consumer import Consumer
from app.schemas import ConsumerCreate, ConsumerRead
from fastapi.responses import StreamingResponse
import csv
from io import StringIO

router = APIRouter(prefix="/consumers", tags=["Consumers"])

Base.metadata.create_all(bind=engine)

from typing import List
from app.schemas import ConsumerCreate, ConsumerRead

@router.post("/bulk", response_model=List[ConsumerRead])
def create_consumers_bulk(consumers: List[ConsumerCreate], db: Session = Depends(get_db)):
    db_consumers = []
    for c in consumers:
        db_c = Consumer(**c.dict())
        db.add(db_c)
        db_consumers.append(db_c)
    db.commit()
    for db_c in db_consumers:
        db.refresh(db_c)
    return db_consumers


@router.post("/", response_model=ConsumerRead)
def create_consumer(consumer: ConsumerCreate, db: Session = Depends(get_db)):
    db_consumer = Consumer(**consumer.dict())
    db.add(db_consumer)
    db.commit()
    db.refresh(db_consumer)
    return db_consumer

@router.get("/", response_model=list[ConsumerRead])
def list_consumers(db: Session = Depends(get_db)):
    return db.query(Consumer).all()

@router.get("/{consumer_id}", response_model=ConsumerRead)
def get_consumer(consumer_id: int, db: Session = Depends(get_db)):
    consumer = db.query(Consumer).filter(Consumer.id == consumer_id).first()
    if not consumer:
        raise HTTPException(status_code=404, detail="Consumer not found")
    return consumer

@router.put("/{consumer_id}", response_model=ConsumerRead)
def update_consumer(consumer_id: int, updated: ConsumerCreate, db: Session = Depends(get_db)):
    consumer = db.query(Consumer).filter(Consumer.id == consumer_id).first()
    if not consumer:
        raise HTTPException(status_code=404, detail="Consumer not found")
    for field, value in updated.dict().items():
        setattr(consumer, field, value)
    db.commit()
    db.refresh(consumer)
    return consumer

@router.delete("/{consumer_id}")
def delete_consumer(consumer_id: int, db: Session = Depends(get_db)):
    consumer = db.query(Consumer).filter(Consumer.id == consumer_id).first()
    if not consumer:
        raise HTTPException(status_code=404, detail="Consumer not found")
    db.delete(consumer)
    db.commit()
    return {"detail": "Consumer deleted"}

@router.get("/export_csv")
def export_consumers_csv(db: Session = Depends(get_db)):
    consumers = db.query(Consumer).all()
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "name", "type", "latitude", "longitude"])
    for c in consumers:
        writer.writerow([c.id, c.name, c.type, c.latitude, c.longitude])
    output.seek(0)
    return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=consumers.csv"})
