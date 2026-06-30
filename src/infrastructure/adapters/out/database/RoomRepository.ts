// src/infrastructure/adapters/out/database/RoomRepository.ts
import { IRoomRepository } from '../../../../application/ports/out/IRoomRepository';
import { Room } from '../../../../domain/Room';
import { db } from './index';
import { rooms } from './schema';
import { eq } from 'drizzle-orm';

export class RoomRepository implements IRoomRepository {
  
  async save(room: Room): Promise<void> {
    // 1. Drizzle recibe los datos de la Entidad Pura y los inserta en Supabase
    await db.insert(rooms).values({
      id: room.id,
      name: room.name,
      hostId: room.hostId,
      inviteCode: room.inviteCode,
      theme: room.theme,
      image: room.image,
      maxParticipants: room.maxParticipants,
      isPublic: room.isPublic,
    });
  }

  async findById(id: string): Promise<Room | null> {
    // 1. Buscamos en la base de datos
    const result = await db.select().from(rooms).where(eq(rooms.id, id));
    
    if (result.length === 0) return null;
    
    const data = result[0];
    
    // 2. Reconstruimos la Entidad Pura para devolvérsela a la aplicación
    return new Room(
      data.id,
      data.name,
      data.hostId,
      data.inviteCode,
      data.theme,
      data.image,
      data.maxParticipants,
      data.isPublic
    );
  }

  async findByHostId(hostId: string): Promise<Room[]> {
    const result = await db.select().from(rooms).where(eq(rooms.hostId, hostId));
    
    return result.map(data => new Room(
      data.id,
      data.name,
      data.hostId,
      data.inviteCode,
      data.theme,
      data.image,
      data.maxParticipants,
    ));
  }

  async update(room: Room): Promise<void> {
    await db.update(rooms).set({
      name: room.name,
      image: room.image,
      maxParticipants: room.maxParticipants,
      isPublic: room.isPublic,
      theme: room.theme,
    }).where(eq(rooms.id, room.id));
  }
}
