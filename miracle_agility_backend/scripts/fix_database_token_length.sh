#!/bin/bash

# 修复数据库access_token字段长度问题
# 使用方法: ./fix_database_token_length.sh [database_host] [database_port] [database_name] [username]

set -e  # 遇到错误立即退出

# 默认配置
DB_HOST=${1:-localhost}
DB_PORT=${2:-3306}
DB_NAME=${3:-miracle_agility}
DB_USER=${4:-root}

echo "=========================================="
echo "Miracle Agility 数据库字段长度修复脚本"
echo "=========================================="
echo "数据库主机: $DB_HOST"
echo "数据库端口: $DB_PORT"
echo "数据库名称: $DB_NAME"
echo "用户名: $DB_USER"
echo "=========================================="

# 检查MySQL是否可访问
echo "正在检查MySQL连接..."
if ! mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p -e "SELECT 1;" >/dev/null 2>&1; then
    echo "❌ 无法连接到MySQL数据库，请检查配置和凭据"
    exit 1
fi

echo "✅ MySQL连接成功"

# 检查数据库是否存在
echo "正在检查数据库 $DB_NAME..."
DB_EXISTS=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p -e "SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='$DB_NAME';" --skip-column-names 2>/dev/null | wc -l)

if [ "$DB_EXISTS" -eq 0 ]; then
    echo "❌ 数据库 $DB_NAME 不存在"
    exit 1
fi

echo "✅ 数据库 $DB_NAME 存在"

# 检查user_sessions表是否存在
echo "正在检查user_sessions表..."
TABLE_EXISTS=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p -D "$DB_NAME" -e "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA='$DB_NAME' AND TABLE_NAME='user_sessions';" --skip-column-names 2>/dev/null | wc -l)

if [ "$TABLE_EXISTS" -eq 0 ]; then
    echo "❌ 表 user_sessions 不存在"
    echo "请先运行初始化脚本创建表结构"
    exit 1
fi

echo "✅ 表 user_sessions 存在"

# 检查access_token字段长度
echo "正在检查access_token字段长度..."
FIELD_LENGTH=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p -D "$DB_NAME" -e "SELECT CHARACTER_MAXIMUM_LENGTH FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='$DB_NAME' AND TABLE_NAME='user_sessions' AND COLUMN_NAME='access_token';" --skip-column-names 2>/dev/null)

echo "当前access_token字段长度: $FIELD_LENGTH"

if [ "$FIELD_LENGTH" -lt 512 ]; then
    echo "⚠️  字段长度不足，需要修复"
    
    # 备份现有数据
    echo "正在备份现有数据..."
    BACKUP_TABLE="user_sessions_backup_$(date +%Y%m%d_%H%M%S)"
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p -D "$DB_NAME" -e "CREATE TABLE $BACKUP_TABLE AS SELECT * FROM user_sessions;"
    echo "✅ 数据已备份到表: $BACKUP_TABLE"
    
    # 应用修复
    echo "正在应用字段长度修复..."
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p -D "$DB_NAME" << EOF
ALTER TABLE user_sessions 
MODIFY COLUMN access_token VARCHAR(512) NOT NULL COMMENT '访问令牌',
MODIFY COLUMN refresh_token VARCHAR(512) DEFAULT NULL COMMENT '刷新令牌';
EOF
    
    if [ $? -eq 0 ]; then
        echo "✅ 字段长度修复成功"
    else
        echo "❌ 字段长度修复失败"
        exit 1
    fi
else
    echo "✅ 字段长度已足够 ($FIELD_LENGTH >= 512)"
fi

# 验证修复结果
echo "正在验证修复结果..."
NEW_LENGTH=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p -D "$DB_NAME" -e "SELECT CHARACTER_MAXIMUM_LENGTH FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='$DB_NAME' AND TABLE_NAME='user_sessions' AND COLUMN_NAME='access_token';" --skip-column-names 2>/dev/null)

echo "修复后access_token字段长度: $NEW_LENGTH"

if [ "$NEW_LENGTH" -ge 512 ]; then
    echo "✅ 修复验证成功"
else
    echo "❌ 修复验证失败"
    exit 1
fi

# 清理过期会话（可选）
echo "正在清理过期会话..."
CLEANED_COUNT=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p -D "$DB_NAME" -e "DELETE FROM user_sessions WHERE expires_at < NOW(); SELECT ROW_COUNT();" --skip-column-names 2>/dev/null | tail -1)
echo "已清理 $CLEANED_COUNT 个过期会话"

echo "=========================================="
echo "✅ 数据库修复完成！"
echo "现在可以重启后端服务并测试登录功能"
echo "==========================================" 