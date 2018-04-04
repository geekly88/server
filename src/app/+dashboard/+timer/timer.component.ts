import { Component } from '@angular/core';
import { RouterTransition } from './../../@providers';

@Component({
    selector : 'timer',
    templateUrl : './timer.html',
    animations : [RouterTransition()]
})
export class TimerComponent{}