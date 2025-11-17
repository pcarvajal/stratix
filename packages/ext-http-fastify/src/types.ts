import type { FastifyRequest, RouteShorthandOptions } from 'fastify';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface RouteConfig<TBody = unknown, TQuery = unknown, TParams = unknown> {
  method: HttpMethod;
  path: string;
  handler: RouteHandler<TBody, TQuery, TParams>;
  options?: RouteShorthandOptions;
  schema?: RouteSchema<TBody, TQuery, TParams>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface RouteSchema<TBody = unknown, TQuery = unknown, TParams = unknown> {
  body?: unknown;
  querystring?: unknown;
  params?: unknown;
  response?: {
    [statusCode: number]: unknown;
  };
}

export interface RouteHandler<TBody = unknown, TQuery = unknown, TParams = unknown> {
  (request: HttpRequest<TBody, TQuery, TParams>): Promise<HttpResponse>;
}

export interface HttpRequest<TBody = unknown, TQuery = unknown, TParams = unknown> {
  body: TBody;
  query: TQuery;
  params: TParams;
  headers: Record<string, string | string[] | undefined>;
  raw: FastifyRequest;
}

export interface HttpResponse {
  statusCode?: number;
  body?: unknown;
  headers?: Record<string, string>;
}

export interface FastifyHTTPPluginOptions {
  port?: number;
  host?: string;
  prefix?: string;
  cors?:
    | boolean
    | {
        origin?: string | string[] | boolean;
        methods?: string[];
        credentials?: boolean;
      };
  logger?: boolean;
  trustProxy?: boolean;
}

export interface HttpError extends Error {
  statusCode: number;
  code?: string;
  details?: unknown;
}
