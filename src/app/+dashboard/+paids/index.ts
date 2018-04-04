import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';

import { PaidsDetailsComponent } from './paidsDetails';
import { PaidsListComponent } from './paidsList';

export const BRANDS_ROUTERS = [
    { path : '', component : PaidsListComponent, pathMatch : 'full' },
    { path : 'details', component : PaidsDetailsComponent },
    { path : 'details/:id', component : PaidsDetailsComponent }
];

@NgModule({
    declarations : [ ],
    imports : [ CommonModule, ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(BRANDS_ROUTERS)]
})
export default class PaidsModule {}