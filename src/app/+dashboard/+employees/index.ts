import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';

import { EmployeesDetailsComponent } from './employeesDetails';
import { EmployeesListComponent } from './employeesList';

export const SUPPLIERS_ROUTERS = [
    { path : '', component : EmployeesListComponent, pathMatch : 'full' },
    { path : 'details', component : EmployeesDetailsComponent },
    { path : 'details/:id', component : EmployeesDetailsComponent }
];

@NgModule({
    declarations : [],
    imports : [ CommonModule, ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(SUPPLIERS_ROUTERS)]
})
export default class EmployeesModule {}