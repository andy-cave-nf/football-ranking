import nock, { type Scope } from 'nock';
import { apiEnv } from '../../../src/env';

import type { Source } from '../../../src/sources/base';
import { ApiSource } from '../../../src/sources/api_source';

let scope: Scope

beforeEach(async () => {
  nock.disableNetConnect()
})

afterEach(() => {
  nock.cleanAll();
  nock.enableNetConnect();
})

describe('All teams are are called', async () => {
  let source: Source
  beforeEach(async () => {
    scope = nock(new URL('https://v3.football.api-sports.io'), {
      reqheaders: {
        'x-apisports-key': apiEnv.API_KEY,
      },
    })
      .get('/teams')
      .query({
        league: 39,
        season: 2024,
      })
      .replyWithFile(200, 'tests/fixtures/api_football/premier-league-2024-teams.json', {
        'Content-Type': 'application/json',
      });

    source = new ApiSource({
      39:[2024]
    })
    await source.teams()
  })
  it.todo('tests that the nock is called properly', () => {
    expect(scope.isDone()).toBe(true)
  })
})