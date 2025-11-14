# @stratix/ext-mappers

DTO mapper utilities for Stratix framework. Provides type-safe mapping between domain entities and DTOs.

## Installation

```bash
pnpm add @stratix/ext-mappers
```

## Usage

```typescript
import { Mapper } from '@stratix/ext-mappers';

const productMapper = Mapper.create<Product, ProductDTO>()
  .addField('id', (p) => p.id.toString())
  .addField('name', 'name')
  .addField('price', (p) => p.price.toString());

const dto = productMapper.map(product);
const dtos = productMapper.mapArray(products);
```

## License

MIT
