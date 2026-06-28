// src/application/use-cases/GetUserRoomsUseCase.ts
import { IRoomRepository } from '../ports/out/IRoomRepository';
import { Room } from '../../domain/Room';

export class GetUserRoomsUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async execute(hostId: string): Promise<Room[]> {
    return await this.roomRepository.findByHostId(hostId);
  }
}
