FROM node:latest as node
WORKDIR /app
COPY ./constraint-grid-app /app/
RUN npm install
RUN npm run build

FROM nginx:alpine
EXPOSE 80
COPY --from=node /app/dist/constraint-grid-app /usr/share/nginx/html


