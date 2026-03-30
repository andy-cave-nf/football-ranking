import {
  type ApiQuery,
  ApiQueryError,
  DefaultApiQuery,
  SafeApiQuery,
} from '../../../../src/sources/api_source/query';

describe('Default Api Query', () => {
  let query : DefaultApiQuery
  let startDate: Date;
  let endDate: Date;
  describe('given a query for a premier league api source', () => {
    let actual: URL
    let season: number
    beforeEach(async () => {
      query = new DefaultApiQuery("39")
    })
    describe('when the date 2024-01-01 is processed for the 2024 season', () => {
      beforeEach(async () => {
        startDate = new Date('2024-01-01');
        endDate = startDate
        season = 2024
        actual = query.query(startDate, endDate, season)
      })

      it('returns a query for the 2024 season', () => {
        const expected =
          new URL('https://v3.football.api-sports.io/fixtures?from=2024-01-01&to=2024-01-01&season=2024&league=39');
        expect(actual).toEqual(expected)
      })
    })
    describe('when the date range 2024-01-01 and 2024-12-31 is processed for the 2024 season', () => {
      beforeEach(async () => {
        startDate = new Date('2024-01-01')
        endDate = new Date('2024-12-31')
        season = 2024
        actual = query.query(startDate, endDate, season)
      })
      it('returns a query for the 2024 season', () => {
        const expected = new URL(
          'https://v3.football.api-sports.io/fixtures?from=2024-01-01&to=2024-12-31&season=2024&league=39'
        );
        expect(actual).toEqual(expected)
      })
    })
  })
})

describe('Safe Api Query', () => {
  let origin: ApiQuery
  let query: SafeApiQuery
  describe('given an origin that succeeds', () => {
    beforeEach(async () => {
      origin = {
        query(_from: Date, _to:Date, _season:number):URL{
          return new URL('https://example.com')
        }
      }
      query = new SafeApiQuery(origin)
    })
    describe('when the query is processed', () => {
      let from: Date;
      let to: Date;
      let season: number
      beforeEach(async () => {
        from = new Date('2024-01-01');
        to = new Date('2024-12-31');
        season = 2024
      })
      it('returns the query unchanged', () => {
        expect(query.query(from,to,season)).toEqual(origin.query(from, to, season));
      })
    })
  })
  describe('given an origin that raises an unexpected error', () => {
    beforeEach(async () => {
      origin = {
        query(_from: Date, _to: Date, _season:number):URL{
          throw new Error('Unexpected error')
        }
      }
      query = new SafeApiQuery(origin)
    })
    describe('when the query is processed', () => {
      let from: Date;
      let to: Date;
      let season: number
      beforeEach(async () => {
        from = new Date('2024-01-01');
        to = new Date('2024-12-31');
        season = 2024
      })
      it('raises an Api Query error', () => {
        expect(() => query.query(from,to,season)).toThrow(ApiQueryError)
      })
    })
  })
})