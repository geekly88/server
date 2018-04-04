import { Injectable ,  } from '@angular/core';
import { CanActivate, CanActivateChild , Router, NavigationEnd, NavigationStart, ActivatedRoute } from '@angular/router';
import { GlobalProvider } from './';
import { Users } from './../@interfaces';

import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

declare let $:any;

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {

    private intRegex:RegExp = /^\d*\.?\d+$/;
    private subscription:any;
    constructor(private _router:Router){

    }
    canActivate():boolean {
        return this.canReallyActivate();
    }

    canActivateChild():boolean {
        return this.canReallyActivate();
    }

    private canReallyActivate():boolean{
        let token:any = localStorage.getItem('TokenKey');
        let roles:any = localStorage.getItem('roles');
        if(!token || !roles){
            this.__notAuthinticated(true);
            return false;
        }
        try {
            let __user = JSON.parse(token);
            roles = JSON.parse(roles);
            if(this.__activateDashboard(roles , __user)) return true;
            else return true;
        } catch (error) {
            this.__notAuthinticated(true);
            return false;
        }
    }

    private __activateDashboard(roles:Object , __user:Users):any{
        let __self:AuthGuard = this;
        this.subscription = this._router.events
        .subscribe((event) => {
            if(event instanceof NavigationStart){
                let __prev:any = $('.prev-page');
                if(__prev) __prev.attr('data-page',this._router.url);
                $('.modal-backdrop.fade').remove();
            }
            else if(event instanceof NavigationEnd){
                if(this._router.url.indexOf('/login') >= 0) {
                    return this.subscription.unsubscribe();
                }
                let __authRes:boolean = __self.__authDashboard(roles , __user , this._router.url);
                if(!__authRes){
                    __self.__notAuthinticated(__authRes,roles);
                }
            }
        });



        let __authRes:boolean = __self.__authDashboard(roles , __user , this._router.url);
        if(!__authRes){
            __self.__notAuthinticated(__authRes);
        }
    }

    private __notAuthinticated(__res:boolean = false , __roles:any = null):void{
        this._router.navigate(['dashboard/settings']);
    }

    private __authDashboard(roles:Object , __user:Users , url:string):any{
        if(!url) return false;
        let __urlArr:Array<string> = url.split('/');
        let __url:string[] = [];
        __urlArr.forEach((str) => {
            if(str && str !== "") __url.push(str);
        });
        if(__url.length === 0 || __url[0] !== 'dashboard'){
            // this._router.navigate(['login']);
            return true;
        }
        let __role = __user.role;
        if(!__role){
            this._router.navigate(['/login']);
            return false;
        }
        let __roles:any = roles[__role];
        if(!__roles){
            this._router.navigate(['/login']);
            return false;
        }
        if(__user.super) return true;
        let __page:string = !__url[1] ? null : __url[1].toLocaleLowerCase();
        if(!__page) return false;
        switch (__page) {
            case 'timer':
                return true;
            case 'types':
            case 'options':
            case 'tags':
            case 'collections':
            case 'brands':
            case 'gifts':
                return (__roles.hasOwnProperty('products') && true === __roles['products']['all']);
            case 'bookstree':
            case 'bookkepping':
                return (__roles.hasOwnProperty('accountants') && true === __roles['accountants']['all']);
            case 'reports':
            case 'settings':
                return (__roles.hasOwnProperty(__page) && true === __roles[__page]['all']);
            case 'index':
                return (__roles.hasOwnProperty('dashboard') && true === __roles['dashboard']['all']);
            case 'users':
                if(__url.length === 3 && __url[2] === 'roles'){
                    return (__roles.hasOwnProperty('users') && true === __roles['users']['premessions']);
                }
            case 'registers':
            case 'registershistory':
                return (__roles.hasOwnProperty('sells') && true === __roles['sells']['create']);
            default:
                try {
                    if(!(__roles.hasOwnProperty(__page))) return false;
                    if(__url.length === 2){
                        return (__roles.hasOwnProperty(__page) && (__roles[__page]['find'] || __roles[__page]['all']));
                    }else if(__url.length >= 3){
                        if(__url[2] === 'details'){
                            if(__url.length === 4 && this.intRegex.test(__url[3].toString())){
                                return (__roles[__page]['update']);
                            }else{
                                return (__roles[__page]['create']);
                            }
                        }else if(__url[2] === 'show' && (__page === 'sell' || __page === 'buys')){
                            return (__roles.hasOwnProperty(__page) && (true === __roles[__page]['update']));
                        }else if(__url[2] === 'destroy'){
                                return (__roles[__page]['destroy']);
                        }else return false; //false
                    }else return false; //false
                } catch (error) {
                    return false;
                }
        }
    }
}