import { Injectable } from '@angular/core';

import { Hero } from './hero';
import { HEROES } from './mock-heroes';


@Injectable()
export class HeroService {
    getHeroes(): Promise<Hero[]> {
        return Promise.resolve(HEROES);
    }

    getHero(id: number): Promise<Hero> {
    	let hero = HEROES.find(hero => hero.id === id);
    	console.log(hero);
    	return Promise.resolve(HEROES.find(hero => hero.id === id));
    }
}