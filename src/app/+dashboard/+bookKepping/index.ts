import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';

import { BookKeppingDetailsComponent } from './bookKeppingDetails';
import { BookKeppingListComponent } from './bookKeppingList';

export const BOOKKEPPING_ROUTERS = [
    { path : '', component : BookKeppingListComponent, pathMatch : 'full' },
    { path : 'details', component : BookKeppingDetailsComponent },
    { path : 'details/:id', component : BookKeppingDetailsComponent }
];

@NgModule({
    declarations : [ ],
    imports : [ CommonModule, ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(BOOKKEPPING_ROUTERS)]
})
export default class BookKeppingModule {}