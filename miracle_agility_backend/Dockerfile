# 使用腾讯云公共镜像
FROM ccr.ccs.tencentyun.com/library/maven:3.6.3-openjdk-8 as build
COPY . /code
WORKDIR /code

# 配置阿里云 Maven 镜像源加速
RUN mkdir -p /root/.m2 && \
    echo '<?xml version="1.0" encoding="UTF-8"?><settings><mirrors><mirror><id>aliyunmaven</id><mirrorOf>*</mirrorOf><name>阿里云公共仓库</name><url>https://maven.aliyun.com/repository/public</url></mirror></mirrors></settings>' > /root/.m2/settings.xml

RUN mvn clean package -DskipTests

# 使用腾讯云 JRE 镜像
FROM ccr.ccs.tencentyun.com/library/openjdk:8-jre-alpine

# 替换为国内源
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tencent.com/g' /etc/apk/repositories && \
    apk add --no-cache tzdata curl

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