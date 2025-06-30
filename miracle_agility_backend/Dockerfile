# Build the application artifact
FROM maven:3.6.3-eclipse-temurin-8 as build
COPY . /code
WORKDIR /code

RUN mvn clean package -DskipTests

# Start with a base image containing Java runtime
FROM eclipse-temurin:8-jre-focal

# Copy the application's jar to the container
COPY --from=build /code/target/agility-backend.jar /app.jar

# Set timezone to China
RUN ln -snf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo Asia/Shanghai > /etc/timezone

# Informs the container listens on the specified network ports at runtime
EXPOSE 8085

# Create log directory
RUN mkdir -p /var/log/myapp && \
    chmod -R 755 /var/log/myapp

# Run the jar file
ENTRYPOINT ["java", \
    "-server", \
    "-jar", \
    "-Xms4096M", \
    "-Xmx4096M", \
    "/app.jar"]