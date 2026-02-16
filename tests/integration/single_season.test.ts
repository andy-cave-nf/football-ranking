import { InMemoryLeague, type League } from '../../src/leagues/leagues';
import {DefaultRuleset} from "../../src/rulesets/rulesets";
import { DefaultRankings, type Rankings } from '../../src/rankings';
import {readFile} from 'fs/promises'
import { JsonSource } from '../../src/sources/sources';
import path from 'node:path';


describe("Single Season rankings of a fake league of five teams from a json file", () => {
    let startingElo: number
    let rankings: Rankings
    let allElos: number[]
    let page: JsonPage
    let league: League

    beforeEach(async () => {
        startingElo = 1000
        league = new InMemoryLeague(startingElo)
        rankings = new DefaultRankings(
            league,
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
        expect(averageElo).toBeCloseTo(1000)
    })

})
