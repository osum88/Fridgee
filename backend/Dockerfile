FROM node:22-alpine

# Nastavení adresář uvnitř kontejneru na /app
WORKDIR /app

# Zkopíruje package.json a package-lock.json do WORKDIR (/app) v kontejneru
COPY package*.json ./

# Nainstalujeme všechny závislosti projektu uvnitř /app
RUN npm install

# Zkopírujeme zbytek kódu aplikace do kontejneru
COPY . .

# Port Express.js serveru
EXPOSE 3001

# Příkaz, který se spustí, když se kontejner spustí
CMD ["npm", "start"]