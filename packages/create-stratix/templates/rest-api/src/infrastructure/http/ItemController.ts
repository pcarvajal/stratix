// @ts-nocheck
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { CommandBus, QueryBus } from '@stratix/abstractions';
import { Result } from '@stratix/primitives';
import { CreateItem, CreateItemOutput } from '../../application/commands/CreateItem.js';
import { GetItem, ItemDto } from '../../application/queries/GetItem.js';
import { ListItems } from '../../application/queries/ListItems.js';

interface CreateItemBody {
  name: string;
  description: string;
}

interface GetItemParams {
  id: string;
}

export class ItemController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  async register(app: FastifyInstance): Promise<void> {
    app.post('/items', this.createItem.bind(this));
    app.get('/items', this.listItems.bind(this));
    app.get('/items/:id', this.getItem.bind(this));
  }

  private async createItem(
    request: FastifyRequest<{ Body: CreateItemBody }>,
    reply: FastifyReply
  ): Promise<void> {
    const result = await this.commandBus.dispatch<Result<CreateItemOutput>>(
      new CreateItem(request.body)
    );

    if (result.isSuccess) {
      reply.status(201).send(result.value);
    } else {
      reply.status(400).send({ error: result.error.message });
    }
  }

  private async listItems(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const result = await this.queryBus.execute<Result<ItemDto[]>>(new ListItems());

    if (result.isSuccess) {
      reply.status(200).send(result.value);
    } else {
      reply.status(500).send({ error: result.error.message });
    }
  }

  private async getItem(
    request: FastifyRequest<{ Params: GetItemParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const result = await this.queryBus.execute<Result<ItemDto>>(
      new GetItem({ id: request.params.id })
    );

    if (result.isSuccess) {
      reply.status(200).send(result.value);
    } else {
      reply.status(404).send({ error: result.error.message });
    }
  }
}
