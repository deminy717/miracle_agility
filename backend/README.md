# 犬敏捷俱乐部小程序后台

基于 Spring Boot 的犬敏捷俱乐部小程序后台 API 服务。

## 项目结构

```
backend/
├── src/main/java/com/miracle/agility/
│   ├── MiracleAgilityApplication.java      # 主启动类
│   ├── common/
│   │   └── ApiResponse.java                # 统一响应格式
│   ├── controller/                         # 控制器层
│   │   ├── UserController.java            # 用户相关接口
│   │   ├── HomeController.java            # 首页相关接口
│   │   ├── ArticleController.java         # 文章相关接口
│   │   ├── VideoController.java           # 视频相关接口
│   │   └── CourseController.java          # 课程相关接口
│   ├── service/                           # 服务层
│   │   ├── UserService.java
│   │   ├── HomeService.java
│   │   ├── ArticleService.java
│   │   ├── VideoService.java
│   │   └── CourseService.java
│   ├── entity/                            # 实体类
│   │   ├── User.java                      # 用户实体
│   │   ├── Article.java                   # 文章实体
│   │   ├── Video.java                     # 视频实体
│   │   ├── Course.java                    # 课程实体
│   │   ├── Chapter.java                   # 章节实体
│   │   ├── Lesson.java                    # 课时实体
│   │   ├── UserCourse.java                # 用户课程关联
│   │   └── UserLesson.java                # 用户课时关联
│   ├── mapper/                            # 数据访问层
│   ├── dto/                               # 数据传输对象
│   │   ├── request/                       # 请求DTO
│   │   └── response/                      # 响应DTO
│   └── utils/
│       └── JwtUtil.java                   # JWT工具类
├── src/main/resources/
│   ├── application.yml                    # 应用配置
│   └── sql/init.sql                       # 数据库初始化脚本
└── pom.xml                                # Maven配置
```

## 技术栈

- Spring Boot 2.7.0
- MySQL 8.0
- MyBatis Plus 3.5.2
- JWT 0.9.1
- Redis
- Maven

## 快速开始

### 1. 环境准备

- JDK 8+
- MySQL 8.0+
- Redis 6.0+
- Maven 3.6+

### 2. 数据库配置

1. 创建数据库：
```sql
CREATE DATABASE miracle_agility CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 执行初始化脚本：
```bash
mysql -u root -p miracle_agility < src/main/resources/sql/init.sql
```

### 3. 配置文件

修改 `src/main/resources/application.yml` 中的数据库连接信息：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/miracle_agility?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=GMT%2B8
    username: your_username
    password: your_password
  
  redis:
    host: localhost
    port: 6379
```

### 4. 启动项目

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

项目将启动在 `http://localhost:8080/api`

## API 接口

### 用户相关

- `POST /api/user/login` - 用户登录
- `GET /api/user/info` - 获取用户信息

### 首页相关

- `GET /api/home/articles` - 获取首页资讯列表
- `GET /api/home/videos` - 获取首页视频列表

### 文章相关

- `GET /api/article/detail` - 获取文章详情

### 视频相关

- `GET /api/video/detail` - 获取视频详情

### 课程相关

- `GET /api/course/list` - 获取课程列表（需要登录）
- `GET /api/course/detail` - 获取课程详情（需要登录）
- `GET /api/course/lesson` - 获取课时内容（需要登录）
- `POST /api/course/update-status` - 更新课时状态（需要登录）

## 认证机制

需要登录的接口需要在请求头中添加：
```
auth: Bearer <token>
```

## 响应格式

所有接口统一返回格式：
```json
{
  "error": 0,
  "body": {},
  "message": ""
}
```

- `error=0`: 成功
- `error=401`: 需要登录
- `error=500`: 系统异常
- 其他值: 业务异常

## 开发说明

1. 所有接口都遵循 RESTful 设计规范
2. 使用 MyBatis Plus 进行数据访问，支持自动分页
3. JWT 用于用户身份验证
4. 统一异常处理和响应格式
5. 支持跨域请求

## 部署

1. 打包项目：
```bash
mvn clean package
```

2. 运行 jar 包：
```bash
java -jar target/agility-backend-1.0.0.jar
```

## 注意事项

1. 本项目为演示版本，微信登录部分使用模拟数据
2. 生产环境需要配置真实的微信小程序 AppID 和 AppSecret
3. 建议使用 Nginx 进行反向代理
4. 数据库连接池和 Redis 连接需要根据实际情况调优 