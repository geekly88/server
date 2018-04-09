import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';

import { BanksDetailsComponent } from './banksDetails';
import { BanksListComponent } from './banksList';

export const PURCHASES_ROUTERS = [
    { path : '', component : BanksListComponent, pathMatch : 'full' },
    { path : 'details', component : BanksDetailsComponent },
    { path : 'details/:id', component : BanksDetailsComponent }
];

@NgModule({
    declarations : [],
    imports : [ CommonModule, ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(PURCHASES_ROUTERS)]
})
export default class BanksModule {}