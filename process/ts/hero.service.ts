import { Injectable }               from '@angular/core';
import { Http, Response, Headers }  from '@angular/http';

import { Hero } from './hero';

import { Observable } from 'rxjs/Observable'


@Injectable()
export class HeroService {
    private heroesUrl = 'app/heroes';
    private headers = new Headers({'Content-Type': 'application/json'});

    constructor(private http: Http) {}

    private handleError(error: Response | any): Observable<any> {
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.messsage : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
    }

    private extractData<T>(response: Response) {
        let body = response.json();
        return body.data || {} as T;
    }

    getHeroes(): Observable<Hero[]> {
        return this.http.get(this.heroesUrl)
        .map(this.extractData)
        .catch(this.handleError);
    }

    getHero(id: number): Observable<Hero> {
        return this.getHeroes()
        .map(heroes => heroes.find(hero => hero.id === id));
    }

    update(hero: Hero): Observable<Hero> {
        const url = `${this.heroesUrl}/${hero.id}`;
        return this.http.put(
            url,
            JSON.stringify(hero),
            { headers: this.headers }
        )
        .map(() => hero)
        .catch(this.handleError);
    }

    create(name: string): Observable<Hero> {
        return this.http.post(
            this.heroesUrl,
            JSON.stringify({name: name}),
            {headers: this.headers}
        )
        .map(this.extractData)
        .catch(this.handleError);
    }

    delete(id: number): Observable<number> {
        const url = `${this.heroesUrl}/${id}`;
        return this.http.delete(url, {headers: this.headers})
        .map(() => id)
        .catch(this.handleError);
    }
}