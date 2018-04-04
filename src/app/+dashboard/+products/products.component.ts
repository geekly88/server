import { Component } from '@angular/core';
import { RouterTransition } from './../../@providers';

@Component({
    selector : 'products',
    templateUrl : './products.html',
    animations : [RouterTransition()]
})
export class ProductsComponent{}