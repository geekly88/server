import { Component } from '@angular/core';
import { RouterTransition } from './../../@providers';

@Component({
    selector : 'trash',
    templateUrl : './trash.html',
    animations : [RouterTransition()]
})
export class TrashComponent{}