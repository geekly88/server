import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';

import { HistoryListComponent } from './historyList';

export const HISTORY_ROUTERS = [
    { path : '', component : HistoryListComponent, pathMatch : 'full' }
];

@NgModule({
    declarations : [ ],
    imports : [ CommonModule, ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(HISTORY_ROUTERS)]
})
export default class HistoryModule {}