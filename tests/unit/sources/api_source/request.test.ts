import type { ApiQuery } from '../../../../src/sources/api_source/query';
import nock, { type Scope } from 'nock';
import {
  type ApiRequest,
  DefaultApiRequest,
  type RequestOptions,
} from '../../../../src/sources/api_source/request';
import type { ApiResponse } from '../../../../src/sources/types';
import * as fs from 'node:fs';
import { ZodError } from 'zod';
describe('Api Request', () => {
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
      request = new DefaultApiRequest(url, query, options)
    })
    describe('when the request is executed', () => {
      let response: ApiResponse
      let expected: ApiResponse
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
    describe('when the request is executed', () => {
      it.todo('returns an empty array')
    })
  })
  describe('given a valid query and the api returns a 200 with an invalid structure', () => {
    let url: URL;
    let queryParams: { start: Date; end: Date; season: number };
    let query: ApiQuery;
    let options: RequestOptions;
    let scope: Scope;
    let filename: string;

    beforeEach(() => {
      filename = 'tests/fixtures/api_football/pl-2026-02-22.json';
      url = new URL('https://www.example.com');
      queryParams = { start: new Date(), end: new Date(), season: 2025 };
      options = {
        headers: { 'x-apisports-key': 'key' },
        endpoint: 'endpoint',
        method: 'GET',
      };
      query = {
        query(_from: Date, _to: Date, _season: number): string {
          return 'a-query';
        },
      };
      scope = nock(new URL(url), {
        reqheaders: options.headers,
      })
        .get('/' + options.endpoint)
        .query(query.query(queryParams.start, queryParams.end, queryParams.season))
        .reply(200,{bad:'structure'})
      request = new DefaultApiRequest(url, query, options);
    });

    describe('when the request is executed', () => {
      it('raises a Zod Error', async () => {
        await expect(request.requestWithParams(queryParams.start, queryParams.end, queryParams.season)).rejects.toThrow(ZodError);
      })
    })
  })
})
describe.todo('Safe Api Request', () => {})
describe.todo('Valid Response From Api Request', () => {})