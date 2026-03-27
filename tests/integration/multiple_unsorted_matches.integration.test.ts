import  { DefaultRankings, type Rankings } from '../../src/rankings';
import type { TrueSkillConfig } from '../../src/rulesets/types';
import  { type League, SafeLeague, StrictLeagueRecord } from '../../src/leagues/base';
import { InMemoryLeague } from '../../src/leagues/in_memory';
import { DefaultTeamMap } from '../../src/leagues/team_maps';
import type { Team } from '../../src/leagues/types';
import { DefaultTrueSkill } from '../../src/rulesets/trueskill';
import path from 'node:path';
import  { SafeSource, SortedSource, type Source, StrictSourceDates, StrictSourceIds, UniqueResultsSource } from '../../src/sources/base';
import { JsonSource } from '../../src/sources/json_source';
import { SafeJson } from '../../src/sources/parsers/base';
import {
  DefaultJsonFixtures,
  ValidatedJsonScores,
  ValidatedJsonShape,
} from '../../src/sources/parsers/json_parse';

describe('given multiple unsorted matches from a json source', () => {
  let ranking: Rankings
  let config: TrueSkillConfig
  let league: League
  let source: Source;
  beforeEach(() => {
    config = {
      mu0: 25,
      sigma0: 25/3,
      tau: 25/300,
      beta: 25/6,
      drawRate: 0.25
    }
    league = new StrictLeagueRecord(
      new SafeLeague(
        new InMemoryLeague(
          new DefaultTeamMap(new Map<string,Team>()),
          new DefaultTrueSkill(config)
        )
      )
    )
    const filepath = path.resolve(process.cwd(), 'tests','fixtures','json_source','multiple_unsorted_matches.json')
    source = new StrictSourceDates(
      new StrictSourceIds(
        new UniqueResultsSource(
          new SortedSource(
            new SafeSource(
              new JsonSource(
                new SafeJson(
                  new ValidatedJsonShape(
                    new ValidatedJsonScores(
                      new DefaultJsonFixtures(filepath)
                    )
                  )
                )
              )
            )
          )
        )
      )
    )
    ranking = new DefaultRankings(league,source)
  })
  describe('when all the matches are processed', () => {
    beforeEach(async () => {
      await ranking.run(new Date(2026,0,1),new Date(2026,3,1));
    })
    it('stores all the teams with ratings', () => {
      expect(league.standings()).toHaveLength(4)
    })
  })
  describe('when two matches are processed', () => {
    beforeEach(async () => {
      await ranking.run(new Date(2026,0,1),new Date(2026,1,16));
    })
    it('stores only the played teams with ratings', () => {
      expect(league.standings()).toHaveLength(3)
    })
  })
  describe('when a single match is processed', () => {
    beforeEach(async () => {
      await ranking.run(new Date(2026,0,1),new Date(2026,1,14));
    })
    it('stores only two teams with ratings', () => {
      expect(league.standings()).toHaveLength(2)
    })
  })
})