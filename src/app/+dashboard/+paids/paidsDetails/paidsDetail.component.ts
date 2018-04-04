import { Component, OnInit, OnChanges, AfterViewInit , EventEmitter} from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GlobalProvider , LabProvider, RouterTransition } from './../../../@providers';
import { Paids, Taxes , Banks , Registers , BooksTree , Journals } from './../../../@interfaces';
import { HttpRequestService } from './../../../@services';

@Component({
    selector : 'paids-details',
    templateUrl : './paidsDetails.html',
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
export class PaidsDetailsComponent implements OnInit,AfterViewInit,OnChanges{
    
    private onAction:EventEmitter<{}> = new EventEmitter();
    private isDynamic:boolean;
    private editable:boolean;
    private submitted:boolean;
    private formObject:FormGroup;
    private item:Paids;
    private editItem:Paids;
    private __modal:string;
    private param:string;
    private _page:string = 'paids/';
    private __paymentsArray:Array<any> = [];
    private __taxesArray:Array<Taxes> = [];
    private __banksArray:Array<Banks> = [];
    private __booksTreeArray:Array<BooksTree> = [];
    private __registersArray:Array<Registers> = [];
    private __autoObj:any = {};
    private __moneyObjs:any;
    private __is_paid:boolean = true;
    private __paymentDate:Date;
    private __type_label:string = 'رقم فاتورة الشراء';
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
        this._lab.__prepareDateTimePicker__('datetime' , '#datetime');
    }

    ngOnChanges(props:any):void{
        if(props.editItem && props.editItem.currentValue && ((props.editable && props.editable.currentValue === true) || this.editable)){
            this.item = this.editItem;
            for(let key in this.item){
                if(this.item[key] !== null && this.item[key] !== undefined && this.formObject.value.hasOwnProperty(key)){
                    this.formObject.controls[key].setValue(this.item[key]);
                }
            }
            this.__paymentsArray = Object['assign'](this.item.payments , []);
            this.__paymentDate = this.item.paid_date;
            this.changePaidType(this.item.from);
            this.changeIsPaid(!this.item.is_recive);
        }else if(((props.editable && props.editable.currentValue === false) || !this.editable) 
         || (props.param && props.param.currentValue === null)){
             this.__initFormsObject__();
        }

    }

    ngOnInit():any{
        this.__init__();
    }

    public onSelectItem($event:any):void{
        // if(!$event.target.name) return;
        // if($event.target.value === '__ADDONE__'){
        //     this.onAddSelectItem($event);
        //     return;
        // }
    }

    public onAddSelectItem($event:any):void{
        if(!$event || !$event.target || !$event.target.name) return;
        switch($event.target.name){
            case 'tax':
                this.__modal = 'taxes';
                break;
            case 'payment':
                this.__modal = 'payments';
                break;
        }
        this._lab.__modal('#show-dynamic-model');
    }

    OnSubmitForm(values:Paids,valid:boolean):void{
        this.submitted = true;
        if(false === valid) {
            if(!values.paid_date){
                return this._lab.__setAlerts__('error' , 'الرجاء كتابة تاريخ الدفع');
            }
            this._lab.__setAlerts__('error' , 'الرجاء التأكد من الملاحظات الجانبية لكل حقل و تجنب الاخطاء لاتمام العملية');
            return;   
        }

        if(this.__paymentsArray.length === 0) return;
        if(values['agent']) delete values['agent'];
        values['amount'] = parseFloat(values['amount'].toString());

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
                    this.__paymentsArray = [];
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

    OnPayment():boolean{
        if(this.formObject.value.payment_by === 'REGISTER' && !this.formObject.value.register_id){
            this._lab.__setAlerts__('warn' , 'الرجاء اختيار المسجل أو الكاشير المسؤول عن عملية الدفع');
            return false;
        }
        if(this.formObject.value.payment_by === 'BANK' && !this.formObject.value.bank_id){
            this._lab.__setAlerts__('warn' , 'الرجاء اختيار الحساب البنكى المسؤول عن عملية الدفع');
            return false;
        }

        let __amount:number = parseFloat(this.formObject.value.amount_of_paid);
        if(isNaN(__amount) || __amount <= 0){
            this._lab.__setAlerts__('warn' , 'المبلغ المدفوع يجب أن يكون أكبر من صفر');
            return false;
        }
        
        let __payment:any = {
            by : this.formObject.value.payment_by,
            amount : __amount
        };
        if(this.formObject.value.payment_by === 'BANK') {
            __payment['bank_id'] = parseInt(this.formObject.value.bank_id);
            for(let i:number = 0; i < this.__banksArray.length; i++){
                if(this.__banksArray[i].id !== __payment['bank_id']) continue;
                __payment['bank'] = this.__banksArray[i].name;
                __payment['account_number'] = this.__banksArray[i].number;
                break;
            } 
        }
        if(this.formObject.value.payment_by === 'REGISTER') {
            __payment['register_id'] = parseInt(this.formObject.value.register_id);
            for(let i:number = 0; i < this.__registersArray.length; i++){
                if(this.__registersArray[i].id !== this.formObject.value.register_id) continue;
                __payment['register'] = this.__registersArray[i].name;
                break;
            } 
        }

        this.__paymentsArray.push(__payment)
        this.formObject.controls['payments'].setValue(this.__paymentsArray);
        if(__payment.by === 'REGISTER') this.formObject.controls['is_registered'].setValue(true);
        this.formObject.controls['amount'].setValue(this.formObject.value.amount + __payment.amount);
        this.formObject.controls['amount_of_paid'].setValue(0);

        return true;
    }

    private OnRemovePayment(__index:number):void{
        let __sum:number = 0;
        let __isRegistered:boolean = false;
        let __payments:Array<Object> = [];
        this.__paymentsArray.forEach((payment , index) => {
            if(__index === index) return;
            __payments.push(payment);
            __sum += payment.amount;
            if(payment.by === 'REGISTER') __isRegistered = true;
        });
        this.__paymentsArray = Object['assign'](__payments , []);
        this.formObject.controls['payments'].setValue(this.__paymentsArray);
        this.formObject.controls['amount'].setValue(__sum);
        this.formObject.controls['is_registered'].setValue(__isRegistered);
    }

    public validateControl(name:string , parent:string = null):boolean{
        if(!(this.formObject.value.hasOwnProperty(name))){
            return;
        }
        let __parent:any;
        if(parent)
            __parent = this.formObject.controls[parent];
        else
            __parent = this.formObject;
        return (!__parent.controls[name].valid && (!__parent.controls[name].pristine || this.submitted));
    }

    private __init__():void{
        // this._lab.getCurrentJournal(this , (error) =>{
        //     if(error){
        //         this._lab.__setAlerts__('connfail');
        //         setTimeout(function() {
        //             this._global.navigatePanel('paids');
        //         }, 1000);
        //     }
            this.__initFormsObject__();
            this.__setAutoObject__();
            this.__setMoneyObjs__();
            this.__getRouterParamsData__();
            this.__initShortCut__();
            this.__getArrays__();
        // });
    }

    private __initFormsObject__():void{
        // window['me'] = this;
        let nameRegex:RegExp = this._global.config["nameRegex"];
        let shortNameRegex:RegExp = this._global.config["shortNameRegex"];
        let noteRegex:RegExp = this._global.config["noteRegex"];
        let intRegex:RegExp = this._global.config["intRegex"];
        let priceRegex:RegExp = this._global.config["priceRegex"];
        let floatRegex:RegExp = this._global.config["floatRegex"];
        let alphanumdashed:RegExp = this._global.config["alphanumdashed"];
        this.formObject = this._fb.group({
            number        : [ 1 , [Validators.required , Validators.pattern(intRegex)]],
            // page          : [ this._journal.page , [Validators.required , Validators.pattern(intRegex)]],
            reference     : ['' , Validators.pattern(alphanumdashed)],
            tax           : [ 0 , Validators.pattern(floatRegex)],
            to            : ['' , Validators.pattern(noteRegex)],
            title         : ['' , [ Validators.required , Validators.pattern(noteRegex)]],
            paid_date     : [ new Date() , Validators.required ],
            payment_by    : ['REGISTER'],
            amount        : [ 0 , [ Validators.required , Validators.pattern(priceRegex)]],
            amount_of_paid: [ 0 , [ Validators.required , Validators.pattern(priceRegex)]],
            category      : ['' , Validators.pattern(nameRegex)],
            is_paid       : [ true ],
            is_recive     : [ false ],
            name          : [ '' , Validators.pattern(shortNameRegex)],
            name_id       : [ 0 , Validators.pattern(intRegex)],
            name_code     : [ '' , Validators.pattern(intRegex)],
            agent         : [null],

            register      : ['' , Validators.pattern(nameRegex)],
            register_id   : [ 0 , Validators.pattern(intRegex)],
            payments      : [[]],
            bank          : ['' , Validators.pattern(nameRegex)],
            bank_id       : [0  , Validators.pattern(intRegex)],
            account_number: [ ],
            others        : ['' , Validators.pattern(shortNameRegex)],
            // deb_or_cred   : ['' , Validators.pattern(nameRegex)],
            // deb_or_cred_code: ['' , Validators.nullValidator ],
            // deb_or_cred_id: [0  , Validators.pattern(intRegex)],

            from          : ['PUR'],

            is_registered : [ false ],

            is_purches    : [ true ],
            is_supplier   : [ false ],
            is_other      : [ false ],

            is_sales      : [ true ],
            is_customer   : [ false ],
            is_employee   : [ false ]

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
        

        this._lab.__getBooksTree__(this,'__booksTreeArray',()=>{});
    }

    private __getRouterParamsData__():void{
        this._lab.__setGlobal__(this._global);
        if(!this.isDynamic && this._route.params['value'] && this._route.params['value']['id'] &&
            this._global.config['intRegex'].test(this._route.params['value']['id']) ){
            this.param = this._route.params['value']['id'];
            this._http.get(this._page + this.param).subscribe(
                (item) => {
                    if(item.error !== null) { 
                        this._global.navigatePanel('paids');
                        return;
                    }
                    this.item = item.data;
                    this.formObject.setValue(this.item);
                    this.editable = true;
                
                    this.__paymentsArray = Object['assign'](this.item.payments , []);
                    this.__paymentDate = this.item.paid_date;
                    this.changePaidType(this.item.from);
                    this.changeIsPaid(!this.item.is_recive);
                },
                (response) => { 
                    this._global.navigatePanel('paids');
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
                 //is_sales         'SALE'
    changeCheckBox(chekbox:string , paidType:string):void{
        this.formObject.controls['agent'].setValue(null);
        this.formObject.controls['name'].setValue('');
        this.formObject.controls['name_code'].setValue('');
        this.formObject.controls['name_id'].setValue(0);
        let typesProperty:Array<string> = [
            'is_sales' , 'is_purches' , 'is_customer' , 'is_supplier' , 'is_employee' , 'is_other'
        ];
        typesProperty.forEach((property) => {
            if(property === chekbox) this.formObject.controls[property].setValue(true);
            else this.formObject.controls[property].setValue(false);
        });
        this.changePaidType(paidType);
    }

    changeIsPaid(is_paid:boolean):void{
        let res:boolean;
        let values:any = this.formObject.value;
        this.__is_paid = is_paid;
        this.formObject.controls['is_paid'].setValue(is_paid);
        this.formObject.controls['is_recive'].setValue(!is_paid);
        if(is_paid){
            if(values.is_other) this.changePaidType('OTHER');
            else if(values.is_supplier) this.changePaidType('SUP');
            else if(values.is_employee) this.changePaidType('EMP');
            else this.changePaidType('PUR');
        }
        else{
            if(values.is_other) this.changePaidType('OTHER');
            else if(values.is_customer) this.changePaidType('CUS');
            else if(values.is_employee) this.changePaidType('EMP');
            else this.changePaidType('SALE');
        }
    }

    changePaidType(type:string):void{
        if(!type || type === '') return;
        this.formObject.controls['from'].setValue(type);
        switch (type) {
            case 'SUP':
                this.formObject.controls['is_supplier'].setValue(true);
                this.formObject.controls['is_customer'].setValue(false);
                this.formObject.controls['is_employee'].setValue(false);
                this.formObject.controls['is_purches'].setValue(false);
                this.formObject.controls['is_other'].setValue(false);
                this.formObject.controls['is_sales'].setValue(false);
                this.__type_label = 'اسم المورد';
                break;
            case 'CUS':
                this.formObject.controls['is_supplier'].setValue(false);
                this.formObject.controls['is_customer'].setValue(true);
                this.formObject.controls['is_employee'].setValue(false);
                this.formObject.controls['is_purches'].setValue(false);
                this.formObject.controls['is_sales'].setValue(false);
                this.formObject.controls['is_other'].setValue(false);
                this.__type_label = 'اسم الزبون';
                break;
            case 'EMP':
                this.formObject.controls['is_supplier'].setValue(false);
                this.formObject.controls['is_customer'].setValue(false);
                this.formObject.controls['is_employee'].setValue(true);
                this.formObject.controls['is_purches'].setValue(false);
                this.formObject.controls['is_sales'].setValue(false);
                this.formObject.controls['is_other'].setValue(false);
                this.__type_label = 'اسم الموظف';
                break;
            case 'SALE':
                this.formObject.controls['is_customer'].setValue(false);
                this.formObject.controls['is_supplier'].setValue(false);
                this.formObject.controls['is_purches'].setValue(false);
                this.formObject.controls['is_sales'].setValue(true);
                this.formObject.controls['is_employee'].setValue(false);
                this.formObject.controls['is_other'].setValue(false);
                this.__type_label = 'رقم فاتورة المبيعات';
                break;
            case 'PUR':
                this.formObject.controls['is_customer'].setValue(false);
                this.formObject.controls['is_supplier'].setValue(false);
                this.formObject.controls['is_sales'].setValue(false);
                this.formObject.controls['is_purches'].setValue(true);
                this.formObject.controls['is_other'].setValue(false);
                this.formObject.controls['is_employee'].setValue(false);
                this.__type_label = 'رقم فاتورة الشراء';
                break;
            case 'OTHER':
                this.formObject.controls['is_customer'].setValue(false);
                this.formObject.controls['is_supplier'].setValue(false);
                this.formObject.controls['is_sales'].setValue(false);
                this.formObject.controls['is_purches'].setValue(false);
                this.formObject.controls['is_employee'].setValue(false);
                this.formObject.controls['is_other'].setValue(true);
                this.__type_label = this.__is_paid ? 'الحساب المدين' : 'الحساب الدائن';
                break;
        }
        this.__setAutoObject__();
    }

    autocompletevaluechanged($event):void{
        if($event.item.id && $event.item.id > 0){
            this.formObject.controls['agent'].setValue($event.item);
            this.formObject.controls['name_id'].setValue($event.item.id);
            this.formObject.controls['name_code'].setValue($event.item.code);
            this.formObject.controls['name'].setValue($event.item[this.__autoObj.field[0]]);
        }else{
            this.formObject.controls['agent'].setValue(null);
            this.formObject.controls['name_id'].setValue(0);
            this.formObject.controls['name'].setValue('');
            this.formObject.controls['name_code'].setValue('');
        }
        this.__setMoneyObjs__();
    }

    private __setAutoObject__():void{
        let __url__:string;
        let type:string = this.formObject.value.from;
        if(!type || type === '') return;
        switch (type) {
            case 'SUP':
            case 'CUS':
            case 'EMP':
                __url__ = type=== 'CUS' ? 'customers' : ( type === 'SUP' ? 'suppliers' : 'employees');
                this.__autoObj = {
                    url : __url__ + '/?contains=true&logic=||',
                    template : '#name (#code)',
                    searchFields : ['name' , 'code'],
                    field : ['name' , 'code']
                }   
                break;
        
            case 'SALE':
            case 'PUR':
                __url__ = type === 'SALE' ? 'sells' : 'buys';
                this.__autoObj = {
                    url : __url__ + '/?contains=false',
                    template : 'فاتورة رقم  #number',
                    searchFields : ['number'],
                    field : ['number']
                }
                break;
            case 'OTHER':
                this.__autoObj = {
                    url : null,
                    template : '#name_ar',
                    searchFields : ['name_ar','name'],
                    field : ['name_ar' , 'name'],
                    isLocal : true
                }
                break;
        }
    }

    private __setMoneyObjs__():void{
        let type:string = this.formObject.value.from;
        if(!this.formObject.value.agent || !type || type === ''){
            this.__moneyObjs = {
                total : 0,
                debt : 0,
                paid : 0
            };
            return;
        }
        switch (type) {
            case 'SUP':
            case 'CUS':
            case 'EMP':
                this.__moneyObjs = {
                    total : this.formObject.value.agent.total,
                    paid : this.formObject.value.agent.paid,
                    debt : ((this.formObject.value.agent.total - this.formObject.value.agent.paid) - this.formObject.value.amount)
                };  
                break;
            case 'SALE':
            case 'PUR':
                this.__moneyObjs = {
                    total : this.formObject.value.agent.totals,
                    paid : this.formObject.value.agent.paid,
                    debt : ((this.formObject.value.agent.totals - this.formObject.value.agent.paid) - this.formObject.value.amount)
                };
                break;
        }
    }
}