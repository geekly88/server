import { Component /*, Injector , ChangeDetectorRef */, OnInit , AfterViewInit } from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GlobalProvider , LabProvider, RouterTransition } from './../../../@providers';
import { Accounts } from './../../../@interfaces';
import { HttpRequestService } from './../../../@services';

declare let $:any;
let time = new Date();

@Component({
    selector : 'accounts-details',
    templateUrl : './accountsDetails.html',
    providers : [
        GlobalProvider, 
        LabProvider, 
        HttpRequestService,
    ],
    animations : [RouterTransition('Form')],
    host : {'[@RouterTransition]': ''},
    inputs : ['isDynamic']
})
export class AccountsDetailsComponent implements OnInit,AfterViewInit{
    
    public isDynamic:boolean;
    private _editable:boolean;
    private submitted:boolean;
    private formObject:FormGroup;
    private item:any;
    private errors:any;
    private _page:string = 'accounts/';
    private __param:string;
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

    OnSubmitForm(values:any,valid:boolean):void{
        this.submitted = true;
        if(false === valid) {
            this._lab.__setAlerts__('error' , 'الرجاء التأكد من الملاحظات الجانبية لكل حقل و تجنب الاخطاء لاتمام العملية');
            return;   
        }
        this.errors = null;
        let obj:any;
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

                    let __token:any = this._global.getToken();
                    if(this.item.id === __token['account']['id']){
                        __token['account'] = this.item;
                        this._global.setToken({data : __token} , null , false);
                    }
                }else{
                    this.__initFormsObject__();
                    this.submitted = false;
                }
                this._lab.__setAlerts__('success','تمت عملية حفظ البيانات بنجاح');
            },
            (error) => { 
                this.errors = error 
                this._lab.__setErrors__(error);
            },
            ()=> {
            }
        );
    }

    public validateControl(name:string , error:boolean=false):boolean{
        return (!this.formObject.controls[name].valid && (!this.formObject.controls[name].pristine || this.submitted));
    }

    private autocompletevaluechanged($event){
    }

    private __init__():void{
        this.__getRouterParamsData__();
        this.__initShortCut__();
    }

    private __initFormsObject__():void{
        let nameRegex:RegExp = this._global.config["nameRegex"];
        let noteRegex:RegExp = this._global.config["noteRegex"];
        let emailRegex:RegExp = this._global.config["emailRegex"];
        let socialRegex:RegExp = this._global.config["socialRegex"];
        let intRegex:RegExp = this._global.config["intRegex"];
        let priceRegex:RegExp = this._global.config["priceRegex"];
        let phoneRegex:RegExp = this._global.config["phoneRegex"];
        let postRegex:RegExp = this._global.config["postRegex"];
        let siteRegex:RegExp = this._global.config["siteRegex"];
        this.formObject = this._fb.group({
            name        : ['' , [Validators.required, Validators.pattern(nameRegex)]],
            code        : [ , Validators.pattern(intRegex)],
            email       : ['' , Validators.pattern(emailRegex)],
            phone       : ['' , Validators.pattern(phoneRegex)],
            mobile      : ['' , Validators.pattern(phoneRegex)],

            img         : [''],

            active      : [ true ],
            address1    : ['' , Validators.pattern(nameRegex)],
            address2    : ['' , Validators.pattern(nameRegex)],
            state       : ['' , Validators.pattern(nameRegex)],
            city        : ['' , Validators.pattern(nameRegex)],
            country     : ['' , Validators.pattern(nameRegex)],
            postcode    : ['' , Validators.pattern(postRegex)],


            facebook    : ['' , Validators.pattern(socialRegex)],
            twitter     : ['' , Validators.pattern(socialRegex)],
            linkedin    : ['' , Validators.pattern(socialRegex)],
            website     : ['' , Validators.pattern(siteRegex)],
            createdAt   : [  , Validators.nullValidator ],
            updatedAt   : [  , Validators.nullValidator ],
           
            description : ['' , Validators.pattern(noteRegex)]
        });
    }

    private __getRouterParamsData__():void{
        this._lab.__setGlobal__(this._global);
        if(!this.isDynamic && this._route.params['value'] && this._route.params['value']['id'] &&
            this._global.config['intRegex'].test(this._route.params['value']['id']) ){
            this.__param = this._route.params['value']['id'];
            this._http.get(this._page + this.__param).subscribe(
                (item) => {
                    if(item.error !== null) { 
                        this._router.navigate([this._global.config['dashboard'] + '/accounts']);
                        return;
                    }
                    this.item = item.data;
                    this._lab.__setTopLink__({href:this._page,text:' / الحسابات'},
                    {href:this._page + 'details/' + this._route.params['value']['id'] , text : ' / تعديل الحساب ' + this.item.name});
                    for(let key in this.item){
                        if(this.item[key] !== null && this.item[key] !== undefined && this.formObject.value.hasOwnProperty(key)){
                            this.formObject.controls[key].setValue(this.item[key]);
                        }
                    }
                    this._editable = true;
                },
                (response) => { 
                    this._global.navigatePanel(this._page);
                },
                () => {}
            );
        }else{
            this._lab.__setTopLink__({href:this._page,text:' / الحسابات'},
            { href : this._page + 'details' , text : ' / اضافة حساب جديد'});
        }
    }

    private __initShortCut__():any{
        this._lab.__setShortCuts__(this);
    }
}