import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';

import { TimerDetailsComponent } from './timerDetails';
import { TimerListComponent } from './timerList';

export const TIMER_ROUTERS = [
    { path : '', component : TimerListComponent, pathMatch : 'full' },
    { path : 'details', component : TimerDetailsComponent },
    { path : 'details/:id', component : TimerDetailsComponent }
];

@NgModule({
    declarations : [ ],
    imports : [ CommonModule, ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(TIMER_ROUTERS)]
})
export default class TimerModule {}