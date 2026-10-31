# Dockerfile ubicado en la raíz del repositorio
# Etapa 1: Compilar la aplicación con Maven y OpenJDK 21
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app/back

# Copiar el wrapper de maven y dependencias primero
COPY back/.mvn/ .mvn/
COPY back/mvnw back/pom.xml ./
RUN chmod +x ./mvnw
RUN ./mvnw dependency:go-offline -B

# Copiar el código fuente del back y compilar
COPY back/src/ ./src/
RUN ./mvnw clean package -DskipTests

# Etapa 2: Imagen final para ejecución
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copiar la carpeta datos completa con los JSON, PDFs y vectores
COPY datos/ ./datos/

# Copiar el JAR generado en back
COPY --from=builder /app/back/target/*.jar app.jar

# Render asigna dinámicamente la variable PORT (por defecto 8080 o 10000)
ENV PORT=8080
EXPOSE 8080

# Iniciar la aplicación en la raíz /app para que encuentre ./datos
CMD ["java", "-Dserver.port=${PORT}", "-Dcorpus.json=datos/procesados/articulos.json", "-jar", "app.jar"]
