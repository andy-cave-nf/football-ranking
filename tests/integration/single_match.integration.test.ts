import { DefaultRankings, type Rankings } from '../../src/rankings';
import { InMemoryLeague } from '../../src/leagues/in_memory';
import { JsonSource } from '../../src/sources/json_source';
import path from 'node:path';
import { makeTempDir } from '../utils';
import { readFileSync, rmSync } from 'fs';
import { JsonPage } from '../../src/pages/pages';
import { join } from 'path';
import type { TrueSkillConfig } from '../../src/rulesets/types';
import { DefaultTrueSkill } from '../../src/rulesets/trueskill';

let dir:string
beforeEach(() => {
  dir = makeTempDir('tmp');
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});


describe('given a single non-drawn match between two teams from a json source, when the match is processed', () => {
  let ranking: Rankings
  let config: TrueSkillConfig
  beforeEach(async () => {
    config = {
      mu0: 25,
      sigma0: 25/3,
      tau: 25/300,
      beta: 25/6,
      drawRate: 0.25
    }
    ranking = new DefaultRankings(
      new InMemoryLeague(new DefaultTrueSkill(config)),
      new JsonSource(
        path.resolve(process.cwd(), 'tests', 'fixtures', 'json_source', 'single_match.json')
      )
    );
    await ranking.run(new Date(2025, 8, 16), new Date(2026, 5, 25));
  })
  it.todo('stores both teams with updated ratings', async () => {
    const rankings= ranking.ranking
    expect(rankings).toHaveLength(2)
    for (const ranking in rankings){
      expect(ranking.mu).not.toEqual(config.mu0);
      expect(ranking.sigma).toBeLessThan(config.sigma0);
    }
  })
  it.todo('writes a results file with teams sorted by rating', async () => {
    const file = join(dir, 'single-match-test.json');
    const page = new JsonPage(file)
    await ranking.print(page)
    const raw = readFileSync(file, 'utf-8');
    const ratings = JSON.parse(raw) as Record<string, Rating>;
    const allRatings = Object.values(ratings);
    expect(allRatings[0].mu).toBeGreaterThan(allRatings[1].mu)

  })
})

it.todo('given a single drawn match between two teams from a json source when the match is processed then both teams are stored with closer ratings than the prior')