# Etapa 1: Compilar la aplicación con Maven y OpenJDK 21
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app

# Copiar el wrapper de maven y dependencias primero para cachear
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x ./mvnw
RUN ./mvnw dependency:go-offline -B

# Copiar el código fuente y compilar
COPY src/ ./src/
RUN ./mvnw clean package -DskipTests

# Etapa 2: Imagen final ligera para ejecución
FROM eclipse-temurin:21-jre
WORKDIR /app

# Crear carpetas requeridas para los datos
RUN mkdir -p datos/procesados

# Copiar el jar generado desde la etapa de compilación
COPY --from=builder /app/target/*.jar app.jar

# Exponer el puerto de Spring Boot
EXPOSE 8080

# Iniciar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]
