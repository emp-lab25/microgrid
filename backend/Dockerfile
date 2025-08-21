# Utilise l’image officielle Python
FROM python:3.11-slim

# Définit le dossier de travail
WORKDIR /app

# Copie les fichiers requirements
COPY requirements.txt .

# Installe les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Copie le reste du code
COPY . .

# Expose le port (même que ton uvicorn local, mais ici sans --reload)
EXPOSE 8011

# Commande de lancement
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8011"]
