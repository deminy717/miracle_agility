-- 生成用户课程测试数据
INSERT INTO user_courses (user_id, course_id, registration_type, progress, last_study_time, total_study_minutes, is_completed, completed_at, status)
VALUES 
-- 用户1的课程
(1, 1, 'direct', 75, '2024-03-15 10:30:00', 180, false, null, 'active'),
(1, 2, 'direct', 100, '2024-03-14 15:45:00', 240, true, '2024-03-14 15:45:00', 'active'),
(1, 3, 'code', 30, '2024-03-13 09:20:00', 60, false, null, 'active'),

-- 用户2的课程
(2, 1, 'direct', 90, '2024-03-15 11:20:00', 200, false, null, 'active'),
(2, 4, 'gift', 50, '2024-03-12 14:30:00', 120, false, null, 'active'),

-- 用户3的课程
(3, 2, 'direct', 100, '2024-03-10 16:45:00', 300, true, '2024-03-10 16:45:00', 'active'),
(3, 3, 'code', 60, '2024-03-14 13:15:00', 150, false, null, 'active'),
(3, 5, 'direct', 25, '2024-03-15 09:45:00', 45, false, null, 'active'),

-- 用户4的课程
(4, 1, 'direct', 100, '2024-03-11 17:30:00', 250, true, '2024-03-11 17:30:00', 'active'),
(4, 4, 'direct', 80, '2024-03-15 10:15:00', 180, false, null, 'active'),

-- 用户5的课程
(5, 2, 'gift', 40, '2024-03-14 11:45:00', 90, false, null, 'active'),
(5, 5, 'direct', 70, '2024-03-15 14:20:00', 160, false, null, 'active');

-- 生成一些已完成的课程记录
UPDATE user_courses 
SET is_completed = true, 
    completed_at = DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY),
    progress = 100
WHERE progress >= 95; 