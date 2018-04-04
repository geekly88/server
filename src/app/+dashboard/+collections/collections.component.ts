import { Component } from '@angular/core';
import { RouterTransition } from './../../@providers';

@Component({
    selector : 'collections',
    templateUrl : './collections.html',
    animations : [RouterTransition()]
})
export class CollectionsComponent{}