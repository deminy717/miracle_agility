-- 为lesson_cards表添加文件相关字段
-- 执行时间：2024-06-29

-- 添加文件相关字段
ALTER TABLE lesson_cards 
ADD COLUMN file_url VARCHAR(500) COMMENT '文件URL地址',
ADD COLUMN file_name VARCHAR(255) COMMENT '原始文件名',
ADD COLUMN file_size VARCHAR(50) COMMENT '文件大小（格式化后的字符串，如：1.5MB）',
ADD COLUMN file_type VARCHAR(50) COMMENT '文件类型（ppt, pdf, word, excel等）';

-- 添加索引以提升查询性能
CREATE INDEX idx_lesson_cards_card_type ON lesson_cards(card_type);
CREATE INDEX idx_lesson_cards_file_type ON lesson_cards(file_type);

-- 验证字段添加是否成功
DESCRIBE lesson_cards;

-- 显示表结构确认
SHOW CREATE TABLE lesson_cards; 