import type { ApiQuery } from '../../../../src/sources/api_source/query';
import nock, { type Scope } from 'nock';
import {
  ApiErrorWrappedRequest,
  type ApiRequest,
  ApiRequestError,
  EndpointRequest,
  ErrorGuardedApiRequest,
  type RequestOptions,
  SchemaValidatedRequest,
} from '../../../../src/sources/api_source/request';
import type { ApiSchema } from '../../../../src/sources/types';
import * as fs from 'node:fs';
import { ZodError } from 'zod';
import { readFile } from 'fs/promises';
describe('Endpoint Request', () => {
  let request: ApiRequest
  beforeAll(() => {
    nock.disableNetConnect()
  })
  afterEach(() => {
    nock.cleanAll()
  })
  afterAll(() => {
    nock.enableNetConnect()
  })
  describe('given a valid query', () => {
    let url: URL
    let queryParams: {start: Date, end: Date, season: number}
    let query: ApiQuery
    let options: RequestOptions
    let scope: Scope
    let filename: string

    beforeEach(() => {
      filename = 'tests/fixtures/api_football/pl-2026-02-22.json';
      url = new URL('https://www.example.com',);
      queryParams = {start: new Date(), end: new Date(), season: 2025}
      options = {
        headers: {'x-apisports-key': 'key'},
        endpoint: 'endpoint',
        method: 'GET'
      }
      query = {
        query(_from: Date, _to: Date, _season: number): string {
          return 'a-query'
        }
      }
      scope = nock(new URL(url), {
        reqheaders: options.headers,
      })
        .get('/' + options.endpoint)
        .query(query.query(queryParams.start, queryParams.end, queryParams.season))
        .replyWithFile(200, filename, { 'Content-Type': 'application/json' });
      request = new EndpointRequest(url, query, options)
    })
    describe('when the request is executed', () => {
      let response: ApiSchema
      let expected: ApiSchema
      beforeEach(async () => {
        response = await request.requestWithParams(queryParams.start, queryParams.end, queryParams.season)
        expected = JSON.parse(fs.readFileSync(filename, 'utf8'));
      })
      it('constructs the request correctly with the correct endpoint, headers and method', () => {
        expect(scope.isDone()).toBe(true)
      })
      it('makes only the expected calls', () => {
        expect(nock.isDone()).toBe(true)
      })
      it('returns the parsed response body', () => {
        expect(response).toEqual(expected)
      })
    })
  })

  describe('given a valid query and the api returns a 200 with an empty results array', () => {
    let url: URL;
    let queryParams: { start: Date; end: Date; season: number };
    let query: ApiQuery;
    let options: RequestOptions;
    let filename: string
    beforeEach(() => {
      filename = 'tests/fixtures/api_football/pl_2022-08-08_2022-08-09_season_2022.json';
      url = new URL('https://www.example.com');
      queryParams = {start: new Date(), end: new Date(), season: 2025}
      options = {
        headers:{'x-apisports-key': 'key'},
        endpoint: 'endpoint',
        method:'GET'
      }
      query = {
        query(_from: Date, _to: Date, _season: number): string {
          return 'a-query';
        },
      };
      nock(new URL(url), {
        reqheaders: options.headers,
      })
        .get('/' + options.endpoint)
        .query(query.query(queryParams.start, queryParams.end, queryParams.season))
        .replyWithFile(200, filename, { 'Content-Type': 'application/json' });

      request = new EndpointRequest(url, query, options);
    })
    describe('when the request is executed', () => {
      let response: ApiSchema
      beforeEach(async () => {
        response = await request.requestWithParams(queryParams.start, queryParams.end, queryParams.season)
      })
      it('returns an empty array', () => {
        expect(response.response).toEqual([])
      })
    })
  })
})
describe('Api Error Wrapped Request', () => {
  let request: ApiErrorWrappedRequest
  let origin: ApiRequest
  describe('given an api request that returns a successful response', () => {
    beforeEach(async () => {
      const filename = 'tests/fixtures/api_football/pl-2026-02-22.json';
      origin = {
        async requestWithParams(_start: Date, _end: Date, _season: number): Promise<ApiSchema> {
          const raw = await readFile(filename, 'utf-8');
          return JSON.parse(raw);
        },
      };
      request = new ApiErrorWrappedRequest(origin);
    });
    describe('when the request is executed', () => {
      let response: ApiSchema
      beforeEach(async () => {
        response = await request.requestWithParams(new Date(), new Date(), 2025)
      })
      it('returns the response unchanged', async () => {
        const expected = await origin.requestWithParams(new Date(), new Date(), 2025)
        expect(response).toEqual(expected)
      })
    })
  })
  describe('given an api request that throws an unexpected error', () => {
    beforeEach(async () => {
      origin = {
        async requestWithParams(_start: Date, _end: Date, _season: number): Promise<ApiSchema> {
          throw new Error('Unexpected error')
        },
      };
      request = new ApiErrorWrappedRequest(origin);
    });
    describe('when the request is executed', () => {
      it('wraps the error in an Api Request Error', async () =>{
        await expect(request.requestWithParams(new Date(), new Date(), 2025)).rejects.toThrow(
          ApiRequestError
        );
      })
    })
  })
})
describe('Valid Response From Api Request', () => {
  let request: SchemaValidatedRequest
  let origin: ApiRequest
  describe('given an api request that returns an expected response', () => {
    beforeEach(async () => {
      const filename = "tests/fixtures/api_football/pl-2026-02-22.json";
      origin = {
        async requestWithParams(_start: Date, _end: Date, _season: number): Promise<ApiSchema> {
          const raw = await readFile(filename,'utf-8')
          return JSON.parse(raw)
        }
      }
      request = new SchemaValidatedRequest(origin);
    })
    describe('when the request is executed', () => {
      let response: ApiSchema
      beforeEach(async () => {
        response = await request.requestWithParams(new Date(), new Date(), 2025)
      })
      it('returns the response unchanged', async () => {
        const expected = await origin.requestWithParams(new Date(), new Date(), 2025)
        expect(response).toEqual(expected)
      })
    })
  })
  describe('given an api request that returns an unexpected response', () => {
    beforeEach(async () => {
      origin = {
        async requestWithParams(_start: Date, _end: Date, _season: number): Promise<ApiSchema> {
          // @ts-expect-error: expect Type Error or Zod Error
          return {bad: 'structure'}
        },
      };
      request = new SchemaValidatedRequest(origin);
    })
    describe('when the request is executed', () => {
      it('raises a Zod Error', async () => {
        await expect(
          request.requestWithParams(new Date(), new Date(), 2025)
        ).rejects.toThrow(ZodError);
      })
    })
  })
})

