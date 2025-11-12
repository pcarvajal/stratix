// @ts-nocheck
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { RegisterUserHandler } from '../../application/commands/RegisterUser.js';
import { GetUserHandler } from '../../application/queries/GetUser.js';

export class UserController {
  constructor(
    private readonly registerUserHandler: RegisterUserHandler,
    private readonly getUserHandler: GetUserHandler
  ) {}

  registerRoutes(app: FastifyInstance): void {
    // Register user
    app.post('/api/users', async (request: FastifyRequest, reply: FastifyReply) => {
      const result = await this.registerUserHandler.handle({
        data: request.body as { email: string; name: string },
      });

      if (result.isFailure) {
        return reply.status(400).send({
          error: result.error.message,
        });
      }

      return reply.status(201).send(result.value);
    });

    // Get user by ID
    app.get('/api/users/:id', async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };

      const result = await this.getUserHandler.handle({
        data: { userId: id },
      });

      if (result.isFailure) {
        return reply.status(404).send({
          error: result.error.message,
        });
      }

      return reply.status(200).send(result.value);
    });
  }
}
