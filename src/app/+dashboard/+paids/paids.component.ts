import { Component } from '@angular/core';
import { RouterTransition } from './../../@providers';

@Component({
    selector : 'paids',
    templateUrl : './paids.html',
    animations : [RouterTransition()]
})
export class PaidsComponent{}