FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances de production
RUN npm install --production

# Copier le reste des fichiers compilés (dist)
COPY dist/ ./dist/

# Exposer le port par défaut
EXPOSE 3000

# Lancer le serveur
CMD ["node", "dist/server.cjs"]
