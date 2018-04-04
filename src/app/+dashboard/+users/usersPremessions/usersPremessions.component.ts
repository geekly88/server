import { Component, OnInit/*, OnChanges, AfterViewInit*/ } from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AutocompleteComponent } from './../../../@components';
import { GlobalProvider , LabProvider, RouterTransition } from './../../../@providers';
import { Users } from './../../../@interfaces';
import { HttpRequestService } from './../../../@services';

declare let $:any;

@Component({
    selector : 'users-premessions',
    templateUrl : './usersPremessions.html',
    providers : [
        GlobalProvider, 
        LabProvider, 
        HttpRequestService,
    ],
    animations : [RouterTransition('Form')],
    host : {'[@RouterTransition]': ''},
    inputs : ['isDynamic']
})
export class UsersPremessionsComponent implements OnInit/*,OnChanges,AfterViewInit*/{
    

    private isDynamic:boolean;
    private item:Users;
    private errors:any;
    private __obj:Object = { };
    private __premessionsObject:Object = { };
    private __premessionsArray:Array<string> = [];
    private __roles:Array<string> = [ 'admin' , 'manager' , 'user' ];
    private _page:string = 'auth/roles/';
    constructor(
        private _router : Router,
        private _route : ActivatedRoute, 
        private _fb:FormBuilder,
        private _global:GlobalProvider,
        private _http:HttpRequestService,
        private _lab:LabProvider
    ){}

    // ngOnChanges(props:any):void{
    // }

    // ngAfterViewInit() {
    // }

    ngOnInit():any{
        this.__init__();
    }

    OnSubmitForm():void{
        let obj:any;
        let __showMSG:boolean = false;
        for(let page in this.__premessionsObject){
            if(this.__obj['admin'][page]){
                for(let prem in this.__obj['admin'][page]){
                    if(true !== this.__obj['admin'][page][prem]){
                        this.__obj['admin'][page][prem] = true;
                        __showMSG = true;
                    }
                }
            }
        }

        if(__showMSG === true) return this._lab.__setAlerts__('error' , 'لايمكن تغيير صلاحيات المدير ... قد تصبح غير قادر على الوصول لكثير من البيانات');

        this._lab.__setAlerts__();
        this._http.put(this._page, this.__obj).subscribe(
            (item) => 
            {
                // console.log(item);
                if(item.error !== null) { 
                    this._lab.__setErrors__(item.error);
                    return;
                }
                this.item = item.data instanceof Array ? (item.data.length > 0 ? item.data[0] : this.item) : this.item;
                this._global.setResource(this.item , 'roles');
                this._lab.__setAlerts__('success','تمت عملية تعديل الصلاحيات');
            },
            (error) => { 
                this.errors = error 
                this._lab.__setErrors__(error);
            },
            ()=> {
            }
        );
    }

    private onChangePremessions(parent:string , child:string):void{
        // 
    }

    private __init__():void{
        this.__initObjects__();
        this.__getRouterParamsData__();
        this.__initShortCut__();
    }

    private __initObjects__():void{
        this.__premessionsObject = {
            settings : 'تصاريح الاعدادات و تعديلها',
            history : 'تصاريح سجلات الدخول و الخروج',
            dashboard : 'تصاريح الصفحة الرئيسية',
            reports : 'التصاريح الخاصة بصفحة  التقارير', //

            products : 'التصاريح الخاصة بصفحة الأصناف و الخدمات و ملحقاتها', 
            sells: 'التصاريح الخاصة بصفحة المبيعات',

            buys : 'التصاريح الخاصة بصفحة فواتير الشراء', 
            expenses : 'التصاريح الخاصة بصفحة المصاريف',
            paids: 'التصاريح الخاصة بصفحة المدفوعات و القبوضات',
            taxes : 'التصاريح الخاصة بصفحة الضرائب',//
            storages : 'التصاريح الخاصة بصفحة ',//
            banks : 'التصاريح الخاصة بصفحة البنوك',//

            accountants : 'التصاريح الخاصة بالصفحات المحاسبية',//
            

            suppliers : 'التصاريح الخاصة بصفحة الموردين', 
            customers : 'التصاريح الخاصة بصفحة الزبائن', 
            employees: 'التصاريح الخاصة بصفحة الموظفين',

            users : 'التصاريح الخاصة بصفحة المستخدمين',
            accounts : 'التصاريح الخاصة بصفحة الحسابات',

            trash : 'ازالة الأصناف'
        };
    }

    private __getRouterParamsData__():void{
        this._lab.__setGlobal__(this._global);
        this._http.get(this._page).subscribe(
            (item) => {
                if(item.error !== null) { 
                    this._global.navigatePanel('users');
                    return;
                }
                this.item = item.data;
                this.__obj = this.item;
                this._global.setResource(this.item , 'roles');
            },
            (response) => { 
                this._lab.__setAlerts__('connfail');
                setTimeout(() => {
                    this._global.navigatePanel('users');
                } , 2000);
            },
            () => {}
        );
    }

    private __initShortCut__():any{
        this._lab.__setShortCuts__(this);
    }
}