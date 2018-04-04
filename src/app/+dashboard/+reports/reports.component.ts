import { Component } from '@angular/core';
import { RouterTransition } from './../../@providers';

@Component({
    selector : 'reports',
    templateUrl : './reports.html',
    animations : [RouterTransition()]
})
export class ReportsComponent{}