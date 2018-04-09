import { Component } from '@angular/core';
import { RouterTransition } from './../../@providers';

@Component({
    selector : 'purchases',
    templateUrl : './purchases.html',
    animations : [RouterTransition()]
})
export class PurchasesComponent{}