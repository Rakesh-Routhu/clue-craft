import { Server, Socket } from 'socket.io';
import { GameManager } from '../game/GameManager';

const gameManager = GameManager.getInstance();

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Join a game room
    socket.on('join-room', (gameId: string) => {
      socket.join(gameId);
      console.log(`Player ${socket.id} joined room ${gameId}`);
    });

    // Leave a game room  
    socket.on('leave-room', (gameId: string) => {
      socket.leave(gameId);
      console.log(`Player ${socket.id} left room ${gameId}`);
    });

    // Handle game events and broadcast updates
    socket.on('game-action', (data) => {
      const { gameId, action, payload } = data;
      
      try {
        let result;
        
        switch (action) {
          case 'switch-team':
            gameManager.switchTeam(gameId, payload.playerId, payload.team);
            break;
          case 'set-role':
            gameManager.setRole(gameId, payload.playerId, payload.role);
            break;
          case 'give-clue':
            gameManager.giveClue(gameId, payload.playerId, payload.word, payload.number);
            break;
          case 'make-guess':
            result = gameManager.makeGuess(gameId, payload.playerId, payload.wordIndex);
            break;
          case 'end-turn':
            gameManager.endTurn(gameId, payload.playerId);
            break;
        }

        // Broadcast updated game state to all players in the room
        const game = gameManager.getGame(gameId);
        io.to(gameId).emit('game-updated', { game, result });
        
      } catch (error) {
        socket.emit('error', { message: (error as Error).message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Player disconnected: ${socket.id}`);
    });
  });
}