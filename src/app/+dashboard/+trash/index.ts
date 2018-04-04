import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';

import { TrashDetailsComponent } from './trashDetails';
import { TrashListComponent } from './trashList';

export const TRASH_ROUTERS = [
    { path : '', component : TrashListComponent, pathMatch : 'full' },
    { path : 'details', component : TrashDetailsComponent },
    { path : 'details/:id', component : TrashDetailsComponent }
];

@NgModule({
    declarations : [ ],
    imports : [ CommonModule, ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(TRASH_ROUTERS)]
})
export default class TrashModule {}