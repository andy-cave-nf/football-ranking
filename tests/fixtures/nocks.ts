import type { FixtureQuery, ApiQuery } from '../../src/sources/api_source/api_source';
import nock from 'nock';
import { apiEnv } from '../../src/env';

export function apiNock(uri: string, query: ApiQuery | FixtureQuery, responseFile: string) {
  return nock(new URL(apiEnv.API_URL), {
    reqheaders: {
      'x-apisports-key': apiEnv.API_KEY,
    },
  })
    .get('/' + uri)
    .query(query)
    .replyWithFile(200, responseFile, { 'Content-Type': 'application/json' });
}
