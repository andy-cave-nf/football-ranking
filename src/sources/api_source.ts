import type { Source } from './base';
import { apiEnv } from '../env';
import type { SourceTeam } from './types';

export class ApiSource implements Source {
  private url = apiEnv.API_URL
  private key = apiEnv.API_KEY
  constructor(private leagues: Record<number,number[]>) {}
  async teams(): Promise<SourceTeam[]> {
    const response = await fetch()
  }
}

export type TeamQuery = {
  league: number
  season: number
}

export type FixtureQuery = {
  from: string,
  to: string,
  season: number,
  league: number
}