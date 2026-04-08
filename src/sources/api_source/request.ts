import  { type ApiResponse, ApiResponseSchema } from '../types';
import type { ApiQuery } from './query';

export interface ApiRequest {
  requestWithParams(start: Date,end: Date, season: number) : Promise<ApiResponse>
}

export type RequestOptions = {
  headers: Record<string, string>;
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH'
}

export class EndpointRequest implements ApiRequest {
  constructor(private url: URL, private query: ApiQuery, private options: RequestOptions) {}
  async requestWithParams(start: Date, end: Date, season: number): Promise<ApiResponse> {
    const response = await fetch(
      new URL(
        '/'+this.options.endpoint + '?' + this.query.query(start,end,season),this.url
      ),
      {
        method: this.options.method,
        headers: this.options.headers,
      }
    )
    return await response.json();
  }
}

export class SchemaValidatedRequest implements ApiRequest {
  constructor(private origin: ApiRequest){}
  async requestWithParams(start: Date, end: Date, season: number): Promise<ApiResponse> {
    return ApiResponseSchema.parse(await this.origin.requestWithParams(start, end, season));
  }
}

export class ApiErrorWrappedRequest implements ApiRequest {
  constructor(private origin: ApiRequest){}
  async requestWithParams(start: Date, end: Date, season: number):Promise<ApiResponse> {
    try {
      return await this.origin.requestWithParams(start, end, season);
    } catch (error) {
      throw new ApiRequestError('Unable to parse response', { cause: error});
    }
  }
}

export class ApiRequestError extends Error {
  constructor(
    public message: string,
    public options?: ErrorOptions
  ) {
    super(message, options);
    this.name = 'ApiRequestError';
  }
}
