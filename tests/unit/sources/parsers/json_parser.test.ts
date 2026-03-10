import type { JsonFixtures } from '../../../../src/sources/parsers/base';
import type { JsonData } from '../../../../src/sources/parsers/types';
import path from 'node:path';

describe('given a json file containing a single match, when the file is read', () => {
  let parser: JsonFixtures<JsonData>
  let actual: JsonData;
  it.todo('returns a single fixture', () => {
    beforeEach(async () => {
      const filepath = path.resolve(process.cwd(), 'tests', 'fixtures','json_source','single_match.json');
      parser = new
    })
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