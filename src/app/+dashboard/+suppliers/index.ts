import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';

import { SuppliersDetailsComponent } from './suppliersDetails';
import { SuppliersListComponent } from './suppliersList';

export const SUPPLIERS_ROUTERS = [
    { path : '', component : SuppliersListComponent, pathMatch : 'full' },
    { path : 'details', component : SuppliersDetailsComponent },
    { path : 'details/:id', component : SuppliersDetailsComponent }
];

@NgModule({
    declarations : [],
    imports : [ CommonModule, ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(SUPPLIERS_ROUTERS)]
})
export default class SuppliersModule {}