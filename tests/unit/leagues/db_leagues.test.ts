import type { League } from '../../../src/leagues/base';
import { type Connection, Pool } from 'pg';
import { PgPoolQueryRunner } from 'ts-sql-query/queryRunners/PgPoolQueryRunner';
import { apiEnv } from '../../../src/env';

describe.todo('tests on empty db leagues', () => {
  let league: League;
  let connection: Connection;
  beforeEach(async () => {
    const pgPool = new Pool({
      host: apiEnv.TEST_DB_HOST,
      database: apiEnv.TEST_DB_NAME,
    });
    connection = new DbConnection(
      new PgPoolQueryRunner(
        new Pool(pgPool)
      )
    )
    league = new PgLeague(connection)
  })
  it('tests that there are no teams', async () => {
    await expect(league.teams.size).toBe(0);
  })

})