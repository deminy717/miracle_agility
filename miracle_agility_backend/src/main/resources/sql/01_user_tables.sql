-- 奇迹犬敏捷训练小程序 - 用户相关数据表
-- 创建时间: 2024-12-19
-- 版本: 1.0

-- 使用数据库
USE miracle_agility;

-- 1. 用户表 (users)
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    openid VARCHAR(100) NOT NULL UNIQUE COMMENT '微信OpenID',
    unionid VARCHAR(100) DEFAULT NULL COMMENT '微信UnionID',
    nickname VARCHAR(50) NOT NULL COMMENT '用户昵称',
    avatar_url VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
    gender TINYINT DEFAULT 0 COMMENT '性别: 0-未知, 1-男, 2-女',
    phone VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    email VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    real_name VARCHAR(50) DEFAULT NULL COMMENT '真实姓名',
    role ENUM('user', 'admin', 'super_admin') DEFAULT 'user' COMMENT '用户角色',
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active' COMMENT '用户状态',
    level VARCHAR(20) DEFAULT '新手' COMMENT '用户等级',
    experience_points INT DEFAULT 0 COMMENT '经验值',
    total_study_time INT DEFAULT 0 COMMENT '总学习时长(分钟)',
    last_login_time DATETIME DEFAULT NULL COMMENT '最后登录时间',
    last_login_ip VARCHAR(45) DEFAULT NULL COMMENT '最后登录IP',
    registration_source VARCHAR(50) DEFAULT 'wechat' COMMENT '注册来源',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted_at DATETIME DEFAULT NULL COMMENT '删除时间(软删除)',
    
    INDEX idx_openid (openid),
    INDEX idx_phone (phone),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 2. 用户会话表 (user_sessions)
CREATE TABLE user_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '会话ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    session_key VARCHAR(100) NOT NULL UNIQUE COMMENT '微信会话密钥',
    access_token VARCHAR(512) NOT NULL COMMENT '访问令牌',
    refresh_token VARCHAR(512) DEFAULT NULL COMMENT '刷新令牌',
    expires_at DATETIME NOT NULL COMMENT '过期时间',
    client_ip VARCHAR(45) DEFAULT NULL COMMENT '客户端IP',
    user_agent TEXT DEFAULT NULL COMMENT '用户代理信息',
    device_info JSON DEFAULT NULL COMMENT '设备信息',
    status ENUM('active', 'expired', 'revoked') DEFAULT 'active' COMMENT '会话状态',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_session_key (session_key),
    INDEX idx_access_token (access_token),
    INDEX idx_expires_at (expires_at),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户会话表';

-- 3. 用户扩展信息表 (user_profiles)
CREATE TABLE user_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
    user_id BIGINT NOT NULL UNIQUE COMMENT '用户ID',
    birthday DATE DEFAULT NULL COMMENT '生日',
    location VARCHAR(100) DEFAULT NULL COMMENT '所在地区',
    bio TEXT DEFAULT NULL COMMENT '个人简介',
    dog_breed VARCHAR(50) DEFAULT NULL COMMENT '狗狗品种',
    dog_name VARCHAR(50) DEFAULT NULL COMMENT '狗狗名字',
    dog_age INT DEFAULT NULL COMMENT '狗狗年龄',
    training_experience ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'beginner' COMMENT '训练经验',
    interests JSON DEFAULT NULL COMMENT '兴趣标签',
    achievements JSON DEFAULT NULL COMMENT '成就记录',
    preferences JSON DEFAULT NULL COMMENT '用户偏好设置',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_dog_breed (dog_breed),
    INDEX idx_training_experience (training_experience)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户扩展信息表';

