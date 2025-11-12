import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { CommandBus, QueryBus } from '@stratix/abstractions';
import { Result } from '@stratix/primitives';
import { AddStock, AddStockOutput } from '../../application/commands/AddStock.js';
import { GetInventory, InventoryDto } from '../../application/queries/GetInventory.js';

interface AddStockBody {
  productId: string;
  quantity: number;
}

interface GetInventoryParams {
  productId: string;
}

export class InventoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  async register(app: FastifyInstance): Promise<void> {
    app.post('/inventory/stock', this.addStock.bind(this));
    app.get('/inventory/:productId', this.getInventory.bind(this));
    app.get('/health', this.health.bind(this));
  }

  private async addStock(
    request: FastifyRequest<{ Body: AddStockBody }>,
    reply: FastifyReply
  ): Promise<void> {
    const result = await this.commandBus.dispatch<Result<AddStockOutput>>(
      new AddStock(request.body)
    );

    if (result.isSuccess) {
      reply.status(200).send(result.value);
    } else {
      reply.status(400).send({ error: result.error.message });
    }
  }

  private async getInventory(
    request: FastifyRequest<{ Params: GetInventoryParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const result = await this.queryBus.dispatch<Result<InventoryDto>>(
      new GetInventory({ productId: request.params.productId })
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
      service: 'inventory-service',
      timestamp: new Date().toISOString(),
    });
  }
}
