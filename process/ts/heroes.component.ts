import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';

import { Hero } from './hero';
import { HeroService } from './hero.service';


@Component({
    selector: 'my-heroes',
    templateUrl: 'heroes.component.html',
    styleUrls: ['css/heroes.component.css'],
})
export class HeroesComponent implements OnInit {
    ngOnInit(): void {
        this.getHeroes();
    }

    constructor(
        private heroService: HeroService,
        private router: Router
    ) {}

    selectedHero: Hero;
    heroes: Hero[];

    getHeroes(): void {
        this.heroService.getHeroes().then(heroes => this.heroes = heroes);
    }

    onSelect(hero: Hero): void {
        this.selectedHero = hero;
    }

    gotoDetail(): void {
        this.router.navigate(['detail', this.selectedHero.id]);
    }

    add(name: string): void {
        name = name.trim();
        if (!name) return;
        this.heroService.create(name)
            .then(hero => {
                this.heroes.push(hero);
                this.selectedHero = null;
            });
    }
}