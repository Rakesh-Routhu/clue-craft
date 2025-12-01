import { Router } from 'express';
import { Server } from 'socket.io';
import { GameManager } from '../game/GameManager';

const gameManager = GameManager.getInstance();

export default function setupGameRoutes(io: Server) {
  const router = Router();

  // Create a new game
  router.post('/create-game', (req, res) => {
    try {
      const { playerName } = req.body;
      const game = gameManager.createGame(playerName);
      res.json({ 
        success: true, 
        gameId: game.gameId,
        playerId: Object.keys(game.players)[0]
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to create game' });
    }
  });

  // Join an existing game  
  router.post('/join-game', (req, res) => {
    try {
      const { gameId, playerName } = req.body;
      const result = gameManager.joinGame(gameId, playerName);
      res.json({ success: true, ...result });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  });

  // Start a game (generate board)
  router.post('/start-game', (req, res) => {
    try {
      const { gameId } = req.body;
      gameManager.startGame(gameId);
      const game = gameManager.getGame(gameId);
      
      // Broadcast to all players in the game room that the game has started
      io.to(gameId).emit('game-updated', { game });
      
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  });

  // Get game state
  router.get('/game-state/:gameId', (req, res) => {
    try {
      const { gameId } = req.params;
      const game = gameManager.getGame(gameId);
      res.json({ success: true, game });
    } catch (error) {
      res.status(404).json({ success: false, error: 'Game not found' });
    }
  });

  // Switch team
  router.put('/switch-team', (req, res) => {
    try {
      const { gameId, playerId, team } = req.body;
      gameManager.switchTeam(gameId, playerId, team);
      const game = gameManager.getGame(gameId);
      res.json({ success: true, game });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  });

  // Set role
  router.put('/set-role', (req, res) => {
    try {
      const { gameId, playerId, role } = req.body;
      gameManager.setRole(gameId, playerId, role);
      const game = gameManager.getGame(gameId);
      res.json({ success: true, game });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  });

  // Give a clue (spymaster only)
  router.post('/give-clue', (req, res) => {
    try {
      const { gameId, playerId, word, number } = req.body;
      gameManager.giveClue(gameId, playerId, word, number);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  });

  // Make a guess (operative only)
  router.post('/make-guess', (req, res) => {
    try {
      const { gameId, playerId, wordIndex } = req.body;
      const result = gameManager.makeGuess(gameId, playerId, wordIndex);
      res.json({ success: true, ...result });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  });

  // End current team's turn
  router.post('/end-turn', (req, res) => {
    try {
      const { gameId, playerId } = req.body;
      gameManager.endTurn(gameId, playerId);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  });

  return router;
}