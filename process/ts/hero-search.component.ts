import { Component, OnInit }  from  '@angular/core';
import { Router }             from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { Subject }    from 'rxjs/Subject';

import { HeroSearchService } from './hero-search.service';
import { Hero } from './hero';

@Component({
    selector: 'hero-search',
    templateUrl: 'hero-search.component.html',
    styleUrls: ['hero-search.component.css'],
    providers: [HeroSearchService]
})
export class HeroSearchComponent implements OnInit {
    heroes: Observable<Hero[]>;
    private searchTerms = new Subject<string>();

    constructor(
        private heroSearchService: HeroSearchService,
        private router: Router
    ) {}

    // Push a search into the observable stream.
    search(term: string): void {
        this.searchTerms.next(term);
    }

    gotoDetail(hero: Hero): void {
        let link = ['detail', hero.id];
        this.router.navigate(link);
    }

    ngOnInit(): void {
        this.heroes = this.searchTerms
        .debounceTime(300)         // wait for 300ms pause in events
        .distinctUntilChanged()    // ignore if search term is same as previous
        .switchMap(                // switch to new observable each time
            term => term
            ? this.heroSearchService.search(term)   // return the http search observable
            : Observable.of<Hero[]>([])             // or the observable of empty heroes if no search term
        )
        .catch(error => {
            // TODO: real error handling
            console.log(error);
            return Observable.of<Hero[]>([]);
        });
    }
}