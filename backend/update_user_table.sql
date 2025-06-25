-- 更新users表，添加用户信息完整性字段

-- 添加自定义昵称字段
ALTER TABLE users ADD COLUMN custom_nickname VARCHAR(100) COMMENT '用户自定义昵称';

-- 添加自定义头像字段
ALTER TABLE users ADD COLUMN custom_avatar VARCHAR(500) COMMENT '用户自定义头像URL';

-- 添加信息完整性标志字段
ALTER TABLE users ADD COLUMN profile_completed BOOLEAN DEFAULT FALSE COMMENT '用户信息是否完善';

-- 为现有用户设置默认值
UPDATE users SET profile_completed = FALSE WHERE profile_completed IS NULL; 