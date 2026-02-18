import { InMemoryLeague, type League } from '../../src/leagues/leagues';
import {DefaultRuleset} from "../../src/rulesets/rulesets";
import { DefaultRankings, type Rankings } from '../../src/rankings';
import { JsonSource } from '../../src/sources/sources';
import path from 'node:path';
import { JsonPage, type Page } from '../../src/pages/pages';
import { makeTempDir } from '../utils';
import { join } from 'path';
import { readFileSync, rmSync } from 'fs';


describe("Single Season rankings of a fake league of five teams from a json file", () => {
    let startingElo: number
    let rankings: Rankings
    let allElos: number[]
    let page: Page
    let league: League
    let dir: string
    let file: string;
    beforeEach(async () => {
        dir = makeTempDir('tmp');
        file = join(dir, 'single-season-test.json');
        startingElo = 1000
        league = new InMemoryLeague(startingElo)
        rankings = new DefaultRankings(
            league,
            new JsonSource(path.resolve(process.cwd(), 'tests', 'fixtures.json')),
            new DefaultRuleset(16,400)
        )
        page = new JsonPage(file)
        await rankings.run(new Date(2025,8 ,16), new Date(2026,5,25))
        await rankings.print(page)
        const raw = readFileSync(file, 'utf-8')
        const elos = JSON.parse(raw) as Record<string,number>
        allElos = Object.values(elos)
    })

    afterEach(async () => {
      rmSync(dir, { recursive: true, force: true });
    })

    it('tests that the average elo remains the same across the league', async () =>{
        const averageElo = allElos.reduce((a, b) =>  a + b,0) / allElos.length;
        expect(averageElo).toBe(startingElo);
    })
    it('tests that all the elos are not the same', () => {
        const setElos = new Set(allElos)
        expect(setElos.size).not.toEqual(1)
    })

})
