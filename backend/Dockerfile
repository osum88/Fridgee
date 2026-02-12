FROM node:22-alpine

# Instalace potřebných balíčků pro Alpine 
# musl-locales obsahuje data pro řazení a formátování
RUN apk add --no-cache icu-data-full icu-libs musl-locales

# Nastavení adresář uvnitř kontejneru na /app
WORKDIR /app

# Zkopíruje package.json a package-lock.json do WORKDIR (/app) v kontejneru
COPY package*.json ./

# Nainstalujeme všechny závislosti projektu uvnitř /app
RUN npm install

# Nastavení jazykového prostředí
ENV LANG en_US.UTF-8
ENV LC_ALL en_US.UTF-8

# RUN npx prisma generate // TODO: kontrola jestli je to potreba

# Zkopírujeme zbytek kódu aplikace do kontejneru
COPY . .

# Port Express.js serveru
EXPOSE 3001

# Příkaz, který se spustí, když se kontejner spustí
CMD ["npm", "start"]