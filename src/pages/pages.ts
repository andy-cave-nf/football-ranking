import { writeFile } from 'fs/promises';
import type { Team } from '../leagues/teams';

export interface Page {
  print(teams: Team[]): Promise<void>
}

export class JsonPage implements Page {
  constructor(private filepath: string) {}
  async print(teams: Team[]) {
    await writeFile(this.filepath,JSON.stringify(this.printableTeams(teams),null,4), 'utf8')
  }
  private printableTeams(teams: Team[]):Record<string,number> {
    return Object.fromEntries(
      teams.map(team => [team.name,team.elo])
    )
  }
}