import { Component } from '@angular/core';
import { RouterTransition } from './../../@providers';

@Component({
    selector : 'accounts',
    templateUrl : './accounts.html',
    animations : [RouterTransition()]
})
export class AccountsComponent{}