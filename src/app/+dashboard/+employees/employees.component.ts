import { Component } from '@angular/core';
import { RouterTransition } from './../../@providers';

@Component({
    selector : 'employees',
    templateUrl : './employees.html',
    animations : [RouterTransition()]
})
export class EmployeesComponent{}