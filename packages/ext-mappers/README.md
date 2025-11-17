# @stratix/ext-mappers

DTO mapper utilities for Stratix framework. Provides type-safe mapping between domain entities and DTOs with a fluent builder API.

## Installation

```bash
pnpm add @stratix/ext-mappers
```

## Features

- Type-safe entity-to-DTO mapping
- Fluent builder API
- Support for simple field mapping (property name strings)
- Support for complex transformations (mapper functions)
- Batch mapping with `mapArray()`
- Zero runtime overhead for simple mappings
- Works seamlessly with Stratix entities and value objects

## Basic Usage

### Simple Property Mapping

When DTO fields match entity properties, use string property names:

```typescript
import { Mapper } from '@stratix/ext-mappers';
import { Product } from './domain/entities/Product.js';

interface ProductDTO {
  id: string;
  name: string;
  stock: number;
}

const productMapper = Mapper.create<Product, ProductDTO>()
  .addField('id', (p) => p.id.toString())
  .addField('name', 'name')  // Direct property mapping
  .addField('stock', 'stock'); // Direct property mapping

const product = Product.create({ name: 'Laptop', price: 999, stock: 10 });
const dto = productMapper.map(product);
// { id: '...', name: 'Laptop', stock: 10 }
```

### Complex Transformations

Use mapper functions for complex transformations:

```typescript
import { Mapper } from '@stratix/ext-mappers';
import { Product } from './domain/entities/Product.js';
import { Money } from '@stratix/primitives';

interface ProductDTO {
  id: string;
  name: string;
  priceAmount: number;
  priceCurrency: string;
  inStock: boolean;
  displayName: string;
}

const productMapper = Mapper.create<Product, ProductDTO>()
  .addField('id', (p) => p.id.toString())
  .addField('name', (p) => p.name)
  .addField('priceAmount', (p) => p.price.amount)
  .addField('priceCurrency', (p) => p.price.currency.code)
  .addField('inStock', (p) => p.stock > 0)
  .addField('displayName', (p) => `${p.name} - ${p.price.format()}`);

const product = Product.create({
  name: 'Laptop',
  price: Money.create(999, Currency.USD),
  stock: 10
});

const dto = productMapper.map(product);
// {
//   id: '...',
//   name: 'Laptop',
//   priceAmount: 999,
//   priceCurrency: 'USD',
//   inStock: true,
//   displayName: 'Laptop - $999.00'
// }
```

## Advanced Examples

### Nested Object Mapping

Map nested domain objects to flat DTOs:

```typescript
interface OrderDTO {
  orderId: string;
  customerId: string;
  customerName: string;
  totalAmount: number;
  totalCurrency: string;
  itemCount: number;
  status: string;
}

const orderMapper = Mapper.create<Order, OrderDTO>()
  .addField('orderId', (o) => o.id.toString())
  .addField('customerId', (o) => o.customer.id.toString())
  .addField('customerName', (o) => o.customer.fullName)
  .addField('totalAmount', (o) => o.total.amount)
  .addField('totalCurrency', (o) => o.total.currency.code)
  .addField('itemCount', (o) => o.items.length)
  .addField('status', (o) => o.status.toString());
```

### Array Mapping

Map collections of entities efficiently:

```typescript
const products = await productRepository.findAll();
const productDTOs = productMapper.mapArray(products);
// Returns ProductDTO[]
```

### Conditional Mapping

Apply conditional logic in mappers:

```typescript
interface UserDTO {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
}

const userMapper = Mapper.create<User, UserDTO>()
  .addField('id', (u) => u.id.toString())
  .addField('email', (u) => u.email.value)
  .addField('fullName', (u) => `${u.firstName} ${u.lastName}`)
  .addField('role', (u) => u.role.name)
  .addField('isActive', (u) => u.status === UserStatus.ACTIVE)
  .addField('lastLogin', (u) =>
    u.lastLoginAt ? u.lastLoginAt.toISOString() : null
  );
```

### Reusable Mappers

Create and reuse mappers across your application:

```typescript
// infrastructure/mappers/ProductMapper.ts
export const productMapper = Mapper.create<Product, ProductDTO>()
  .addField('id', (p) => p.id.toString())
  .addField('name', 'name')
  .addField('price', (p) => p.price.amount)
  .addField('stock', 'stock');

// infrastructure/http/ProductController.ts
import { productMapper } from '../mappers/ProductMapper.js';

class ProductController {
  async list(request: Request, reply: Reply) {
    const products = await this.productRepository.findAll();
    const dtos = productMapper.mapArray(products);
    return reply.send(dtos);
  }
}
```

### Composing Mappers

Combine multiple mappers for complex scenarios:

```typescript
const addressMapper = Mapper.create<Address, AddressDTO>()
  .addField('street', 'street')
  .addField('city', 'city')
  .addField('country', (a) => a.country.code);

const customerMapper = Mapper.create<Customer, CustomerDTO>()
  .addField('id', (c) => c.id.toString())
  .addField('name', (c) => c.fullName)
  .addField('email', (c) => c.email.value)
  .addField('address', (c) => addressMapper.map(c.address));
```

## API Reference

### `Mapper.create<TSource, TTarget>()`

Creates a new mapper builder.

**Type Parameters:**
- `TSource` - The source entity type
- `TTarget` - The target DTO type

**Returns:** `Mapper<TSource, TTarget>`

### `.addField<TKey>(targetField, mapping)`

Adds a field mapping.

**Parameters:**
- `targetField: TKey` - The target DTO field name
- `mapping: keyof TSource | (source: TSource) => TTarget[TKey]` - Either:
  - A source property name (string) for direct mapping
  - A mapper function for transformations

**Returns:** `this` (for chaining)

### `.map(source: TSource)`

Maps a single entity to a DTO.

**Parameters:**
- `source: TSource` - The source entity

**Returns:** `TTarget` - The mapped DTO

### `.mapArray(sources: TSource[])`

Maps an array of entities to DTOs.

**Parameters:**
- `sources: TSource[]` - Array of source entities

**Returns:** `TTarget[]` - Array of mapped DTOs

## Best Practices

1. **Create mappers in the infrastructure layer**: Mappers are adapters between domain and presentation.

2. **One mapper per DTO**: Keep mappers focused and single-purpose.

3. **Use simple mappings when possible**: Prefer string property names over functions for readability.

4. **Test your mappers**: Ensure transformations produce expected output.

```typescript
// Good: infrastructure/mappers/ProductMapper.ts
export const productMapper = Mapper.create<Product, ProductDTO>()
  .addField('id', (p) => p.id.toString())
  .addField('name', 'name');

// Avoid: Inline mappers in controllers
.send(products.map(p => ({ id: p.id.toString(), ... })));
```

5. **Handle null/undefined gracefully**: Use optional chaining and nullish coalescing.

```typescript
.addField('lastLogin', (u) => u.lastLoginAt?.toISOString() ?? null)
```

## Integration with Stratix

Mappers work seamlessly with Stratix repositories and HTTP controllers:

```typescript
// application/queries/ListProducts.ts
export class ListProductsHandler implements QueryHandler<ListProducts, Result<ProductDTO[]>> {
  constructor(
    private readonly repository: ProductRepository,
    private readonly mapper: Mapper<Product, ProductDTO>
  ) {}

  async handle(query: ListProducts): Promise<Result<ProductDTO[]>> {
    try {
      const products = await this.repository.findAll();
      const dtos = this.mapper.mapArray(products);
      return Success.create(dtos);
    } catch (error) {
      return Failure.create(error as Error);
    }
  }
}
```

## License

MIT
