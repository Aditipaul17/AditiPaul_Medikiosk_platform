#!/bin/bash
set -e

echo "=========================================================="
echo "         MediKiosk Production Deployment Launcher        "
echo "=========================================================="

# Check if Docker is requested
if [ "$1" == "docker" ]; then
    echo "Launching via Docker Compose..."
    docker-compose up -d --build
    echo "Services deployed via Docker Compose!"
    exit 0
fi

# 1. Backend & DBMS
echo "[1/3] Initializing DBMS & Starting FastAPI Engine..."
cd backend
python3 -m pip install -r requirements.txt
python3 db_init.py
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 &
cd ..

# 2. Frontend Build & Start
echo "[2/3] Building Next.js Frontend for Production..."
cd frontend
npm install
npm run build

echo "[3/3] Starting Next.js Production Server on port 3000..."
npm run start
