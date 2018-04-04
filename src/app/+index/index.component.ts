import { Component } from '@angular/core';
import { Router } from '@angular/router';
/*
 * We're loading this component asynchronously
 * We are using some magic with es6-promise-loader that will wrap the module with a Promise
 * see https://github.com/gdi2290/es6-promise-loader for more info
 */

@Component({
    selector: 'index',
    templateUrl : './index.html'
})
export class IndexComponent {
    constructor(
        private _router:Router
    ) {}

    ngOnInit():any {
        this._router.navigate(['login']);
    }

}
