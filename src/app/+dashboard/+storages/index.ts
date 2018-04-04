import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';

import { StoragesDetailsComponent } from './storagesDetails';
import { StoragesListComponent } from './storagesList';

export const STORAGES_ROUTERS = [
    { path : '', component : StoragesListComponent, pathMatch : 'full' },
    { path : 'details', component : StoragesDetailsComponent },
    { path : 'details/:id', component : StoragesDetailsComponent }
];

@NgModule({
    declarations : [ ],
    imports : [ CommonModule, ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(STORAGES_ROUTERS)]
})
export default class StoragesModule {}