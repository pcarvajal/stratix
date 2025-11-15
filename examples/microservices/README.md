# Microservices Example

Event-driven microservices communicating via RabbitMQ.

## Quick Start

```bash
# Start RabbitMQ
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# Start services (separate terminals)
cd order-service && pnpm dev
cd inventory-service && pnpm dev
```

## Services

### Order Service (Port 3001)

- `POST /orders` - Create new order
- `GET /orders/:id` - Get order details
- `GET /health` - Health check

**Publishes:** `OrderPlacedEvent`
**Consumes:** `StockReservedEvent`, `StockReservationFailedEvent`

### Inventory Service (Port 3002)

- `GET /inventory/:productId` - Get product inventory
- `POST /inventory/:productId/stock` - Add stock
- `GET /health` - Health check

**Publishes:** `StockReservedEvent`, `StockReservationFailedEvent`
**Consumes:** `OrderPlacedEvent`

## Architecture

```
┌─────────────────┐           ┌──────────────┐           ┌──────────────────┐
│  Order Service  │──publish──│   RabbitMQ   │──consume──│ Inventory Service│
│  (Port 3001)    │           │  Message Bus │           │   (Port 3002)    │
└─────────────────┘           └──────────────┘           └──────────────────┘
```

## Example Usage

**Create Order:**
```bash
curl -X POST http://localhost:3001/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-123",
    "items": [
      {
        "productId": "product-1",
        "quantity": 2,
        "price": 10.00
      }
    ]
  }'
```

**Check Order:**
```bash
curl http://localhost:3001/orders/order_abc123
```

**Check Inventory:**
```bash
curl http://localhost:3002/inventory/product-1
```

## Features

- Service independence
- Asynchronous messaging
- Event-driven communication
- Fault tolerance
- Dead letter queue for failed messages
- Horizontal scaling

## Scaling

Run multiple instances of each service:

```bash
PORT=3001 pnpm start &
PORT=3011 pnpm start &

PORT=3002 pnpm start &
PORT=3012 pnpm start &
```

RabbitMQ distributes messages across instances using competing consumers pattern.

## Monitoring

RabbitMQ Management UI: `http://localhost:15672` (guest/guest)

## License

MIT
