import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';

import { AccountsDetailsComponent } from './accountsDetails';
import { AccountsListComponent } from './accountsList';

export const ACCOUNTS_ROUTERS = [
    { path : '', component : AccountsListComponent, pathMatch : 'full' },
    { path : 'details', component : AccountsDetailsComponent },
    { path : 'details/:id', component : AccountsDetailsComponent }
];

@NgModule({
    declarations : [],
    imports : [ CommonModule, ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(ACCOUNTS_ROUTERS)]
})
export default class AccountsModule {}