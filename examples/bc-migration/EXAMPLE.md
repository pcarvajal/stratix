# Bounded Context as Module - Ejemplo Completo

## Concepto

Un **Bounded Context as Module** es un patrón donde todo un contexto delimitado (domain, application, infrastructure) se encapsula en un modulo portátil que puede ejecutarse tanto en un monolito como en un microservicio sin cambios de código.

## Estructura de un Bounded Context Module

```
orders/
├── OrdersContextModule.ts          # Modulo principal (auto-wiring)
├── domain/
│   ├── entities/
│   │   └── Order.ts                # Aggregate Root
│   ├── events/
│   │   └── OrderCreated.ts         # Domain Event
│   └── repositories/
│       └── OrderRepository.ts      # Interface
├── application/
│   ├── commands/
│   │   ├── CreateOrder.ts          # Command
│   │   └── CreateOrderHandler.ts   # Handler
│   └── queries/
│       ├── GetOrderById.ts         # Query
│       └── GetOrderByIdHandler.ts  # Handler
├── infrastructure/
│   └── persistence/
│       └── InMemoryOrderRepository.ts  # Implementation
└── index.ts                        # Barrel export
```

## Ejemplo: OrdersContextModule

### 1. Domain Layer (Sin cambios entre monolito y microservicio)

```typescript
// domain/entities/Order.ts
import { AggregateRoot, EntityId } from '@stratix/primitives';
import { OrderCreatedEvent } from '../events/OrderCreated.js';

export type OrderId = EntityId<'Order'>;

export interface OrderProps {
  customerId: string;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped';
}

export class Order extends AggregateRoot<'Order'> {
  private constructor(
    id: OrderId,
    private _customerId: string,
    private _total: number,
    private _status: 'pending' | 'confirmed' | 'shipped',
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  get customerId(): string {
    return this._customerId;
  }

  get total(): number {
    return this._total;
  }

  get status(): string {
    return this._status;
  }

  static create(props: OrderProps): Order {
    const id = EntityId.create<'Order'>();
    const now = new Date();
    const order = new Order(id, props.customerId, props.total, props.status, now, now);

    // Record domain event
    order.addDomainEvent(new OrderCreatedEvent(id, props.customerId, props.total));

    return order;
  }

  confirm(): void {
    if (this._status !== 'pending') {
      throw new Error('Only pending orders can be confirmed');
    }
    this._status = 'confirmed';
    this.touch();
  }
}
```

```typescript
// domain/events/OrderCreated.ts
import { DomainEvent } from '@stratix/primitives';
import { OrderId } from '../entities/Order.js';

export class OrderCreatedEvent extends DomainEvent {
  constructor(
    public readonly orderId: OrderId,
    public readonly customerId: string,
    public readonly total: number
  ) {
    super();
  }
}
```

```typescript
// domain/repositories/OrderRepository.ts
import { Repository } from '@stratix/abstractions';
import { Order, OrderId } from '../entities/Order.js';

export interface OrderRepository extends Repository<Order, OrderId> {
  findByCustomerId(customerId: string): Promise<Order[]>;
}
```

### 2. Application Layer (Sin cambios entre monolito y microservicio)

```typescript
// application/commands/CreateOrder.ts
import { Command } from '@stratix/abstractions';

export interface CreateOrderData {
  customerId: string;
  total: number;
}

export class CreateOrderCommand implements Command {
  constructor(public readonly data: CreateOrderData) {}
}
```

```typescript
// application/commands/CreateOrderHandler.ts
import { CommandHandler } from '@stratix/abstractions';
import { Result, Success, Failure } from '@stratix/primitives';
import { CreateOrderCommand } from './CreateOrder.js';
import { OrderRepository } from '../../domain/repositories/OrderRepository.js';
import { Order } from '../../domain/entities/Order.js';

export class CreateOrderHandler implements CommandHandler<CreateOrderCommand, Result<{ id: string }>> {
  constructor(private readonly orderRepository: OrderRepository) {}

  async handle(command: CreateOrderCommand): Promise<Result<{ id: string }>> {
    try {
      const order = Order.create({
        customerId: command.data.customerId,
        total: command.data.total,
        status: 'pending',
      });

      await this.orderRepository.save(order);

      return Success.create({ id: order.id.toString() });
    } catch (error) {
      return Failure.create(error as Error);
    }
  }
}
```

