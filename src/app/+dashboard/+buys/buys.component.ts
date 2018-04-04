import { Component } from '@angular/core';
import { RouterTransition } from './../../@providers';

@Component({
    selector : 'buys',
    templateUrl : './buys.html',
    animations : [RouterTransition()]
})
export class BuysComponent{}