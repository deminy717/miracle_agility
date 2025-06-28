-- 用户课程关联表
CREATE TABLE IF NOT EXISTS user_courses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    course_id BIGINT NOT NULL COMMENT '课程ID',
    registration_type VARCHAR(20) NOT NULL DEFAULT 'direct' COMMENT '注册方式: direct-直接注册, code-授权码注册, gift-赠送',
    source_code_id BIGINT NULL COMMENT '注册来源：授权码ID（如果是通过授权码注册）',
    progress INT NOT NULL DEFAULT 0 COMMENT '学习进度（百分比，0-100）',
    last_study_time DATETIME NULL COMMENT '最后学习时间',
    total_study_minutes INT NOT NULL DEFAULT 0 COMMENT '总学习时间（分钟）',
    is_completed BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否完成',
    completed_at DATETIME NULL COMMENT '完成时间',
    rating INT NULL COMMENT '评分（1-5分）',
    review TEXT NULL COMMENT '评价内容',
    status VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT '状态: active-正常, suspended-暂停, cancelled-取消',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    UNIQUE KEY uk_user_course (user_id, course_id),
    KEY idx_user_id (user_id),
    KEY idx_course_id (course_id),
    KEY idx_source_code_id (source_code_id),
    KEY idx_status (status),
    KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户课程关联表';

-- 课程授权码表
CREATE TABLE IF NOT EXISTS course_access_codes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    code VARCHAR(32) NOT NULL UNIQUE COMMENT '授权码（唯一）',
    course_id BIGINT NOT NULL COMMENT '课程ID',
    created_by BIGINT NOT NULL COMMENT '创建者ID（管理员）',
    description VARCHAR(255) NULL COMMENT '授权码描述/备注',
    valid_from DATETIME NULL COMMENT '有效期开始时间',
    valid_until DATETIME NULL COMMENT '有效期结束时间',
    usage_limit INT NULL COMMENT '使用次数限制（null表示无限制）',
    used_count INT NOT NULL DEFAULT 0 COMMENT '已使用次数',
    status VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT '状态: active-有效, used-已使用, expired-已过期, disabled-已禁用',
    used_by BIGINT NULL COMMENT '使用者ID（如果已使用）',
    used_at DATETIME NULL COMMENT '使用时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    UNIQUE KEY uk_code (code),
    KEY idx_course_id (course_id),
    KEY idx_created_by (created_by),
    KEY idx_status (status),
    KEY idx_used_by (used_by),
    KEY idx_valid_until (valid_until),
    KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程授权码表';

-- 为现有的用户表和课程表添加外键约束（如果需要）
-- ALTER TABLE user_courses ADD CONSTRAINT fk_user_courses_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
-- ALTER TABLE user_courses ADD CONSTRAINT fk_user_courses_course_id FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
-- ALTER TABLE user_courses ADD CONSTRAINT fk_user_courses_source_code_id FOREIGN KEY (source_code_id) REFERENCES course_access_codes(id) ON DELETE SET NULL;

-- ALTER TABLE course_access_codes ADD CONSTRAINT fk_access_codes_course_id FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
-- ALTER TABLE course_access_codes ADD CONSTRAINT fk_access_codes_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;
-- ALTER TABLE course_access_codes ADD CONSTRAINT fk_access_codes_used_by FOREIGN KEY (used_by) REFERENCES users(id) ON DELETE SET NULL; 