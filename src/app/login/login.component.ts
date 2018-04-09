import { Component , OnInit , AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { HttpRequestService } from './../@services';
import { GlobalProvider , LabProvider} from './../@providers';
import { Users } from './../@interfaces';

@Component({
    selector :'login',
    templateUrl : './login.html',
    providers : [
        HttpRequestService,
        LabProvider,
        GlobalProvider
        ]
})

export class LoginComponent implements OnInit{

    private formObject: FormGroup;
    private activateObject: FormGroup;
    private __completeLogin:boolean;
    private __passActivation:boolean = false;
    private __isNotActivated:boolean = true;
    private __isCheckedActivateionYet:boolean = false;
    private __isExpired:boolean = false;
    private _error = false;
    private __intervalHandler:any;
    private __checkIsRegisteredBoolean:boolean;
    private __activationLastStatus:string = '';

    constructor(
        private _router : Router,
        private _http: HttpRequestService,
        private _fb: FormBuilder,
        private _global: GlobalProvider,
        private _lab:LabProvider
    ){
        this._global.clearToken();
        this.formObject = this._fb.group({
            username       : ['' , <any>Validators.required],
            password       : ['' , <any>Validators.required]
        });

        this.activateObject = this._fb.group({
            serialnumber   : ['' , [Validators.required , Validators.pattern(null)]]
        })
    }

    ngAfterViewInit():void{
        let height:string = this._lab.getHeight() + 'px';
        this._lab.jQuery('body').css({ 'min-height' : height });
        this._lab.jQuery('input.autofocus').focus();
    }

    ngOnInit():any{
        this.__checkIsRegistered(this);
        this.__checkActivation();
        let __self:LoginComponent = this;
        setTimeout(function() {
            __self.__intervalHandler = setInterval(__self.__checkIsRegistered(__self) , 5000);
        }, 5000);
    }

    OnSubmitForm(model: Users, isValid: boolean):void{
        if(!this.__isCheckedActivateionYet || !this.__passActivation
        || this.__isExpired === true || !this.__completeLogin){
            return this.__checkActivation(null);
        }
        // else{
        //     if(!this.__passActivation || this.__isExpired === true || !this.__completeLogin) return;
        // }
        if(!isValid){
            return this._lab.__setAlerts__('error' , 'الرجاء كتابة اسم المستخدم و كلمة المرور الصحيحة');
        }
        model['email'] = model.username;
        this._http.post('auth/',model).subscribe(
            (res:any) => {
                if(res.error === null && res.data.token){
                    this._global.setResource(res.data.branches , 'branches');
                    this._global.setResource(res.data.register , 'register');
                    this._global.setResource(res.data.storages , 'storages');
                    this._global.setResource(res.data.roles , 'roles');
                    this._lab.__setGlobal__(this._global);
                    delete res.data.roles;
                    delete res.data.register;
                    delete res.data.branches;
                    delete res.data.storages;
                    // this._lab.__adjustBooksCodes__(res.data.settings);
                    this._global.setToken(res,['dashboard/index'],false);
                    let __self:LoginComponent = this;
                    setTimeout(() => {
                        let __values:Object = {
                            login_at : new Date() ,
                            username: res.data.username,
                            role : res.data.role
                        };
                        __self._lab.__setLogin__(this._http , __values);
                    } , 1000);
                }else{
                    this._lab.__setAlerts__('warn' , 'بيانات الدخول غير مطابقة ... يرجى التأكد من البيانات الصحيحة');
                }
            },
            (error) => {
                if(error && error.status && error.status === 400){
                    this._lab.__setAlerts__('warn' , 'بيانات الدخول غير مطابقة ... يرجى التأكد من البيانات الصحيحة');
                }else{
                    this._lab.__setErrors__(error);
                }
            });
    }

    OnActivateForm(value:any, isValid: boolean):void{
        if(!isValid){
            return this._lab.__setAlerts__('error' , 'الرقم التسلسلى غير صحيح');
        }
        this.__checkActivation(value);
    }

    __checkIsRegistered(__self:LoginComponent):void{
        if(__self.__checkIsRegisteredBoolean) return;
        __self._http.get('super/isregistered').subscribe(
            (item) => {
                if(item){
                    if(item && typeof(item.count) === 'number' && 0 === item.count){
                        __self._lab.__setAlerts__('warn' , 'عليك التسجيل للتمكن الدخول لحساباتك');
                        __self._router.navigate(['/register/init']);
                    }
                    __self.__checkIsRegisteredBoolean = true;
                    clearInterval(__self.__intervalHandler);
                }
            },(error) => {
                __self.__checkIsRegisteredBoolean = false;
                __self._lab.__setErrors__(error);
            }
        )
    }

    __checkActivation(values:any = null):void{
        let __request:any;
        if(values) __request = this._http.post('super/activate' , values);
        else __request = this._http.get('super/activation');
        __request.subscribe(
            (response) => {
                this.__isCheckedActivateionYet = false;
                this.__isNotActivated = true;
                this.__completeLogin = true;
                this.__isExpired = false;
                this.__passActivation = false;
                if(response.data){
                    this.__passActivation = true;
                    this.__isCheckedActivateionYet = true;
                    this.__activationLastStatus = response.data;
                    switch (response.data) {
                        case 'ACTIVATED':
                            this.__isNotActivated = false;
                            this.__isExpired = false;
                            this._lab.__setAlerts__('success' , 'تم التحقق من حالة البرنامج ... يمكنك الدخول الان');
                            break;
                        case 'INITIALIZED':
                            this._lab.__setAlerts__('success' , 'تم اعادة بناء بعض الملفات المحذوفة مسبقا');
                            break;
                        case 'NOTACTIVATED':
                            break;
                        case 'EXPIRED':
                            this.__completeLogin = false;
                            this.__passActivation = false;
                            this.__isExpired = true;
                            this._lab.__setAlerts__('warn' , 'الرجاء تفعيل البرنامج لتتمكن من الدخول مرة أخرى');
                            break;
                        case 'FILEPATHERROR':
                            this._lab.__setAlerts__('error' , 'تم ازالة بعض الملفات من قبل المستخدم');
                        case 'NOTINITIALIZED':
                            this.__passActivation = false;
                            if(this.__checkIsRegistered){
                                this._lab.__setAlerts__('error' , 'يبدو أنه قد نم حذف بعض الملفات من البرنامج ... الرجاء اعادة المحاولة');
                                break;
                            }
                            this._router.navigate(['/register/init']);
                            break;
                        case 'NOTVALIDSERIAL':
                            this.__completeLogin = false;
                            this._lab.__setAlerts__('error' , 'الرقم التسلسلى اللذى ادخلته غير فعال');
                            break;
                        default:
                            this.__passActivation = false;
                            this._lab.__setAlerts__('error' , 'حدث خطأ ما فى عملية متابعة الحساب ... الرجاء اعادة المحاولة');
                            break;
                    }
                }
            },(error) => {
                this._lab.__setErrors__(error);
                this.__passActivation = false;
                this.__completeLogin = false;
                this.__isNotActivated = true;
                this.__isExpired = false;
                this.__isCheckedActivateionYet = false;
            }
        );
    }
}
