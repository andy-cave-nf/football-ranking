import {pgConnection} from "./db_set_up";
import { DefaultLeague, type League } from '../../src/leagues/leagues';
import {DefaultRuleset} from "../../src/rulesets/rulesets";
import type {Connection} from "../../src/leagues/connections/connections";
import { DefaultRankings, type Rankings } from '../../src/rankings';
import {readFile} from 'fs/promises'
import { JsonSource } from '../../src/sources/sources';
import path from 'node:path';


describe("Single Season rankings of a fake league of five teams from a json file", () => {
    let storageConnection: Connection //This should be a json connection as well.
    let rankings: Rankings
    let allElos: number[]
    let page: JsonPage
    let league: League

    beforeEach(async () => {
        storageConnection = pgConnection
        league = new InMemoryLeague()
        rankings = new DefaultRankings(
            new league,
            new JsonSource(path.resolve(process.cwd(), 'tests', 'fixtures.json')),
            new DefaultRuleset(16,400)
        )
        page = new JsonPage('single_season.json')
        await rankings.run(new Date(2024,8,16), new Date(2025,5,25))
        await rankings.print(page)
        const raw = await readFile('single_season.json', 'utf-8')
        const elos = JSON.parse(raw) as Record<string,number>
        allElos = Object.values(elos)

    })

    it.todo('tests that the average elo remains the same across the league', async () =>{
        const averageElo = allElos.reduce((a, b) =>  a + b,0) / allElos.length;
        expect(averageElo).toBe(league.startingElo)
    })

})
