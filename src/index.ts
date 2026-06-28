import Fastify from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const fastify = Fastify({
  logger: true
});

import { RoomSocket } from './infrastructure/adapters/in/websockets/RoomSocket';

// Registrar Socket.io como plugin de Fastify
fastify.register(fastifyPlugin(async (fastify) => {
  const io = new Server(fastify.server, {
    cors: {
      origin: '*', // Se ajustará para Vercel luego
      methods: ['GET', 'POST']
    }
  });

  fastify.decorate('io', io);

  // Le pasamos el control a nuestro Adaptador Hexagonal de WebSockets
  new RoomSocket(io);
}));

import { setupRoutes } from './infrastructure/adapters/in/http/routes';

// Registrar Rutas HTTP (Pilar 2)
fastify.register(setupRoutes);

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`Servidor escuchando en http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
