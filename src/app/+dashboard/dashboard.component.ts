import { Component , OnInit} from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { Router , NavigationStart} from '@angular/router';
import { GlobalProvider , LabProvider } from './../@providers';
import { HttpRequestService } from './../@services';
/*
 * We're loading this component asynchronously
 * We are using some magic with es6-promise-loader that will wrap the module with a Promise
 * see https://github.com/gdi2290/es6-promise-loader for more info
 */

@Component({
    selector: 'dashboard',
    templateUrl : './dashboard.html'
})
export class DashboardComponent implements OnInit {
    private __activationInterval:any;
    constructor(
        private _global:GlobalProvider,
        private _location:PlatformLocation,
        private _lab:LabProvider,
        private _router:Router,
        private _http:HttpRequestService
    ) {
        this._lab.__setGlobal__(this._global);
    }

    ngOnInit() {
        let __self:DashboardComponent = this;
        this.__activationInterval = setInterval(() => {
            __self._http.get('super/activation').subscribe(
                (response) => {
                    if(response.data){
                        switch (response.data) {
                            case 'ACTIVATED':
                                clearInterval(__self.__activationInterval);
                                break;
                            case 'NOTACTIVATED':
                                break;
                            case 'EXPIRED':
                                clearInterval(__self.__activationInterval);
                                __self._lab.__setAlerts__('warn' , 'انتهاء المدة التجريبية الرجاء ادخال بيانات التفعيل');
                                __self._lab.__setLogout__(__self._http);
                                break;
                            case 'FILEPATHERROR':
                            case 'NOTINITIALIZED':
                            case 'INITIALIZED':
                                clearInterval(__self.__activationInterval);
                                __self._lab.__setAlerts__('error' , 'يبدو أنه قد نم حذف بعض الملفات من البرنامج ... الرجاء اعادة تسجيل الدخول');
                                __self._lab.__setLogout__(__self._http);
                                break;
                            default:
                                clearInterval(__self.__activationInterval);
                                __self._lab.__setAlerts__('error' , 'يحدث خطأ ما فى بيانات البرنامج ... الرجاء اعادة تسجيل الدخول');
                                __self._lab.__setLogout__(__self._http);
                                break;
                        }
                    }
                },(error) => {
                }
            );
        }, 1000 * 1800 );//every 30 minutes
        let __url:string = window.self.location.href.replace(this._global.config['basePath'] , '')
        this.__resizeSideBar(__url);
        this._router.events.filter(value =>  (value instanceof NavigationStart )).subscribe
            ((event) => {
                this.__resizeSideBar(event.url);
            },(error) => {
            },() => { }
        );
        this._location.onPopState(() => {
            if(this._global.History.length === 0) return;
            this.__resizeSideBar(this._global.History.pop());
        });
    }

    private __resizeSideBar(url):void{
        if(!url) return;
        let __urlArr:Array<string> = url.split('/');
        let __url:string[] = [];
        __urlArr.forEach((str) => {
            if(str && str !== "") __url.push(str);
        });
        if(__url.length === 0) return;
        this._global.History.push(url);
        this._lab.setUrl(__url);
        this._lab.resize(__url,true);
    }
}
