import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';

import { PurchasesShowsComponent } from './purchasesShows';
import { PurchasesDetailsComponent } from './purchasesDetails';
import { PurchasesListComponent } from './purchasesList';

export const PURCHASES_ROUTERS = [
    { path : '', component : PurchasesListComponent, pathMatch : 'full' },
    { path : 'shows/:id', component : PurchasesShowsComponent },
    { path : 'details', component : PurchasesDetailsComponent },
    { path : 'details/:id', component : PurchasesDetailsComponent }
];

@NgModule({
    declarations : [],
    imports : [ CommonModule, ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(PURCHASES_ROUTERS)]
})
export default class PurchasesModule {}