import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect(url: string = 'http://localhost:3001') {
    if (!this.socket) {
      this.socket = io(url);
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(gameId: string) {
    if (this.socket) {
      this.socket.emit('join-room', gameId);
    }
  }

  leaveRoom(gameId: string) {
    if (this.socket) {
      this.socket.emit('leave-room', gameId);
    }
  }

  onGameUpdated(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('game-updated', callback);
    }
  }

  offGameUpdated() {
    if (this.socket) {
      this.socket.off('game-updated');
    }
  }

  onError(callback: (error: any) => void) {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  emitGameAction(gameId: string, action: string, payload: any) {
    if (this.socket) {
      this.socket.emit('game-action', { gameId, action, payload });
    }
  }
}

export const socketService = new SocketService();