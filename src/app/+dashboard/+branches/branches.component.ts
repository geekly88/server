import { Component } from '@angular/core';
import { RouterTransition } from './../../@providers';

@Component({
    selector : 'branches',
    templateUrl : './branches.html',
    animations : [RouterTransition()]
})
export class BranchesComponent{}
