FROM maven:3.6.3-jdk-8 as build

# 配置阿里云 Maven 镜像源
RUN mkdir -p /root/.m2 && \
    echo '<?xml version="1.0" encoding="UTF-8"?>' > /root/.m2/settings.xml && \
    echo '<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"' >> /root/.m2/settings.xml && \
    echo '          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' >> /root/.m2/settings.xml && \
    echo '          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0' >> /root/.m2/settings.xml && \
    echo '          http://maven.apache.org/xsd/settings-1.0.0.xsd">' >> /root/.m2/settings.xml && \
    echo '  <mirrors>' >> /root/.m2/settings.xml && \
    echo '    <mirror>' >> /root/.m2/settings.xml && \
    echo '      <id>aliyunmaven</id>' >> /root/.m2/settings.xml && \
    echo '      <mirrorOf>*</mirrorOf>' >> /root/.m2/settings.xml && \
    echo '      <name>阿里云公共仓库</name>' >> /root/.m2/settings.xml && \
    echo '      <url>https://maven.aliyun.com/repository/public</url>' >> /root/.m2/settings.xml && \
    echo '    </mirror>' >> /root/.m2/settings.xml && \
    echo '  </mirrors>' >> /root/.m2/settings.xml && \
    echo '</settings>' >> /root/.m2/settings.xml

COPY pom.xml /code/
WORKDIR /code
RUN mvn dependency:go-offline -B

COPY . /code
RUN mvn clean package -DskipTests -B

FROM adoptopenjdk:8-jre-hotspot-bionic

RUN apt-get update && \
    apt-get install -y --no-install-recommends tzdata curl && \
    ln -snf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo Asia/Shanghai > /etc/timezone && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY --from=build /code/target/agility-backend.jar /app.jar

RUN mkdir -p /var/log/myapp && \
    chmod -R 755 /var/log/myapp

EXPOSE 8085

# 使用更合理的内存配置
ENTRYPOINT ["java", \
    "-server", \
    "-jar", \
    "-Xms512M", \
    "-Xmx1024M", \
    "/app.jar"]