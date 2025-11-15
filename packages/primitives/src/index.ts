// Core
export { ValueObject } from './core/ValueObject.js';
export { Entity } from './core/Entity.js';
export { EntityId } from './core/EntityId.js';
export { AggregateRoot } from './core/AggregateRoot.js';
export type { DomainEvent } from './core/DomainEvent.js';
export { DomainService } from './core/DomainService.js';
export type { DomainServiceMethod, AsyncDomainServiceMethod } from './core/DomainService.js';

// Result Pattern
export type { Result } from './result/Result.js';
export { Success, Failure, ResultUtils } from './result/Result.js';

// Errors
export { DomainError } from './errors/DomainError.js';

// Value Objects
export { Currency } from './value-objects/Currency.js';
export { Money } from './value-objects/Money.js';
export { Email } from './value-objects/Email.js';
export { URL } from './value-objects/URL.js';
export { PhoneNumber } from './value-objects/PhoneNumber.js';
export { CountryCallingCodeRegistry } from './value-objects/CountryCallingCode.js';
export type { CountryCallingCodeInfo } from './value-objects/CountryCallingCode.js';
export { CountryRegistry } from './value-objects/CountryRegistry.js';
export type { CountryInfo } from './value-objects/CountryRegistry.js';
export { DateRange } from './value-objects/DateRange.js';
export { Percentage } from './value-objects/Percentage.js';
export { Address } from './value-objects/Address.js';
export type { AddressProps } from './value-objects/Address.js';
export { UUID } from './value-objects/UUID.js';

// Patterns
export { Specification, fromPredicate } from './patterns/Specification.js';
export type { SpecificationResult } from './patterns/Specification.js';

// AI Agents
export * from './ai-agents/index.js';
