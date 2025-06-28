-- ===============================================
-- 用户课程关联数据
-- 创建时间: 2024-06-28
-- 说明: 为已有的用户和课程生成对应关系
-- ===============================================

-- 使用数据库
USE miracle_agility;

-- 清除可能存在的旧数据（可选）
-- DELETE FROM user_courses;

-- 插入用户课程关联数据
-- 用户1（测试用户1）的课程关联
INSERT INTO user_courses (user_id, course_id, registration_type, progress, last_study_time, total_study_minutes, is_completed, created_at)
VALUES 
(1, 1, 'direct', 85, NOW() - INTERVAL 2 DAY, 120, TRUE, NOW() - INTERVAL 30 DAY),
(1, 2, 'direct', 45, NOW() - INTERVAL 1 DAY, 60, FALSE, NOW() - INTERVAL 15 DAY);

-- 用户2（测试管理员）的课程关联
INSERT INTO user_courses (user_id, course_id, registration_type, progress, last_study_time, total_study_minutes, is_completed, created_at)
VALUES 
(2, 1, 'direct', 100, NOW() - INTERVAL 10 DAY, 180, TRUE, NOW() - INTERVAL 45 DAY),
(2, 2, 'direct', 75, NOW() - INTERVAL 3 DAY, 90, FALSE, NOW() - INTERVAL 20 DAY);

-- 用户3（开发者账号）的课程关联
INSERT INTO user_courses (user_id, course_id, registration_type, progress, last_study_time, total_study_minutes, is_completed, created_at)
VALUES 
(3, 1, 'direct', 100, NOW() - INTERVAL 5 DAY, 150, TRUE, NOW() - INTERVAL 40 DAY);

-- 添加一些授权码注册的课程关系
-- 首先创建授权码
INSERT INTO course_access_codes (code, course_id, created_by, description, usage_limit, status, created_at)
VALUES 
('AGILITY2024', 2, 2, '高级障碍训练授权码', 10, 'active', NOW() - INTERVAL 60 DAY);

-- 使用授权码注册课程
INSERT INTO user_courses (user_id, course_id, registration_type, source_code_id, progress, last_study_time, total_study_minutes, is_completed, created_at)
VALUES 
(3, 2, 'code', LAST_INSERT_ID(), 30, NOW() - INTERVAL 2 DAY, 45, FALSE, NOW() - INTERVAL 10 DAY);

-- 更新授权码使用情况
UPDATE course_access_codes 
SET used_count = used_count + 1, 
    used_by = 3, 
    used_at = NOW() - INTERVAL 10 DAY
WHERE code = 'AGILITY2024';

-- 更新课程的学生数量
UPDATE courses 
SET student_count = (SELECT COUNT(*) FROM user_courses WHERE course_id = courses.id AND status = 'active')
WHERE id IN (1, 2);

-- 更新用户的总学习时间
UPDATE users u
SET total_study_time = (SELECT COALESCE(SUM(total_study_minutes), 0) FROM user_courses WHERE user_id = u.id)
WHERE id IN (1, 2, 3);

-- 打印确认信息
SELECT 'User-Course relationships have been successfully created!' AS Message; 