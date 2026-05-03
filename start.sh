#!/usr/bin/env bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "  __  __      __    __        __  _   _ ___ "
echo " |  \/  |_   _\ \  / /   _  |  \| | | |_ _|"
echo " | |\/| | | | |\ \/ /   / \ | |\\ | |_| || | "
echo " |_|  |_|\_, | \_/    \_/ |_| \_|\___/|___|"
echo "         |__/                                 "
echo -e "${NC}"
echo -e " ${GREEN}Self-hosted AI Chat Interface${NC}"
echo ""

# Check prerequisites
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ Python 3 not found. Install Python 3.11+${NC}"; exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Install Node.js 18+${NC}"; exit 1
fi

# Copy .env if not exists
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠  Created .env from .env.example — edit it to configure your setup${NC}"
fi

# Setup Python venv
if [ ! -d ".venv" ]; then
    echo -e "\n${BLUE}► Setting up Python virtual environment…${NC}"
    python3 -m venv .venv
fi
source .venv/bin/activate

# Install backend deps
echo -e "\n${BLUE}► Installing backend dependencies…${NC}"
pip install -q -r backend/requirements.txt

# Install frontend deps
echo -e "\n${BLUE}► Installing frontend dependencies…${NC}"
cd frontend && npm install --silent && cd ..

# Start
echo -e "\n${GREEN}✓ Starting MyWebUI…${NC}"
echo -e " ${BLUE}Backend:${NC}  http://localhost:8080"
echo -e " ${BLUE}Frontend:${NC} http://localhost:5173"
echo -e "\n  First user to register becomes admin.\n"

# Start both
(cd frontend && npm run dev) &
FRONTEND_PID=$!

uvicorn backend.app.main:app --host 0.0.0.0 --port 8080 --reload &
BACKEND_PID=$!

trap "kill $FRONTEND_PID $BACKEND_PID 2>/dev/null; echo -e '\n${YELLOW}Stopped.${NC}'" SIGINT SIGTERM
wait
