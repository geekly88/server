import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';

import { CollectionsDetailsComponent } from './collectionsDetails';
import { CollectionsListComponent } from './collectionsList';

export const COLLECTIONS_ROUTERS = [
    { path : '', component : CollectionsListComponent, pathMatch : 'full' },
    { path : 'details', component : CollectionsDetailsComponent },
    { path : 'details/:id', component : CollectionsDetailsComponent }
];

@NgModule({
    declarations : [ ],
    imports : [ CommonModule, ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(COLLECTIONS_ROUTERS)]
})
export default class CollectionsModule {}