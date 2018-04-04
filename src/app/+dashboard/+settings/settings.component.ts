import { Component } from '@angular/core';
import { RouterTransition } from './../../@providers';

@Component({
    selector : 'settings',
    templateUrl : './settings.html',
    animations : [RouterTransition()]
})
export class SettingsComponent{}