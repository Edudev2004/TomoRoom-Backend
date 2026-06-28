// src/infrastructure/adapters/in/http/RoomController.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { ICreateRoomUseCase } from '../../../../application/ports/in/ICreateRoomUseCase';
import { GetUserRoomsUseCase } from '../../../../application/use-cases/GetUserRoomsUseCase';

export class RoomController {
  constructor(
    private readonly createRoomUseCase: ICreateRoomUseCase,
    private readonly getUserRoomsUseCase: GetUserRoomsUseCase
  ) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { name, hostId, maxParticipants, isPublic } = request.body as any;
      
      const room = await this.createRoomUseCase.execute({ 
        name, 
        hostId,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
        isPublic: isPublic !== undefined ? Boolean(isPublic) : undefined
      });

      return reply.status(201).send({
        success: true,
        data: room,
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }

  async listMyRooms(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user?.id;
      if (!userId) {
        return reply.status(401).send({ success: false, message: 'No autenticado' });
      }

      const rooms = await this.getUserRoomsUseCase.execute(userId);
      return reply.status(200).send({
        success: true,
        data: rooms,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Error al obtener salas',
      });
    }
  }
}
