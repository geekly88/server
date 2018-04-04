import { Component } from '@angular/core';
import { RouterTransition } from './../../@providers';

@Component({
    selector : 'journals',
    templateUrl : './journals.html',
    animations : [RouterTransition()]
})
export class JournalsComponent{}