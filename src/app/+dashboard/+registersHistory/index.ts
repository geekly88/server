import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';

import { RegistersHistoryDetailsComponent } from './registersHistoryDetails';
import { RegistersHistoryListComponent } from './registersHistoryList';

export const REGISTERSHISTORY_ROUTERS = [
    { path : '', component : RegistersHistoryListComponent, pathMatch : 'full' },
    { path : 'details', component : RegistersHistoryDetailsComponent },
    { path : 'details/:id', component : RegistersHistoryDetailsComponent }
];

@NgModule({
    declarations : [ ],
    imports : [ CommonModule, ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(REGISTERSHISTORY_ROUTERS)]
})
export default class RegistersHistoryModule {}