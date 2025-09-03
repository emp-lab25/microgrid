from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from pydantic import BaseModel
from app.database import get_db
from app.models.measurement import Measurement
import joblib
import pandas as pd
import os


router = APIRouter(
    prefix="/network_quality",
    tags=["Network Quality"]
)

# -------------------
# Modèle pour simulation utilisateur
# -------------------
class SimulationInput(BaseModel):
    consumption: float          # Puissance consommée (kW)
    island_mode: bool           # Mode îlot (True/False)
    pv_production: float        # Production PV (kW)
    fc_production: float        # Production Fuel Cell (kW)

# -------------------
# Graphiques historiques (aujourd'hui)
# -------------------
@router.get("/voltage_frequency")
def get_voltage_frequency(db: Session = Depends(get_db)):
    """Retourne les tensions et fréquences pour aujourd'hui"""
    today = date.today()
    data = db.query(
        Measurement.timestamp,
        Measurement.mg_lv_voltage,
        Measurement.receiving_voltage,
        Measurement.mccb_voltage,
        Measurement.mg_lv_frequency,
        Measurement.mccb_frequency
    ).filter(func.date(Measurement.timestamp) == today).all()

    return [
        {
            "timestamp": ts,
            "mg_lv_voltage": mg,
            "receiving_voltage": rv,
            "mccb_voltage": mv,
            "mg_lv_frequency": mf,
            "mccb_frequency": mfreq
        } for ts, mg, rv, mv, mf, mfreq in data
    ]

# -------------------
# KPIs calculés pour aujourd'hui
# -------------------
@router.get("/kpis")
def get_network_kpis(db: Session = Depends(get_db)):
    """
    KPIs simples :
    - Tension moyenne microgrid
    - Fréquence moyenne microgrid
    - Écart max tension MCCB vs bus
    """
    today = date.today()
    voltages = db.query(
        Measurement.mg_lv_voltage,
        Measurement.mccb_voltage,
        Measurement.mg_lv_frequency
    ).filter(func.date(Measurement.timestamp) == today).all()

    if not voltages:
        return {"error": "Pas de données pour aujourd'hui"}

    mg_voltage_list = [v[0] for v in voltages if v[0] is not None]
    mccb_voltage_list = [v[1] for v in voltages if v[1] is not None]
    mg_freq_list = [v[2] for v in voltages if v[2] is not None]

    avg_voltage = sum(mg_voltage_list) / len(mg_voltage_list) if mg_voltage_list else 0
    avg_freq = sum(mg_freq_list) / len(mg_freq_list) if mg_freq_list else 0
    max_voltage_diff = max([abs(m - mc) for m, mc in zip(mg_voltage_list, mccb_voltage_list)]) if mg_voltage_list and mccb_voltage_list else 0

    return {
        "avg_mg_voltage": round(avg_voltage, 2),
        "avg_mg_frequency": round(avg_freq, 2),
        "max_voltage_diff_mccb_bus": round(max_voltage_diff, 2)
    }

# -------------------
# Simulation utilisateur
# -------------------
@router.post("/simulate")
def simulate_network(input_data: SimulationInput):
    """
    Simulation simple : variation de tension et fréquence selon la consommation et production.
    - Mode îlot : facteur d’amplification de variation
    - Retourne liste de valeurs sur 24h simulées 
    """
    hours = list(range(24))
    results = []

    for h in hours:
        # Variation simple : +/- 1% par 100 kW de déséquilibre
        net_power = input_data.consumption - (input_data.pv_production + input_data.fc_production)
        island_factor = 1.2 if input_data.island_mode else 1.0

        voltage = 400 - (net_power / 100) * island_factor   # tension en V
        frequency = 50 - (net_power / 200) * island_factor  # fréquence en Hz

        results.append({
            "hour": h,
            "simulated_voltage": round(voltage, 2),
            "simulated_frequency": round(frequency, 2)
        })

    return results

# -------------------
#  modèle prédictif ML
# -------------------
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import timedelta
from app.database import get_db
from app.models.measurement import Measurement
import joblib
import pandas as pd
import os



# --- Charger le modèle ---
model_path = os.path.join(os.path.dirname(__file__), "../../ml/random_forest_model.pkl")
model = joblib.load(model_path)

# --- Définir les features utilisées par le modèle ---
features = [
    'battery_power',
    'battery_set_response',
    'pv_power',
    'ge_power_body',
    'ge_power_total',
    'ge_body_set_response',
    'fc_setpoint',
    'fc_power',
    'fc_set_response',
    'mccb_power',
    'receiving_voltage',
    'mccb_voltage',
    'mccb_frequency',
    'mg_lv_frequency',
    'temp_inlet',
    'temp_outlet'
]

@router.get("/predict")
def predict_network(db: Session = Depends(get_db)):
    """
    Prédit la tension 'mg_lv_voltage' pour les 5 prochains jours
    à partir de la moyenne quotidienne des features historiques dans la base.
    """
    try:
        # --- Récupérer les données depuis la base ---
        query = db.query(Measurement).all()
        if not query:
            return {"error": "Pas de données dans la base"}

        # --- Convertir en DataFrame ---
        data = pd.DataFrame([{
            'Timestamp': m.timestamp,
            'battery_power': m.battery_power,
            'battery_set_response': m.battery_set_response,
            'pv_power': m.pv_power,
            'ge_power_body': m.ge_power_body,
            'ge_power_total': m.ge_power_total,
            'ge_body_set_response': m.ge_body_set_response,
            'fc_setpoint': m.fc_setpoint,
            'fc_power': m.fc_power,
            'fc_set_response': m.fc_set_response,
            'mccb_power': m.mccb_power,
            'receiving_voltage': m.receiving_voltage,
            'mccb_voltage': m.mccb_voltage,
            'mccb_frequency': m.mccb_frequency,
            'mg_lv_frequency': m.mg_lv_frequency,
            'temp_inlet': m.temp_inlet,
            'temp_outlet': m.temp_outlet
        } for m in query])

        data['Timestamp'] = pd.to_datetime(data['Timestamp'])

        # --- Resampling journalier pour obtenir la moyenne par jour ---
        daily_mean = data.set_index('Timestamp')[features].resample('1D').mean()

        # --- Prendre la dernière moyenne disponible comme référence ---
        last_day_mean = daily_mean.iloc[-1]

        # --- Créer les entrées pour les 5 prochains jours ---
        X_new = pd.DataFrame([last_day_mean.values]*5, columns=features)

        # --- Prédiction ---
        y_pred = model.predict(X_new)

        # --- Créer un DataFrame avec les dates futures et les prédictions ---
        future_dates = [daily_mean.index[-1] + timedelta(days=i+1) for i in range(5)]
        predictions = pd.DataFrame({
            "date": future_dates,
            "mg_lv_voltage_pred": y_pred
        })

        # --- Retourner les résultats en JSON ---
        return predictions.to_dict(orient="records")

    except Exception as e:
        return {"error": str(e)}
