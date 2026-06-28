// src/infrastructure/adapters/in/websockets/RoomSocket.ts
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

export class RoomSocket {
  constructor(private readonly io: Server) {
    this.setupMiddleware();
    this.setupEvents();
  }

  private setupMiddleware() {
    // Este "Guardián" protege las conexiones WebSocket
    this.io.use((socket, next) => {
      // El cliente debe enviar el token en la configuración inicial del socket
      const token = socket.handshake.auth.token || socket.handshake.headers['authorization'];
      
      if (!token) {
        return next(new Error('Autenticación denegada: Token no provisto'));
      }

      try {
        const cleanToken = token.replace('Bearer ', '');
        const secret = process.env.JWT_SECRET || 'secret-development-key';
        
        // Verificamos si es un usuario válido
        const decoded = jwt.verify(cleanToken, secret) as { id: string };
        
        // Guardamos su ID directamente en su conexión de Socket
        (socket as any).userId = decoded.id;
        next();
      } catch (err) {
        next(new Error('Token inválido'));
      }
    });
  }

  private setupEvents() {
    this.io.on('connection', (socket: Socket) => {
      const userId = (socket as any).userId;
      console.log(`[Socket] Usuario ${userId} conectado (ID: ${socket.id})`);

      // Evento 1: Entrar a una sala
      socket.on('join_room', (roomId: string) => {
        socket.join(roomId);
        console.log(`[Socket] Usuario ${userId} se unió a la sala ${roomId}`);
        // Le avisamos a los que ya estaban en la sala
        socket.to(roomId).emit('user_joined', { userId });
      });

      // Evento 2: Sincronizar Video (Play, Pause, Seek)
      socket.on('sync_video', (data: { roomId: string, action: string, time: number }) => {
        // Retransmitimos la orden a todos en la sala EXCEPTO al que la envió
        socket.to(data.roomId).emit('video_synced', data);
      });

      // Evento 3: Chat
      socket.on('chat_message', (data: { roomId: string, message: string }) => {
        this.io.to(data.roomId).emit('new_message', {
          userId,
          message: data.message,
          timestamp: new Date()
        });
      });

      socket.on('disconnect', () => {
        console.log(`[Socket] Usuario ${userId} desconectado`);
      });
    });
  }
}
