#!/bin/bash

# Miracle Agility 数据库自动建表脚本
# 使用方法: ./setup_database.sh [mysql_username] [mysql_password]

echo "🚀 开始设置 Miracle Agility 数据库..."

# 检查参数
if [ $# -eq 0 ]; then
    echo "请提供MySQL用户名和密码:"
    echo "用法: ./setup_database.sh [username] [password]"
    echo "示例: ./setup_database.sh root mypassword"
    exit 1
fi

MYSQL_USER=${1:-root}
MYSQL_PASS=${2}

if [ -z "$MYSQL_PASS" ]; then
    echo "错误: 请提供MySQL密码"
    exit 1
fi

# 数据库配置
DB_NAME="miracle_agility"
DB_CHARSET="utf8mb4"
DB_COLLATE="utf8mb4_unicode_ci"

echo "📊 数据库配置:"
echo "  - 数据库名: $DB_NAME"
echo "  - 字符集: $DB_CHARSET"
echo "  - 排序规则: $DB_COLLATE"
echo "  - MySQL用户: $MYSQL_USER"

# 检查MySQL是否可用
echo "🔍 检查MySQL连接..."
mysql -u$MYSQL_USER -p$MYSQL_PASS -e "SELECT 1;" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ MySQL连接失败，请检查用户名和密码"
    exit 1
fi
echo "✅ MySQL连接成功"

# 创建数据库
echo "🏗️  创建数据库 $DB_NAME..."
mysql -u$MYSQL_USER -p$MYSQL_PASS -e "
CREATE DATABASE IF NOT EXISTS $DB_NAME 
CHARACTER SET $DB_CHARSET 
COLLATE $DB_COLLATE;
" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ 数据库创建成功"
else
    echo "❌ 数据库创建失败"
    exit 1
fi

# 执行建表脚本
SQL_FILES=("01_user_tables.sql" "02_course_tables.sql" "03_chapter_tables.sql")

for sql_file in "${SQL_FILES[@]}"; do
    if [ -f "$sql_file" ]; then
        echo "📄 执行 $sql_file..."
        mysql -u$MYSQL_USER -p$MYSQL_PASS $DB_NAME < $sql_file
        if [ $? -eq 0 ]; then
            echo "✅ $sql_file 执行成功"
        else
            echo "❌ $sql_file 执行失败"
            exit 1
        fi
    else
        echo "⚠️  警告: $sql_file 文件不存在，跳过"
    fi
done

# 验证建表结果
echo "🔍 验证建表结果..."
TABLE_COUNT=$(mysql -u$MYSQL_USER -p$MYSQL_PASS $DB_NAME -se "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$DB_NAME';")

echo "📊 数据库统计:"
echo "  - 总表数量: $TABLE_COUNT"

# 显示所有表
echo "📋 数据库表列表:"
mysql -u$MYSQL_USER -p$MYSQL_PASS $DB_NAME -e "SHOW TABLES;"

# 检查关键表是否存在
REQUIRED_TABLES=("users" "courses" "chapters" "chapter_content_cards")
echo "🔍 检查关键表..."

for table in "${REQUIRED_TABLES[@]}"; do
    EXISTS=$(mysql -u$MYSQL_USER -p$MYSQL_PASS $DB_NAME -se "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$DB_NAME' AND table_name='$table';")
    if [ "$EXISTS" -eq 1 ]; then
        echo "✅ 表 $table 存在"
    else
        echo "❌ 表 $table 不存在"
    fi
done

# 显示测试数据
echo "📊 测试数据统计:"
for table in "${REQUIRED_TABLES[@]}"; do
    EXISTS=$(mysql -u$MYSQL_USER -p$MYSQL_PASS $DB_NAME -se "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$DB_NAME' AND table_name='$table';")
    if [ "$EXISTS" -eq 1 ]; then
        COUNT=$(mysql -u$MYSQL_USER -p$MYSQL_PASS $DB_NAME -se "SELECT COUNT(*) FROM $table;" 2>/dev/null)
        echo "  - $table: $COUNT 条记录"
    fi
done

echo ""
echo "🎉 Miracle Agility 数据库设置完成!"
echo ""
echo "📝 接下来的步骤:"
echo "1. 更新 application.yml 中的数据库配置:"
echo "   spring.datasource.url: jdbc:mysql://localhost:3306/$DB_NAME?useUnicode=true&characterEncoding=utf8mb4"
echo "   spring.datasource.username: $MYSQL_USER"
echo "   spring.datasource.password: [您的密码]"
echo ""
echo "2. 启动Spring Boot应用进行测试"
echo ""
echo "3. 如需重置数据库，执行: DROP DATABASE $DB_NAME; 然后重新运行此脚本" 