# Build the React client and package it into Spring Boot so production uses one
# HTTPS origin for the site and API (no browser CORS configuration is required).
FROM node:22-alpine AS frontend-build
WORKDIR /frontend
COPY Frontend/package*.json ./
RUN npm ci
COPY Frontend/ ./
RUN npm run build

FROM maven:3.9-eclipse-temurin-21 AS backend-build
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -q dependency:go-offline
COPY src/ src/
COPY --from=frontend-build /frontend/dist/ src/main/resources/static/
RUN ./mvnw -q -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=backend-build /app/target/*.jar app.jar
EXPOSE 10000
# Render supplies DATABASE_URL as postgresql://...; the JDBC driver requires
# jdbc:postgresql://.... PORT is supplied by Render at runtime.
ENTRYPOINT ["sh", "-c", "if [ -n \"$DATABASE_URL\" ]; then export DB_URL=\"jdbc:${DATABASE_URL}\"; fi; exec java -Dserver.port=${PORT:-10000} -jar /app/app.jar"]
