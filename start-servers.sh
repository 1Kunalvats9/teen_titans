#!/bin/bash

# Start WebSocket server in background
echo "Starting WebSocket server..."
cd ../websocket-server
npm run dev &
WS_PID=$!

# Wait a moment for WebSocket server to start
sleep 2

# Start Next.js app
echo "Starting Next.js app..."
cd ../teen_titans
npm run dev &
NEXT_PID=$!

echo "Both servers started!"
echo "Next.js app: http://localhost:3000"
echo "WebSocket server: ws://localhost:3001"
echo "Health check: http://localhost:3001/health"

# Function to cleanup on exit
cleanup() {
    echo "Shutting down servers..."
    kill $WS_PID
    kill $NEXT_PID
    exit 0
}

# Trap SIGINT and SIGTERM
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
