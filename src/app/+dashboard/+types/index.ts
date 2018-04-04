import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';

import { TypesDetailsComponent } from './typesDetails';
import { TypesListComponent } from './typesList';

export const SUPPLIERS_ROUTERS = [
    { path : '', component : TypesListComponent, pathMatch : 'full' },
    { path : 'details', component : TypesDetailsComponent },
    { path : 'details/:id', component : TypesDetailsComponent }
];

@NgModule({
    declarations : [],
    imports : [ CommonModule, ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(SUPPLIERS_ROUTERS)]
})
export default class TypesModule {}