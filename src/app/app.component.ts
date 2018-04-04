/*
 * Angular 2 decorators and services
 */
import { Component, ViewEncapsulation , OnInit } from '@angular/core';
// import { HttpRequestService } from './@services';

declare var $:any;
/*
* App Component
* Top Level Component
*/
@Component({
    selector: 'app',
    encapsulation: ViewEncapsulation.None,
    templateUrl : './app.html'
})
export class AppComponent implements OnInit{
    
    constructor(
        // private _http:HttpRequestService
    ) {
    }
    ngOnInit() {
        // localStorage.removeItem('TokenKey')
        let __height:number = $(document).outerHeight();
        __height = __height - 56;
        $('.dashboardPages').css({'min-height' :__height.toString() + 'px'}); 
    }
}