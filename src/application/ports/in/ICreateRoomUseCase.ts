// src/application/ports/in/ICreateRoomUseCase.ts
import { Room } from '../../../domain/Room';

export interface CreateRoomCommand {
  name: string;
  hostId: string;
  maxParticipants?: number;
  isPublic?: boolean;
}

export interface ICreateRoomUseCase {
  execute(command: CreateRoomCommand): Promise<Room>;
}
