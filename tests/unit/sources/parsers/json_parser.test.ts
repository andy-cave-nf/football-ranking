import type { JsonFixtures } from '../../../../src/sources/parsers/base';
import type { JsonData } from '../../../../src/sources/parsers/types';
import path from 'node:path';
import { DefaultJsonFixtures } from '../../../../src/sources/parsers/json_parse';

describe('Default Json Fixtures', () => {
  describe('given a file containing valid JSON when the file is parsed', () => {
    let fixture: DefaultJsonFixtures
    let actual: unknown
    beforeEach(async () => {
      const filepath = path.resolve(process.cwd(), 'tests', 'fixtures','json_source','single_match.json');
      fixture = new DefaultJsonFixtures(filepath);
      actual = await fixture.parse()
      })
    it('returns the parsed object', () => {
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
  describe('given a file that does not exist, when the file is parsed', () => {
    it.todo('throws a filesystem error')
  })
  describe('given a file containing invalid JSON when the file is parsed', () => {
    it.todo('throws a syntax error')
  })
})
describe('Validated Json Shape', () => {
  describe('given a json fixture that has a valid structure, when the data is parsed', () => {
    it.todo('returns the data unchanged')
  })
  describe('given a json fixture that has an invalid structure, when the data is parsed', () => {
    it.todo('throws a Zod error')
  })
})

describe('Safe Json', () => {
  describe('given a json fixture that succeeds, when the data is parsed', () => {
    it.todo('returns the data unchanged')
  })
  describe('given a json fixture that throws, when the data is parsed', () => {
    it.todo('raises a json parse error with the original error as a cause')
  })
})


describe('Validate Json Scores', () => {
  describe('given a json fixture that has valid scores, when the data is parsed', () => {
    it.todo('returns the data unchanged')
  })
  describe('given a json fixture that has an invalid scores, when the data is parsed', () => {
    it.todo('throws a json parse error')
  })
})


describe('given a json file containing a single match, when the file is read', () => {
  let fixture: JsonFixtures<JsonData>
  let actual: JsonData;
})

describe('given a json file containing many matches, when the file is read', () => {
  let fixture: JsonFixtures<JsonData>
  let actual: JsonData;
  beforeEach(async () => {
    const filepath = path.resolve(process.cwd(), 'tests', 'fixtures','json_source','two_matches.json');
    fixture = defaultJsonFixtures(filepath);
    actual = await fixture.parse()
  })
  it('returns all the matches', () => {
    const expected = {
      fixtures: [
        {
          matchId: 'M002',
          homeId: 'T001',
          homeName: 'Avalon Rovers',
          awayId: 'T003',
          awayName: 'Cedar City FC',
          score: '1-2',
          date: '2026-02-16T17:00:00',
        },
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

describe('given a json file with no matches, when the file is read', () => {
  it.todo('returns the provided empty object')
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