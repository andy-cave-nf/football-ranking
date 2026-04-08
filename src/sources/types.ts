import { FixtureQuerySchema } from './api_source/api_source';
import * as z from "zod"

export interface SourceTeam {
  id: string;
  name: string;
}

const GoalSchema = z.object({
  home: z.union([z.number().int().gte(0),z.null()]),
  away: z.union([z.number().int().gte(0),z.null()])
})


const ScoreSchema = z.object({
  halftime: GoalSchema,
  fulltime: GoalSchema,
  extratime: GoalSchema,
  penalty: GoalSchema
})

const StrictGoalSchema = z.object({
  home: z.number().int().gte(0),
  away: z.number().int().gte(0),
})


const TeamSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  logo: z.string(),
  winner: z.union([z.boolean(), z.null()]),
})

const TeamsSchema = z.object({
  home: TeamSchema,
  away: TeamSchema
})

const LeagueSchema = z.object({
  id: z.number(),
  name: z.string(),
  country: z.string(),
  logo: z.string(),
  flag: z.string(),
  season: z.number().int().gte(1000).lte(9999),
  round: z.string(),
  standings: z.boolean(),
})

const StatusSchema = z.object({
  long: z.string(),
  short: z.string(),
  elapsed: z.number().int().gte(90),
  extra: z.union([z.number().int().gte(0), z.null()])
})

const VenueFixtureDetailSchema = z.object({
  id: z.int().positive(),
  name: z.string(),
  city: z.string()
})

const ApiFixtureSchema = z.object({
  id: z.int().positive(),
  referee: z.string(),
  date: z.iso.datetime({offset: true}),
  timezone: z.string(),
  timestamp: z.number().int().positive(),
  periods: z.object({
    first: z.number().int().positive(),
    second: z.number().int().positive(),
  }),
  venue: VenueFixtureDetailSchema,
  status: StatusSchema
})

const FixtureResponseSchema = z.object({
  fixture: ApiFixtureSchema,
  league: LeagueSchema,
  teams: TeamsSchema,
  goals: StrictGoalSchema,
  score: ScoreSchema
})

const PagingSchema = z.object({
  current: z.number().gte(0),
  total: z.number().gte(0)
})

export const ApiResponseSchema = z.object({
  get: z.string(),
  parameters: FixtureQuerySchema,
  errors: z.array(z.string()),
  results: z.number().gte(0),
  paging: PagingSchema,
  response: z.array(FixtureResponseSchema),
})


export type ApiResponse = z.infer<typeof ApiResponseSchema>;
export type FixtureResponse = z.infer<typeof FixtureResponseSchema>;
