import { Component } from '@angular/core';
import { RouterTransition } from './../../@providers';

@Component({
    selector : 'banks',
    templateUrl : './banks.html',
    animations : [RouterTransition()]
})
export class BanksComponent{}