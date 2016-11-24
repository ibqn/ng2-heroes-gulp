import { Component } from '@angular/core';

import { Hero } from './hero';


@Component({
    selector: 'my-app',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.css'],
})
export class AppComponent {
    title = 'Tour of Heroes';
}