describe('ErrorGuarded Api Request', () => {
  let request: ErrorGuardedApiRequest
  let origin: ApiRequest
  describe('given an api request that returns a successful response', () => {
    beforeEach(async () => {
      const filename = 'tests/fixtures/api_football/pl-2026-02-22.json';
      origin = {
        async requestWithParams(_start: Date, _end: Date, _season: number): Promise<ApiSchema> {
          const raw = await readFile(filename, 'utf-8');
          return JSON.parse(raw);
        },
      };
      request = new ErrorGuardedApiRequest(origin);
    });
    describe('when the request is executed', () => {
      let response: ApiSchema;
      beforeEach(async () => {
        response = await request.requestWithParams(new Date(), new Date(), 2025)
      })
      it('returns the response unchanged', async () => {
        const expected = await origin.requestWithParams(new Date(), new Date(), 2025)
        expect(response).toEqual(expected)
      })
    })
  })
  describe('given an api request that returns a response with errors', () => {
    beforeEach(async () => {
      const filename = 'tests/fixtures/api_football/errored-response.json';
      origin = {
        async requestWithParams(_start: Date, _end: Date, _season: number): Promise<ApiSchema> {
          const raw = await readFile(filename, 'utf-8');
          return JSON.parse(raw);
        },
      };
      request = new ErrorGuardedApiRequest(origin);
    });
    describe('when the request is executed', () => {
      it('throws an Api Request Error', async () => {
        await expect(request.requestWithParams(new Date(), new Date(), 2025)).rejects.toThrow(
          ApiRequestError
        );
      })
    })
  })
})