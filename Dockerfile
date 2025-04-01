
FROM node:20


WORKDIR /app
COPY . .

RUN npm install
RUN npm rebuild bcrypt --update-binary

RUN npm run build

EXPOSE 3000


CMD ["npm", "start"]