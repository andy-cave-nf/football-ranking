import * as z from "zod"


export const FixtureSchema = z.object({
  matchId: z.string(),
  homeId: z.string(),
  awayId: z.string(),
  homeName: z.string(),
  awayName: z.string(),
  score: z.string(),
  date: z.iso.datetime(),
})

export const JsonDataSchema = z.object({
  fixtures: z.array(FixtureSchema),
})

export type JsonData = z.infer<typeof JsonDataSchema>
export type Fixtures = z.infer<typeof FixtureSchema>
export type DashedScore = `${number}-${number}`;
