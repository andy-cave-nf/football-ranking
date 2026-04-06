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

export class DefaultApiRequest implements ApiRequest {
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

export class ValidatedRequest implements ApiRequest {
  constructor(private origin: ApiRequest){}
  async requestWithParams(start: Date, end: Date, season: number): Promise<ApiResponse> {
    return ApiResponseSchema.parse(await this.origin.requestWithParams(start, end, season));
  }
}