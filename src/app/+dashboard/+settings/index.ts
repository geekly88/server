import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';
import { SettingsDetailsComponent } from './settingsDetails';

export const SETTINGS_ROUTERS = [
    { path : '', component : SettingsDetailsComponent, pathMatch : 'full' },
];

@NgModule({
    declarations : [],
    imports : [ CommonModule, ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(SETTINGS_ROUTERS)]
})
export default class SettingsModule {}