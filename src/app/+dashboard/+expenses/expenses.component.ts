import { Component } from '@angular/core';
import { RouterTransition } from './../../@providers';

@Component({
    selector : 'expenses',
    templateUrl : './expenses.html',
    animations : [RouterTransition()]
})
export class ExpensesComponent{}