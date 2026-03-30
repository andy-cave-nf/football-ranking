import nock, { type Scope } from 'nock';
import { apiEnv } from '../../../../src/env';

import { SortedSource, type Source } from '../../../../src/sources/base';
import { ApiSource } from '../../../../src/sources/api_source/api_source';
import { apiNock } from '../../../fixtures/nocks';
import type { SourceTeam } from '../../../../src/sources/types';
import type { Result } from '../../../../src/leagues/types';

let scope: Scope;
let source: Source;
let teams: SourceTeam[];
let league: number;
let season: number;

describe('api sources', () => {
  describe('given an api source of the premier league', () => {
    describe('when the results of a home win between Liverpool and Newcastle on 2024-01-01 are processed', () => {
      it.todo('returns the transformed result correctly as a home win', () => {})
    });
    describe('when the results of an away win between ')

    describe('when the results between 2024-01-01 and 2026-01-01 are processed',() =>{
      it.todo('calls the fixtures endpoint with the correct date range')
      it.todo('returns the correct number of matches')
      it.todo('returns the matches in ascending date order.')
    })
  })
  describe('when')
})


beforeEach(async () => {
  nock.disableNetConnect();
});

afterEach(() => {
  nock.cleanAll();
  nock.enableNetConnect();
});

describe('Tests the premier league results between 2024-01-01 and 2026-01-01', async () => {
  let from: string;
  let to: string;
  let seasons: string[];
  let results: Result[];
  let source: Source;
  let scopes: Scope[];
  beforeEach(async () => {
    league = 39;
    from = '2024-01-01';
    to = '2026-01-01';
    seasons = ['2023', '2024', '2025', '2026'];
    const filepaths = [
      'tests/fixtures/api_football/pl_2024-01-01_2026-01-01_season_2023.json',
      'tests/fixtures/api_football/pl_2024-01-01_2026-01-01_season_2024.json',
      'tests/fixtures/api_football/pl_2024-01-01_2026-01-01_season_2025.json',
      'tests/fixtures/api_football/pl_2024-01-01_2026-01-01_season_2026.json',
    ];
    const zipped = seasons.map((value, index) => [value, filepaths[index]]);
    scopes = [];
    for (const [season, filepath] of zipped) {
      scopes.push(
        apiNock(
          'fixtures',
          { league: '39', from, to, season: season as string },
          filepath as string
        )
      );
    }
    source = new SortedSource(new ApiSource(['39']));
    results = await source.results(new Date(from), new Date(to));
  });
  it('tests that all nocks are called', async () => {
    scopes.forEach((scope) => expect(scope.isDone()).toBe(true));
  });
  it('tests that the correct number of results are pulled', async () => {
    expect(results).toHaveLength(754);
  });
  it('tests that the results are sorted by date ascending', async () => {
    const dates: Date[] = results.map((result) => result.date);
    expect(dates).toEqual([...dates].sort((a, b) => a.getTime() - b.getTime()));
  });
});
