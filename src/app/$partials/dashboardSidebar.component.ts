import { Component , OnInit , AfterViewInit} from '@angular/core';
import { GlobalProvider , LabProvider } from './../@providers';
import { HttpRequestService } from './../@services';


@Component({
    selector : 'dashboard-sidebar',
    templateUrl : './dashboardSidebar.html',
    providers : [GlobalProvider]
})
export class DashboardSidebarComponent/* implements OnInit,AfterViewInit*/{
    
    private __show:boolean = false;
    private __shows:string = '';
    private __showsArray:Array<string> = [];
    private __premessions:any = {};
    private __pageType:string = 'NONE';
    constructor(
        private _lab:LabProvider,
        private _global:GlobalProvider,
        private _http:HttpRequestService
    ){};
    // ngAfterViewInit():any{

    // };

    // ngOnInit():void{
        
    // }

    OnLinkClicked(page:string):void{
        this.__shows = page;
        let __self:DashboardSidebarComponent = this;
        if(this.__shows === 'settings' || this.__shows === 'users' || this.__shows === 'index')
            this.OnNavigateClicked();
        else
            this.__show = true;
        setTimeout(function() {
            __self._lab.resizeHeight();
        }, 200);
    }

    IsVisibile(__from :string=''):boolean{
        if(this.__shows === __from){
            return true;
        }
        return false;
    }

    OnNavigateClicked(__page : string = '',__continue:boolean = true):void{
        let __url:string;
        if(__continue){
            __url = this.__shows + __page;
        }else{
            __url = __page;
        }
        if(this._lab.__checkAuthPage('dashboard/' + __url)) {
            this._global.navigatePanel(__url);
        }else{
            this._lab.__notHavingPremmAlert();
        }
        this.OnCloseShadow();
    }
    OnCloseShadow():void{
        this.__show = false;
        this._lab.jQuery('.second-wrapper').css({ display : 'none' });
    }

    onShowSorthcuts():void{
        let __href:string = window.location.href;
        if(__href.indexOf('/details') > 1){
            if(__href.indexOf('/sales/details') > 1 || __href.indexOf('/purchases/details') > 1){
                this.__pageType = 'ORDERS';
            }else{
                this.__pageType = 'FORMS';
            }
        }else{
            let __footer:any = this._lab.jQuery('.dash-footer');
            if(__footer) this.__pageType = 'LIST';
            else this.__pageType = 'NONE';
        }
        this._lab.__modal('#show-shortcuts-model');
    }
}