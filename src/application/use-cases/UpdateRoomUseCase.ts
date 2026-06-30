// src/application/use-cases/UpdateRoomUseCase.ts
import { IUpdateRoomUseCase, UpdateRoomCommand } from '../ports/in/IUpdateRoomUseCase';
import { IRoomRepository } from '../ports/out/IRoomRepository';
import { Room } from '../../domain/Room';

export class UpdateRoomUseCase implements IUpdateRoomUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async execute(command: UpdateRoomCommand): Promise<Room> {
    const room = await this.roomRepository.findById(command.roomId);
    if (!room) throw new Error("Sala no encontrada");
    if (room.hostId !== command.hostId) throw new Error("No tienes permisos para editar esta sala");
    
    if (command.name !== undefined) room.name = command.name;
    if (command.image !== undefined) room.image = command.image || null;
    if (command.maxParticipants !== undefined) room.maxParticipants = command.maxParticipants;
    if (command.isPublic !== undefined) room.isPublic = command.isPublic;
    
    await this.roomRepository.update(room);
    return room;
  }
}
