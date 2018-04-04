import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';

import { ExpensesDetailsComponent } from './expensesDetails';
import { ExpensesListComponent } from './expensesList';

export const BRANDS_ROUTERS = [
    { path : '', component : ExpensesListComponent, pathMatch : 'full' },
    { path : 'details', component : ExpensesDetailsComponent },
    { path : 'details/:id', component : ExpensesDetailsComponent }
];

@NgModule({
    declarations : [ ],
    imports : [ CommonModule, ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(BRANDS_ROUTERS)]
})
export default class ExpensesModule {}