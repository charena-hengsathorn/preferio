#!/bin/bash

echo "🚀 Testing Preferio Setup"
echo "========================="

# Check if Python is available
echo "📋 Checking Python installation..."
python3 --version || echo "❌ Python not found"

# Check if Node.js is available
echo "📋 Checking Node.js installation..."
node --version || echo "❌ Node.js not found"

# Check if npm is available
echo "📋 Checking npm installation..."
npm --version || echo "❌ npm not found"

echo ""
echo "🔧 Installing Python dependencies..."
cd backend
pip install -r requirements.txt
cd ..

echo ""
echo "🔧 Installing Node.js dependencies..."
npm run install:all

echo ""
echo "✅ Setup complete! You can now run:"
echo "   npm run dev    # Start all services"
echo "   npm run dev:frontend    # Start only Vite React"
echo "   npm run dev:nextjs      # Start only Next.js"
echo "   npm run dev:backend     # Start only Python FastAPI"
echo ""
echo "🌐 Services will be available at:"
echo "   - Vite React: http://localhost:5173"
echo "   - Next.js: http://localhost:3000"
echo "   - FastAPI: http://localhost:8000"
echo "   - API Docs: http://localhost:8000/docs"
