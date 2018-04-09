import { Component } from '@angular/core';
import { RouterTransition } from './../../@providers';

@Component({
    selector : 'sales',
    templateUrl : './sales.html',
    animations : [RouterTransition()]
})
export class SalesComponent{}