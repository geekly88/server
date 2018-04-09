import { Component, OnInit, AfterViewInit , ViewChild } from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AutocompleteComponent } from './../../../@components';
import { GlobalProvider , LabProvider, RouterTransition } from './../../../@providers';
import { Users , Registers } from './../../../@interfaces';
import { HttpRequestService } from './../../../@services';

declare let $:any;

@Component({
    selector : 'users-details',
    templateUrl : './usersDetails.html',
    providers : [
        GlobalProvider, 
        LabProvider, 
        HttpRequestService,
    ],
    animations : [RouterTransition('Form')],
    host : {'[@RouterTransition]': ''},
    inputs : ['isDynamic']
})
export class UsersDetailsComponent implements OnInit,AfterViewInit{
    

    private isDynamic:boolean;
    private _editable:boolean;
    private submitted:boolean;
    private formObject:FormGroup;
    private item:Users;
    private __registers:Registers[] = [];
    private errors:any;
    private __param:string;
    private _page:string = 'users/';
    constructor(
        private _router : Router,
        private _route : ActivatedRoute, 
        private _fb:FormBuilder,
        private _global:GlobalProvider,
        private _http:HttpRequestService,
        private _lab:LabProvider
    ){}

    ngAfterViewInit() {
        this._lab.__initForm__(this.formObject,this._global);
    }

    ngOnInit():any{
        this.__initFormsObject__();
        this.__init__();
    }

    OnSubmitForm(values:Users,valid:boolean):void{
        this.submitted = true;
        if(false === valid) {
            this._lab.__setAlerts__('error' , 'الرجاء التأكد من الملاحظات الجانبية لكل حقل و تجنب الاخطاء لاتمام العملية');
            return;   
        }
        if(!this._editable){
            if(values.password === '' ){
                this._lab.__setAlerts__('error' , 'يجب كتابة كلمة المرور للمستخدم');
                return;
            }else if(values.password !== values.rePassword){
                this._lab.__setAlerts__('error' , 'كلمتا المرور غير متطابقتان');
                return;
            }
        }
        let obj:any;
        this._lab.__setAlerts__();
        // Make Sure Register Id Is Number And Pass As Number
        values['register_id'] = !Number(values['register_id']) ? 0 : Number(values['register_id']);
        if(true === this._editable){
            obj = this._http.put(this._page + this.__param, values);
        }else{
            obj = this._http.post(this._page, values);
        }
        this._lab.__setAlerts__();
        obj.subscribe(
            (item) => 
            {
                if(item.error !== null) { 
                    this._lab.__setErrors__(item.error);
                    return;
                }
                if(true === this._editable){
                    this.item = item.data;
                    for(let key in this.item){
                        if(this.item[key] !== null && this.item[key] !== undefined && this.formObject.value.hasOwnProperty(key)){
                            this.formObject.controls[key].setValue(this.item[key]);
                        }
                    }
                    let token = this._global.getToken();
                    let settings = token['settings'];
                    let account = token['account'];
                    if(this.item.id === token['id']){
                        item.data['settings'] = settings;
                        item.data['account'] = account;
                        this._global.setToken(item);
                    }
                }else{
                    this.__initFormsObject__();
                    this.submitted = false;
                }
                this._lab.__setAlerts__('success','تمت عملية حفظ البيانات بنجاح');
            },
            (error) => { 
                this._lab.__setErrors__(error);
            },
            ()=> {
            }
        );
    }

    public validateControl(name:string , parent:string = null):boolean{
        // if(!this.formObject.value[name]){
        //     throw new Error(name + ' not found in your form group');
        // }
        let __parent:any;
        if(parent)
            __parent = this.formObject.controls[parent];
        else
            __parent = this.formObject;
        return (!__parent.controls[name].valid && (!__parent.controls[name].pristine || this.submitted));
    }

    
    private __init__():void{
        this.__getRouterParamsData__();
        this.__initShortCut__();
    }

    private __initFormsObject__():void{
        let emailRegex:RegExp = this._global.config["emailRegex"];
        let nameRegex:RegExp = this._global.config["nameRegex"];
        let intRegex:RegExp = this._global.config["intRegex"];
        this.formObject = this._fb.group({
            branch_id          : [ this._global.getResource('branches')[0].id, [ Validators.required , Validators.pattern(intRegex)]],
            username           : [ '', [Validators.required , Validators.pattern(nameRegex)]],
            email              : [ '', Validators.pattern(emailRegex)],
            password           : [ '', [Validators.minLength(4) , Validators.maxLength(16)]],
            rePassword         : [ '', [Validators.minLength(4) , Validators.maxLength(16)]],
            role               : [ 'manager' ],
            register_id        : [ 0 , [Validators.required , Validators.pattern(intRegex)] ],
            admin              : [ true ],
        });
    }

    private __getRegistersList__():void{
        this._http.get('registers?limit=100000&page=1&sort=number&sortBy=ASC').subscribe(
            (response) => {
                if(response.error){
                    return this._lab.__setErrors__(response.error);
                }
                if(response.data && response.data.length > 0){
                    this.__registers = response.data;
                }
            },(error) => {
                this._lab.__setErrors__(error);
            }
        );
    }

    private __getRouterParamsData__():void{
        this._lab.__setGlobal__(this._global);
        this.__getRegistersList__();
        if(!this.isDynamic && this._route.params['value'] && this._route.params['value']['id'] &&
            this._global.config['intRegex'].test(this._route.params['value']['id']) ){
            this.__param = this._route.params['value']['id'];
            this._http.get(this._page + this.__param).subscribe(
                (item) => {
                    if(item.error !== null) { 
                        this._global.navigatePanel('users');
                        return;
                    }
                    this.item = <Users>item.data;
                    for(let key in this.item){
                        if(this.item[key] !== null && this.item[key] !== undefined && this.formObject.value.hasOwnProperty(key)){
                            this.formObject.controls[key].setValue(this.item[key]);
                        }
                    }
                    this._editable = true;
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
    }

    private __initShortCut__():any{
        this._lab.__setShortCuts__(this);
    }
}