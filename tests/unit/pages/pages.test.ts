import { makeTempDir } from '../../utils';
import type { Page } from '../../../src/pages/pages';
import { join } from 'path';
import { rmSync } from 'fs';


describe('test that json page writes to a file correctly', () => {
  let dir: string
  let page: Page
  let file: string
  beforeEach(() => {
    dir = makeTempDir('tmp')
    file = join(dir, 'json-page-test.json')
    page = JsonPage(file)
  })
  afterEach(() => {
    rmSync(dir, { recursive: true , force: true })
  })
//   create a tmp working directory and clean it up
//   create data to write
//   read data and check contents
})