import { Component } from '@angular/core';
import { RouterTransition } from './../../@providers';

@Component({
    selector : 'sells',
    templateUrl : './sells.html',
    animations : [RouterTransition()]
})
export class SellsComponent{}