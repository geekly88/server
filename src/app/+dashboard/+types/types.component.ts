import { Component } from '@angular/core';
import { RouterTransition } from './../../@providers';

@Component({
    selector : 'types',
    templateUrl : './types.html',
    animations : [RouterTransition()]
})
export class TypesComponent{}