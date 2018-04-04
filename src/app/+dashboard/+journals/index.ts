import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';

import { JournalsDetailsComponent } from './journalsDetails';
import { JournalsListComponent } from './journalsList';

export const JOURNALS_ROUTERS = [
    { path : '', component : JournalsListComponent, pathMatch : 'full' },
    { path : 'details', component : JournalsDetailsComponent },
    { path : 'details/:id', component : JournalsDetailsComponent }
];

@NgModule({
    declarations : [ ],
    imports : [ CommonModule, ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(JOURNALS_ROUTERS)]
})
export default class JournalsModule {}