import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';

import { OptionsDetailsComponent } from './optionsDetails';
import { OptionsListComponent } from './optionsList';

export const SUPPLIERS_ROUTERS = [
    { path : '', component : OptionsListComponent, pathMatch : 'full' },
    { path : 'details', component : OptionsDetailsComponent },
    { path : 'details/:id', component : OptionsDetailsComponent }
];

@NgModule({
    declarations : [],
    imports : [ CommonModule, ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(SUPPLIERS_ROUTERS)]
})
export default class OptionsModule {}