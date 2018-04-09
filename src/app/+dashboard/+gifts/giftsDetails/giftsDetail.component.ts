import { Component, OnInit, OnChanges, AfterViewInit , EventEmitter} from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AutocompleteComponent } from './../../../@components';
import { GlobalProvider , LabProvider, RouterTransition } from './../../../@providers';
import { Gifts, Taxes } from './../../../@interfaces';
import { HttpRequestService } from './../../../@services';

@Component({
    selector : 'gifts-details',
    templateUrl : './giftsDetails.html',
    providers : [
        GlobalProvider, 
        LabProvider, 
        HttpRequestService,
    ],
    animations : [RouterTransition('Form')],
    host : {'[@RouterTransition]': ''},
    inputs : ['isDynamic' , 'editable' , 'param' , 'editItem'],
    outputs : ['onAction']
})
export class GiftsDetailsComponent implements OnInit,AfterViewInit,OnChanges{
    

    private onAction:EventEmitter<{}> = new EventEmitter();
    private isDynamic:boolean;
    private editable:boolean;
    private submitted:boolean;
    private formObject:FormGroup;
    private item:Gifts;
    private editItem:Gifts;
    private __modal:string;
    private param:string;
    private _page:string = 'gifts/';
    private __paymentsArray:any = [];
    private __taxesArray:Array<Taxes> = [];
    private __paymentDate:Date;
    private __type__:string = 'cash';
    private __expireDate:Date;

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
        this.__initFormsObject__();
        this.__init__();
    }

    OnSubmitForm(values:Gifts,valid:boolean):void{
        this.submitted = true;
        if(false === valid) {
            if(!values.expire_date){
                return this._lab.__setAlerts__('error' , 'الرجاء كتابة تاريخ انتهاء الصلاحية');
            }
            this._lab.__setAlerts__('error' , 'الرجاء التأكد من الملاحظات الجانبية لكل حقل و تجنب الاخطاء لاتمام العملية');
            return;   
        }

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
                    this._lab.__setAlerts__('success','تمت عملية تعديل البيانات بنجاح');
                }else{
                    this.__initFormsObject__();
                    this.onAction.emit({
                        action : 'ADD',
                        item : item.data
                    });
                }
                this.submitted = false;
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
        let nameRegex:RegExp = this._global.config["nameRegex"];
        let noteRegex:RegExp = this._global.config["noteRegex"];
        let intRegex:RegExp = this._global.config["intRegex"];
        let priceRegex:RegExp = this._global.config["priceRegex"];
        let floatRegex:RegExp = this._global.config["floatRegex"];
        let alphanumdashed:RegExp = this._global.config["alphanumdashed"];
        this.formObject = this._fb.group({
            branch_id     : [ this._global.getResource('branches')[0].id, [ Validators.required , Validators.pattern(intRegex)]],
            name          : ['' , Validators.pattern(nameRegex)],
            coupon        : ['' , Validators.pattern(alphanumdashed)],
            type          : ['' , Validators.pattern(nameRegex)],
            status        : ['' , Validators.pattern(nameRegex)],
            expire_date   : [ new Date() , Validators.required ],
            is_percentage : [ false ],
            amount        : [ 0 , [ Validators.required , Validators.pattern(priceRegex)]],
            limit         : [ 0 , [ Validators.required , Validators.pattern(intRegex)]],
            counter       : [ 0 , [ Validators.required , Validators.pattern(intRegex)]],
            is_active     : [ true ]
        });
        this.formObject.controls['coupon'].setValue(this._global.randomString());
        // this.__checkCupon();
    }

    private __getRouterParamsData__():void{
        this._lab.__setGlobal__(this._global);
        if(!this.isDynamic && this._route.params['value'] && this._route.params['value']['id'] &&
            this._global.config['intRegex'].test(this._route.params['value']['id']) ){
            this.param = this._route.params['value']['id'];
            this._http.get(this._page + this.param).subscribe(
                (item) => {
                    if(item.error !== null) { 
                        this._global.navigatePanel('gifts');
                        return;
                    }
                    this.item = item.data;
                    this.formObject.setValue(this.item);
                    this.editable = true;
                },
                (response) => { 
                    this._global.navigatePanel('gifts');
                },
                () => {}
            );
        }
    }

    private __initShortCut__():any{
        this._lab.__setShortCuts__(this);
    }
}