import { Component } from '@angular/core';
import { RouterTransition } from './../../@providers';

@Component({
    selector : 'brands',
    templateUrl : './brands.html',
    animations : [RouterTransition()]
})
export class BrandsComponent{}