-- 4. 管理员表 (admin_users)
CREATE TABLE admin_users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '管理员ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '管理员用户名',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    salt VARCHAR(50) NOT NULL COMMENT '密码盐值',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
    phone VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    role ENUM('admin', 'super_admin') DEFAULT 'admin' COMMENT '管理员角色',
    permissions JSON DEFAULT NULL COMMENT '权限列表',
    status ENUM('active', 'inactive', 'locked') DEFAULT 'active' COMMENT '账号状态',
    last_login_time DATETIME DEFAULT NULL COMMENT '最后登录时间',
    last_login_ip VARCHAR(45) DEFAULT NULL COMMENT '最后登录IP',
    login_attempts INT DEFAULT 0 COMMENT '登录尝试次数',
    locked_until DATETIME DEFAULT NULL COMMENT '锁定到期时间',
    created_by BIGINT DEFAULT NULL COMMENT '创建者ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted_at DATETIME DEFAULT NULL COMMENT '删除时间(软删除)',
    
    FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员用户表';

-- 5. 管理员会话表 (admin_sessions)
CREATE TABLE admin_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '会话ID',
    admin_id BIGINT NOT NULL COMMENT '管理员ID',
    token VARCHAR(200) NOT NULL UNIQUE COMMENT '访问令牌',
    refresh_token VARCHAR(200) DEFAULT NULL COMMENT '刷新令牌',
    expires_at DATETIME NOT NULL COMMENT '过期时间',
    client_ip VARCHAR(45) DEFAULT NULL COMMENT '客户端IP',
    user_agent TEXT DEFAULT NULL COMMENT '用户代理信息',
    status ENUM('active', 'expired', 'revoked') DEFAULT 'active' COMMENT '会话状态',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE,
    INDEX idx_admin_id (admin_id),
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员会话表';

-- 6. 操作日志表 (operation_logs)
CREATE TABLE operation_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    user_id BIGINT DEFAULT NULL COMMENT '操作用户ID',
    admin_id BIGINT DEFAULT NULL COMMENT '操作管理员ID',
    operation_type VARCHAR(50) NOT NULL COMMENT '操作类型',
    operation_desc TEXT DEFAULT NULL COMMENT '操作描述',
    resource_type VARCHAR(50) DEFAULT NULL COMMENT '资源类型',
    resource_id BIGINT DEFAULT NULL COMMENT '资源ID',
    old_data JSON DEFAULT NULL COMMENT '操作前数据',
    new_data JSON DEFAULT NULL COMMENT '操作后数据',
    client_ip VARCHAR(45) DEFAULT NULL COMMENT '客户端IP',
    user_agent TEXT DEFAULT NULL COMMENT '用户代理信息',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_admin_id (admin_id),
    INDEX idx_operation_type (operation_type),
    INDEX idx_resource_type (resource_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

-- 插入初始管理员数据
INSERT INTO admin_users (username, password_hash, salt, real_name, email, role, permissions, status)
VALUES 
('admin', SHA2(CONCAT('admin123', 'miracle_salt_2024'), 256), 'miracle_salt_2024', '系统管理员', 'admin@miracle-agility.com', 'super_admin', 
 JSON_ARRAY('user_manage', 'content_manage', 'system_manage', 'data_export'), 'active'),
('editor', SHA2(CONCAT('editor123', 'miracle_salt_2024'), 256), 'miracle_salt_2024', '内容编辑员', 'editor@miracle-agility.com', 'admin', 
 JSON_ARRAY('content_manage'), 'active');

-- 插入测试用户数据
INSERT INTO users (openid, nickname, avatar_url, gender, role, level, experience_points)
VALUES 
('test_openid_001', '测试用户1', 'https://example.com/avatar1.jpg', 1, 'user', '新手', 0),
('test_openid_002', '测试管理员', 'https://example.com/avatar2.jpg', 2, 'admin', '管理员', 1000),
('test_openid_003', '开发者账号', 'https://example.com/avatar3.jpg', 1, 'user', '开发者', 500);

-- 为测试用户创建扩展信息
INSERT INTO user_profiles (user_id, dog_breed, dog_name, dog_age, training_experience, interests)
VALUES 
(1, '边境牧羊犬', '小黑', 3, 'beginner', JSON_ARRAY('agility', 'obedience')),
(2, '金毛', '金子', 5, 'advanced', JSON_ARRAY('agility', 'competition')),
(3, '拉布拉多', '小白', 2, 'intermediate', JSON_ARRAY('training', 'health')); 