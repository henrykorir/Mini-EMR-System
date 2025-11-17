#!/bin/bash

set -e

echo "🚀 Setting up Mini EMR System Database"

# Wait for MySQL to be fully started
echo "⏳ Waiting for MySQL to start..."
sleep 10

# Initialize MySQL database with your schema
echo "🗄️ Initializing MySQL database with Mini EMR schema..."

# SCHEMA_FILE="/workspaces/Mini-EMR-System/backend/sql/schema.sql"

# if [ -f "$SCHEMA_FILE" ]; then
#     echo "📁 Loading schema file: $SCHEMA_FILE"
    
#     # Create database and load schema
#     mysql -h localhost -u root -pAdmin123 <<-EOF
# CREATE DATABASE IF NOT EXISTS medi_grind_db;
# USE medi_grind_db;
# EOF

#     mysql -h localhost -u root -pAdmin123 medi_grind_db < "$SCHEMA_FILE"
#     echo "✅ Database schema loaded successfully!"
    
#     # Show created tables
#     echo "📊 Database tables:"
#     mysql -h localhost -u root -pAdmin123 medi_grind_db -e "SHOW TABLES;"
# else
#     echo "❌ Schema file not found at: $SCHEMA_FILE"
#     exit 1
# fi

# Install dependencies for existing code
echo "📦 Installing backend dependencies..."
cd /workspaces/Mini-EMR-System/backend
npm install

echo "📦 Installing frontend dependencies..."
cd /workspaces/Mini-EMR-System/frontend
npm install

echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Start your application:"
echo "Backend: cd /workspaces/Mini-EMR-System/backend && npm run dev"
echo "Frontend: cd /workspaces/Mini-EMR-System/frontend && npm start"