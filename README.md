
# Microgrid Monitoring

Mini-application de monitoring énergétique d’un microgrid. Cette application permet de suivre la production, le stockage, la distribution d’énergie et la qualité du réseau d’un microgrid en temps réel, avec des analyses avancées via un modèle de Machine Learning.

---

##  Objectif

- Surveiller la production et la consommation d’énergie.
- Analyser la performance des batteries, fuel cells et panneaux solaires.
- Suivre la qualité réseau (tension, fréquence).
- Fournir un dashboard interactif pour la gestion des consommateurs avec carte et CRUD.
- Assurer la sécurité des données et la robustesse grâce à Kubernetes et PostgreSQL.

---

##  Stack Technique


- **Backend** : FastAPI  
- **Frontend** : React  
- **Base de données** : PostgreSQL  
- **Machine Learning** : Random Forest (fichier `random_forest_model.pkl`)  
- **Déploiement** :  
  - **Backend** : déployé sur **Kubernetes**, exposé à Internet via **Cloudflare Tunnel**  
  - **Frontend** : déployé sur **Netlify**  


---

##  Structure des données

Les données sont récupérées depuis Kaggle et corrigées localement pour éviter les valeurs aberrantes avant d’être insérées dans la base. Le dossier `data/` contient les fichiers CSV originaux .

| Champ original | Nouveau nom | Description / Utilité |
|----------------|------------|----------------------|
| Timestamp | timestamp | Date et heure de la mesure |
| Battery Active Power | battery_power | Puissance active batterie |
| Battery Active Power Set Response | battery_set_response | Réponse batterie aux consignes |
| PVPCS Active Power | pv_power | Puissance panneaux solaires |
| GE Body Active Power | ge_power_body | Consommation d’une charge spécifique |
| GE Active Power | ge_power_total | Consommation totale microgrid |
| GE Body Active Power Set Response | ge_body_set_response | Réponse GE body aux consignes |
| FC Active Power (FC-end) Set | fc_setpoint | Consigne fuel cell |
| FC Active Power | fc_power | Puissance réelle fuel cell |
| FC Active Power (FC-end) Set Response | fc_set_response | Réponse fuel cell aux consignes |
| Island mode MCCB Active Power | mccb_power | Consommation MCCB mode îlot |
| MG-LV-MSB AC Voltage | mg_lv_voltage | Tension AC bus microgrid |
| Receiving Point AC Voltage | receiving_voltage | Tension AC point de réception |
| Island mode MCCB AC Voltage | mccb_voltage | Tension AC MCCB |
| Island mode MCCB Frequency | mccb_frequency | Fréquence AC MCCB |
| MG-LV-MSB Frequency | mg_lv_frequency | Fréquence bus microgrid |
| Inlet Temperature of Chilled Water | temp_inlet | Température entrée eau glacée |
| Outlet Temperature | temp_outlet | Température sortie eau glacée |

---

##  Dashboard - Sections

### 1️⃣ Production d’énergie
- **Champs utilisés** : `battery_power`, `battery_set_response`, `pv_power`, `fc_power`, `fc_setpoint`, `fc_set_response`, `ge_power_total`
- **Graphiques** : Battery Power, PV Power, Fuel Cell Power vs Setpoint
- **KPIs** : % énergie renouvelable, rendement batterie, fiabilité fuel cell

### 2️⃣ Stockage d’énergie
- **Champs utilisés** : `battery_power`, `fc_power`
- **Graphiques** : État de charge estimé (SOC), contribution fuel cell
- **KPIs** : Autonomie batterie, % contribution fuel cell, alertes visuelles

### 3️⃣ Distribution & Consommation
- **Champs utilisés** : `ge_power_total`, `ge_power_body`, `mccb_power`
- **Graphiques** : Donut chart, évolution consommation
- **KPIs** : Part autoconsommation, dépendance au réseau, consommation critique

### 4️⃣ Gestion des consommateurs (CRUD + Carte)
- **Champs ajoutés** : `name`, `type`, `latitude`, `longitude`
- **Fonctionnalités** :
  - Carte interactive pour localiser les consommateurs
  - CRUD complet : ajouter, modifier, supprimer
  - Export des données des consommateurs

### 5️⃣ Qualité du réseau & Machine Learning
- **Champs utilisés** : `mg_lv_voltage`, `receiving_voltage`, `mccb_voltage`, `mg_lv_frequency`, `mccb_frequency`
- **Graphiques** : 
  - Tension et fréquence du réseau (LineChart)
  - Simulation tension/fréquence 24h (LineChart interactif)
  - Prédictions de tension sur 5 jours (LineChart ML)
