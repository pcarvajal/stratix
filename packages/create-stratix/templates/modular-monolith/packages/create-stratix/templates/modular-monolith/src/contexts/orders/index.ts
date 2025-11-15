// Context Module
export { OrdersContextModule } from './OrdersContextModule.js';

// Domain
export { Order, type OrderId, type OrderProps } from './domain/entities/Order.js';
export { OrderCreatedEvent } from './domain/events/OrderCreated.js';
export type { OrderRepository } from './domain/repositories/OrderRepository.js';

// Application - Commands
export {
  CreateOrderCommand,
  type CreateOrderInput,
  type CreateOrderOutput,
} from './application/commands/CreateOrder.js';

// Application - Queries
export {
  GetOrderByIdQuery,
  type GetOrderByIdInput,
  type GetOrderByIdOutput,
} from './application/queries/GetOrderById.js';
export { ListOrdersQuery, type ListOrdersOutput } from './application/queries/ListOrders.js';

// Infrastructure
export { InMemoryOrderRepository } from './infrastructure/persistence/InMemoryOrderRepository.js';
