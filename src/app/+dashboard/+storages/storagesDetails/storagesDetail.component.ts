import { Component, EventEmitter , OnInit , OnChanges , AfterViewInit } from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AutocompleteComponent } from './../../../@components';
import { GlobalProvider , LabProvider, RouterTransition } from './../../../@providers';
import { Storages } from './../../../@interfaces';
import { HttpRequestService } from './../../../@services';

declare let $:any;

@Component({
    selector : 'storages-details',
    templateUrl : './storagesDetails.html',
    providers : [
        GlobalProvider, 
        LabProvider, 
        HttpRequestService,
        AutocompleteComponent,
    ],
    animations : [RouterTransition('Form')],
    host : {'[@RouterTransition]': ''},
    inputs : ['isDynamic' , 'editable' , 'param' , 'editItem'],
    outputs : ['onAction']
})
export class StoragesDetailsComponent implements OnInit,AfterViewInit,OnChanges{
    
    public onAction = new EventEmitter();
    public isDynamic:boolean;
    public editable:boolean;
    public param:string;
    public editItem:Storages;
    private item:Storages;
    private submitted:boolean;
    private formObject:FormGroup;
    private errors:any;
    private __obj:any;
    private _page:string = 'storages/';
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

    ngOnChanges(props:any):void{
        if(props.editItem && props.editItem.currentValue && ((props.editable && props.editable.currentValue === true) || this.editable)){
            this.item = this.editItem;
            for(let key in this.item){
                if(this.item[key] !== null && this.item[key] !== undefined && this.formObject.value.hasOwnProperty(key)){
                    this.formObject.controls[key].setValue(this.item[key]);
                }
            }
            this.formObject.get('code').disable();
    }else if(((props.editable && props.editable.currentValue === false) || !this.editable) 
         || (props.param && props.param.currentValue === null)){
             this.__initFormsObject__();
        }
    }

    ngOnInit():any{
        this.__initFormsObject__();
        this.__init__();
    }

    OnSubmitForm(values:Storages,valid:boolean):void{
        this.submitted = true;
        if(false === valid) {
            this._lab.__setAlerts__('error' , 'الرجاء التأكد من الملاحظات الجانبية لكل حقل و تجنب الاخطاء لاتمام العملية');
            return;   
        }
        this.errors = null;
        
        let obj:any;
        if(true === this.editable){
            obj = this._http.put(this._page + this.param, values);
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
                let __storages:Storages[] = <Storages[]>this._global.getResource('storages') || [];
                if(true === this.editable){
                    this.item = item.data;
                    for(let key in this.item){
                        if(this.item[key] !== null && this.item[key] !== undefined && this.formObject.value.hasOwnProperty(key)){
                            this.formObject.controls[key].setValue(this.item[key]);
                        }
                    }
                    this.onAction.emit({
                        action : 'EDIT',
                        item : this.item
                    });
                    for(let i:number = 0; i < __storages.length; i++){
                        if(__storages[i].id === this.item.id){
                            __storages[i] = this.item;
                            break;
                        }
                    }
                    if(__storages.length === 0) __storages = [ this.item ];
                    this._global.setResource(__storages , 'storages');
                }else{
                    this.onAction.emit({
                        action : 'ADD',
                        item : item.data
                    });
                    __storages.push(item.data);
                    this._global.setResource(__storages , 'storages');
                    this.__initFormsObject__();
                }
                this.submitted = false;
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

    public validateControl(name:string , parent:string = null):boolean{
        let __parent:any;
        if(parent)
            __parent = this.formObject.controls[parent];
        else
            __parent = this.formObject;
        return (!__parent.controls[name].valid && (!__parent.controls[name].pristine || this.submitted));
    }

    private __init__():void{
        this._lab.__setGlobal__(this._global);
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
            phoneType   : ['phone'],
            phone       : ['' , Validators.pattern(phoneRegex)],
            mobile      : ['' , Validators.pattern(phoneRegex)],
            fax         : ['' , Validators.pattern(phoneRegex)],

            status      : ['' ],
            active      : [ true ],
            address1    : ['' , Validators.pattern(nameRegex)],
            address2    : ['' , Validators.pattern(nameRegex)],
            city        : ['' , Validators.pattern(nameRegex)],
            country     : ['' , Validators.pattern(nameRegex)],
            state       : ['' , Validators.pattern(nameRegex)],
            postcode    : [   , Validators.pattern(postRegex)],

            img         : [''],
            description : ['' , Validators.pattern(noteRegex)]
        });
        this.__getNewCode__();
    }

    private __initShortCut__():any{
        this._lab.__setShortCuts__(this);
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
}