# from fastapi import APIRouter, Depends
# from sqlalchemy.orm import Session
# from sqlalchemy import func
# from app.database import get_db
# from app.models.measurement import Measurement

# router = APIRouter(prefix="/production", tags=["Production"])

# # -------------------
# # Graphiques
# # -------------------

# @router.get("/battery_power")
# def get_battery_power(db: Session = Depends(get_db)):
#     data = db.query(Measurement.timestamp, Measurement.battery_power).all()
#     return [{"timestamp": t, "battery_power": bp} for t, bp in data]

# @router.get("/battery_set_response")
# def get_battery_set_response(db: Session = Depends(get_db)):
#     data = db.query(
#         Measurement.timestamp,
#         Measurement.battery_power,
#         Measurement.battery_set_response
#     ).all()
#     return [{"timestamp": t, "battery_power": bp, "battery_set_response": bs} for t, bp, bs in data]

# @router.get("/pv_power")
# def get_pv_power(db: Session = Depends(get_db)):
#     data = db.query(Measurement.timestamp, Measurement.pv_power).all()
#     return [{"timestamp": t, "pv_power": p} for t, p in data]

# @router.get("/fuel_cell")
# def get_fuel_cell(db: Session = Depends(get_db)):
#     data = db.query(
#         Measurement.timestamp,
#         Measurement.fc_power,
#         Measurement.fc_setpoint,
#         Measurement.fc_set_response
#     ).all()
#     return [
#         {"timestamp": t, "fc_power": p, "fc_setpoint": sp, "fc_set_response": r}
#         for t, p, sp, r in data
#     ]

# # -------------------
# # KPIs
# # -------------------

# @router.get("/kpi/renewable_percentage")
# def get_renewable_percentage(db: Session = Depends(get_db)):
#     """
#     % énergie renouvelable = (pv_power + battery_power) / ge_power_total
#     """
#     total_pv_battery = db.query(func.sum(Measurement.pv_power + Measurement.battery_power)).scalar() or 0
#     total_ge = db.query(func.sum(Measurement.ge_power_total)).scalar() or 1  # éviter division par 0
#     percentage = (total_pv_battery / total_ge) * 100
#     return {"renewable_percentage": round(percentage, 2)}

# @router.get("/kpi/battery_efficiency")
# def get_battery_efficiency(db: Session = Depends(get_db)):
#     """
#     Rendement batterie = énergie déchargée / énergie chargée ==> sum des puissances positives / sum des puissances négatives
#     """
#     charged = db.query(func.sum(func.nullif(Measurement.battery_power, 0))).filter(Measurement.battery_power > 0).scalar() or 0
#     discharged = - (db.query(func.sum(func.nullif(Measurement.battery_power, 0))).filter(Measurement.battery_power < 0).scalar() or 0)
#     efficiency = (discharged / charged * 100) if charged != 0 else 0
#     return {"battery_efficiency": round(efficiency, 2)}

# @router.get("/kpi/fuel_cell_reliability")
# def get_fuel_cell_reliability(db: Session = Depends(get_db)):
#     """
#     Fiabilité fuel cell = fc_power / fc_setpoint
#     """
#     total_power = db.query(func.sum(Measurement.fc_power)).scalar() or 0
#     total_setpoint = db.query(func.sum(Measurement.fc_setpoint)).scalar() or 1
#     reliability = (total_power / total_setpoint) * 100
#     print(round(reliability, 2))
#     return {"fuel_cell_reliability": round(reliability, 2)}
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import date
from app.database import get_db
from app.models.measurement import Measurement

router = APIRouter(prefix="/production", tags=["Production"])

# -------------------
# Graphiques
# -------------------

@router.get("/battery_power")
def get_battery_power(db: Session = Depends(get_db)):
    today = date.today()
    data = db.query(Measurement.timestamp, Measurement.battery_power)\
             .filter(func.date(Measurement.timestamp) == today)\
             .all()
    return [{"timestamp": t, "battery_power": bp} for t, bp in data]

@router.get("/battery_set_response")
def get_battery_set_response(db: Session = Depends(get_db)):
    today = date.today()
    data = db.query(
        Measurement.timestamp,
        Measurement.battery_power,
        Measurement.battery_set_response
    ).filter(func.date(Measurement.timestamp) == today)\
     .all()
    return [{"timestamp": t, "battery_power": bp, "battery_set_response": bs} for t, bp, bs in data]

@router.get("/pv_power")
def get_pv_power(db: Session = Depends(get_db)):
    today = date.today()
    data = db.query(Measurement.timestamp, Measurement.pv_power)\
             .filter(func.date(Measurement.timestamp) == today)\
             .all()
    return [{"timestamp": t, "pv_power": p} for t, p in data]

@router.get("/fuel_cell")
def get_fuel_cell(db: Session = Depends(get_db)):
    today = date.today()
    data = db.query(
        Measurement.timestamp,
        Measurement.fc_power,
        Measurement.fc_setpoint,
        Measurement.fc_set_response
    ).filter(func.date(Measurement.timestamp) == today)\
     .all()
    return [
        {"timestamp": t, "fc_power": p, "fc_setpoint": sp, "fc_set_response": r}
        for t, p, sp, r in data
    ]

# -------------------
# KPIs
# -------------------

@router.get("/kpi/renewable_percentage")
def get_renewable_percentage(db: Session = Depends(get_db)):
    today = date.today()
    total_pv_battery = db.query(func.sum(Measurement.pv_power + Measurement.battery_power))\
                         .filter(func.date(Measurement.timestamp) == today)\
                         .scalar() or 0
    total_ge = db.query(func.sum(Measurement.ge_power_total))\
                 .filter(func.date(Measurement.timestamp) == today)\
                 .scalar() or 1
    percentage = (total_pv_battery / total_ge) * 100
    return {"renewable_percentage": round(percentage, 2)}

@router.get("/kpi/battery_efficiency")
def get_battery_efficiency(db: Session = Depends(get_db)):
    today = date.today()
    charged = db.query(func.sum(func.nullif(Measurement.battery_power, 0)))\
                .filter(Measurement.battery_power > 0)\
                .filter(func.date(Measurement.timestamp) == today)\
                .scalar() or 0
    discharged = - (db.query(func.sum(func.nullif(Measurement.battery_power, 0)))\
                    .filter(Measurement.battery_power < 0)\
                    .filter(func.date(Measurement.timestamp) == today)\
                    .scalar() or 0)
    efficiency = (discharged / charged * 100) if charged != 0 else 0
    return {"battery_efficiency": round(efficiency, 2)}

@router.get("/kpi/fuel_cell_reliability")
def get_fuel_cell_reliability(db: Session = Depends(get_db)):
    today = date.today()
    total_power = db.query(func.sum(Measurement.fc_power))\
                    .filter(func.date(Measurement.timestamp) == today)\
                    .scalar() or 0
    total_setpoint = db.query(func.sum(Measurement.fc_setpoint))\
                       .filter(func.date(Measurement.timestamp) == today)\
                       .scalar() or 1
    reliability = (total_power / total_setpoint) * 100
    return {"fuel_cell_reliability": round(reliability, 2)}
