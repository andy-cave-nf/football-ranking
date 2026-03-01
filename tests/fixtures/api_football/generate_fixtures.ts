import { apiEnv } from '../../../src/env';
import * as fs from 'node:fs';

// console.log(format(new Date(),'yyyy-MM-dd'));

const fixtureResponse = await fetch(
  apiEnv.API_URL +
    '/fixtures' +
    '?' +
    new URLSearchParams({
      league: '39',
      from: '2024-08-16',
      to: '2025-05-25',
      season: '2025',
    }).toString(),
  {
    method: 'GET',
    headers: { 'x-apisports-key': apiEnv.API_KEY },
  }
);

// TODO: Needs to create nocks for each season call that is necessary between dates
// TODO: say dates are between 2023-01-01 and 2026-01-01 it needs seasons 2022,23,24,25,26

fs.writeFileSync(
  'tests/fixtures/api_football/pl_2024-08-16_2025-05-25_season_2025.json',
  JSON.stringify(await fixtureResponse.json(), null, 2)
);

// const teamResponse = await fetch(
//   apiEnv.API_URL +
//   '/teams' +
//   '?' +
//   new URLSearchParams({
//     league: '40',
//     season: '2024'
//   }).toString(),
//   {
//     method: 'GET',
//     headers: { 'x-apisports-key': apiEnv.API_KEY },
//   }
// );
//
// fs.writeFileSync(
//   'tests/fixtures/api_football/championship-2024-teams.json',
//   JSON.stringify(await teamResponse.json(), null, 2),
// )
//
