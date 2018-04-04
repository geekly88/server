import { Component } from '@angular/core';
import { RouterTransition } from './../../@providers';

@Component({
    selector : 'taxes',
    templateUrl : './taxes.html',
    animations : [RouterTransition()]
})
export class TaxesComponent{}