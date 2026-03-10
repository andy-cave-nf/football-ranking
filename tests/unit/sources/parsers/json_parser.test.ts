import type { JsonFixtures } from '../../../../src/sources/parsers/base';
import type { JsonData } from '../../../../src/sources/parsers/types';
import path from 'node:path';
import { defaultJsonFixtures } from '../../../utils';

describe('given a json file containing a single match, when the file is read', () => {
  let fixture: JsonFixtures<JsonData>
  let actual: JsonData;
  beforeEach(async () => {
    const filepath = path.resolve(process.cwd(), 'tests', 'fixtures','json_source','single_match.json');
    fixture = defaultJsonFixtures(filepath);
    actual = await fixture.parse()
    })
  it('returns a single fixture', () => {
    const expected = {
      fixtures: [
        {
          matchId: 'M001',
          homeId: 'T001',
          homeName: 'Avalon Rovers',
          awayId: 'T002',
          awayName: 'Beacon United',
          score: '0-1',
          date: '2026-02-14T15:00:00',
        },
      ],
    };
    expect(actual).toStrictEqual(expected);
  })
})

describe('given a json file containing many matches, when the file is read', () => {
  it.todo('returns all the matches')
})

describe('given a json file with an empty object, when the file is read', () => {
  it.todo('returns an empty list')
})

describe('given a json file with an empty fixtures key, when the file is read', () => {
  it.todo('returns an empty list')
})

describe('given an empty invalid json file, when the file is read', () => {
  it.todo('raises a json parser error')
})

describe('given a json file with a fixture that has malformed score, when the file is read', () => {
  it.todo('raises a json parser error')
})

describe('given a json file with a fixture with an invalid date, when the file is read', () => {
  it.todo('raises a json parser error')
})

describe('given a json file with a fixture with a missing result, when the file is read', () => {
  it.todo('raises a json parser error')
})

describe('given a json file with a fixture with a missing home team id, when the file is read', () => {
  it.todo('raises a json parser error')
})

describe('given a json file with a fixture with a missing away team id, when the file is read', () => {
  it.todo('raises a json parser error')
})

describe('given a json file with a fixture with a missing home team name, when the file is read', () => {
  it.todo('raises a json parser error')
})

describe('given a json file with a fixture with a missing away team name, when the file is read', () => {
  it.todo('raises a json parser error')
})

describe('given a json file with a fixture with a missing date, when the file is read', () => {
  it.todo('raises a json parser error')
})