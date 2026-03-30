import { DefaultRankings, type Rankings } from '../../src/rankings';
import { InMemoryLeague } from '../../src/leagues/in_memory';
import { JsonSource } from '../../src/sources/json_source';
import path from 'node:path';
import type { TrueSkillConfig } from '../../src/rulesets/types';
import { DefaultTrueSkill } from '../../src/rulesets/trueskill';
import { DefaultTeamMap } from '../../src/leagues/team_maps';
import type { Team } from '../../src/leagues/types';
import { SafeJson } from '../../src/sources/parsers/base';
import { DefaultJsonFixtures, ValidatedJsonScores, ValidatedJsonShape } from '../../src/sources/parsers/json_parse';
import  { type League, SafeLeague } from '../../src/leagues/base';
import {
  SafeSource,
  SortedSource,
  type Source,
  StrictSourceDates,
  StrictSourceIds,
  UniqueResultsSource,
} from '../../src/sources/base';
import { ApiSource } from '../../src/sources/api_source/api_source';


describe('given a single match between two teams from a json source', () => {
  let ranking: Rankings
  let config: TrueSkillConfig
  let league: League
  beforeEach(async () => {
    config = {
      mu0: 25,
      sigma0: 25/3,
      tau: 25/300,
      beta: 25/6,
      drawRate: 0.25
    }
    league = new SafeLeague(
        new InMemoryLeague(
        new DefaultTeamMap(new Map<string,Team>()),
        new DefaultTrueSkill(config)
        )
      )
    const filepath = path.resolve(process.cwd(), 'tests', 'fixtures', 'json_source', 'single_match.json')
    ranking =
      new DefaultRankings(
        league,
        new JsonSource(
          new SafeJson(
            new ValidatedJsonScores(
              new ValidatedJsonShape(
                new DefaultJsonFixtures(filepath)
              )
            )
          )
        )
    );
  })
  describe('when the match is processed', () => {
    beforeEach(async () => {
      await ranking.run(new Date(2025, 8, 16), new Date(2026, 5, 25));
    })
    it('stores both teams with ratings', () => {
      expect(league.standings()).toHaveLength(2)
    })
  })
})

describe('given a single premier league match between two teams from an api source', () => {
  let rankings: Rankings
  let config: TrueSkillConfig
  let league: League
  let source: Source
  beforeEach(async () => {
    config = {
      mu0: 25,
      sigma0: 25 / 3,
      tau: 25 / 300,
      beta: 25 / 6,
      drawRate: 0.25,
    };
    league = new SafeLeague(
        new InMemoryLeague(
        new DefaultTeamMap(new Map<string, Team>()),
        new DefaultTrueSkill(config)
      )
    );
    source = new StrictSourceDates(
      new StrictSourceIds(
        new UniqueResultsSource(
          new SortedSource(
            new SafeSource(
              new ApiSource(["39"])
            )
          )
        )
      )
    )
    rankings = new DefaultRankings(league, source)
  })
  describe('when the match is processed', () => {
    beforeEach(async () => {
      await rankings.run(new Date(2023,0,12),new Date(2023,0,12))
    })
    it('stores both teams with ratings', () => {
      expect(league.standings()).toHaveLength(2)
    })
  })
})