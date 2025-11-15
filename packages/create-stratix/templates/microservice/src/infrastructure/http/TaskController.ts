// @ts-nocheck
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { CommandBus, QueryBus } from '@stratix/abstractions';
import { Result } from '@stratix/primitives';
import { CreateTask, CreateTaskOutput } from '../../application/commands/CreateTask.js';
import { GetTask, TaskDto } from '../../application/queries/GetTask.js';

interface CreateTaskBody {
  title: string;
  description: string;
}

interface GetTaskParams {
  id: string;
}

export class TaskController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  async register(app: FastifyInstance): Promise<void> {
    app.post('/tasks', this.createTask.bind(this));
    app.get('/tasks/:id', this.getTask.bind(this));
    app.get('/health', this.health.bind(this));
  }

  private async createTask(
    request: FastifyRequest<{ Body: CreateTaskBody }>,
    reply: FastifyReply
  ): Promise<void> {
    const result = await this.commandBus.dispatch<Result<CreateTaskOutput>>(
      new CreateTask(request.body)
    );

    if (result.isSuccess) {
      reply.status(201).send(result.value);
    } else {
      reply.status(400).send({ error: result.error.message });
    }
  }

  private async getTask(
    request: FastifyRequest<{ Params: GetTaskParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const result = await this.queryBus.execute<Result<TaskDto>>(
      new GetTask({ id: request.params.id })
    );

    if (result.isSuccess) {
      reply.status(200).send(result.value);
    } else {
      reply.status(404).send({ error: result.error.message });
    }
  }

  private async health(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    reply.status(200).send({
      status: 'ok',
      service: 'microservice',
      timestamp: new Date().toISOString(),
    });
  }
}
