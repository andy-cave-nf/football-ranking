import { TuiView } from './tui';
import { DefaultRankings, SafeRankings } from './rankings';
import { InMemoryLeague, SafeLeague, StrictLeagueRecord } from './leagues/leagues';
import { ApiSource } from './sources/api_source';
import { DefaultRuleset } from './rulesets/rulesets';
import { JsonPage } from './pages/pages';
import { SafeSource, StrictSourceDates } from './sources/base';

console.log('running')
const view = new TuiView(
  new SafeRankings(
    new DefaultRankings(
      new StrictLeagueRecord(
        new SafeLeague(
          new InMemoryLeague(1000)
        )
      ),
      new StrictSourceDates(
        new SafeSource(
          new ApiSource(["39"])
        )
      ),
      new DefaultRuleset(16,400)
    )
  ),
  new JsonPage('results.json')
)
await view.run().catch(console.error);