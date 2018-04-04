import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';

import { SellsShowsComponent } from './sellsShows';
import { SellsDetailsComponent } from './sellsDetails';
import { SellsListComponent } from './sellsList';

export const SELLS_ROUTERS = [
    { path : '', component : SellsListComponent, pathMatch : 'full' },
    { path : 'shows/:id', component : SellsShowsComponent },
    { path : 'details', component : SellsDetailsComponent },
    { path : 'details/:id', component : SellsDetailsComponent }
];

@NgModule({
    declarations : [],
    imports : [ CommonModule, ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(SELLS_ROUTERS)]
})
export default class SellsModule {}