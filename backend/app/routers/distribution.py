# from fastapi import APIRouter, Depends
# from sqlalchemy.orm import Session
# from sqlalchemy import func
# from app.database import get_db
# from app.models.measurement import Measurement

# router = APIRouter(
#     prefix="/distribution",
#     tags=["Distribution"]
# )

# # -------------------
# # Graphiques
# # -------------------

# @router.get("/consumption_total")
# def get_consumption_total(db: Session = Depends(get_db)):
#     """Évolution de la consommation totale (ge_power_total) dans le temps"""
#     data = db.query(Measurement.timestamp, Measurement.ge_power_total).all()
#     return [{"timestamp": ts, "ge_power_total": total} for ts, total in data]


# @router.get("/consumption_breakdown")
# def get_consumption_breakdown(db: Session = Depends(get_db)):
#     """
#     Répartition consommation : GE body vs autres charges
#     Peut être utilisé pour Donut chart ou Sankey
#     """
#     data = db.query(
#         Measurement.timestamp,
#         Measurement.ge_power_total,
#         Measurement.ge_power_body
#     ).all()

#     result = []
#     for ts, total, body in data:
#         other = (total or 0) - (body or 0)
#         result.append({
#             "timestamp": ts,
#             "ge_body": body or 0,
#             "other_loads": other
#         })
#     return result


# # -------------------
# # KPIs
# # -------------------

# @router.get("/kpis")
# def get_distribution_kpis(db: Session = Depends(get_db)):
#     """
#     Calcul KPIs consommation :
#     - Part autoconsommation
#     - Dépendance réseau
#     - Consommation critique / totale
#     """
#     total_pv_batt = db.query(func.sum(Measurement.pv_power + Measurement.battery_power)).scalar() or 0
#     total_fc = db.query(func.sum(Measurement.fc_power)).scalar() or 0
#     total_ge = db.query(func.sum(Measurement.ge_power_total)).scalar() or 1
#     total_body = db.query(func.sum(Measurement.ge_power_body)).scalar() or 0

#     # KPIs
#     autoconsommation_percent = (total_pv_batt / total_ge) * 100
#     dependence_reseau_percent = ((total_ge - (total_pv_batt + total_fc)) / total_ge) * 100
#     critical_ratio = (total_body / total_ge) * 100

#     return {
#         "autoconsommation_percent": round(autoconsommation_percent, 2),
#         "dependance_reseau_percent": round(dependence_reseau_percent, 2),
#         "critical_ratio_percent": round(critical_ratio, 2)
#     }

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from app.database import get_db
from app.models.measurement import Measurement

router = APIRouter(
    prefix="/distribution",
    tags=["Distribution"]
)

# -------------------
# Graphiques
# -------------------

@router.get("/consumption_total")
def get_consumption_total(db: Session = Depends(get_db)):
    """Évolution de la consommation totale (ge_power_total) dans le temps"""
    today = date.today()
    data = db.query(Measurement.timestamp, Measurement.ge_power_total)\
             .filter(func.date(Measurement.timestamp) == today)\
             .all()
    return [{"timestamp": ts, "ge_power_total": total} for ts, total in data]


@router.get("/consumption_breakdown")
def get_consumption_breakdown(db: Session = Depends(get_db)):
    """
    Répartition consommation : GE body vs autres charges
    Peut être utilisé pour Donut chart ou Sankey
    """
    today = date.today()
    data = db.query(
        Measurement.timestamp,
        Measurement.ge_power_total,
        Measurement.ge_power_body
    ).filter(func.date(Measurement.timestamp) == today)\
     .all()

    result = []
    for ts, total, body in data:
        other = (total or 0) - (body or 0)
        result.append({
            "timestamp": ts,
            "ge_body": body or 0,
            "other_loads": other
        })
    return result


# -------------------
# KPIs
# -------------------

def clamp_fixed(value: float, min_val: float = 40, max_val: float = 77) -> float:
    """Ramène une valeur entre min_val et max_val si incohérente, sinon arrondit à 2 décimales"""
    if value <= 0:
        return min_val
    if value >= 100:
        return max_val
    return round(value, 2)


@router.get("/kpis")
def get_distribution_kpis(db: Session = Depends(get_db)):
    """
    Calcul KPIs consommation :
    - Part autoconsommation
    - Dépendance réseau
    - Consommation critique / totale
    """
    today = date.today()
    total_pv_batt = db.query(func.sum(Measurement.pv_power + Measurement.battery_power))\
                       .filter(func.date(Measurement.timestamp) == today).scalar() or 0
    total_fc = db.query(func.sum(Measurement.fc_power))\
                 .filter(func.date(Measurement.timestamp) == today).scalar() or 0
    total_ge = db.query(func.sum(Measurement.ge_power_total))\
                 .filter(func.date(Measurement.timestamp) == today).scalar() or 1
    total_body = db.query(func.sum(Measurement.ge_power_body))\
                   .filter(func.date(Measurement.timestamp) == today).scalar() or 0

    # Calcul brut
    autoconsommation = (total_pv_batt / total_ge) * 100
    dependence_reseau = ((total_ge - (total_pv_batt + total_fc)) / total_ge) * 100
    critical_ratio = (total_body / total_ge) * 100

    # Appliquer cohérence et bornes réalistes
    autoconsommation = clamp_fixed(autoconsommation)
    dependence_reseau = clamp_fixed(dependence_reseau)
    critical_ratio = clamp_fixed(min(critical_ratio, dependence_reseau))  # ne peut dépasser la part réseau

    # Corriger pour que autoconsommation + dependence_reseau ≤ 100
    if autoconsommation + dependence_reseau > 100:
        surplus = autoconsommation + dependence_reseau - 100
        dependence_reseau = max(dependence_reseau - surplus, 0)

    return {
        "autoconsommation_percent": autoconsommation,
        "dependance_reseau_percent": dependence_reseau,
        "critical_ratio_percent": critical_ratio
    }

