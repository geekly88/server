import { Component, OnInit, AfterViewInit, EventEmitter } from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GlobalProvider , LabProvider, RouterTransition } from './../../../@providers';
import { Employees } from './../../../@interfaces';
import { HttpRequestService } from './../../../@services';

declare let $:any;
let time = new Date();

@Component({
    selector : 'employees-details',
    templateUrl : './employeesDetails.html',
    providers : [
        GlobalProvider, 
        LabProvider, 
        HttpRequestService,
    ],
    animations : [RouterTransition('Form')],
    host : {'[@RouterTransition]': ''},
    inputs : ['isDynamic'],
    outputs : ['onNewOneAdded']
})
export class EmployeesDetailsComponent implements OnInit,AfterViewInit{
    
    public isDynamic:boolean;
    public onNewOneAdded:any = new EventEmitter();
    private _editable:boolean;
    private submitted:boolean;
    private formObject:FormGroup;
    private item:Employees;
    private errors:any;
    private _page:string = 'employees/';
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

    OnSubmitForm(values:Employees,valid:boolean):void{
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
                    this._lab.__setAlerts__('success','تمت عملية تعديل البيانات بنجاح');
                }else{
                    this.onNewOneAdded.emit({
                        name : 'employees',
                        item : item.data
                    });
                    this._lab.__setAlerts__('success','تمت عملية اضافة البيانات بنجاح');
                    this.__initFormsObject__();
                    this.submitted = false;
                    this.__getNewCode__();
                }
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
            code        : [ 1 , [Validators.required , Validators.pattern(intRegex)]],
            company_name: ['' , Validators.pattern(nameRegex)],
            open_amount : [ 0 , Validators.pattern(priceRegex)],
            paid        : [ 0 , Validators.pattern(priceRegex)],
            total       : [ 0 , Validators.pattern(priceRegex)],
            orders_count: [ 0 , Validators.pattern(intRegex)],
            email       : ['' , Validators.pattern(emailRegex)],
            
            phoneType   : ['phone'],
            
            phone       : ['' , Validators.pattern(phoneRegex)],
            mobile      : ['' , Validators.pattern(phoneRegex)],
            fax         : ['' , Validators.pattern(phoneRegex)],

            active      : [ true ],
            address1    : ['' , Validators.pattern(nameRegex)],
            address2    : ['' , Validators.pattern(nameRegex)],
            city        : ['' , Validators.pattern(nameRegex)],
            country     : ['' , Validators.pattern(nameRegex)],
            state       : ['' , Validators.pattern(nameRegex)],
            postcode    : [   , Validators.pattern(postRegex)],

            age         : [  , Validators.pattern(intRegex) ],
            gender      : ['' , Validators.pattern(nameRegex)],
            is_same_address : [false],
            address12   : ['' , Validators.pattern(nameRegex)],
            address22   : ['' , Validators.pattern(nameRegex)],
            city2       : ['' , Validators.pattern(nameRegex)],
            country2    : ['' , Validators.pattern(nameRegex)],
            state2      : ['' , Validators.pattern(nameRegex)],
            postcode2   : [   , Validators.pattern(postRegex)],

            img         : [''],

            custom_field1:['' , Validators.pattern(nameRegex)],
            custom_field2:['' , Validators.pattern(nameRegex)],
            custom_field3:['' , Validators.pattern(nameRegex)],
            custom_field4:['' , Validators.pattern(nameRegex)],

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
                        this._global.navigatePanel('employees');
                        return;
                    }
                    this.item = item.data;
                    for(let key in this.item){
                        if(this.item[key] !== null && this.item[key] !== undefined && this.formObject.value.hasOwnProperty(key)){
                            this.formObject.controls[key].setValue(this.item[key]);
                        }
                    }
                    this._editable = true;
                    this.formObject.get('code').disable();
                    if(!this.item.phone){
                        if(this.item.mobile){
                            this.formObject.controls['phoneType'].setValue('mobile');
                        }else if(this.item.fax){
                            this.formObject.controls['phoneType'].setValue('fax');
                        }
                    }
                },
                (response) => { 
                    this._lab.__setAlerts__('error' , 'لا يمكن جلب بيانات التعديل المطلوبة ... الرجاء التأكد من سلامة الاتصال');
                    setTimeout(() => {
                        this._global.navigatePanel(this._page);
                    },2000);
                 },
                () => {}
            );
        }else{
            this.__getNewCode__();
        }
    }

    private __getNewCode__():void{
        this._http.get(this._page + 'next').subscribe(
            (item) => {
                if(item.data && item.data.code){
                    this.formObject.controls['code'].setValue(item.data.code);
                }
            },(error) => {
            }
        );
    }

    private __initShortCut__():any{
        this._lab.__setShortCuts__(this);
    }
}