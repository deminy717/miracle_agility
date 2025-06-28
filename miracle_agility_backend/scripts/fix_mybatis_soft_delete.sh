#!/bin/bash

# 修复MyBatis-Plus软删除配置问题
# 使用方法: ./fix_mybatis_soft_delete.sh [database_host] [database_port] [database_name] [username]

set -e  # 遇到错误立即退出

# 默认配置
DB_HOST=${1:-localhost}
DB_PORT=${2:-3306}
DB_NAME=${3:-miracle_agility}
DB_USER=${4:-root}

echo "=========================================="
echo "Miracle Agility MyBatis-Plus软删除修复脚本"
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

# 运行修复脚本
echo "正在运行软删除修复迁移..."
if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p -D "$DB_NAME" < src/main/resources/sql/migrations/002_fix_mybatis_plus_soft_delete.sql; then
    echo "✅ 数据库迁移执行成功"
else
    echo "❌ 数据库迁移执行失败"
    exit 1
fi

# 验证修复结果
echo "正在验证修复结果..."
DELETED_AT_EXISTS=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p -D "$DB_NAME" -e "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='$DB_NAME' AND TABLE_NAME='users' AND COLUMN_NAME='deleted_at';" --skip-column-names 2>/dev/null)

if [ "$DELETED_AT_EXISTS" -eq 1 ]; then
    echo "✅ deleted_at字段存在"
else
    echo "❌ deleted_at字段不存在"
    exit 1
fi

# 清理可能存在的无效数据
echo "正在清理无效数据..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p -D "$DB_NAME" -e "UPDATE users SET deleted_at = NULL WHERE deleted_at = '0000-00-00 00:00:00';"

# 显示用户统计
echo "用户统计："
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p -D "$DB_NAME" -e "
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as active_users,
    COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as deleted_users
FROM users;"

echo "=========================================="
echo "✅ MyBatis-Plus软删除修复完成！"
echo "现在可以重启后端服务并测试登录功能"
echo "修复内容："
echo "1. 移除了全局逻辑删除配置"
echo "2. 注释了@TableLogic注解"
echo "3. 确保deleted_at字段正确配置"
echo "==========================================" 