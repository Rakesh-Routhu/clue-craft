// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_BASE_URL = 'https://clue-craft-xpoe.vercel.app/api';

export const gameAPI = {
  async createGame(playerName: string) {
    const response = await fetch(`${API_BASE_URL}/create-game`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerName }),
    });
    return response.json();
  },

  async joinGame(gameId: string, playerName: string) {
    const response = await fetch(`${API_BASE_URL}/join-game`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gameId, playerName }),
    });
    return response.json();
  },

  async startGame(gameId: string) {
    const response = await fetch(`${API_BASE_URL}/start-game`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gameId }),
    });
    return response.json();
  },

  async getGameState(gameId: string) {
    const response = await fetch(`${API_BASE_URL}/game-state/${gameId}`);
    return response.json();
  },

  async switchTeam(gameId: string, playerId: string, team: string) {
    const response = await fetch(`${API_BASE_URL}/switch-team`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gameId, playerId, team }),
    });
    return response.json();
  },

  async setRole(gameId: string, playerId: string, role: string) {
    const response = await fetch(`${API_BASE_URL}/set-role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gameId, playerId, role }),
    });
    return response.json();
  },

  async giveClue(gameId: string, playerId: string, word: string, number: number) {
    const response = await fetch(`${API_BASE_URL}/give-clue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gameId, playerId, word, number }),
    });
    return response.json();
  },

  async makeGuess(gameId: string, playerId: string, wordIndex: number) {
    const response = await fetch(`${API_BASE_URL}/make-guess`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gameId, playerId, wordIndex }),
    });
    return response.json();
  },

  async endTurn(gameId: string, playerId: string) {
    const response = await fetch(`${API_BASE_URL}/end-turn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gameId, playerId }),
    });
    return response.json();
  },
};