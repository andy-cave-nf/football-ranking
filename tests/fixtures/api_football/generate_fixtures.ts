import { apiEnv } from '../../../src/env';
import * as fs from 'node:fs';

const fixtureResponse = await fetch(
  apiEnv.API_URL +
    '/fixtures' +
    '?' +
    new URLSearchParams({
      from: '2024-08-16',
      to: '2025-05-25',
      season: '2024',
      league: '39',
    }).toString(),
  {
    method: 'GET',
    headers: { 'x-apisports-key': apiEnv.API_KEY },
  }
);
//
// fs.writeFileSync(
//   'tests/fixtures/api_football/premier-league-2024-fixtures.json',
//   JSON.stringify(await fixtureResponse.json(), null, 2),
// )

const teamResponse = await fetch(
  apiEnv.API_URL +
  '/teams' +
  '?' +
  new URLSearchParams({
    league: '39',
    season: '2024'
  }).toString(),
  {
    method: 'GET',
    headers: { 'x-apisports-key': apiEnv.API_KEY },
  }
);

fs.writeFileSync(
  'tests/fixtures/api_football/premier-league-2024-teams.json',
  JSON.stringify(await teamResponse.json(), null, 2),
)


