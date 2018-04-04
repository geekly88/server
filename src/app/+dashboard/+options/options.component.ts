import { Component } from '@angular/core';
import { RouterTransition } from './../../@providers';

@Component({
    selector : 'options',
    templateUrl : './options.html',
    animations : [RouterTransition()]
})
export class OptionsComponent{}