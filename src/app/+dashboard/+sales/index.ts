import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';

import { SalesShowsComponent } from './salesShows';
import { SalesDetailsComponent } from './salesDetails';
import { SalesListComponent } from './salesList';

export const SALES_ROUTERS = [
    { path : '', component : SalesListComponent, pathMatch : 'full' },
    { path : 'shows/:id', component : SalesShowsComponent },
    { path : 'details', component : SalesDetailsComponent },
    { path : 'details/:id', component : SalesDetailsComponent }
];

@NgModule({
    declarations : [],
    imports : [ CommonModule, ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(SALES_ROUTERS)]
})
export default class SalesModule {}
