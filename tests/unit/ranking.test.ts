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
import type { Match } from '../../src/sources/types';

let rankings: Rankings
let league: League
let ruleset: Ruleset
let source: Source
let dates: {start: Date, end: Date}
let teams: Team[]
let matches: Match[]

beforeEach(async () => {
    teams = [{name: "team1", elo:100}, {name: "team2", elo: 200}, {name: "team3", elo: 300}];
    matches = [{id:1},{id:2},{id:3},{id:4},{id:5},{id:6}];
    league = new FakeLeague({teams:teams})
    ruleset = new FakeRuleset()
    source = new FakeSource({teams: teams, matches})
    rankings = new DefaultRankings(league, source, ruleset)
    dates = {start: new Date(2000,1,1), end: new Date(2001,1,1)}
})


describe('Ranking makes correct calls on running', async () => {
    beforeEach(async () => {
        await rankings.run(dates.start, dates.end)
    })
    it('tests teams are called from source', async () => {
        expect(source.teams).toBeCalledTimes(1)
    })

    it('tests the teams are added', async () => {
        teams.forEach(team => {
            expect(league.add).toBeCalledWith(team.name, dates.start)
        })
    })

    it('tests matches are called from the source', async () => {
        expect(source.matches).toBeCalledWith(dates.start,dates.end)
    })

    it('tests that the matches are recorded by the league', async()=>{
        matches.forEach(match => {
            expect(league.record).toBeCalledWith(match, ruleset)
        })
    })

    it.todo('tests that teams are correct once added', async () => {
    //     This is a test for leagues!
    })

})

describe('test that printing rankings call pages', async () => {
    let fakePage: Page
    beforeEach(async () => {
        fakePage = new FakePage()
        await rankings.print(fakePage)
    })
    it('tests that teams are called from leagues', async()=>{
        expect(league.teams).toBeCalledTimes(1)
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