- **KPIs** : 
  - Tension moyenne du microgrid
  - Fréquence moyenne du microgrid
  - Écart maximum de tension (MCCB ↔ bus)
- **Fonctionnalités avancées** : 
  - **Simulation dynamique** : ajustement consommation, production PV/PAC, mode îlot
  - **Prédictions ML** : affichage des résultats d’un modèle pré-entraîné (`.pkl`)
  - **Export des données** : possibilité d’exporter les graphes sous forme de **PDF**


---

##  Installation et lancement

1. **Activer l'environnement Python** :

```bash
cd backend
venv\Scripts\activate
```

2. **Charger les données dans PostgreSQL** :

```bash
python app/ingest_csv.py
```

3. **Lancer l’API FastAPI** :

```bash
uvicorn app.main:app --reload --port 8011
```

4. **Lancer le frontend React** :

```bash
cd frontend
npm install
npm start
```

> L’application sera accessible sur `http://localhost:3000`.

---

##  Machine Learning

- Le fichier `random_forest_model.pkl` contient le modèle entraîné.
- Les prédictions utilisent les moyennes journalières des features historiques.
- L’endpoint `/predict` retourne les valeurs prévues pour les 5 prochains jours.

---

#  Sécurité & 🚀 Déploiement

## Déploiement
- **Backend** : entièrement **conteneurisé avec Docker**, déployé sur **Kubernetes** pour une **scalabilité** et une **haute disponibilité**, exposé de manière sécurisée via **Cloudflare Tunnel**.  
- **Frontend** : hébergé sur **Netlify**, offrant une distribution rapide et fiable des assets statiques.  
- **Base de données** : PostgreSQL **conteneurisée sur Kubernetes**, non exposée à l’extérieur, accessible uniquement par le backend pour assurer la sécurité des données.  
- **Avantages** : architecture moderne, isolation complète des composants, résilience aux pannes et gestion simplifiée des mises à jour.  

## Sécurité des données
- **Validation stricte** de chaque champ en entrée pour prévenir les **injections malveillantes** et garantir l’intégrité des données.  
- **Restrictions et contrôles** appliqués dans le backend pour assurer le respect des formats et des contraintes métier.  
- **Endpoints sécurisés** : seuls les accès avec données valides sont traités, renforçant la protection contre les attaques.  
- **Conteneurisation et orchestration** apportent une couche supplémentaire de sécurité et d’isolation des services.  


---

##  Organisation du projet

```
microgrid/
│
├─ backend/ 
│ ├─ app/
│ │ ├─ pycache/ # Fichiers compilés Python
│ │ ├─ models/ # Définition des modèles 
│ │ ├─ routers/ # Endpoints FastAPI
│ │ ├─ init.py
│ │ ├─ database.py # Configuration et connexion à PostgreSQL
│ │ ├─ ingest_csv.py # Script pour charger les données CSV dans la DB
│ │ └─ main.py # Point d'entrée de l'application FastAPI
│ │
│ ├─ data/ # Données CSV d'entrée
│ ├─ ml/
│ │ ├─ predict.ipynb # Notebook pour prédictions et tests ML
│ │ └─ random_forest_model.pkl # Modèle ML pré-entraîné
│ │
│ ├─ venv/ 
│ ├─ Dockerfile 
│ └─ requirements.txt # Dépendances Python
│
├─ db/ 
│ ├─ backup.sql # Fichier de sauvegarde initial de la DB
│ └─ dockerfile # Dockerfile pour containeriser la DB
│
├─ frontend/ # Frontend React
│
├─ k8s/ 
│ ├─ backend/ 
│ │ ├─ deployment.yaml # Deployment Kubernetes du backend
│ │ ├─ ingress.yaml # Ingress pour exposer le backend via Cloudflare
│ │ └─ service.yaml # Service Kubernetes pour le backend
│ │
│ ├─ bd/ 
│ │ ├─ postgres-deployment.yaml # Deployment Kubernetes de PostgreSQL
│ │ ├─ postgres-pvc.yaml # Persistent Volume Claim
│ │ └─ postgres-service.yaml # Service interne pour le backend uniquement
│
├─ .gitignore 
├─ Jenkinsfile # Pipeline CI/CD
└─ README.md 
```
