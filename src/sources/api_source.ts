import type { Source } from './base';
import { apiEnv } from '../env';
import type { ApiResponse } from './types';
import { cartesianProduct } from '../utils';
import { format } from 'date-fns';
import type { Result } from '../leagues/types';

export class ApiSource implements Source {
  private url = apiEnv.API_URL
  private key = apiEnv.API_KEY
  constructor(private leagues: string[]) {}
  async results(from: Date, to: Date) {
    const rawResponse = await this.fetchAll(from, to,this.leagues)
    return this.cleanedResults(rawResponse)
  }
  private async fetchAll(from:Date,to:Date, competitions: string[]) {
    const seasons: string[] = this.listSeasons(from,to)
    const allCombinations = cartesianProduct<string, string>(seasons,competitions)
    const allResponses = []
    for (const [season, competition] of allCombinations) {
      const response = await this.fetchResult(from, to, season, competition)
      allResponses.push(response);
    }
    return allResponses
  }
  private listSeasons(from: Date, to: Date):string[] {
    const start = (from.getFullYear()-1)
    const end = to.getFullYear()
    return Array.from({length: end-start+1},(_,i): string => (start+i).toString())
  }
  private async fetchResult(from: Date, to: Date, season: string,league:string) {
    const response = await fetch(
      apiEnv.API_URL +
        '/fixtures' +
        '?' +
        new URLSearchParams({
          from: format(from, 'yyyy-MM-dd'),
          to: format(to, 'yyyy-MM-dd'),
          season: season as string,
          league: league as string,
        }).toString(),
      {
        method: 'GET',
        headers: { 'x-apisports-key': apiEnv.API_KEY },
      }
    );
    return await response.json() as ApiResponse<'fixture'>;
  }
  private cleanedResults(rawResponse: ApiResponse<'fixture'>[]) {
    return rawResponse.map((response) => (this.cleanedResult(response))).flat();
  }
  private cleanedResult(response: ApiResponse<'fixture'>): Result[] {
    const fixtures =  response.response
    return fixtures.map((fixture) => ({
      home: {id: fixture.teams.home.id.toString(), name: fixture.teams.home.name},
      away: {id: fixture.teams.away.id.toString(), name: fixture.teams.away.name},
      homeWin: fixture.teams.home.winner ? 1 : fixture.teams.away.winner ? 0 : 0.5,
      date: new Date(fixture.fixture.date)
    }))
  }
}

export type ApiQuery = {
  league: string
  season: string
}

export type FixtureQuery = {
  from: string,
  to: string,
  season: string,
  league: string
}