import pandas as pd
from sqlalchemy.orm import Session
from models.measurement import Measurement, Base
from database import engine, SessionLocal
import numpy as np


# Créer les tables si elles n'existent pas
Base.metadata.create_all(bind=engine)

# Lire le CSV
csv_file = "data/Aug_2022.csv"
df = pd.read_csv(csv_file, delimiter=',')

# Renommer les colonnes pour correspondre aux attributs de Measurement
df.rename(columns={
    'Timestamp': 'timestamp',
    'Battery_Active_Power': 'battery_power',
    'Battery_Active_Power_Set_Response': 'battery_set_response',
    'PVPCS_Active_Power': 'pv_power',
    'GE_Body_Active_Power': 'ge_power_body',
    'GE_Active_Power': 'ge_power_total',
    'GE_Body_Active_Power_Set_Response': 'ge_body_set_response',
    'FC_Active_Power_FC_END_Set': 'fc_setpoint',
    'FC_Active_Power': 'fc_power',
    'FC_Active_Power_FC_end_Set_Response': 'fc_set_response',
    'Island_mode_MCCB_Active_Power': 'mccb_power',
    'MG-LV-MSB_AC_Voltage': 'mg_lv_voltage',
    'Receiving_Point_AC_Voltage': 'receiving_voltage',
    'Island_mode_MCCB_AC_Voltage': 'mccb_voltage',
    'Island_mode_MCCB_Frequency': 'mccb_frequency',
    'MG-LV-MSB_Frequency': 'mg_lv_frequency',
    'Inlet_Temperature_of_Chilled_Water': 'temp_inlet',
    'Outlet_Temperature': 'temp_outlet'
}, inplace=True)

# Convertir timestamp et changer l'année 2022 -> 2025
df['timestamp'] = pd.to_datetime(df['timestamp'])
df['timestamp'] = df['timestamp'].apply(lambda x: x.replace(year=2025) if x.year == 2022 else x)


# === Remplacer les 0 ou valeurs nulles par la moyenne ===
for col in df.columns:
    if col != "timestamp":  # on ne touche pas au timestamp
        if pd.api.types.is_numeric_dtype(df[col]):
            mean_val = df[col][df[col] != 0].mean()  # moyenne sans compter les 0
            df[col] = df[col].replace(0, np.nan)     # remplacer 0 par NaN
            df[col] = df[col].fillna(mean_val)       # remplacer NaN par la moyenne


# === Nettoyage des valeurs incohérentes / extrêmes ===

# Fonctions pour filtrer les valeurs selon chaque capteur
def clamp(series, min_val, max_val):
    return series.clip(lower=min_val, upper=max_val)

# Batterie
df['battery_power'] = clamp(df['battery_power'], -120, 120)
df['battery_set_response'] = clamp(df['battery_set_response'], -60, 80)

# PV
df['pv_power'] = clamp(df['pv_power'], 0, 60)

# GE Body
df['ge_power_body'] = clamp(df['ge_power_body'], 0, 300)
df['ge_power_total'] = clamp(df['ge_power_total'], 0, 400)
df['ge_body_set_response'] = clamp(df['ge_body_set_response'], 0, 240)

# Fuel Cell
df['fc_setpoint'] = clamp(df['fc_setpoint'], 0, 80)
df['fc_power'] = clamp(df['fc_power'], 0, 80)
df['fc_set_response'] = clamp(df['fc_set_response'], 0, 80)

# MCCB
df['mccb_power'] = clamp(df['mccb_power'], 0, 400)
df['mccb_voltage'] = clamp(df['mccb_voltage'], 460, 500)
df['mccb_frequency'] = clamp(df['mccb_frequency'], 59.5, 61)

# Microgrid
df['mg_lv_voltage'] = clamp(df['mg_lv_voltage'], 460, 500)
df['receiving_voltage'] = clamp(df['receiving_voltage'], 460, 500)
df['mg_lv_frequency'] = clamp(df['mg_lv_frequency'], 59.5, 61)

# Températures
df['temp_inlet'] = clamp(df['temp_inlet'], 5, 35)
df['temp_outlet'] = clamp(df['temp_outlet'], 5, 35)

# Remplacer les NaN par 0 ou valeur moyenne selon la colonne
fill_zero_cols = [
    'battery_power', 'battery_set_response', 'pv_power',
    'ge_power_body', 'ge_power_total', 'ge_body_set_response',
    'fc_setpoint', 'fc_power', 'fc_set_response',
    'mccb_power'
]
df[fill_zero_cols] = df[fill_zero_cols].fillna(0)

fill_mean_cols = [
    'mccb_voltage', 'mccb_frequency', 'mg_lv_voltage', 'receiving_voltage', 'mg_lv_frequency',
    'temp_inlet', 'temp_outlet'
]
for col in fill_mean_cols:
    df[col] = df[col].fillna(df[col].mean())

# === Statistiques et vérifications ===

# print("\n=== Valeurs manquantes par colonne ===")
# print(df.isna().sum())

# print("\n=== Statistiques descriptives après nettoyage ===")
print(df.describe())

#  Insérer les données dans PostgreSQL
session: Session = SessionLocal()

#  Vider la table avant l'insertion
session.query(Measurement).delete()
session.commit()

#  Ajouter les mesures
for _, row in df.iterrows():
    measurement = Measurement(
        timestamp=row['timestamp'],
        battery_power=row['battery_power'],
        battery_set_response=row.get('battery_set_response'),
        pv_power=row['pv_power'],
        ge_power_body=row['ge_power_body'],
        ge_power_total=row['ge_power_total'],
        ge_body_set_response=row.get('ge_body_set_response'),
        fc_setpoint=row['fc_setpoint'],
        fc_power=row['fc_power'],
        fc_set_response=row.get('fc_set_response'),
        mccb_power=row['mccb_power'],
        mg_lv_voltage=row['mg_lv_voltage'],
        receiving_voltage=row.get('receiving_voltage'),
        mccb_voltage=row['mccb_voltage'],
        mccb_frequency=row['mccb_frequency'],
        mg_lv_frequency=row['mg_lv_frequency'],
        temp_inlet=row.get('temp_inlet'),
        temp_outlet=row.get('temp_outlet')
    )
    session.add(measurement)

# Commit et fermer la session
session.commit()
session.close()

print("✅ Données CSV importées avec succès !")
