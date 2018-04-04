import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';

import { TaxesDetailsComponent } from './taxesDetails';
import { TaxesListComponent } from './taxesList';

export const SUPPLIERS_ROUTERS = [
    { path : '', component : TaxesListComponent, pathMatch : 'full' },
    { path : 'details', component : TaxesDetailsComponent },
    { path : 'details/:id', component : TaxesDetailsComponent }
];

@NgModule({
    declarations : [],
    imports : [ CommonModule, ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(SUPPLIERS_ROUTERS)]
})
export default class TaxesModule {}