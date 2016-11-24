import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params }   from '@angular/router';
import { Location }                 from '@angular/common';

import { HeroService } from './hero.service';
import { Hero } from './hero';

import 'rxjs/add/operator/switchMap';


@Component({
    selector: 'my-hero-detail',
    templateUrl: 'hero-detail.component.html',
    styleUrls: ['hero-detail.component.css']
})
export class HeroDetailComponent implements OnInit {
    @Input() hero: Hero;
    errorMessage: string;


    constructor(
        private heroService: HeroService,
        private route: ActivatedRoute,
        private location: Location
    ) {}

    ngOnInit(): void {
        this.route.params.switchMap((params: Params) => {
            // convert string to a number
            let id: number = +params['id'];
            return this.heroService.getHero(id);
        }).subscribe(
            hero => this.hero = hero,
            error =>  this.errorMessage = <any>error
        );
    }

    goBack(): void {
        this.location.back();
    }

    save(): void {
        this.heroService.update(this.hero)
        .subscribe(
            () => this.goBack(),
            error =>  this.errorMessage = <any>error
        );
    }
}
