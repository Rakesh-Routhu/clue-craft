import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  
  connect(url: string = 'https://clue-craft-xpoe.vercel.app') {
    if (!this.socket) {
      this.socket = io("https://clue-craft-xpoe.vercel.app", {
        transports: ["polling", "websocket"], // allow polling first, then upgrade
        withCredentials: true,
        autoConnect: true
      });
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