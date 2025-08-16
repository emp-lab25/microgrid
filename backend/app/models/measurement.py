from sqlalchemy import Column, Integer, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Measurement(Base):
    __tablename__ = "measurements"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, nullable=False)
    battery_power = Column(Float)
    battery_set_response = Column(Float)
    pv_power = Column(Float)
    ge_power_body = Column(Float)
    ge_power_total = Column(Float)
    ge_body_set_response = Column(Float)
    fc_setpoint = Column(Float)
    fc_power = Column(Float)
    fc_set_response = Column(Float)
    mccb_power = Column(Float)
    mg_lv_voltage = Column(Float)
    receiving_voltage = Column(Float)
    mccb_voltage = Column(Float)
    mccb_frequency = Column(Float)
    mg_lv_frequency = Column(Float)
    temp_inlet = Column(Float)
    temp_outlet = Column(Float)