```typescript
// application/queries/GetOrderById.ts
import { Query } from '@stratix/abstractions';
import { OrderId } from '../../domain/entities/Order.js';

export class GetOrderByIdQuery implements Query {
  constructor(public readonly orderId: OrderId) {}
}
```

```typescript
// application/queries/GetOrderByIdHandler.ts
import { QueryHandler } from '@stratix/abstractions';
import { Result, Success, Failure } from '@stratix/primitives';
import { GetOrderByIdQuery } from './GetOrderById.js';
import { OrderRepository } from '../../domain/repositories/OrderRepository.js';
import { Order } from '../../domain/entities/Order.js';

export class GetOrderByIdHandler implements QueryHandler<GetOrderByIdQuery, Result<Order | null>> {
  constructor(private readonly orderRepository: OrderRepository) {}

  async handle(query: GetOrderByIdQuery): Promise<Result<Order | null>> {
    try {
      const order = await this.orderRepository.findById(query.orderId);
      return Success.create(order);
    } catch (error) {
      return Failure.create(error as Error);
    }
  }
}
```

### 3. Infrastructure Layer (Puede cambiar entre monolito y microservicio)

```typescript
// infrastructure/persistence/InMemoryOrderRepository.ts
import { Order, OrderId } from '../../domain/entities/Order.js';
import { OrderRepository } from '../../domain/repositories/OrderRepository.js';

export class InMemoryOrderRepository implements OrderRepository {
  private orders = new Map<string, Order>();

  async save(order: Order): Promise<void> {
    this.orders.set(order.id.toString(), order);
  }

  async findById(id: OrderId): Promise<Order | null> {
    return this.orders.get(id.toString()) || null;
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter((order) => order.customerId === customerId);
  }

  async findAll(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async delete(id: OrderId): Promise<void> {
    this.orders.delete(id.toString());
  }

  async count(): Promise<number> {
    return this.orders.size;
  }
}
```

### 4. OrdersContextModule (El corazón del patrón)

```typescript
// OrdersContextModule.ts
import { BaseContextModule } from '@stratix/runtime';
import {
  PluginMetadata,
  CommandDefinition,
  QueryDefinition,
  EventHandlerDefinition,
  RepositoryDefinition,
} from '@stratix/abstractions';

// Domain
import { Order } from './domain/entities/Order.js';
import { OrderRepository } from './domain/repositories/OrderRepository.js';

// Application
import { CreateOrderCommand } from './application/commands/CreateOrder.js';
import { CreateOrderHandler } from './application/commands/CreateOrderHandler.js';
import { GetOrderByIdQuery } from './application/queries/GetOrderById.js';
import { GetOrderByIdHandler } from './application/queries/GetOrderByIdHandler.js';

// Infrastructure
import { InMemoryOrderRepository } from './infrastructure/persistence/InMemoryOrderRepository.js';

/**
 * Orders Bounded Context Module
 *
 * This module encapsulates the entire Orders context:
 * - Domain entities and business rules
 * - Application commands and queries
 * - Infrastructure implementations
 *
 * The module can run in:
 * 1. Modular Monolith - alongside other contexts
 * 2. Microservice - as standalone service
 *
 * ZERO code changes needed between deployments.
 */
export class OrdersContextModule extends BaseContextModule {
  readonly metadata: PluginMetadata = {
    name: 'orders-context',
    version: '1.0.0',
    description: 'Orders Bounded Context - Manages customer orders',
  };

  readonly contextName = 'Orders';

  private orderRepository!: OrderRepository;

  /**
   * Define all repositories for this context.
   * BaseContextModule will register them in the DI container automatically.
   */
  getRepositories(): RepositoryDefinition[] {
    return [
      {
        token: 'orderRepository',
        instance: new InMemoryOrderRepository(),
        singleton: true,
      },
    ];
  }

  /**
   * Define all commands for this context.
   * BaseContextModule will register them with the command bus automatically.
   */
  getCommands(): CommandDefinition[] {
    return [
      {
        name: 'CreateOrder',
        commandType: CreateOrderCommand,
        handler: new CreateOrderHandler(this.orderRepository),
      },
    ];
  }

  /**
   * Define all queries for this context.
   * BaseContextModule will register them with the query bus automatically.
   */
  getQueries(): QueryDefinition[] {
    return [
      {
        name: 'GetOrderById',
        queryType: GetOrderByIdQuery,
        handler: new GetOrderByIdHandler(this.orderRepository),
      },
    ];
  }

  /**
   * Define all event handlers for this context.
   * BaseContextModule will subscribe them to the event bus automatically.
   */
  getEventHandlers(): EventHandlerDefinition[] {
    return [];
    // Example:
    // return [
    //   {
    //     eventName: 'ProductCreated',
    //     eventType: ProductCreatedEvent,
    //     handler: new ProductCreatedHandler(this.orderRepository),
    //   },
    // ];
  }

  /**
   * Initialize the plugin.
   * Resolve dependencies and call super to auto-register everything.
   */
  async initialize(context: PluginContext): Promise<void> {
    // Call super.initialize FIRST to register repositories
    await super.initialize(context);

    // NOW we can resolve the repository
    this.orderRepository = context.container.resolve<OrderRepository>('orderRepository');
  }
}
```

