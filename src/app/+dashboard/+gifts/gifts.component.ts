import { Component } from '@angular/core';
import { RouterTransition } from './../../@providers';

@Component({
    selector : 'gifts',
    templateUrl : './gifts.html',
    animations : [RouterTransition()]
})
export class GiftsComponent{}