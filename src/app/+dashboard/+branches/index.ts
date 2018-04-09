import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';

import { BranchesDetailsComponent } from './branchesDetails';
import { BranchesListComponent } from './branchesList';

export const BRANCHES_ROUTERS = [
    { path : '', component : BranchesListComponent, pathMatch : 'full' },
    { path : 'details', component : BranchesDetailsComponent },
    { path : 'details/:id', component : BranchesDetailsComponent }
];

@NgModule({
    declarations : [],
    imports : [ CommonModule, ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(BRANCHES_ROUTERS)]
})
export default class BranchesModule {}
