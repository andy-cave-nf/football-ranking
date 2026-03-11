import type { SafeSource, Source } from '../../../../src/sources/base';

describe.todo('Safe Source', () => {
  let source: SafeSource
  let origin: Source
  describe.todo('given a source that succeeds, when the source is parsed', () => {
    it.todo('returns the data unchanged')
  })
  describe.todo('given a source that fails, when the source is parsed', () => {
    it.todo('raises a source error')
  })
})

describe.todo('Strict Source Dates', () => {
  describe('given a source, when it is parsed with correctly ordered dates', () => {
    it.todo('returns the data unchanged')
  })
  it.todo('a source error is raised if the end date is before the start date')
})

describe.todo('Sorted Source', () => {
  describe('given a source with unsorted results, when the source is parsed', () => {
    it.todo('returns the results in chronological order')
  })
})
