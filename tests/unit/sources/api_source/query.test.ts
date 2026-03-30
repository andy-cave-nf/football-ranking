import { DefaultApiQuery } from '../../../../src/sources/api_source/query';

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