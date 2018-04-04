import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';

import { BuysShowsComponent } from './buysShows';
import { BuysDetailsComponent } from './buysDetails';
import { BuysListComponent } from './buysList';

export const BUYS_ROUTERS = [
    { path : '', component : BuysListComponent, pathMatch : 'full' },
    { path : 'shows/:id', component : BuysShowsComponent },
    { path : 'details', component : BuysDetailsComponent },
    { path : 'details/:id', component : BuysDetailsComponent }
];

@NgModule({
    declarations : [],
    imports : [ CommonModule, ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(BUYS_ROUTERS)]
})
export default class BuysModule {}