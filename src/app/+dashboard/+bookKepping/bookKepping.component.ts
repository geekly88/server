import { Component } from '@angular/core';
import { RouterTransition } from './../../@providers';

@Component({
    selector : 'bookKepping',
    templateUrl : './bookKepping.html',
    animations : [RouterTransition()]
})
export class BookKeppingComponent{}