import { Component } from '@angular/core';
import { RouterTransition } from './../../@providers';

@Component({
    selector : 'registers',
    templateUrl : './registers.html',
    animations : [RouterTransition()]
})
export class RegistersComponent{}