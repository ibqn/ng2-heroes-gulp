import { Component, OnInit } from '@angular/core';

import { Hero } from './hero';
import { HeroService } from './hero.service'


@Component({
  selector: 'my-dashboard',
  templateUrl: 'dashboard.component.html',
  styleUrls: ['css/dashboard.component.css']
})
export class DashboardComponent implements OnInit {
	heroes: Hero[];
    errorMessage: string;

	constructor(private heroService: HeroService) {}

	ngOnInit(): void {
    	this.heroService.getHeroes()
        .subscribe(
            heroes => this.heroes = heroes.slice(1, 5),
            error =>  this.errorMessage = <any>error
        );
    }
}