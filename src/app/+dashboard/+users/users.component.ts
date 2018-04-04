import { Component } from '@angular/core';
import { RouterTransition } from './../../@providers';

@Component({
    selector : 'users',
    templateUrl : './users.html',
    animations : [RouterTransition()]
})
export class UsersComponent{}