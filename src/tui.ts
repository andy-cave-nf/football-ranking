import { Command, type OptionValues } from 'commander';
import type { Rankings } from './rankings';
import type { Page } from './pages/pages';

export class TuiView {
  private program: Command = new Command();
  constructor(
    private rankings: Rankings,
    private page: Page
  ) {}
  async run(): Promise<void> {
    const options = this.options();
    await this.rankings.run(new Date(options.from), new Date(options.to));
    await this.rankings.print(this.page);
  }
  private options(): OptionValues {
    this.program.requiredOption('--from <from>', 'left side of date interval');
    this.program.requiredOption('--to <to>', 'right side of date interval');
    // this.program.requiredOption('--competition <competition>', 'competition id');
    // this.program.requiredOption('--file <file>', 'file path');
    this.program.parse();
    return this.program.opts();
  }
}
