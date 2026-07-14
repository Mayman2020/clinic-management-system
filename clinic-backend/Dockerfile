FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY mvnw mvnw.cmd ./
COPY .mvn .mvn
COPY pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B -q
COPY src ./src
RUN ./mvnw package -DskipTests -B -q

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN mkdir -p /data/uploads
COPY --from=build /app/target/*.jar app.jar
ENV UPLOAD_DIR=/data/uploads
ENV FILE_BASE_URL=http://localhost:8082/api/v1
ENV SERVER_PORT=8082
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
