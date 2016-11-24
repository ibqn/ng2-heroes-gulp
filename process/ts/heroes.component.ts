import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';

import { Hero } from './hero';
import { HeroService } from './hero.service';


@Component({
    selector: 'my-heroes',
    templateUrl: 'heroes.component.html',
    styleUrls: ['heroes.component.css'],
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
    errorMessage: string;

    getHeroes(): void {
        this.heroService.getHeroes()
        .subscribe(
            heroes => this.heroes = heroes,
            error => this.errorMessage = <any>error
        );
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
        .subscribe(
            hero => {
                this.heroes.push(hero);
                this.selectedHero = null;
            },
            error =>  this.errorMessage = <any>error
        );
    }

    delete(hero: Hero): void {
        this.heroService.delete(hero.id)
        .subscribe(
            () => {
                this.heroes = this.heroes.filter(h => h !== hero);
                if (this.selectedHero === hero) {
                    this.selectedHero = null;
                }
            },
            error =>  this.errorMessage = <any>error
        );
    }
}