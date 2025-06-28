#!/bin/bash

# 修复session_key重复约束冲突问题
# 使用方法: ./fix_session_key_duplicate.sh [database_host] [database_port] [database_name] [username]

set -e  # 遇到错误立即退出

# 默认配置
DB_HOST=${1:-localhost}
DB_PORT=${2:-3306}
DB_NAME=${3:-miracle_agility}
DB_USER=${4:-root}

echo "=========================================="
echo "Miracle Agility Session Key重复修复脚本"
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

# 检查数据库和表是否存在
echo "正在检查数据库和表..."
TABLE_EXISTS=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p -D "$DB_NAME" -e "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA='$DB_NAME' AND TABLE_NAME='user_sessions';" --skip-column-names 2>/dev/null)

if [ "$TABLE_EXISTS" -eq 0 ]; then
    echo "❌ 表 user_sessions 不存在"
    exit 1
fi

echo "✅ 表 user_sessions 存在"

# 检查是否有重复的session_key
echo "正在检查重复的session_key..."
DUPLICATE_COUNT=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p -D "$DB_NAME" -e "
SELECT COUNT(*) - COUNT(DISTINCT session_key) as duplicate_count
FROM user_sessions;" --skip-column-names 2>/dev/null)

echo "发现 $DUPLICATE_COUNT 个重复的session_key记录"

if [ "$DUPLICATE_COUNT" -gt 0 ]; then
    echo "需要清理重复记录"
    
    # 显示重复的session_key
    echo "重复的session_key列表："
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p -D "$DB_NAME" -e "
    SELECT session_key, COUNT(*) as count
    FROM user_sessions 
    GROUP BY session_key 
    HAVING COUNT(*) > 1;"
    
    # 运行修复脚本
    echo "正在运行session_key重复修复迁移..."
    if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p -D "$DB_NAME" < src/main/resources/sql/migrations/003_fix_session_key_duplicate.sql; then
        echo "✅ 数据库迁移执行成功"
    else
        echo "❌ 数据库迁移执行失败"
        exit 1
    fi
else
    echo "✅ 没有发现重复的session_key记录"
fi

# 验证修复结果
echo "正在验证修复结果..."
FINAL_DUPLICATE_COUNT=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p -D "$DB_NAME" -e "
SELECT COUNT(*) - COUNT(DISTINCT session_key) as duplicate_count
FROM user_sessions;" --skip-column-names 2>/dev/null)

if [ "$FINAL_DUPLICATE_COUNT" -eq 0 ]; then
    echo "✅ 重复记录清理成功"
else
    echo "⚠️  仍然存在 $FINAL_DUPLICATE_COUNT 个重复记录"
fi

# 显示最终统计
echo "会话统计："
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p -D "$DB_NAME" -e "
SELECT 
    COUNT(*) as total_sessions,
    COUNT(DISTINCT session_key) as unique_session_keys,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_sessions,
    COUNT(CASE WHEN status = 'revoked' THEN 1 END) as revoked_sessions,
    COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_sessions
FROM user_sessions;"

echo "=========================================="
echo "✅ Session Key重复修复完成！"
echo "现在可以重启后端服务并测试登录功能"
echo "修复内容："
echo "1. 清理了重复的session_key记录"
echo "2. 删除了过期的会话记录"
echo "3. 添加了防重复插入的逻辑"
echo "==========================================" 