// src/application/ports/in/IUpdateRoomUseCase.ts
import { Room } from '../../../domain/Room';

export interface UpdateRoomCommand {
  roomId: string;
  hostId: string;
  name?: string;
  image?: string;
  maxParticipants?: number;
  isPublic?: boolean;
}

export interface IUpdateRoomUseCase {
  execute(command: UpdateRoomCommand): Promise<Room>;
}
