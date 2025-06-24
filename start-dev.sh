#!/bin/bash

echo "🔥 Starting Fire Management Platform Development Servers"
echo "=================================================="

# Function to cleanup background processes
cleanup() {
    echo "🛑 Stopping servers..."
    pkill -f "node server.js"
    pkill -f "vite"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend server
echo "🚀 Starting Backend API Server..."
cd backend
node server.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🎨 Starting Frontend Development Server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are running!"
echo "📊 Backend API: http://localhost:3001"
echo "🌐 Frontend App: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for background processes
wait $BACKEND_PID $FRONTEND_PID 