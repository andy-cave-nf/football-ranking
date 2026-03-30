import { apiEnv } from '../../env';
import { format } from 'date-fns';

export interface ApiQuery {
  query(start: Date, end: Date, season: number): URL
}

export class DefaultApiQuery implements ApiQuery {
  private url = apiEnv.API_URL
  constructor(private leagues: string) {}
  query(from:Date, to: Date, season: number) {
    return new URL(
      'fixtures?'+
      new URLSearchParams({
        from: format(from,'yyyy-MM-dd'),
        to: format(to,'yyyy-MM-dd'),
        season: season.toString(),
        league: this.leagues,
      },
        ).toString(),
      this.url+'/')
  }
}