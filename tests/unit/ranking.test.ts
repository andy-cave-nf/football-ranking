import {type League} from "../../src/leagues/leagues";
import {
  DefaultRankings,
  RankingError,
  type Rankings,
  RankingsWithStrictDates, SafeRankings,
} from '../../src/rankings';
import type {Ruleset} from "../../src/rulesets/rulesets";
import { ErroredRanking, FakeLeague, FakePage, FakeRuleset, FakeSource } from './fake_setup';
import type {Page} from "../../src/pages/pages";
import type {Team} from "../../src/leagues/teams";
import type { Source } from '../../src/sources/sources';
import type { SourceTeam } from '../../src/sources/types';
import type { Mock } from 'vitest';
import type { Result } from '../../src/leagues/types';
import type { ReadOnlyStrictMap } from '../../src/utils';

let rankings: Rankings
let league: League
let ruleset: Ruleset
let source: Source
let dates: {start: Date, end: Date}
let sourceTeams: SourceTeam[]
let teams: Team[]
let results: Result[]

beforeEach(async () => {
    dates = {start: new Date(2000,0,1), end: new Date(2001,0,1)}
    sourceTeams = [{name: "team1", id:100}, {name: "team2", id: 200}, {name: "team3", id: 300}];
    teams = [{id:1, name: "team1", elo: 200, lastFixtureDate:dates.start}, {id:2, name: "team2", elo: 300, lastFixtureDate:dates.start}, {id:3, name: "team3", elo: 400, lastFixtureDate:dates.start}];
    results = [
      {homeTeamId:1, awayTeamId:2, homeWin: 1, date: new Date(dates.start)},
      {homeTeamId:2, awayTeamId:3, homeWin: 0.5, date: new Date(dates.start)},
      {homeTeamId:1, awayTeamId:3, homeWin: 1, date: new Date(dates.start)},
    ]
    league = new FakeLeague({teams:teams})
    ruleset = new FakeRuleset()
    source = new FakeSource({teams: sourceTeams, matches: results})
    rankings = new DefaultRankings(league, source, ruleset)
})


describe('Ranking makes correct calls on running', async () => {
    beforeEach(async () => {
        await rankings.run(dates.start, dates.end)
    })
    it('tests teams are called from source', async () => {
        expect(source.teams).toBeCalledTimes(1)
    })

    it('tests the teams are added', async () => {
        sourceTeams.forEach(team => {
            expect(league.add).toBeCalledWith(team, dates.start)
        })
    })

    it('tests matches are called from the source', async () => {
        expect(source.results).toBeCalledWith(dates.start,dates.end)
    })

    it('tests that the matches are recorded by the league', async()=>{
        results.forEach(result => {
            expect(league.record).toBeCalledWith(result, ruleset)
        })
    })

})

describe('test that printing rankings call pages', async () => {
    let fakePage: Page
    let spy: Mock<() => ReadOnlyStrictMap<number | string, Team>>
    beforeEach(async () => {
        spy = vi.spyOn(FakeLeague.prototype,'teams','get')
        fakePage = new FakePage()
        await rankings.print(fakePage)
    })
    afterEach(async () => {
      vi.restoreAllMocks()
      vi.clearAllMocks()
    })
    it('tests that teams are called from leagues', async()=>{
        expect(spy).toBeCalledTimes(1)
    })

    it('Tests pages is called with method with', async() => {
        expect(fakePage.with).toBeCalledTimes(teams.length)
    })

    it('tests pages is called with each team', async() => {
      teams.forEach(team => {
        expect(fakePage.with).toBeCalledWith({ [team.name]: team.elo });
      })
    })
})

describe('test strict rankings throws errors', async () => {
  let strictRankings: Rankings
  beforeEach(async () => {
    strictRankings = new RankingsWithStrictDates(rankings)
  })
  it('tests an error is raised if the dates are incompatible',async () => {
    await expect(strictRankings.run(
      new Date(2020,1,1),
      new Date(1970,1,1,))
    ).rejects.toThrowError(RankingError)
  })
})

describe('tests error handling of safe rankings', async () => {
  let safeRankings: Rankings
  beforeEach(async () => {
    safeRankings = new SafeRankings(new ErroredRanking())
  })
  it('tests run raises a ranking error', async() => {
    await expect(safeRankings.run(
      dates.start,
      dates.end,
    )).rejects.toThrowError(RankingError)
  })
  it('tests page raises a ranking error', async() => {
    await expect(safeRankings.print(
      new FakePage()
    )).rejects.toThrowError(RankingError)
  })
})

