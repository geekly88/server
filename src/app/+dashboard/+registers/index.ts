import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';

import { RegistersDetailsComponent } from './registersDetails';
import { RegistersListComponent } from './registersList';

export const REGISTER_ROUTERS = [
    { path : '', component : RegistersListComponent, pathMatch : 'full' },
    { path : 'details', component : RegistersDetailsComponent },
    { path : 'details/:id', component : RegistersDetailsComponent }
];

@NgModule({
    declarations : [ ],
    imports : [ CommonModule, ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(REGISTER_ROUTERS)]
})
export default class RegistersModule {}