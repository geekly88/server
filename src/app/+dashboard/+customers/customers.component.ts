import { Component } from '@angular/core';
import { RouterTransition } from './../../@providers';

@Component({
    selector : 'customers',
    templateUrl : './customers.html',
    animations : [RouterTransition()]
})
export class CustomersComponent{}