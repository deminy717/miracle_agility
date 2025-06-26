-- 更新用户表结构 - 添加个人信息字段
-- 执行日期: 2024-12-19
-- 说明: 为用户表添加省市区、职业、简介等个人信息字段

USE miracle_agility;

-- 添加地区相关字段
ALTER TABLE users ADD COLUMN province VARCHAR(50) DEFAULT NULL COMMENT '省份' AFTER real_name;
ALTER TABLE users ADD COLUMN city VARCHAR(50) DEFAULT NULL COMMENT '城市' AFTER province;
ALTER TABLE users ADD COLUMN district VARCHAR(50) DEFAULT NULL COMMENT '区县' AFTER city;

-- 添加个人信息字段
ALTER TABLE users ADD COLUMN bio TEXT DEFAULT NULL COMMENT '个人简介' AFTER district;
ALTER TABLE users ADD COLUMN profession VARCHAR(100) DEFAULT NULL COMMENT '职业' AFTER bio;
ALTER TABLE users ADD COLUMN specialties TEXT DEFAULT NULL COMMENT '擅长项目' AFTER profession;
ALTER TABLE users ADD COLUMN experience_level VARCHAR(20) DEFAULT '新手' COMMENT '训练经验等级' AFTER specialties;

-- 更新已有测试数据，添加示例信息
UPDATE users SET 
    province = '北京市', 
    city = '北京市', 
    district = '朝阳区',
    bio = '热爱犬类训练，希望与更多朋友交流经验',
    profession = '犬类训练师',
    specialties = '敏捷训练,基础服从',
    experience_level = '中级'
WHERE nickname = '测试用户1';

UPDATE users SET 
    province = '上海市', 
    city = '上海市', 
    district = '浦东新区',
    bio = '专业犬类行为训练师，有丰富的比赛经验',
    profession = '专业训练师',
    specialties = '敏捷训练,行为矫正,比赛指导',
    experience_level = '高级'
WHERE nickname = '测试管理员';

UPDATE users SET 
    province = '广东省', 
    city = '深圳市', 
    district = '南山区',
    bio = '软件开发工程师，业余时间喜欢训练宠物犬',
    profession = '软件工程师',
    specialties = '基础训练,日常护理',
    experience_level = '初级'
WHERE nickname = '开发者账号';

-- 添加索引以提高查询性能
CREATE INDEX idx_users_province ON users(province);
CREATE INDEX idx_users_city ON users(city);
CREATE INDEX idx_users_experience_level ON users(experience_level); 