import nock, { type Scope } from 'nock';
import { InMemoryLeague } from '../../src/leagues/in_memory';
import {DefaultEloRuleset} from "../../src/rulesets/rulesets";
import { DefaultRankings, type Rankings } from '../../src/rankings';
import { JsonSource } from '../../src/sources/json_source';
import path from 'node:path';
import { JsonPage, type Page } from '../../src/pages/pages';
import { makeTempDir } from '../utils';
import { join } from 'path';
import { readFileSync, rmSync } from 'fs';
import { apiEnv } from '../../src/env';
import { apiNock } from '../fixtures/nocks';
import { ApiSource } from '../../src/sources/api_source';

let dir: string
let startingElo: number
let rankings: Rankings
let allElos: number[]
let page: Page
let file: string;
beforeEach(() => {
  dir = makeTempDir('tmp')
})

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
})

describe("Single Season rankings of a fake league of five teams from a json file", () => {
    beforeEach(async () => {
        file = join(dir, 'single-season-test.json');
        startingElo = 1000
        rankings = new DefaultRankings(
          new InMemoryLeague(startingElo),
          new JsonSource(path.resolve(process.cwd(), 'tests', 'fixtures','json_source.json')),
          new DefaultEloRuleset(16, 400)
        );
        page = new JsonPage(file)
        await rankings.run(new Date(2025,8 ,16), new Date(2026,5,25))
        await rankings.print(page)
        const raw = readFileSync(file, 'utf-8')
        const elos = JSON.parse(raw) as Record<string,number>
        allElos = Object.values(elos)
    })

    it('tests that the average elo remains the same across the league', async () =>{
        const averageElo = allElos.reduce((a, b) =>  a + b,0) / allElos.length;
        expect(averageElo).toBe(startingElo);
    })
    it('tests that all the elos are not the same', () => {
        const setElos = new Set(allElos)
        expect(setElos.size).not.toEqual(1)
    })

})

describe("Premier League season 24/25 from API Football with InMemoryLeague", () => {
  let scopes: Scope[]
  beforeEach(async () => {
    nock.disableNetConnect()
    const league = "39";
    const from = '2024-08-16';
    const to = '2025-05-25';
    const seasons = ['2023', '2024', '2025'];
    const filepaths = [
      'tests/fixtures/api_football/pl_2024-08-16_2025-05-25_season_2023.json',
      'tests/fixtures/api_football/pl_2024-08-16_2025_05_25_season_2024.json',
      'tests/fixtures/api_football/pl_2024-08-16_2025-05-25_season_2025.json',
    ];
    const zipped = seasons.map((value, index) => [value, filepaths[index]]);
    scopes = [];
    for (const [season, filepath] of zipped) {
      scopes.push(
        apiNock(
          'fixtures',
          { league, from, to, season: season as string },
          filepath as string
        )
      );
    }
  })
  afterEach(async () => {
    nock.cleanAll()
    nock.enableNetConnect()
  })

  it('tests the nock response', async () => {

    const fixtureResponse = await fetch(
      apiEnv.API_URL +
        '/fixtures' +
        '?' +
        new URLSearchParams({
          from: '2024-08-16',
          to: '2025-05-25',
          season: '2024',
          league: '39',
        }).toString(),
      {
        method: 'GET',
        headers: { 'x-apisports-key': apiEnv.API_KEY },
      }
    );
    const fixtures = await fixtureResponse.json();


    expect(fixtures).toBeDefined()
    expect(fixtures).not.toEqual({})
    expect(fixtures.response?.length).toBeGreaterThan(0)
    expect(scopes[1]?.isDone()).toBe(true)

  })
  describe('Ranking setup and tests writing to file', () => {
    beforeEach(async () => {
      file = join(dir, 'premier-league-2024-test.json');
      startingElo = 1000;
      page = new JsonPage(file);
      rankings = new DefaultRankings(
        new InMemoryLeague(startingElo),
        new ApiSource(["39"]),
        new DefaultEloRuleset(16, 400)
      );
      await rankings.run(new Date(2024, 7, 16), new Date(2025, 4, 25));
      // rankings.run should get all the games from the competitions between these two dates
      // then if teams have not been added then they should be with a starting elo
      await rankings.print(page);
      const raw = readFileSync(file, 'utf-8');
      const elos = JSON.parse(raw) as Record<string, number>;
      allElos = Object.values(elos);
    })
    it('Tests that the correct calls are made of the nock', () => {
      scopes.forEach((scope) => expect(scope.isDone()).toBe(true));
    })

    it('Tests that average elo remains the same across the league', async () =>{
      const averageElo = allElos.reduce((a, b) => a + b, 0) / allElos.length;
      expect(averageElo).toBe(startingElo);
    })
    it('Tests that all elos are not the same across the league', async () =>{
      const setElos = new Set(allElos);
      expect(setElos.size).not.toEqual(1);
    })
  })
})
