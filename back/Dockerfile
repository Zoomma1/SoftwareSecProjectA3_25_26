FROM maven:3.9.4-eclipse-temurin-17-alpine AS builder
WORKDIR /app
COPY . .
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN mkdir -p /app/images
EXPOSE 8090
# Copy the fat Spring Boot jar built in the builder stage
COPY --from=builder /app/target/SoftwareSecProjectA3_25_26_back-0.0.1-SNAPSHOT.jar /app/app.jar

ENTRYPOINT ["java", "-jar", "/app/app.jar"]