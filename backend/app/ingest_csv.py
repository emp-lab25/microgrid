
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from .models.measurement import Measurement, Base
from .database import engine, SessionLocal


def randomize(col, min_val, max_val):
    """Remplace 0 et NaN par une valeur aléatoire réaliste"""
    mask = (col == 0) | (col.isna())
    col[mask] = np.random.uniform(min_val, max_val, size=mask.sum())
    return col


def clamp(series, min_val, max_val):
    """Force les valeurs à rester dans l’intervalle"""
    return series.clip(lower=min_val, upper=max_val)


def _prepare_dataframe(csv_file: str) -> pd.DataFrame:
    """Lit, nettoie et prépare un DataFrame à partir d’un CSV"""

    df = pd.read_csv(csv_file, delimiter=',')

    # Renommer les colonnes
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

    # Rééchantillonner : garder une ligne par heure
    df.set_index('timestamp', inplace=True)
    df = df.resample('H').mean().reset_index()

    # Nettoyage des colonnes
    df['battery_power'] = clamp(randomize(df['battery_power'], -120, 120), -120, 120)
    df['battery_set_response'] = clamp(randomize(df['battery_set_response'], -60, 80), -60, 80)
    df['pv_power'] = clamp(randomize(df['pv_power'], 0, 60), 0, 60)
    df['ge_power_body'] = clamp(randomize(df['ge_power_body'], 0, 300), 0, 300)
    df['ge_power_total'] = clamp(randomize(df['ge_power_total'], 0, 400), 0, 400)
    df['ge_body_set_response'] = clamp(randomize(df['ge_body_set_response'], 0, 240), 0, 240)
    df['fc_setpoint'] = clamp(randomize(df['fc_setpoint'], 0, 80), 0, 80)
    df['fc_power'] = clamp(randomize(df['fc_power'], 0, 80), 0, 80)
    df['fc_set_response'] = clamp(randomize(df['fc_set_response'], 0, 80), 0, 80)
    df['mccb_power'] = clamp(randomize(df['mccb_power'], 0, 400), 0, 400)
    df['mccb_voltage'] = clamp(randomize(df['mccb_voltage'], 460, 500), 460, 500)
    df['receiving_voltage'] = clamp(randomize(df['receiving_voltage'], 460, 500), 460, 500)
    df['mg_lv_voltage'] = clamp(randomize(df['mg_lv_voltage'], 460, 500), 460, 500)
    df['mccb_frequency'] = clamp(randomize(df['mccb_frequency'], 59.5, 61), 59.5, 61)
    df['mg_lv_frequency'] = clamp(randomize(df['mg_lv_frequency'], 59.5, 61), 59.5, 61)
    df['temp_inlet'] = clamp(randomize(df['temp_inlet'], 5, 35), 5, 35)
    df['temp_outlet'] = clamp(randomize(df['temp_outlet'], 5, 35), 5, 35)

    return df


def import_csvs_to_db(csv_files: list[str]):
    """
    Vide la table, puis importe plusieurs CSV dans l’ordre.
    :param csv_files: liste des chemins des fichiers CSV
    """

    # Créer les tables si elles n'existent pas
    Base.metadata.create_all(bind=engine)

    session: Session = SessionLocal()

    # Vider la table au début
    session.query(Measurement).delete()
    session.commit()
    print("🗑️ Table vidée")

    # Parcourir chaque fichier et insérer
    for csv_file in csv_files:
        print(f"📥 Import du fichier : {csv_file}")
        df = _prepare_dataframe(csv_file)

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

        session.commit()
        print(f"✅ Données de {csv_file} importées ({df.shape[0]} lignes)")

    session.close()
    print("🎉 Import terminé pour tous les fichiers !")
