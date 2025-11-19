import { ValueObject } from '../core/ValueObject.js';
import { Result, Success, Failure } from '../result/Result.js';
import { DomainError } from '../errors/DomainError.js';

/**
 * Represents a valid URL with parsing capabilities.
 *
 * URL is immutable and automatically validates the format.
 * Provides convenient access to URL components like protocol, domain, path, etc.
 *
 * @example
 * ```typescript
 * const result = URL.create('https://example.com/path?query=value');
 * if (result.isSuccess) {
 *   const url = result.value;
 *   console.log(url.protocol); // "https:"
 *   console.log(url.domain); // "example.com"
 *   console.log(url.path); // "/path"
 * }
 * ```
 */
export class URL extends ValueObject {
  private readonly _url: globalThis.URL;

  private constructor(readonly value: string) {
    super();
    this._url = new globalThis.URL(value);
  }

  /**
   * Creates a URL instance with validation.
   *
   * @param value - The URL string
   * @returns Success with URL or Failure with DomainError
   *
   * @example
   * ```typescript
   * const result = URL.create('https://example.com');
   * if (result.isSuccess) {
   *   console.log(result.value.value); // "https://example.com/"
   * }
   *
   * const invalid = URL.create('not-a-url');
   * if (invalid.isFailure) {
   *   console.log(invalid.error.code); // "INVALID_URL"
   * }
   * ```
   */
  static create(value: string): Result<URL, DomainError> {
    if (!value || typeof value !== 'string') {
      return Failure.create(new DomainError('EMPTY_URL', 'URL cannot be empty'));
    }

    const trimmed = value.trim();

    if (trimmed.length === 0) {
      return Failure.create(new DomainError('EMPTY_URL', 'URL cannot be empty'));
    }

    try {
      new globalThis.URL(trimmed);
      return Success.create(new URL(trimmed));
    } catch {
      return Failure.create(new DomainError('INVALID_URL', 'URL format is invalid'));
    }
  }

  /**
   * Gets the protocol of the URL (e.g., "https:").
   *
   * @example
   * ```typescript
   * const url = URL.create('https://example.com').unwrap();
   * console.log(url.protocol); // "https:"
   * ```
   */
  get protocol(): string {
    return this._url.protocol;
  }

  /**
   * Gets the hostname (domain) of the URL.
   *
   * @example
   * ```typescript
   * const url = URL.create('https://example.com:8080').unwrap();
   * console.log(url.domain); // "example.com"
   * ```
   */
  get domain(): string {
    return this._url.hostname;
  }

  /**
   * Gets the port of the URL.
   *
   * @example
   * ```typescript
   * const url = URL.create('https://example.com:8080').unwrap();
   * console.log(url.port); // "8080"
   * ```
   */
  get port(): string {
    return this._url.port;
  }

  /**
   * Gets the path of the URL.
   *
   * @example
   * ```typescript
   * const url = URL.create('https://example.com/path/to/resource').unwrap();
   * console.log(url.path); // "/path/to/resource"
   * ```
   */
  get path(): string {
    return this._url.pathname;
  }

  /**
   * Gets the query string of the URL.
   *
   * @example
   * ```typescript
   * const url = URL.create('https://example.com?foo=bar&baz=qux').unwrap();
   * console.log(url.queryString); // "?foo=bar&baz=qux"
   * ```
   */
  get queryString(): string {
    return this._url.search;
  }

  /**
   * Gets the hash/fragment of the URL.
   *
   * @example
   * ```typescript
   * const url = URL.create('https://example.com#section').unwrap();
   * console.log(url.hash); // "#section"
   * ```
   */
  get hash(): string {
    return this._url.hash;
  }

  /**
   * Gets a specific query parameter value.
   *
   * @param key - The query parameter key
   * @returns The parameter value or null if not found
   *
   * @example
   * ```typescript
   * const url = URL.create('https://example.com?foo=bar&baz=qux').unwrap();
   * console.log(url.getQueryParam('foo')); // "bar"
   * console.log(url.getQueryParam('missing')); // null
   * ```
   */
  getQueryParam(key: string): string | null {
    return this._url.searchParams.get(key);
  }

  /**
   * Gets all query parameters as an object.
   *
   * @returns An object with all query parameters
   *
   * @example
   * ```typescript
   * const url = URL.create('https://example.com?foo=bar&baz=qux').unwrap();
   * console.log(url.getQueryParams()); // { foo: 'bar', baz: 'qux' }
   * ```
   */
  getQueryParams(): Record<string, string> {
    const params: Record<string, string> = {};
    this._url.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }

  /**
   * Checks if the URL uses HTTPS protocol.
   *
   * @returns true if the protocol is HTTPS
   *
   * @example
   * ```typescript
   * const url = URL.create('https://example.com').unwrap();
   * console.log(url.isSecure()); // true
   * ```
   */
  isSecure(): boolean {
    return this.protocol === 'https:';
  }

  /**
   * Checks if the URL belongs to a specific domain.
   *
   * @param domain - The domain to check
   * @returns true if the URL belongs to the domain
   *
   * @example
   * ```typescript
   * const url = URL.create('https://api.example.com').unwrap();
   * console.log(url.belongsToDomain('example.com')); // true
   * console.log(url.belongsToDomain('other.com')); // false
   * ```
   */
  belongsToDomain(domain: string): boolean {
    return this.domain === domain || this.domain.endsWith(`.${domain}`);
  }

  protected getEqualityComponents(): unknown[] {
    return [this._url.href];
  }

  toString(): string {
    return this._url.href;
  }

  toJSON(): string {
    return this._url.href;
  }
}
