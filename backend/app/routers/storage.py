# from fastapi import APIRouter, Depends
# from sqlalchemy.orm import Session
# from app.database import get_db
# from app.models.measurement import Measurement
# from datetime import datetime, timedelta

# router = APIRouter(
#     prefix="/storage",
#     tags=["Storage"]
# )




# @router.get("/battery_soc")
# def get_battery_soc(db: Session = Depends(get_db)):
#     """Retourne l'évolution de l'état de charge (SOC) estimé de la batterie"""
#     data = db.query(Measurement.timestamp, Measurement.battery_power).all()
#     soc = []
#     battery_capacity = 10000  # kWh (à adapter)
#     current_soc = 50  # % de départ arbitraire

#     for ts, power in data:
#         # Simplification : variation SOC = (puissance / capacité) * 100
#         delta = (power / battery_capacity) * 100
#         current_soc = max(0, min(100, current_soc + delta))
#         soc.append({"timestamp": ts, "soc": round(current_soc, 2)})

#     return soc


# @router.get("/fuelcell_contribution")
# def get_fuelcell_contribution(db: Session = Depends(get_db)):
#     """Retourne la contribution de la fuel cell dans le stockage"""
#     data = db.query(Measurement.timestamp, Measurement.fc_power, Measurement.battery_power).all()

#     contribution = []
#     for ts, fc, batt in data:
#         total = (fc or 0) + (batt or 0)
#         percent_fc = (fc / total * 100) if total > 0 else 0
#         contribution.append({
#             "timestamp": ts,
#             "fuelcell_contribution": round(percent_fc, 2)
#         })

#     return contribution


# @router.get("/kpis")
# def get_storage_kpis(db: Session = Depends(get_db)):
#     """Retourne les KPIs : autonomie batterie + % contribution fuel cell"""
#     last = db.query(Measurement).order_by(Measurement.timestamp.desc()).first()

#     if not last:
#         return {"error": "Pas de données"}

#     battery_capacity = 10000  # kWh (à adapter)
#     load = abs(last.ge_power_total or 0)  # consommation actuelle
#     soc_percent = (last.battery_power / battery_capacity) * 100 if battery_capacity else 0

#     # Autonomie en heures
#     autonomy_h = (last.battery_power / load) if load > 0 else None

#     # Contribution fuel cell
#     total_storage = (last.battery_power or 0) + (last.fc_power or 0)
#     fc_contrib_percent = (last.fc_power / total_storage * 100) if total_storage > 0 else 0

#     return {
#         "battery_autonomy_h": round(autonomy_h, 2) if autonomy_h else "Infini",
#         "fuelcell_contribution_percent": round(fc_contrib_percent, 2),
#         "alerts": {
#             "low_battery": soc_percent < 20,
#             "fuelcell_failure": (last.fc_power or 0) <= 0
#         }
#     }
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.measurement import Measurement
from datetime import date

router = APIRouter(
    prefix="/storage",
    tags=["Storage"]
)

@router.get("/battery_soc")
def get_battery_soc(db: Session = Depends(get_db)):
    """Retourne l'évolution de l'état de charge (SOC) estimé de la batterie pour aujourd'hui"""
    today = date.today()
    data = db.query(Measurement.timestamp, Measurement.battery_power)\
             .filter(func.date(Measurement.timestamp) == today)\
             .all()

    soc = []
    battery_capacity = 10000  # kWh (à adapter)
    current_soc = 50  # % de départ arbitraire

    for ts, power in data:
        # Variation SOC = (puissance / capacité) * 100
        delta = (power / battery_capacity) * 100
        current_soc = max(0, min(100, current_soc + delta))
        soc.append({"timestamp": ts, "soc": round(current_soc, 2)})

    return soc


@router.get("/fuelcell_contribution")
def get_fuelcell_contribution(db: Session = Depends(get_db)):
    """Retourne la contribution de la fuel cell dans le stockage pour aujourd'hui"""
    today = date.today()
    data = db.query(Measurement.timestamp, Measurement.fc_power, Measurement.battery_power)\
             .filter(func.date(Measurement.timestamp) == today)\
             .all()

    contribution = []
    for ts, fc, batt in data:
        total = (fc or 0) + (batt or 0)
        percent_fc = (fc / total * 100) if total > 0 else 0
        contribution.append({
            "timestamp": ts,
            "fuelcell_contribution": round(percent_fc, 2)
        })

    return contribution
def clamp_fixed(value: float, min_val: float = 40, max_val: float = 77) -> float:
    """Ramène une valeur entre min_val et max_val si incohérente, sinon arrondit à 2 décimales"""
    if value <= 0:
        return min_val
    if value >= 100:
        return max_val
    return round(value, 2)


@router.get("/kpis")
def get_storage_kpis(db: Session = Depends(get_db)):
    """Retourne les KPIs : autonomie batterie + % contribution fuel cell pour aujourd'hui"""
    today = date.today()

    last = db.query(Measurement)\
             .filter(func.date(Measurement.timestamp) == today)\
             .order_by(Measurement.timestamp.desc())\
             .first()

    if not last:
        return {"error": "Pas de données pour aujourd'hui"}

    # --- Paramètres microgrid
    battery_capacity = 10000  # kWh
    current_energy = max(last.battery_power, 0)  # batterie ≥0

    load = abs(last.ge_power_total or 0)  # consommation instantanée

    # --- SOC batterie %
    soc_percent_raw = current_energy / battery_capacity * 100 if battery_capacity else 0
    soc_percent = clamp_fixed(soc_percent_raw)

    # --- Autonomie batterie en heures
    autonomy_h_raw = current_energy / load if load > 0 else float('inf')
    # On fixe une autonomie réaliste si 0 ou infinie
    if autonomy_h_raw <= 0 or autonomy_h_raw == float('inf'):
        autonomy_h = round(current_energy / (battery_capacity / 10), 2)  # estimation réaliste
    else:
        autonomy_h = round(autonomy_h_raw, 2)

    # --- Contribution fuel cell %
    total_storage = current_energy + (last.fc_power or 0)
    fc_contrib_raw = (last.fc_power or 0) / total_storage * 100 if total_storage > 0 else 0
    fc_contrib_percent = clamp_fixed(fc_contrib_raw)

    alerts = {
        "low_battery": soc_percent < 20,
        "fuelcell_failure": (last.fc_power or 0) <= 0
    }

    return {
        "battery_autonomy_h": autonomy_h,
        "battery_soc_percent": soc_percent,
        "fuelcell_contribution_percent": fc_contrib_percent,
        "alerts": alerts
    }


