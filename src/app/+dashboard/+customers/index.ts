import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';

import { CustomersDetailsComponent } from './customersDetails';
import { CustomersListComponent } from './customersList';

export const SUPPLIERS_ROUTERS = [
    { path : '', component : CustomersListComponent, pathMatch : 'full' },
    { path : 'details', component : CustomersDetailsComponent },
    { path : 'details/:id', component : CustomersDetailsComponent }
];

@NgModule({
    declarations : [],
    imports : [ CommonModule, ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(SUPPLIERS_ROUTERS)]
})
export default class CustomersModule {}