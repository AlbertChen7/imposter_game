import { Server } from 'socket.io';
import { Room } from './Room.js';

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private socketToPlayer: Map<string, { roomCode: string; playerId: string }> = new Map();
  private io: Server;

  constructor(io: Server) {
    this.io = io;

    // Periodic cleanup of abandoned rooms every 5 minutes
    setInterval(() => {
      this.cleanupEmptyRooms();
    }, 5 * 60 * 1000);
  }

  public createRoom(): Room {
    let code = this.generateRoomCode();
    while (this.rooms.has(code)) {
      code = this.generateRoomCode();
    }

    const room = new Room(code, this.io);
    this.rooms.set(code, room);
    return room;
  }

  public getRoom(code: string): Room | undefined {
    return this.rooms.get(code.toUpperCase().trim());
  }

  public registerSocket(socketId: string, roomCode: string, playerId: string) {
    this.socketToPlayer.set(socketId, { roomCode: roomCode.toUpperCase().trim(), playerId });
  }

  public getPlayerBySocket(socketId: string): { roomCode: string; playerId: string } | undefined {
    return this.socketToPlayer.get(socketId);
  }

  public unregisterSocket(socketId: string) {
    this.socketToPlayer.delete(socketId);
  }

  private cleanupEmptyRooms() {
    for (const [code, room] of this.rooms.entries()) {
      const activePlayers = Array.from(room.players.values()).filter(p => p.connected);
      if (activePlayers.length === 0) {
        room.destroy();
        this.rooms.delete(code);
      }
    }
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude I, O to avoid visual confusion
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

