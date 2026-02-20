import type { Source } from './base';
import { apiEnv } from '../env';
import type { ApiResponse, SourceTeam } from './types';

export class ApiSource implements Source {
  private url = apiEnv.API_URL
  private key = apiEnv.API_KEY
  private queries: ApiQuery[]
  constructor(private leagues: Record<number,number[]>) {
    this.queries = Object.entries(leagues).flatMap(([league, seasons]) =>
      seasons.map((season) => ({ league: league.toString(), season: season.toString() }))
    );
  }
  async teams(): Promise<SourceTeam[]> {

    const response = await fetch(
      apiEnv.API_URL +
        '/teams' +
        '?' +
        new URLSearchParams().toString(),
      {
        method: 'GET',
        headers: { 'x-apisports-key': apiEnv.API_KEY },
      }
    );
    const data = (await response.json()) as ApiResponse<'team'>;
    return data.response.map(team => ({name: team.team.name, id: team.team.id}));
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