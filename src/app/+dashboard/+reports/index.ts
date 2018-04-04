import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';
import { ReportsListComponent } from './reportsList';

export const REPORTS_ROUTERS = [
    { path : '', component : ReportsListComponent, pathMatch : 'full' },
];

@NgModule({
    declarations : [],
    imports : [ CommonModule, ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(REPORTS_ROUTERS)]
})
export default class ReportsModule {}