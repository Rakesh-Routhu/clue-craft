# clue-craft - Multiplayer Board Game

A full-stack TypeScript implementation of the popular board game clue-craft with real-time multiplayer functionality.

## 🎮 Game Overview

clue-craft is a social word game where two teams compete to identify their agents (represented by words) based on clues given by their spymasters. The game features:

- **Two teams**: Red and Blue
- **25 word cards** in a 5×5 grid
- **Spymasters** give one-word clues + numbers
- **Field operatives** guess which words belong to their team
- **Win conditions**: Find all your team's words first, or avoid the assassin!

## 🏗️ Architecture

### Backend (`backend/`)
- **Node.js + Express + TypeScript** REST API
- **Socket.IO** for real-time game synchronization
- **In-memory game state** management
- **Game logic modules**: GameManager, BoardGenerator, RulesEngine

### Frontend (`frontend/`)
- **React + TypeScript + Vite** single-page application
- **TailwindCSS** for responsive UI styling
- **Socket.IO client** for live game updates
- **React Router** for navigation

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation & Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd clue-craft
   npm run install:all
   ```

2. **Start development servers:**
   ```bash
   npm run dev
   ```
   This starts both backend (port 3001) and frontend (port 3000) concurrently.

3. **Individual servers:**
   ```bash
   # Backend only
   npm run dev:backend
   
   # Frontend only  
   npm run dev:frontend
   ```

### Environment Variables

Create `.env` files:

**Backend (`.env`):**
```env
PORT=3001
CLIENT_URL=http://localhost:3000
```

**Frontend (`.env`):**
```env
VITE_API_URL=http://localhost:3001/api
```

## 🎯 How to Play

1. **Create/Join Game**: One player creates a game, others join with the Game ID
2. **Team Assignment**: Players are automatically assigned to Red/Blue teams as Spymasters or Operatives
3. **Start Game**: Once 2+ players join, click "Start Game" to generate the board
4. **Give Clues**: Spymasters give one-word clues + numbers (e.g., "Animal 3")
5. **Make Guesses**: Operatives click words to guess their team's agents
6. **Win Conditions**: 
   - Find all your team's words to win
   - Avoid the assassin word (instant loss!)

## 📁 Project Structure

```
clue-craft/
├── backend/src/
│   ├── index.ts              # Express server setup
│   ├── types.ts              # Shared TypeScript interfaces
│   ├── routes/
│   │   └── gameRoutes.ts     # REST API endpoints
│   ├── socket/
│   │   └── socketHandlers.ts # Real-time event handling
│   └── game/
│       ├── GameManager.ts    # Core game state management
│       ├── BoardGenerator.ts # Word selection & board setup
│       └── RulesEngine.ts    # Game rules validation
├── frontend/src/
│   ├── App.tsx               # Main app component
│   ├── types.ts              # TypeScript interfaces
│   ├── pages/
│   │   ├── HomePage.tsx      # Create/join game page
│   │   └── GamePage.tsx      # Main game interface
│   ├── components/
│   │   ├── GameBoard.tsx     # 5×5 word grid
│   │   ├── PlayersList.tsx   # Team & player display
│   │   ├── CluePanel.tsx     # Clue giving & history
│   │   └── GameStatus.tsx    # Game state indicator
│   └── api/
│       ├── gameAPI.ts        # REST API client
│       └── socketService.ts  # Socket.IO client
└── package.json              # Root dev scripts
```

## 🔧 API Endpoints

- `POST /api/create-game` - Create new game session
- `POST /api/join-game` - Join existing game
- `POST /api/start-game` - Generate board & start game  
- `GET /api/game-state/:gameId` - Fetch current game state
- `POST /api/give-clue` - Spymaster gives clue
- `POST /api/make-guess` - Player makes guess
- `POST /api/end-turn` - End current team's turn

## ⚡ Real-time Events

**Socket.IO Events:**
- `join-room` / `leave-room` - Room management
- `game-action` - Game moves (clues, guesses, turns)
- `game-updated` - Broadcast game state changes
- `error` - Error handling

## 🎨 UI Features

- **Responsive design** works on desktop and mobile
- **Color-coded teams** (Red/Blue with distinct styling)
- **Spymaster view** shows word categories with color hints
- **Real-time updates** for all connected players
- **Game history** tracks clues and guesses
- **Turn indicators** show whose turn it is

## 🔒 Game Rules Implementation

- **25 words** total: 8-9 Red, 8-9 Blue, 7 Neutral, 1 Assassin
- **Starting team** gets 9 words (determined randomly)
- **Clue format**: One word + number (0-9)
- **Guess limits**: Clue number + 1 bonus guess
- **Turn ends on**: Wrong team word, neutral, or assassin
- **Win conditions**: All team words found OR opponent hits assassin

## 🛠️ Development

### Build for Production
```bash
npm run build
```

### Technology Stack
- **Backend**: Node.js, Express, TypeScript, Socket.IO
- **Frontend**: React, TypeScript, Vite, TailwindCSS, React Router
- **Development**: Concurrently, Nodemon, ts-node

## 🎮 Game Flow

1. **Lobby Phase**: Players join and are assigned roles
2. **Setup Phase**: Board generated with 25 random words
3. **Game Phase**: Teams alternate giving clues and making guesses
4. **End Phase**: Winner determined, option to play again

---

**Ready to start your spy mission? Create a game and gather your team! 🕵️‍♂️🕵️‍♀️**