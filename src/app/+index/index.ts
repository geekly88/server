import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';

// async components must be named routes for WebpackAsyncRoute
export const routes = [
    { path : '' , component : HomeComponent},
];

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        HomeComponent,
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
    ]
})
export default class IndexModule {
    static routes = routes;
}
