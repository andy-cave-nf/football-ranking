import nock, { type Scope } from 'nock';
import { InMemoryLeague, type League } from '../../src/leagues/leagues';
import {DefaultRuleset} from "../../src/rulesets/rulesets";
import { DefaultRankings, type Rankings } from '../../src/rankings';
import { JsonSource } from '../../src/sources/sources';
import path from 'node:path';
import { JsonPage, type Page } from '../../src/pages/pages';
import { makeTempDir } from '../utils';
import { join } from 'path';
import { readFileSync, rmSync } from 'fs';
import { apiEnv } from '../../src/env';

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
          new DefaultRuleset(16, 400)
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
  let scope:Scope
  beforeEach(async () => {
    nock.disableNetConnect()
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
      })
      .get('/fixtures')
      .query({
        from: '2024-08-16',
        to: '2025-05-25',
        season: 2024,
        league: 39,
      })
      .replyWithFile(200, 'tests/fixtures/api_football/premier-league-2024-fixtures.json', {
        'Content-Type': 'application/json',
      });

  })
  afterEach(async () => {
    nock.cleanAll()
    nock.enableNetConnect()
  })

  it('tests the nock response', async () => {
    const teamResponse = await fetch(
      apiEnv.API_URL +
        '/teams' +
        '?' +
        new URLSearchParams({
          league: '39',
          season: '2024',
        }).toString(),
      {
        method: 'GET',
        headers: { 'x-apisports-key': apiEnv.API_KEY },
      }
    );
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
    const teams = await teamResponse.json();


    expect(teams).toBeDefined();
    expect(teams).not.toEqual({})
    expect(teams.response?.length).toBeGreaterThan(0)

    expect(fixtures).toBeDefined()
    expect(fixtures).not.toEqual({})
    expect(fixtures.response?.length).toBeGreaterThan(0)

    expect(scope.isDone()).toBe(true)
  })
  describe('Ranking setup and tests writing to file', () => {
    beforeEach(async () => {
      file = join(dir, 'premier-league-2024-test.json');
      startingElo = 1000;
      page = new JsonPage(file);
      rankings = new DefaultRankings(
        new InMemoryLeague(startingElo),
        new ApiSource({
          39: [2024],
        }),
        new DefaultRuleset(16, 400)
      );
      await rankings.run(new Date(2024, 8, 16), new Date(2025, 5, 25));
      await rankings.print(page);
      const raw = readFileSync(file, 'utf-8');
      const elos = JSON.parse(raw) as Record<string, number>;
      allElos = Object.values(elos);
    })
    it.todo('Tests that the correct calls are made of the nock', () => {
      expect(scope.isDone()).toBe(true);
    })

    it.todo('Tests that average elo remains the same across the league', async () =>{
      const averageElo = allElos.reduce((a, b) => a + b, 0) / allElos.length;
      expect(averageElo).toBe(startingElo);
    })
    it.todo('Tests that all elos are not the same across the league', async () =>{
      const setElos = new Set(allElos);
      expect(setElos.size).not.toEqual(1);
    })
  })
})
