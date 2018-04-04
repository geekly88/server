import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';

import { GiftsDetailsComponent } from './giftsDetails';
import { GiftsListComponent } from './giftsList';

export const GIFTS_ROUTERS = [
    { path : '', component : GiftsListComponent, pathMatch : 'full' },
    { path : 'details', component : GiftsDetailsComponent },
    { path : 'details/:id', component : GiftsDetailsComponent }
];

@NgModule({
    declarations : [ ],
    imports : [ CommonModule, ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(GIFTS_ROUTERS)]
})
export default class GiftsModule {}