import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';

import { BrandsDetailsComponent } from './brandsDetails';
import { BrandsListComponent } from './brandsList';

export const BRANDS_ROUTERS = [
    { path : '', component : BrandsListComponent, pathMatch : 'full' },
    { path : 'details', component : BrandsDetailsComponent },
    { path : 'details/:id', component : BrandsDetailsComponent }
];

@NgModule({
    declarations : [ ],
    imports : [ CommonModule, ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(BRANDS_ROUTERS)]
})
export default class BrandsModule {}