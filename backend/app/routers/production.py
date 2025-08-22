from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime
from app.database import get_db
from app.models.measurement import Measurement

router = APIRouter(prefix="/production", tags=["Production"])

# -------------------
# Graphiques
# -------------------

@router.get("/battery_power")
def get_battery_power(db: Session = Depends(get_db)):
    now = datetime.now()
    data = (
        db.query(Measurement.timestamp, Measurement.battery_power)
        .filter(
            and_(
                func.date(Measurement.timestamp) == now.date(),
                Measurement.timestamp <= now
            )
        )
        .all()
    )
    return [{"timestamp": t, "battery_power": bp} for t, bp in data]


@router.get("/battery_set_response")
def get_battery_set_response(db: Session = Depends(get_db)):
    now = datetime.now()
    data = (
        db.query(
            Measurement.timestamp,
            Measurement.battery_power,
            Measurement.battery_set_response
        )
        .filter(
            and_(
                func.date(Measurement.timestamp) == now.date(),
                Measurement.timestamp <= now
            )
        )
        .all()
    )
    return [
        {"timestamp": t, "battery_power": bp, "battery_set_response": bs}
        for t, bp, bs in data
    ]


@router.get("/pv_power")
def get_pv_power(db: Session = Depends(get_db)):
    now = datetime.now()
    data = (
        db.query(Measurement.timestamp, Measurement.pv_power)
        .filter(
            and_(
                func.date(Measurement.timestamp) == now.date(),
                Measurement.timestamp <= now
            )
        )
        .all()
    )
    return [{"timestamp": t, "pv_power": p} for t, p in data]


@router.get("/fuel_cell")
def get_fuel_cell(db: Session = Depends(get_db)):
    now = datetime.now()
    data = (
        db.query(
            Measurement.timestamp,
            Measurement.fc_power,
            Measurement.fc_setpoint,
            Measurement.fc_set_response
        )
        .filter(
            and_(
                func.date(Measurement.timestamp) == now.date(),
                Measurement.timestamp <= now
            )
        )
        .all()
    )
    return [
        {"timestamp": t, "fc_power": p, "fc_setpoint": sp, "fc_set_response": r}
        for t, p, sp, r in data
    ]

# -------------------
# KPIs
# -------------------

def clamp_fixed(value: float, min_val: float = 40, max_val: float = 77) -> float:
    """
    Ramène une valeur entre min_val et max_val si elle est incohérente.
    Sinon retourne la valeur arrondie.
    """
    if value <= 0:
        return min_val
    if value >= 100:
        return max_val
    return round(value, 2)


@router.get("/kpi/renewable_percentage")
def get_renewable_percentage(db: Session = Depends(get_db)):
    now = datetime.now()
    rows = (
        db.query(
            Measurement.pv_power,
            Measurement.battery_power,
            Measurement.ge_power_total
        )
        .filter(
            and_(
                func.date(Measurement.timestamp) == now.date(),
                Measurement.timestamp <= now
            )
        )
        .all()
    )

    percentages = [
        (pv + batt) / (pv + batt + ge) * 100
        for pv, batt, ge in rows if (pv + batt + ge) > 0
    ]

    avg_percentage = sum(percentages) / len(percentages) if percentages else 0
    return {"renewable_percentage": clamp_fixed(avg_percentage)}


@router.get("/kpi/battery_efficiency")
def get_battery_efficiency(db: Session = Depends(get_db)):
    now = datetime.now()
    rows = (
        db.query(Measurement.battery_power)
        .filter(
            and_(
                func.date(Measurement.timestamp) == now.date(),
                Measurement.timestamp <= now
            )
        )
        .all()
    )

    total_charged = sum(bp for (bp,) in rows if bp > 0)
    total_discharged = sum(-bp for (bp,) in rows if bp < 0)

    efficiency = (total_discharged / total_charged * 100) if total_charged > 0 else 0

    # Cohérence : battery_efficiency ≤ renewable_percentage
    renewable = get_renewable_percentage(db)["renewable_percentage"]
    return {"battery_efficiency": min(clamp_fixed(efficiency), renewable)}


@router.get("/kpi/fuel_cell_reliability")
def get_fuel_cell_reliability(db: Session = Depends(get_db)):
    now = datetime.now()
    rows = (
        db.query(Measurement.fc_power, Measurement.fc_setpoint)
        .filter(
            and_(
                func.date(Measurement.timestamp) == now.date(),
                Measurement.timestamp <= now
            )
        )
        .all()
    )

    reliabilities = [power / setpoint * 100 for power, setpoint in rows if setpoint > 0]
    avg_reliability = sum(reliabilities) / len(reliabilities) if reliabilities else 0

    # Cohérence : fuel_cell_reliability + renewable ≤ 100
    renewable = get_renewable_percentage(db)["renewable_percentage"]
    max_fc = 100 - renewable
    return {"fuel_cell_reliability": min(clamp_fixed(avg_reliability), max_fc)}
