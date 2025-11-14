# @stratix/ext-validation-zod

Zod-based input validation for Stratix framework. Provides type-safe validation with excellent TypeScript integration.

## Installation

```bash
npm install @stratix/ext-validation-zod
# or
pnpm add @stratix/ext-validation-zod
# or
yarn add @stratix/ext-validation-zod
```

## Features

- Type-safe validation using Zod schemas
- Integration with Stratix Result pattern
- Async validation support
- Detailed error messages
- Helper functions for common validation patterns
- Full TypeScript support with type inference

## Usage

### Basic Validation

```typescript
import { z, validate } from '@stratix/ext-validation-zod';

const UserSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  age: z.number().int().min(18).max(120),
});

const result = validate(UserSchema, {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
});

if (result.success) {
  console.log('Valid data:', result.data);
} else {
  console.log('Validation errors:', result.errors);
}
```

### Validation with Result Pattern

```typescript
import { z, validateWithResult } from '@stratix/ext-validation-zod';

const ProductSchema = z.object({
  name: z.string(),
  price: z.number().positive(),
  stock: z.number().int().min(0),
});

const result = validateWithResult(ProductSchema, productData);

if (result.isSuccess) {
  const product = result.value;
  console.log('Valid product:', product);
} else {
  console.error('Validation failed:', result.error.message);
}
```

### Validation with Exception

```typescript
import { z, validateOrThrow } from '@stratix/ext-validation-zod';
import { ValidationErrorException } from '@stratix/ext-validation-zod';

const OrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
  })).min(1),
  shippingAddress: z.string(),
});

try {
  const validOrder = validateOrThrow(OrderSchema, orderData);
  console.log('Order is valid:', validOrder);
} catch (error) {
  if (error instanceof ValidationErrorException) {
    console.log('Validation errors:', error.errors);
  }
}
```

### Async Validation

```typescript
import { z, validateAsync } from '@stratix/ext-validation-zod';

const UserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const result = await validateAsync(UserSchema, userData);

if (result.success) {
  console.log('User data is valid:', result.data);
}
```

### Using ZodValidator Class

```typescript
import { z, ZodValidator } from '@stratix/ext-validation-zod';

const validator = new ZodValidator(
  z.object({
    title: z.string(),
    content: z.string(),
    published: z.boolean(),
  })
);

const result = validator.safeParse(articleData);

if (result.success) {
  console.log('Article:', result.data);
}
```

### Complex Validation Schemas

```typescript
import { z } from '@stratix/ext-validation-zod';

const CreateProductSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(255, 'Name is too long'),

  description: z.string().optional(),

  price: z.number()
    .positive('Price must be positive')
    .multipleOf(0.01, 'Price must have at most 2 decimal places'),

  category: z.enum(['electronics', 'clothing', 'food', 'other']),

  tags: z.array(z.string()).min(1).max(10),

  specifications: z.record(z.string()),

  availability: z.object({
    inStock: z.boolean(),
    quantity: z.number().int().min(0),
    restockDate: z.date().optional(),
  }),
});

type CreateProductInput = z.infer<typeof CreateProductSchema>;
```

### Integration with Commands

```typescript
import { z, validateOrThrow } from '@stratix/ext-validation-zod';
import type { Command } from '@stratix/abstractions';

const CreateUserInputSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'user']),
});

export class CreateUserCommand implements Command {
  public readonly name = 'CreateUser';

  constructor(public readonly data: z.infer<typeof CreateUserInputSchema>) {
    validateOrThrow(CreateUserInputSchema, data);
  }
}
```

### Custom Error Messages

```typescript
import { z } from '@stratix/ext-validation-zod';

const schema = z.object({
  username: z.string({
    required_error: 'Username is required',
    invalid_type_error: 'Username must be a string',
  }).min(3, 'Username must be at least 3 characters'),

  email: z.string().email('Please provide a valid email address'),

  age: z.number({
    required_error: 'Age is required',
    invalid_type_error: 'Age must be a number',
  }).int('Age must be an integer')
    .min(18, 'You must be at least 18 years old'),
});
```

### Refinements and Custom Validation

```typescript
import { z } from '@stratix/ext-validation-zod';

const PasswordSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
});

const DateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
}).refine(data => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});
```

### Transform Data

```typescript
import { z } from '@stratix/ext-validation-zod';

const ProductSchema = z.object({
  name: z.string().transform(s => s.trim()),
  price: z.string().transform(s => parseFloat(s)),
  tags: z.string().transform(s => s.split(',').map(t => t.trim())),
});

const result = validate(ProductSchema, {
  name: '  Laptop  ',
  price: '999.99',
  tags: 'electronics, computer, portable',
});

// result.data = {
//   name: 'Laptop',
//   price: 999.99,
//   tags: ['electronics', 'computer', 'portable']
// }
```

## API Reference

### Functions

#### `validate<T>(schema: Schema<T>, data: unknown): ValidationResult<T>`

Validates data synchronously and returns a validation result.

#### `validateAsync<T>(schema: Schema<T>, data: unknown): Promise<ValidationResult<T>>`

Validates data asynchronously and returns a promise of validation result.

#### `validateOrThrow<T>(schema: Schema<T>, data: unknown): T`

Validates data and throws `ValidationErrorException` if validation fails.

#### `validateOrThrowAsync<T>(schema: Schema<T>, data: unknown): Promise<T>`

Async version of `validateOrThrow`.

#### `validateWithResult<T>(schema: Schema<T>, data: unknown): Result<T>`

Validates data and returns a Stratix Result type.

#### `validateWithResultAsync<T>(schema: Schema<T>, data: unknown): Promise<Result<T>>`

Async version of `validateWithResult`.

### Classes

#### `ZodValidator<T>`

Low-level validator class for custom validation logic.

#### `ValidationErrorException`

Exception thrown when validation fails.

**Properties:**
- `errors: ValidationError[]` - Array of validation errors

**Methods:**
- `getErrorsForField(field: string)` - Get errors for a specific field
- `hasErrors()` - Check if there are any errors
- `getFirstError()` - Get the first error

### Types

```typescript
interface ValidationError {
  field: string;
  message: string;
  code: string;
}

interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}
```

## Best Practices

1. **Define schemas as constants** outside components for reusability
2. **Use `z.infer<typeof Schema>`** for automatic type inference
3. **Prefer `validateWithResult`** for integration with Stratix Result pattern
4. **Use custom error messages** for better user experience
5. **Validate at boundaries** (API endpoints, command constructors)
6. **Compose schemas** using `z.object().extend()` or `z.merge()`

## License

MIT
