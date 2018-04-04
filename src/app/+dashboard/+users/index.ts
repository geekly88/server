import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';

import { UsersDetailsComponent } from './usersDetails';
import { UsersListComponent } from './usersList';
import { UsersPremessionsComponent } from './usersPremessions';

export const BRANDS_ROUTERS = [
    { path : '', component : UsersListComponent, pathMatch : 'full' },
    { path : 'details', component : UsersDetailsComponent },
    { path : 'details/:id', component : UsersDetailsComponent },
    { path : 'roles', component : UsersPremessionsComponent }
];

@NgModule({
    declarations : [ ],
    imports : [ CommonModule, ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(BRANDS_ROUTERS)]
})
export default class UsersModule {}