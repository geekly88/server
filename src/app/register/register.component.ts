import { Component , OnInit , AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { HttpRequestService } from './../@services';
import { GlobalProvider , LabProvider} from './../@providers';
import { Users } from './../@interfaces';

@Component({
    selector :'register',
    templateUrl : './register.html',
    providers : [
        HttpRequestService,
        LabProvider,
        GlobalProvider
        ]
})
export class RegisterComponent implements OnInit{
    
    private formObject: FormGroup;
    private submitted:boolean = false;
    private __firstTime:boolean = false;
    private __DoneInit__:boolean = false;

    constructor(
        private _router : Router,
        private _http: HttpRequestService,
        private _fb: FormBuilder,
        private _global: GlobalProvider,
        private _lab:LabProvider
    ){ }

      ngAfterViewInit():void{
        let height:string = this._lab.getHeight() + 'px';
        this._lab.jQuery('body').css({ 'min-height' : height });
        this._lab.jQuery('input.autofocus').focus();
    }


    ngOnInit():any{
        let __page:string = this._router.routerState.snapshot.url;
        if(__page.indexOf('register/init') > 0){
            this.__initAccount__();
        }
        let emailRegex:RegExp = this._global.config['emailRegex'];
        this._global.clearToken();
        this.formObject = this._fb.group({
            username       : ['' ,  <any>Validators.required],
            password       : ['' , [<any>Validators.required , <any>Validators.minLength(4) , Validators.maxLength(16)]],
            rePassword     : ['' , [<any>Validators.required , <any>Validators.minLength(4) , Validators.maxLength(16)]],
            email          : ['' , [/*<any>Validators.required ,*/<any>Validators.pattern(emailRegex)]],
        });
    }

    OnSubmitForm(model: Users, isValid: boolean):void{
        this.submitted = true;
        if(!isValid){
            this._lab.__setAlerts__('error' , 'الرجاء التأكد من البيانات المرسلة');
            return;
        }
        if(model.password !== model.rePassword){
            this._lab.__setAlerts__('error' , 'كلمتا المرور غير متطابقتان')
            return;
        }
        this._http.post('auth/register',model).subscribe(
            (res:any) => {
                if(res.error === null && res.data.token){
                    this._lab.__setAlerts__('success' , 'سيتم تحويلك الى لوحة التحكم');
                    let roles:Object = res.data.roles;
                    if(roles){
                        this._global.setResource(roles , 'roles');
                        delete res.data.roles;
                    }
                    setTimeout(() => {
                        this._global.setToken(res,['/dashboard'],false);
                        setTimeout(() => {
                            let __values:Object = { 
                                login_at : new Date(),
                                username: res.data.username,
                                role : res.data.role
                            };
                            this._lab.__setLogin__(this._http , __values);
                        } , 1000);
                        this._lab.__setGlobal__(this._global);
                    } , 2000);
                }else{
                    this._lab.__setAlerts__('error' , 'فشل فى عملية الدخول');
                    return;
                }
            },
            (error) => {
                this._lab.__setAlerts__(error);
            }
        );
    }

    public validateControl(name:string , parent:string = null):boolean{
        if(!this.formObject.controls[name]) return;
        let __parent:any;
        if(parent)
            __parent = this.formObject.controls[parent];
        else
            __parent = this.formObject;
        return (!__parent.controls[name].valid && (!__parent.controls[name].pristine || this.submitted));
    }

    __initAccount__():void{
        this.__firstTime = true;
        this._http.get('super/init').subscribe(
            (response) => {

            },(error) => {
                this.__DoneInit__ = false;
            }
        );
    }
}