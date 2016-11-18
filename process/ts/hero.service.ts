import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Hero } from './hero';

import 'rxjs/add/operator/toPromise';


@Injectable()
export class HeroService {
    private heroesUrl = 'app/heroes';

    constructor(private http: Http) {}

    private handleError(error: any): Promise<any> {
        console.error('An HTTP error ocured', error);
        return Promise.reject(error.message || error);
    }

    getHeroes(): Promise<Hero[]> {
        return this.http.get(this.heroesUrl)
                   .toPromise()
                   .then(response => response.json().data as Hero[])
                   .catch(this.handleError);
    }

    getHero(id: number): Promise<Hero> {
        return this.getHeroes()
                   .then(heroes => heroes.find(hero => hero.id === id));
    }
}