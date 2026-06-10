FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances (y compris devDependencies pour le build)
RUN npm install

# Copier tout le code source
COPY . .

# Construire l'application (Frontend + Backend bundle)
RUN npm run build

# Nettoyer les devDependencies pour réduire la taille de l'image
RUN npm prune --production

# Exposer le port par défaut
EXPOSE 3000

# Lancer le serveur
CMD ["node", "dist/server.cjs"]