## Uso 1: Monolito Modular

```typescript
// monolith/src/index.ts
import { ApplicationBuilder } from '@stratix/runtime';
import { ProductsContextModule } from './contexts/products/index.js';
import { OrdersContextModule } from './contexts/orders/index.js';
import { InventoryContextModule } from './contexts/inventory/index.js';

const app = await ApplicationBuilder.create()
  .useContainer(container)
  .useLogger(logger)

  // 3 contextos en una aplicación
  .useContext(new ProductsContextModule())
  .useContext(new OrdersContextModule())      // <- Mismo código
  .useContext(new InventoryContextModule())

  .build();

await app.start();
```

## Uso 2: Microservicio Extraído

```typescript
// orders-service/src/index.ts
import { ApplicationBuilder } from '@stratix/runtime';
import { PostgresPlugin } from '@stratix/ext-postgres';
import { RabbitMQEventBusPlugin } from '@stratix/ext-rabbitmq';
import { OrdersContextModule } from './orders/index.js';  // MISMO CÓDIGO

const app = await ApplicationBuilder.create()
  .useContainer(container)
  .useLogger(logger)

  // Infraestructura distribuida
  .usePlugin(new PostgresPlugin({ database: 'orders_db' }))
  .usePlugin(new RabbitMQEventBusPlugin({ url: 'amqp://localhost' }))

  // MISMO OrdersContextModule - ZERO cambios
  .useContext(new OrdersContextModule())

  .build();

await app.start();
```

## Lo que NO cambia

Al migrar de monolito a microservicio:

1. **Domain Layer** - Cero cambios
   - Entities
   - Value Objects
   - Business rules
   - Domain events
   - Repository interfaces

2. **Application Layer** - Cero cambios
   - Commands
   - Queries
   - Handlers
   - Application services

3. **OrdersContextModule** - Cero cambios
   - Métodos getCommands()
   - Métodos getQueries()
   - Métodos getRepositories()
   - Auto-registration logic

## Lo que SÍ cambia

1. **main.ts / bootstrap**
   - Monolito: Todos los modulos
   - Microservicio: Solo OrdersContextModule

2. **Infrastructure plugins**
   - Monolito: InMemoryEventBus
   - Microservicio: RabbitMQEventBusPlugin, PostgresPlugin

3. **Deployment**
   - Monolito: Un contenedor
   - Microservicio: Múltiples contenedores

## Ventajas del Patrón

### 1. Portabilidad
El mismo código corre en monolito y microservicio.

### 2. Zero Rewrite
No hay que reescribir lógica de negocio.

### 3. Auto-Wiring
BaseContextModule registra todo automáticamente.

### 4. Migración Gradual
Extrae un contexto a la vez.

### 5. Low Risk
Solo cambia infraestructura, no dominio.

## Generación Automática

Usa el CLI para generar un contexto completo:

```bash
stratix generate context Orders --props "customerId:string,total:number,status:string"
```

Esto genera:
- OrdersContextModule.ts
- Domain layer completo
- Application layer completo
- Infrastructure layer básico
- ~13 archivos listos para usar

## Conclusión

El patrón **Bounded Context as Module** es la killer feature de Stratix:

- **Comenzar modular**: Monolito con contextos bien definidos
- **Desarrollar rápido**: Todo en una aplicación
- **Migrar gradual**: Extraer microservicios cuando se necesite
- **Zero rewrite**: Copiar y ejecutar

Este patrón cumple la promesa de **evolución arquitectónica sin reescritura**.
