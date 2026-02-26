import { TuiView } from './tui';
import { DefaultRankings, SafeRankings } from './rankings';
import { InMemoryLeague } from './leagues/in_memory';
import { ApiSource } from './sources/api_source';
import { EloRuleset } from './rulesets/rulesets';
import { JsonPage } from './pages/pages';
import { SafeSource, StrictSourceDates } from './sources/base';
import { SafeLeague, StrictLeagueRecord } from './leagues/base';

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
      new EloRuleset(16,400)
    )
  ),
  new JsonPage('results/pl_2020-01-01_2026-02-24.json')
)
await view.run().catch(console.error);