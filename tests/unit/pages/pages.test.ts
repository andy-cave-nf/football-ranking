import { makeTempDir } from '../../utils';
import { JsonPage, type Page } from '../../../src/pages/pages';
import { join } from 'path';
import { readFileSync, rmSync } from 'fs';
import { DEFAULT_FAKE_TEAMS } from '../fake_setup';

import type { Team } from '../../../src/leagues/types';

describe('test that json page writes to a file correctly', () => {
  let dir: string;
  let page: Page;
  let file: string;
  let teams: Team[];
  beforeEach(async () => {
    dir = makeTempDir('tmp');
    file = join(dir, 'json-page-test.json');
    page = new JsonPage(file);
    teams = DEFAULT_FAKE_TEAMS;
    await page.print(teams);
  });
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });
  it('tests the contents of the file', async () => {
    const actual = JSON.parse(readFileSync(file, 'utf8'));
    const expected = Object.fromEntries(teams.map((team) => [team.name, team.mu]));
    expect(actual).toEqual(expected);
  });
});
