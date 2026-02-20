import nock, { type Scope } from 'nock';
import { apiEnv } from '../../../src/env';

import type { Source } from '../../../src/sources/base';
import { ApiSource } from '../../../src/sources/api_source';
import { apiNock } from '../../fixtures/nocks';
import type { SourceTeam } from '../../../src/sources/types';

let scope: Scope
let source: Source
let teams: SourceTeam[]
let league: number
let season: number

beforeEach(async () => {
  nock.disableNetConnect()
})

afterEach(() => {
  nock.cleanAll();
  nock.enableNetConnect();
})

describe('Tests the number of teams for premier league 2024 season', async () => {
  beforeEach(async () => {
    league = 39
    season = 2024
    const filepath = 'tests/fixtures/api_football/premier-league-2024-teams.json';
    scope = apiNock('teams', { league: league, season: season }, filepath);
    source = new ApiSource({
      [league]: [season],
    });
    teams = await source.teams();
  })

  it('test the number of teams are called', async () => {
    expect(teams).toHaveLength(20)
  })
  it('tests that the nock is called', async () => {
    expect(scope.isDone()).toBe(true);
  })
})

describe('Tests the number of teams for championship 2024 season', async () => {
  beforeEach(async () => {
    league = 40
    season = 2024
    const filepath = 'tests/fixtures/api_football/championship-2024-teams.json';
    scope = apiNock('teams', { league: league, season: season }, filepath);
    source = new ApiSource({
      [league]: [season],
    })
    teams = await source.teams();
  })
  it('tests the number of teams are called', async () => {
    expect(teams).toHaveLength(24)
  })
  it('tests that the nock is called', async () => {
    expect(scope.isDone()).toBe(true);
  })
})