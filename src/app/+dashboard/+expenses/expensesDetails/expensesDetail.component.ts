import { Component, OnInit, OnChanges, AfterViewInit , EventEmitter} from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GlobalProvider , LabProvider, RouterTransition } from './../../../@providers';
import { Expenses, Taxes , Banks , BooksTree , Registers, Journals } from './../../../@interfaces';
import { HttpRequestService } from './../../../@services';

@Component({
    selector : 'expenses-details',
    templateUrl : './expensesDetails.html',
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
export class ExpensesDetailsComponent implements OnInit,AfterViewInit,OnChanges{
    

    private onAction:EventEmitter<{}> = new EventEmitter();
    private isDynamic:boolean;
    private editable:boolean;
    private submitted:boolean;
    private formObject:FormGroup;
    private item:Expenses;
    private editItem:Expenses;
    private __modal:string;
    private param:string;
    private _page:string = 'expenses/';
    private __taxesArray:Array<Taxes> = [];
    private __paymentDate:Date;
    private __banksArray:Array<Banks> = [];
    private __registersArray:Array<Registers> = [];
    private __booksTreeArray:Array<any> = [];
    // private __paymentsArray:Array<any> = [];
    // private _journal:Journals;
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

            // this.__paymentsArray = this.item.payment_arr;
            this.__paymentDate = this.item.paid_date;
            this.formObject.controls['amount_of_exp'].setValue(this.item.amount);
            this.formObject.controls['payment_way'].setValue(this.item.payment_arr[0]['way']);
            if(this.item.payment_way === 'BANK' && this.item.payment_arr[0].hasOwnProperty('bank_id')){
                for(let i:number = 0; i < this.__banksArray.length; i++){
                    if(this.__banksArray[i].id === this.item.payment_arr[0]['bank_id']){
                        this.formObject.controls['bank'].setValue(this.__banksArray[i].name);
                        this.formObject.controls['bank_id'].setValue(this.__banksArray[i].id);
                    }
                }
            }
        }else if(((props.editable && props.editable.currentValue === false) || !this.editable) 
         || (props.param && props.param.currentValue === null)){
             this.__initFormsObject__();
        }
    }

    ngOnInit():any{
        // this._lab.getCurrentJournal(this , (error) =>{
        //     if(error){
        //         this._lab.__setAlerts__('connfail');
        //         setTimeout(function() {
        //             this._global.navigatePanel('expenses');
        //         }, 1000);
        //     }
            this.__initFormsObject__();
            this.__init__();
        // });
    }

    public onSelectItem($event:any):void{
        if(!$event || !$event.target || !$event.target.name) return;
        // if($event.target.value === '__ADDONE__'){
        //     this.onAddSelectItem($event);
        //     return;
        // }
    }

    public onAddSelectItem($event:any):void{
        // if($event.target.name) return;
        // switch($event.target.name){
        //     case 'tax':
        //         this.__modal = 'taxes';
        //         break;
        //     case 'payment':
        //         this.__modal = 'payments';
        //         break;
        // }
        // this._lab.__modal('#show-dynamic-model');
    }

    OnSubmitForm(values:Expenses,valid:boolean):void{
        this.submitted = true;
        if(false === valid) {
            if(!this.formObject.value.paid_date){
                return this._lab.__setAlerts__('error' , 'الرجاء كتابة تاريخ الدفع');
            }
            this._lab.__setAlerts__('error' , 'الرجاء التأكد من الملاحظات الجانبية لكل حقل و تجنب الاخطاء لاتمام العملية');
            return;   
        }

        if(!this.formObject.value.debitor){
            return this._lab.__setAlerts__('warn' , 'الرجاء كتابة جهة الصرف من قائمة المصروفات المقترحة');
        }
        if(this.formObject.value.payment_way === 'REGISTER' && !this.formObject.value.register_id){
            return this._lab.__setAlerts__('warn' , 'الرجاء اختيار المسجل أو الكاشير المسؤول عن عملية الدفع');
        }
        if(this.formObject.value.payment_way === 'BANK' && !this.formObject.value.bank_id){
            return this._lab.__setAlerts__('warn' , 'الرجاء اختيار الحساب البنكى المسؤول عن عملية الدفع');
        }

        let __amount_of_exp:number = parseFloat(this.formObject.value.amount_of_exp);
        if(isNaN(__amount_of_exp) || __amount_of_exp <= 0){
            return this._lab.__setAlerts__('warn' , 'المبلغ المدفوع يجب أن يكون أكبر من صفر');
        }
        
        let __payment:Array<any> = [{
            way : this.formObject.value.payment_way,
            amount : __amount_of_exp,
        }];

        if(this.formObject.value.payment_way === 'BANK') {
            __payment[0]['bank_id'] = parseInt(this.formObject.value.bank_id);
            for(let i:number = 0; i < this.__banksArray.length; i++){
                if(this.__banksArray[i].id !== this.formObject.value.bank_id) continue;
                __payment[0]['bank'] = this.__banksArray[i].name;
                __payment[0]['bank_account'] = this.__banksArray[i].number;
                break;            
            } 
        }
        if(this.formObject.value.payment_way === 'REGISTER') {
            __payment[0]['register_id'] = parseInt(this.formObject.value.register_id);
            for(let i:number = 0; i < this.__registersArray.length; i++){
                if(this.__registersArray[i].id !== this.formObject.value.register_id) continue;
                __payment[0]['register'] = this.__registersArray[i].name;
                break;            
            } 
        }

        this.formObject.controls['payment_arr'].setValue(__payment);
        this.formObject.controls['amount'].setValue(__amount_of_exp);

        let obj:any;
        if(true === this.editable){
            obj = this._http.put(this._page + this.param, this.formObject.value);
        }else{
            obj = this._http.post(this._page, this.formObject.value);
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
                    // this.__paymentsArray = [];
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
        try {
            if(parent)
                __parent = this.formObject.controls[parent];
            else
                __parent = this.formObject;
            return (!__parent.controls[name].valid && (!__parent.controls[name].pristine || this.submitted));
        } catch (error) {
            return false;
        }
    }

    private __init__():void{
        this.__getRouterParamsData__();
        this.__initShortCut__();
        this.__getArrays__();
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
            number        : [ 1 , [Validators.required , Validators.pattern(intRegex)]],
            // page          : [ this._journal.page , [Validators.required , Validators.pattern(intRegex)]],
            reference     : ['' , Validators.pattern(alphanumdashed)],
            tax           : [ 0 , Validators.pattern(floatRegex)],
            tax_id        : [ 0 , Validators.pattern(intRegex)],
            amount_of_exp : [ 0 , Validators.pattern(priceRegex)],
            amount        : [ 0 , Validators.pattern(priceRegex)],
            title         : ['' , [ Validators.required , Validators.pattern(noteRegex)]],
            paid_date     : [ new Date() , Validators.required ],
            register      : ['' , Validators.pattern(nameRegex)],
            is_registered : [ this._global.getToken()['settings']['is_registered'] ],
            register_id   : [ 0 , Validators.pattern(intRegex)],
            payment_arr   : [[] , Validators.nullValidator],
            payment_way   : ['REGISTER', Validators.nullValidator],
            category      : ['' , Validators.pattern(nameRegex)],
            bank          : ['' , Validators.pattern(nameRegex)],
            bank_id       : [0  , Validators.pattern(intRegex)],
            debitor       : ['' , Validators.pattern(nameRegex)],
            debitor_code  : ['' , Validators.nullValidator ],
            debitor_id    : [0  , Validators.pattern(intRegex)],
        });
        this.__getNextNumber();
    }

    private __getArrays__():void{
        // this._http.get('taxes?page=1&limit=10000000').subscribe(
        //     (res) => {
        //         if(res && res.data && res.data.length >= 0){
        //             this.__taxesArray = res.data;
        //         }
        //     },(error) => {
        //     },() => {}
        // );

        
        let __registersArray:any = this._global.getResource('registers');
        if(__registersArray && __registersArray){
            this.__registersArray = __registersArray;
        }
        this._http.get('registers').subscribe(
            (items) => {
                if(!items.error && items.data){
                    this.__registersArray = items.data;
                    this._global.setResource(this.__registersArray , 'registers');
                }else{
                    this.__registersArray = [];
                }
            },(error) => {
                this.__registersArray = [];
            }
        );


        this._http.get('banks?page=1&limit=10000000').subscribe(
            (res) => {
                if(res && res.data && res.data.length >= 0){
                    this.__banksArray = res.data;
                }
            },(error) => {
            },() => {}
        );
        

        this._lab.__getBooksTree__(this,'__booksTreeArray',() => {
            this.__filterExpenses();
        });
    }

    private __filterExpenses():void{
        let __tempBooksArr:Array<BooksTree> = [];
        this.__booksTreeArray.forEach((item:BooksTree) => {
            if(item.code.indexOf('3') === 0) __tempBooksArr.push(item);
        });
        this.__booksTreeArray = Object['assign'](__tempBooksArr , []);
    }

    private autocompletevaluechanged($event):void{
        if(!$event || $event.class !== 'debitor') return;

        this.formObject.controls['debitor'].setValue($event.item.name_ar);
        this.formObject.controls['debitor_id'].setValue($event.item.id);
        this.formObject.controls['debitor_code'].setValue($event.item.code);
        // this.formObject.controls['debitor'].setValue($event.item.name_ar);
    }

    // private OnPayment():void{
    //     if(!this.formObject.value.debitor){
    //         return this._lab.__setAlerts__('warn' , 'الرجاء كتابة جهة الصرف من قائمة المصروفات المقترحة');
    //     }
    //     if(this.formObject.value.payment_way === 'REGISTER' && !this.formObject.value.register_id){
    //         return this._lab.__setAlerts__('warn' , 'الرجاء اختيار المسجل أو الكاشير المسؤول عن عملية الدفع');
    //     }
    //     if(this.formObject.value.payment_way === 'BANK' && !this.formObject.value.bank_id){
    //         return this._lab.__setAlerts__('warn' , 'الرجاء اختيار الحساب البنكى المسؤول عن عملية الدفع');
    //     }

    //     let __amount_of_exp:number = parseFloat(this.formObject.value.amount_of_exp);
    //     if(isNaN(__amount_of_exp) || __amount_of_exp <= 0){
    //         return this._lab.__setAlerts__('warn' , 'المبلغ المدفوع يجب أن يكون أكبر من صفر');
    //     }
        
    //     let __payment:any = {
    //         way : this.formObject.value.payment_way,
    //         amount : __amount_of_exp,
    //     };
    //     if(this.formObject.value.payment_way === 'BANK') {
    //         __payment['bank_id'] = parseInt(this.formObject.value.bank_id);
    //         for(let i:number = 0; i < this.__banksArray.length; i++){
    //             if(this.__banksArray[i].id !== this.formObject.value.bank_id) continue;
    //             __payment['bank'] = this.__banksArray[i].name;
    //             __payment['bank_account'] = this.__banksArray[i].number;
    //             break;            
    //         } 
    //     }
    //     if(this.formObject.value.payment_way === 'REGISTER') {
    //         __payment['register_id'] = parseInt(this.formObject.value.register_id);
    //         for(let i:number = 0; i < this.__registersArray.length; i++){
    //             if(this.__registersArray[i].id !== this.formObject.value.register_id) continue;
    //             __payment['register'] = this.__registersArray[i].name;
    //             break;            
    //         } 
    //     }
    //     this.__paymentsArray.push(__payment);
    //     let __sum:number =  this.formObject.value.amount + this.formObject.value.amount_of_exp;
    //     this.formObject.controls['amount'].setValue(__sum);
    //     this.formObject.controls['amount_of_exp'].setValue(0);

    //     if(this.formObject.value.payment_way === "REGISTER") this.formObject.controls['is_registered'].setValue(true);
    //     this.formObject.controls['payment_arr'].setValue(this.__paymentsArray);
    // }

    // private OnRemovePayment(__index:number):void{
    //     let __sum:number = 0;
    //     let __isRegistered:boolean = false;
    //     let __payments:Array<Object> = [];
    //     this.__paymentsArray.forEach((payment , index) => {
    //         if(__index === index) return;
    //         __payments.push(payment);
    //         __sum += payment.amount;
    //         if(payment.way === 'REGISTER') __isRegistered = true;
    //     });
    //     this.__paymentsArray = Object['assign'](__payments , []);
    //     this.formObject.controls['payment_arr'].setValue(this.__paymentsArray);
    //     this.formObject.controls['amount'].setValue(__sum);
    //     this.formObject.controls['is_registered'].setValue(__isRegistered);
    // }

    private __getRouterParamsData__():void{
        this._lab.__setGlobal__(this._global);
        if(!this.isDynamic && this._route.params['value'] && this._route.params['value']['id'] &&
            this._global.config['intRegex'].test(this._route.params['value']['id']) ){
            this.param = this._route.params['value']['id'];
            this._http.get(this._page + this.param).subscribe(
                (item) => {
                    if(item.error !== null) { 
                        this._global.navigatePanel('expenses');
                        return;
                    }
                    this.item = item.data;
                    this.formObject.setValue(this.item);
                    this.editable = true;
                    // this.__paymentsArray = item.data.payment_arr;
                    this.__paymentDate = item.data.paid_date;
                },
                (response) => { 
                    this._global.navigatePanel('expenses');
                },
                () => {}
            );
        }else{
            this.__getNextNumber();
        }
    }

    __getNextNumber():void{
        this._http.get(this._page + 'next').subscribe(
            (item) => {
                if(item.data && item.data.number){
                    this.formObject.controls['number'].setValue(item.data.number);
                }
            },(error) => {
            }
        );
    }

    private __initShortCut__():any{
        this._lab.__setShortCuts__(this);
    }
}