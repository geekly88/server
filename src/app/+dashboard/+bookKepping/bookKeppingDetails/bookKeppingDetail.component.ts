import { Component, EventEmitter , OnInit , OnChanges , AfterViewInit } from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AutocompleteComponent } from './../../../@components';
import { GlobalProvider , LabProvider, RouterTransition } from './../../../@providers';
import { BookKepping } from './../../../@interfaces';
import { HttpRequestService } from './../../../@services';

declare let $:any;

@Component({
    selector : 'bookKepping-details',
    templateUrl : './bookKeppingDetails.html',
    providers : [
        GlobalProvider, 
        LabProvider, 
        HttpRequestService,
        AutocompleteComponent,
    ],
    animations : [RouterTransition('Form')],
    host : {'[@RouterTransition]': ''},
    inputs : ['isDynamic' , 'editable' , 'param' , 'editItem' ,'addEditData'],
    outputs : ['onAction']
})
export class BookKeppingDetailsComponent implements OnInit,AfterViewInit,OnChanges{
    
    public onAction = new EventEmitter();
    public isDynamic:boolean;
    public editable:boolean;
    public param:string;
    public addEditData:any;
    public editItem:BookKepping;
    private item:BookKepping;
    private submitted:boolean;
    private formObject:FormGroup;
    private errors:any;
    private __date:Date = new Date();
    private _page:string = 'bookKepping/';
    private __booksTreeArray:Array<BookKepping> = [];



    private __creditors__:Array<number> = [];
    private __debitors__:Array<number> = [];

