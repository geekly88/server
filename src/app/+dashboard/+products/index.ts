import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';

import { ProductsDetailsComponent } from './productsDetails';
import { ProductsListComponent } from './productsList';

export const SUPPLIERS_ROUTERS = [
    { path : '', component : ProductsListComponent, pathMatch : 'full' },
    { path : 'details', component : ProductsDetailsComponent },
    { path : 'details/:id', component : ProductsDetailsComponent }
];

@NgModule({
    declarations : [ ],
    imports : [ CommonModule , ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(SUPPLIERS_ROUTERS)]
})
export default class ProductsModule {}