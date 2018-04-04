import { Component } from '@angular/core';
import { RouterTransition } from './../../@providers';

@Component({
    selector : 'storages',
    templateUrl : './storages.html',
    animations : [RouterTransition()]
})
export class StoragesComponent{}