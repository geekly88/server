import { Component, EventEmitter , OnInit , OnChanges , AfterViewInit } from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AutocompleteComponent } from './../../../@components';
import { GlobalProvider , LabProvider, RouterTransition } from './../../../@providers';
import { Taxes } from './../../../@interfaces';
import { HttpRequestService } from './../../../@services';

declare let $:any;

@Component({
    selector : 'taxes-details',
    templateUrl : './taxesDetails.html',
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
export class TaxesDetailsComponent implements OnInit,AfterViewInit,OnChanges{
    
    public onAction = new EventEmitter();
    public isDynamic:boolean;
    public editable:boolean;
    public param:string;
    public editItem:Taxes;
    private item:Taxes;
    private submitted:boolean;
    private formObject:FormGroup;
    private errors:any;
    private __obj:any;
    private _page:string = 'taxes/';
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
        }else if(((props.editable && props.editable.currentValue === false) || !this.editable) 
         || (props.param && props.param.currentValue === null)){
             this.__initFormsObject__();
        }
    }

    ngOnInit():any{
        
        this.__init__();
        this.__initFormsObject__();
    }

    OnSubmitForm(values:Taxes,valid:boolean):void{
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
                }else{
                    this.onAction.emit({
                        action : 'ADD',
                        item : item.data
                    });
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
        // console.log(name);
        // if(!this.formObject.controls[name])
        //     console.info(name);
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
        let intRegex:RegExp = this._global.config["intRegex"];
        this.formObject = this._fb.group({
            branch_id          : [ this._global.getResource('branches')[0].id, [ Validators.required , Validators.pattern(intRegex)]],
            name               : ['' , [ Validators.required , Validators.pattern(nameRegex)]],
            tax                : ['' , [ Validators.required , Validators.pattern(intRegex)]],
        });
    }

    private __initShortCut__():any{
        this._lab.__setShortCuts__(this);
    }
}