    private creditor_account:string = '';
    private debitor_account:string = '';

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
            this.__prepareCodeArrayName__();
            this.__prepareEditableData__();
        }else if(((props.editable && props.editable.currentValue === false) || !this.editable) 
         || (props.param && props.param.currentValue === null)){
             this.__initFormsObject__();
        }
    }

    ngOnInit():any{
        this.__initFormsObject__();
        this.__init__();
    }

    OnSubmitForm(values:BookKepping,valid:boolean):void{
        this.submitted = true;
        if(false === valid) {
            this._lab.__setAlerts__('error' , 'الرجاء التأكد من الملاحظات الجانبية لكل حقل و تجنب الاخطاء لاتمام العملية');
            return;
        }
        let obj:any;

        values.debitor = this.__debitors__;
        values.creditor = this.__creditors__;
        values.book_date = this.__date;
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
        this.__getBooksTree__();
    }

    private __initFormsObject__():void{
        let nameRegex:RegExp = this._global.config["nameRegex"];
        let intRegex:RegExp = this._global.config["intRegex"];
        let floatRegex:RegExp = this._global.config["floatRegex"];
        let noteRegex:RegExp = this._global.config["noteRegex"];
        this.formObject = this._fb.group({
            branch_id          : [ this._global.getResource('branches')[0].id, [ Validators.required , Validators.pattern(intRegex)]],
            id                 : [0],
            title              : ['' , [ Validators.required , Validators.pattern(nameRegex)]],
            book               : ['' , Validators.pattern(intRegex)],
            book_code          : [ 1 ],
            status             : ['' , Validators.pattern(nameRegex)],
            // root               : ['' , Validators.pattern(nameRegex)],
            // root_code          : [ 0 , Validators.pattern(intRegex)],
            // father             : ['' , Validators.pattern(nameRegex)],
            // father_code        : [ 0 , Validators.pattern(intRegex)],
            // depth              : [ 1 , Validators.pattern(intRegex)],
            debitor            : [ [] ],
            creditor           : [ [] ],
            // description        : [ '', Validators.pattern(noteRegex)],
            creditor_account   : [ [] ],
            creditor_code      : [ '' ],
            debitor_account    : [ [] ],
            debitor_code       : [ '' ],
            page               : [ 1 , Validators.pattern(intRegex)],
            model              : [''],
            model_id           : [ 0 ],
            agent_id           : [ 0 ],
            balance            : [ 0 ],
            is_by_system       : [ false ],

            book_date          : [ new Date() ]
        });

        this.__clearProperties__();
    }

    private __clearProperties__():void{
        this.__debitors__ = [];
        this.__creditors__ = [];
        this.creditor_account = '';
        this.debitor_account  = '';
    }

    private __getBooksTree__():void{
        this._lab.__getBooksTree__(this,'__booksTreeArray',()=>{});
    }

    private __initShortCut__():any{
        this._lab.__setShortCuts__(this);
    }


    private autocompletevaluechanged($event){
        if(!$event || !$event.item) return;
        let __codes:Array<string>;
        if($event.class === 'creditor_account'){
            __codes = this.formObject.value['creditor_code'] || [];
            if(__codes.indexOf($event.item.code) >= 0) return;
            // if(__codes.length >= 1 && this.formObject.value['debitor_account'].length > 1){
            //     this._lab.__setAlerts__('warn' , 'يجب ان يكون حساب واحد دائن لعدة حسابات مدينة أو العكس');
            //     return;
            // }
            __codes.push($event.item.code);
            this.formObject.controls['creditor_code'].setValue(__codes);
        
            
            this.__creditors__.push(0);
            this.formObject.controls['creditor'].setValue(this.__creditors__);
        }
        else if($event.class === 'debitor_account'){
            __codes = this.formObject.value['debitor_code'] || [];
            if(__codes.indexOf($event.item.code) >= 0) return;
            // if(__codes.length >= 1 && this.formObject.value['creditor_account'].length > 1){
            //     this._lab.__setAlerts__('warn' , 'يجب ان يكون حساب واحد مدين لعدة حسابات دائنة أو العكس');
            //     return;
            // }
            __codes.push($event.item.code);
            this.formObject.controls['debitor_code'].setValue(__codes);

            this.__debitors__.push(0);
            this.formObject.controls['debitor'].setValue(this.__debitors__);

        }
        this[$event.class] = ''; // this.creditor_account || this.debitor_account
        if(__codes.length === this.formObject.value[$event.class].length) return;
        __codes = this.formObject.value[$event.class] || [];
        __codes.push($event.item);
        this.formObject.controls[$event.class].setValue(__codes);
        
    }

    private __prepareEditableData__():void{
        this.__creditors__ = this.formObject.value['creditor'];
        this.__debitors__  = this.formObject.value['debitor'];
        
    }

    private __prepareCodeArrayName__():void{
        let __names:Array<any> = [];
        for(let i=0; i < this.formObject.value['creditor_code'].length; i++){
            for(let j=0; j < this.__booksTreeArray.length; j++){
                if(this.formObject.value['creditor_code'][i] === this.__booksTreeArray[j]['code']) {
                    __names.push(this.__booksTreeArray[j]);
                    break;
                }
            }
        }
        this.formObject.controls['creditor_account'].setValue(__names);

        __names = [];
        for(let i=0; i < this.formObject.value['debitor_code'].length; i++){
            for(let j=0; j < this.__booksTreeArray.length; j++){
                if(this.formObject.value['debitor_code'][i] === this.__booksTreeArray[j]['code']) {
                    __names.push(this.__booksTreeArray[j]);
                    break;
                }
            }
        }
        this.formObject.controls['debitor_account'].setValue(__names);
    }

    private onRemoveBookFromList(index:number , src:string):void{
        let __codes:Array<string> = [];
        let __books:Array<string> = [];
        let __debtORcrdt__:string = src === 'creditor' ? '__creditors__' : '__debitors__';
        let __tempBalance__:Array<number> = Object['assign']([] , this[__debtORcrdt__]);
        this[__debtORcrdt__] = [];

        for(let i:number=0; i < __tempBalance__.length; i++ ){
            if(i === index) continue;
            __codes.push(this.formObject.value[src + '_code'][i]);
            __books.push(this.formObject.value[src + '_account'][i]);
            this[__debtORcrdt__].push(__tempBalance__[i]);
        }
        this.formObject.controls[src + '_code'].setValue(__codes);
        this.formObject.controls[src + '_account'].setValue(__books);
        this.formObject.controls[src].setValue(this[__debtORcrdt__]);
    }
}