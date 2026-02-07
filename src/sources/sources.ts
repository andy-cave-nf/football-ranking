import type {Team} from "../leagues/teams";

export interface Source {
    teams(): Promise<Team[]>
    matches(start: Date, end?: Date): Promise<Match[]>
}

export interface Match {
    id:number
}