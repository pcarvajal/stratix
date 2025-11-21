---
sidebar_position: 4
---

# Commands Reference

Complete reference of all Stratix Copilot commands and features.

## Chat Commands

### Entity Generation

**Command:** `/entity`

**Syntax:**
```
@stratix /entity <EntityName> with <prop1>, <prop2>, ...
```

**Examples:**
```
@stratix /entity User with email, name, createdAt
@stratix /entity Product with name, price, stock, category
@stratix /entity Order with orderId, customerId, items, total
```

**Generates:**
- Entity class extending `Entity<Props>`
- Props interface
- Private constructor
- Static `create()` factory method
- Getters for all properties
- Proper TypeScript types

---

### Command Generation

**Command:** `/command`

**Syntax:**
```
@stratix /command <CommandName> with <param1>, <param2>, ...
```

**Examples:**
```
@stratix /command CreateUser with userId, email, name
@stratix /command UpdateProduct with productId, price
@stratix /command DeleteOrder with orderId
```

**Generates:**
- Command DTO class
- Command handler implementing `ICommandHandler`
- Repository injection
- Result pattern usage
- Error handling

---

### Query Generation

**Command:** `/query`

**Syntax:**
```
@stratix /query <QueryName> with <param1>, <param2>, ...
```

**Examples:**
```
@stratix /query GetUserById with userId
@stratix /query ListProducts with page, limit
@stratix /query SearchOrders with status, dateFrom, dateTo
```

**Generates:**
- Query DTO class
- Query handler implementing `IQueryHandler`
- Repository usage
- Result pattern for responses
- Proper typing

---

### Value Object Generation

**Command:** `/vo`

**Syntax:**
```
@stratix /vo <ValueObjectName> [with validation]
```

**Examples:**
```
@stratix /vo Email with validation
@stratix /vo Money with currency
@stratix /vo Address with street, city, zipCode
```

**Generates:**
- Value object class extending `ValueObject<Props>`
- Props interface
- Validation logic
- Static `create()` returning `Result<VO>`
- Equality methods (`equals()`)

---

### Repository Generation

**Command:** `/repository`

**Syntax:**
```
@stratix /repository <RepositoryName>
```

**Examples:**
```
@stratix /repository UserRepository
@stratix /repository ProductRepository with PostgreSQL
@stratix /repository OrderRepository
```

**Generates:**
- Repository interface
- Method signatures (findById, save, delete, etc.)
- Optional implementation (in-memory, PostgreSQL, MongoDB)
- Proper typing with generics

---

### Bounded Context Generation

**Command:** `/context`

**Syntax:**
```
@stratix /context <ContextName>
```

**Examples:**
```
@stratix /context Orders
@stratix /context Users
@stratix /context Inventory
```

**Generates:**
- Complete folder structure
- Sample entity
- Sample repository
- Sample commands and queries
- Infrastructure setup
- Index file with exports

---

### Refactoring Suggestions

**Command:** `/refactor`

**Syntax:**
```
@stratix /refactor
[paste your code]
```

**Examples:**
```
@stratix /refactor
class User {
  constructor(public name: string, public email: string) {}
}
```

**Provides:**
- DDD pattern suggestions
- Value object opportunities
- Entity improvements
- CQRS recommendations
- Code organization tips

---

### Concept Explanation

**Command:** `/explain`

**Syntax:**
```
@stratix /explain <concept>
```

**Examples:**
```
@stratix /explain aggregate roots
@stratix /explain Result pattern
@stratix /explain dependency injection
@stratix /explain bounded contexts
```

**Provides:**
- Clear definition
- Code examples from Stratix
- When to use it
- Best practices
- Related concepts

---

## VS Code Commands

Access via Command Palette (`Cmd+Shift+P`):

### Stratix: Open AI Assistant

Opens Copilot Chat with Stratix context.

**Shortcut:** None (use Command Palette)

---

### Stratix: Rebuild Knowledge Base

Rebuilds the knowledge base from documentation sources.

**When to use:**
- After Stratix framework update
- KB seems outdated
- Troubleshooting issues

**Process:**
1. Scans all documentation
2. Generates embeddings
3. Saves to storage
4. Shows completion message

**Duration:** ~30 seconds

---

### Stratix: Show Knowledge Base Info

Displays knowledge base version and statistics.

**Shows:**
- KB version (matches Stratix version)
- Generation date
- Total documents
- Documents by type:
  - Docusaurus docs
  - Package READMEs
  - Patterns
  - Examples

---

## Action Buttons

After code generation, Stratix Copilot shows action buttons in chat:

### 📄 Create Entity File

- Saves entity to `domain/entities/`
- Opens file in editor
- Follows project structure

### 📄 Create Command File

- Saves command to `application/commands/`
- Creates handler file
- Proper CQRS structure

### 📄 Create Query File

- Saves query to `application/queries/`
- Creates handler file
- Follows conventions

### 📄 Create Value Object File

- Saves to `domain/value-objects/`
- Proper naming
- Opens in editor

### 📄 Create Repository File

- Saves interface to `domain/repositories/`
- Optional implementation in `infrastructure/`

### 📄 Create Bounded Context

- Creates complete folder structure
- Multiple files
- Shows summary of created files

---

## General Chat

You can also ask general questions without slash commands:

```
@stratix how do I implement a repository?
@stratix what's the difference between commands and queries?
@stratix show me an example of an aggregate root
@stratix how do I use the Result pattern?
```

Stratix Copilot will:
- Search knowledge base
- Retrieve relevant documentation
- Provide code examples
- Show source references

---

## Tips

### Command Modifiers

Add details to get more specific results:

```
@stratix /entity User with email validation
@stratix /command CreateOrder with transaction support
@stratix /repository UserRepository with caching
```

### Follow-up Questions

Refine generated code with follow-ups:

```
@stratix add validation to the email property
@stratix make the price property required
@stratix add a method to calculate total
```

### Context Awareness

Stratix Copilot understands your project:

```
@stratix /entity Order
# Knows about existing User, Product entities
# Generates proper relationships
```

---

## Next Steps

- [Examples](./examples.md) - Real-world usage examples
- [Troubleshooting](./troubleshooting.md) - Common issues
- [Best Practices](./best-practices.md) - Tips for effective use
