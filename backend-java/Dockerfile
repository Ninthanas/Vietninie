FROM maven:3.9.11-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml pom.xml
RUN mvn -B dependency:go-offline
COPY src src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /workspace/target/vietninie-api-1.0.0.jar /app/app.jar
USER 10001:10001
EXPOSE 8080
ENTRYPOINT ["java","-XX:MaxRAMPercentage=70","-jar","/app/app.jar"]
