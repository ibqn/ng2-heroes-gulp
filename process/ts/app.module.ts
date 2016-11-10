import { NgModule }              from '@angular/core';
import { BrowserModule }         from '@angular/platform-browser';
import { FormsModule}            from '@angular/forms';
import { HttpModule }            from '@angular/http';

import { AppComponent }          from './app.component';
import { HeroDetailComponent }   from './hero-detail.component';
import { DashboardComponent }    from './dashboard.component';
import { HeroesComponent }       from './heroes.component';

import { HeroService } from './hero.service';

import { AppRoutingModule }   from './app-routing.module';


@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        AppRoutingModule,
    ],
    providers: [HeroService],
    declarations: [
        AppComponent,
        HeroesComponent,
        DashboardComponent,
        HeroDetailComponent
    ],
    bootstrap:    [ AppComponent ]
})
export class AppModule { }