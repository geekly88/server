import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponentsModule } from './../../@components/module';

import { BooksTreeDetailsComponent } from './booksTreeDetails';
import { BooksTreeListComponent } from './booksTreeList';

export const BOOKSTREE_ROUTERS = [
    { path : '', component : BooksTreeListComponent, pathMatch : 'full' },
    { path : 'details', component : BooksTreeDetailsComponent },
    { path : 'details/:id', component : BooksTreeDetailsComponent }
];

@NgModule({
    declarations : [ ],
    imports : [ CommonModule, ReactiveFormsModule, DashboardComponentsModule, FormsModule, RouterModule .forChild(BOOKSTREE_ROUTERS)]
})
export default class BooksTreeModule {}