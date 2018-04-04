import { Component } from '@angular/core';
import { RouterTransition } from './../../@providers';

@Component({
    selector : 'history',
    templateUrl : './history.html',
    animations : [RouterTransition()]
})
export class HistoryComponent{}