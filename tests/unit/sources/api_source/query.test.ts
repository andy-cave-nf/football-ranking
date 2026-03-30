describe('Default Api Query', () => {
  let query : DefaultApiQuery
  let startDate: Date;
  let endDate: Date;
  describe('given a query for a premier league api source', () => {
    beforeEach(async () => {
      query = new DefaultApiQuery(["39"])
    })
    describe('when the date 2024-01-01 is processed', () => {
      let actual: string
      beforeEach(async () => {
        startDate = new Date('2024-01-01');
        endDate = startDate
        actual = query.query(startDate, endDate)
      })
      it('returns a query for the 2023 season', () => {
        const expected = 'https://v3.football.api-sports.io/fixtures?from=2024-01-01&to=2024-01-01&season=2023&league=39'
        expect(actual).toContain(expected);
      })
      it('returns a query for the 2024 season', () => {
        const expected =
          'https://v3.football.api-sports.io/fixtures?from=2024-01-01&to=2024-01-01&season=2024&league=39';
        expect(actual).toContain(expected)
      })
      it('does not return queries for other seasons', () => {
        expect(actual).toHaveLength(2)
      })
    })
    describe.todo('when the date range 2024-01-01 and 2024-12-31 is processed', () => {
      it.todo('returns a query for the 2023 season')
      it.todo('returns a query for the 2024 season')
      it.todo('does not return queries for other seasons')
    })
    describe.todo('when the date range 2024-01-01 and 2026-01-01 is processed', () => {
      it.todo('returns a query for the 2023 season');
      it.todo('returns a query for the 2024 season');
      it.todo('returns a query for the 2025 season');
      it.todo('returns a query for the 2026 season');
      it.todo('returns a query for the season for the year between the start and end date');
      it.todo('does not return queries for other seasons');
    });
    describe.todo('when the date range 2024-01-01 and 2025-01-01 is processed', () => {
      it.todo('returns a query for the 2023 season')
      it.todo('returns a query for the 2024 season')
      it.todo('returns a query for the 2025 season')
      it.todo('returns a query for the season for the year between the start and end date')
      it.todo('does not return queries for other seasons')
    })
  })
  describe('given a query for a premier league and fa cup api source', () => {
    describe('when the date 2024-01-01 is processed', () => {
      it.todo('returns a query for the premier league 2023 season')
      it.todo('returns a query for the premier league 2024 season')
      it.todo('returns a query for the fa cup 2023 season')
      it.todo('returns a query for the fa cup 2024 season')
      it.todo('does not return queries for other seasons')
    })
    describe('when the date range 2024-01-01 and 2024-12-31 is processed', () => {
      it.todo('returns a query for the premier league 2023 season')
      it.todo('returns a query for the premier league 2024 season')
      it.todo('returns a query for the fa cup 2023 season')
      it.todo('returns a query for the fa cup 2024 season')
      it.todo('does not return queries for other seasons')
    })
    describe('when the date range 2024-01-01 and 2025-01-01 is processed', () => {
      it.todo('returns a query for the premier league 2023 season')
      it.todo('returns a query for the premier league 2024 season')
      it.todo('returns a query for the premier league 2025 season')
      it.todo('returns a query for the fa cup 2023 season')
      it.todo('returns a query for the fa cup 2024 season')
      it.todo('returns a query for the fa cup 2025 season')
      it.todo('does not return queries for other seasons')
    })
    describe('when the date range 2024-01-01 and 2026-01-01 is processed', () => {
      it.todo('returns a query for the premier league 2023 season');
      it.todo('returns a query for the premier league 2024 season');
      it.todo('returns a query for the premier league 2025 season');
      it.todo('returns a query for the premier league 2026 season');
      it.todo('returns a query for the fa cup 2023 season');
      it.todo('returns a query for the fa cup 2024 season');
      it.todo('returns a query for the fa cup 2025 season');
      it.todo('returns a query for the fa cup 2026 season');
      it.todo('does not return queries for other seasons');
    });
  })
})