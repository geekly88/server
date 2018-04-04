import { Component } from '@angular/core';
import { RouterTransition } from './../../@providers';

@Component({
    selector : 'supplier',
    templateUrl : './supplier.html',
    animations : [RouterTransition()]
})
export class SupplierComponent{}