import { Component, EventEmitter , OnInit , AfterViewInit } from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AutocompleteComponent } from './../../../@components';
import { GlobalProvider , LabProvider, RouterTransition } from './../../../@providers';
import { RegistersHistory , Registers , Sells , Users , Expenses , Paids } from './../../../@interfaces';
import { HttpRequestService } from './../../../@services';

declare let $:any;

@Component({
    selector : 'registersHistory-details',
    templateUrl : './registersHistoryDetails.html',
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
export class RegistersHistoryDetailsComponent implements OnInit,AfterViewInit{
    
    public onAction = new EventEmitter();
    public isDynamic:boolean;
    public editable:boolean;
    public param:string;
    public editItem:RegistersHistory;
    private __lastItem:RegistersHistory;
    private __registersList:Registers[] = [];
    private __registerSelected:Registers;
    private submitted:boolean;
    private formObject:FormGroup;
    private errors:any;
    private __obj:any;
    private __showDetails:boolean = true;
    private __hasParam:boolean = false;
    private __notRetrived = false;
    private _page:string = 'registersHistory/';
    private __registerResource:RegistersHistory;

    private alphanumdashed:RegExp;
    private nameRegex:RegExp;
    private noteRegex:RegExp;
    private intRegex:RegExp;
    private floatRegex:RegExp;
    private priceRegex:RegExp;
    private postRegex:RegExp;
    private __in:number = 0;
    private __out:number = 0;

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
        this.__init__();
        this.alphanumdashed = this._global.config["alphanumdashed"];
        this.nameRegex= this._global.config["nameRegex"];
        this.noteRegex= this._global.config["noteRegex"];
        this.intRegex = this._global.config["intRegex"];
        this.floatRegex= this._global.config["floatRegex"];
        this.priceRegex= this._global.config["priceRegex"];
        this.postRegex= this._global.config["postRegex"];
        this.__initFormsObject__();
        this.__getRouterParamsData__();
    }

    onPerpareOpenRegister():void{
        this._lab.__modal('#show-register-modal');
        setTimeout(function() {
            $('#show-register-modal .autofocus').focus();
        }, 500);
    }

    autocompletevaluechanged($event):void{
        if(!$event || !$event.item) return;
        if($event.class === 'employee'){
            this.formObject.controls['employee'].setValue($event.item.name);
            this.formObject.controls['employee_id'].setValue($event.item.id);
        }
    }

    onChangeRegisterSelected():void{
        if(!this.__registerSelected || !this.__registerSelected.id) return;
        let __user:Users = this._global.getToken() as Users;
        __user.register_id = this.__registerSelected.id;
        this._global.setToken({ data : __user } ,null , false);
    }

    onOpenRegister():void{
        if(this.formObject.valid === false || this.formObject.controls['employee_id'].value <= 0){
            if(this.formObject.controls['employee_id'].valid === false || this.formObject.controls['employee_id'].value <= 0)
                this._lab.__setAlerts__('error' , 'الرجاء كتابة اختيار الموظف من القائمة اسفل الحقل');
            else
                this._lab.__setAlerts__('error' , 'الرجاء كتابة المبلغ الافتتاحى للمسجل و الموظف البائع خلف المسجل');
            return;
        }
        if((this.editable && this.editItem)){
            this._lab.__setAlerts__('warn' , 'لايمكن تفعيل المسجل حاليا');
            return;
        }
        
        $('#show-register-modal button.close').click();
        let __value = JSON.parse(JSON.stringify(this.formObject.value)); // Object.assign({} , this.formObject.value);
        this.__initFormsObject__();
        let __closure:number = 1;
        if(this.editItem){
            this.formObject.controls['closure'].setValue((this.editItem.closure + 1));
            __closure = this.editItem.closure + 1;
        }
        if(!this.__registerSelected || !this.__registerSelected.name || !this.__registerSelected.id){
            return this._lab.__setAlerts__('warn' , 'الرجا التأكيد على اختيار المسجل');
        }

        let __counted:number = parseFloat(__value.open_amount);
        if(isNaN(__counted)) __counted = 0;

        this.formObject.controls['open_amount'].setValue(__value.open_amount);
        this.formObject.controls['expected'].setValue(parseFloat(__value.open_amount));
        this.formObject.controls['cash_expected'].setValue(parseFloat(__value.open_amount));
        this.formObject.controls['register'].setValue(this.__registerSelected.name);
        this.formObject.controls['register_id'].setValue(this.__registerSelected.id);
        this.formObject.controls['case'].setValue('open');
        this.formObject.controls['counted'].setValue(__counted);
        this.formObject.controls['openedAt'].setValue(new Date());
        this.formObject.controls['employee'].setValue(__value.employee);
        this.formObject.controls['employee_id'].setValue(__value.employee_id);
        this.formObject.controls['employees'].setValue([{
            name : __value.employee,
            id : __value.employee_id,
            start : new Date(),
            end : null
        }]);

        this._http.post( this._page + '?openregister=true' , this.formObject.value).subscribe(
            (response) => {
                if(response.error || !response.data){
                    this._lab.__setAlerts__('warn' , 'التحضير لتفعيل المسجل لأول مرة');
                    return;
                }
                this.editItem = response.data;
                this.__registerResource = this.editItem;
                this._global.setResource(this.__registerResource , 'registerHistory');
                this.editable = true;
                this.param = this.editItem.id.toString();
                let __token:any = this._global.getToken();
                __token['register'] = this.editItem.register_info;
                this._global.setToken({ data : __token} , null , false);
                this._lab.__setAlerts__('success' , 'تم تفعيل المسجل ... سيتم تحويلك للمبيعات');
                let __self:RegistersHistoryDetailsComponent = this;
                setTimeout(function() {
                    __self._global.navigatePanel('sells/details');
                }, 2000);
            },(error) => {
                this._lab.__setErrors__(error);
            },() => {}
        );
    }

    onCloseRegister():void{
        if((!this.editable || !this.param )) return;
        this.submitted = true;
        if(false === this.formObject.valid) {
            this._lab.__setAlerts__('error' , 'الرجاء التأكد من الملاحظات الجانبية لكل حقل و تجنب الاخطاء لاتمام العملية');
            return;   
        }
        this.errors = null;
        let values = this.formObject.value;
        values['case'] = 'close';
        values['closedAt'] = new Date();
        if(values.employees && values.employees instanceof Array){
            let __employee:Object = values.employees.pop();
            if(__employee && typeof(__employee) === 'object'){
                __employee['end'] = new Date();
                values.employees.push(__employee);
            }
        }
        this.onUpdateValues();
        this._lab.__setAlerts__();
        this._http.put(this._page + this.param + '?setregister=true', values).subscribe(
            (item) => {
                if(item.error !== null) { 
                    this._lab.__setErrors__(item.error);
                    return;
                }
                this.editItem = item.data;
                this.__initFormsObject__();
                this.onAction.emit({
                    action : 'EDIT',
                    item : this.editItem
                });
                this.__clear();
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

    onUpdateValues():void{
        let __value:RegistersHistory = this.formObject.value as RegistersHistory;
        let  cash_counted =  parseFloat(__value.cash_counted.toString());
        let  credit_card_counted =  parseFloat(__value.credit_card_counted.toString()) ;
        let  cheque_counted = parseFloat(__value.cheque_counted.toString());
        if(isNaN(cash_counted)) cash_counted = 0;
        if(isNaN(credit_card_counted)) credit_card_counted = 0;
        if(isNaN(cheque_counted)) cheque_counted = 0;

        let  exp_cash_counted =  parseFloat(__value.cash_expected.toString());
        let  exp_credit_card_counted =  parseFloat(__value.credit_card_expected.toString()) ;
        let  exp_cheque_counted = parseFloat(__value.cheque_expected.toString());
        if(isNaN(exp_cash_counted)) exp_cash_counted = 0;
        if(isNaN(exp_credit_card_counted)) exp_credit_card_counted = 0;
        if(isNaN(exp_cheque_counted)) exp_cheque_counted = 0;

        let __counted:number  = cash_counted + credit_card_counted + cheque_counted;
        let __expected:number = exp_cash_counted + exp_cheque_counted + exp_credit_card_counted;
        this.formObject.controls['counted' ].setValue(__counted );
        this.formObject.controls['expected'].setValue(__expected);
    }

    public validateControl(name:string , parent:string = null):boolean{
        return (!this.formObject.controls[name].valid && (!this.formObject.controls[name].pristine || this.submitted));
    }

    private __init__():void{
        this._lab.__setGlobal__(this._global);
        this.__initShortCut__();
    }

    private __getRegistersList__():void{
        let __user:Users = <Users>this._global.getToken();
        if(!__user.admin && !__user.super && __user.register_id === 0){
            this._lab.__setAlerts__('error' , 'غير مسموح لك بتفعيل المسجل حاليا');
            return this._global.navigatePanel('index');
        }
        this._http.get('registers?limit=100000&page=1&sort=number&sortBy=ASC').subscribe(
            (response) => {
                if(response.error){
                    return this._lab.__setErrors__(response.error);
                }
                if(response.data && response.data.length > 0){
                    this.__registersList = response.data;
                    this.__registersList.forEach((__reg , __index) => {
                        if(__reg.id !== __user.register_id) return;
                            this.__registerSelected = __reg;
                    });
                    if(!this.__registerSelected){
                        if(this.__registersList.length > 0 && (__user.super || __user.admin)){
                            this.__registerSelected = this.__registersList[0];
                        }else{
                            this._lab.__setAlerts__('error' , 'يبدو أن هناك خطأ فى المسجل أو الحساب ... عليك التأكد من قائمة المسجلات');
                            return this._global.navigatePanel('registers');
                        }
                    }
                    this._global.setResource(this.__registerSelected , 'register');
                }
            },(error) => {
                this._lab.__setErrors__(error);
            }
        );
    }

    private __getRouterParamsData__():void{
        this._lab.__setGlobal__(this._global);
        this.__getRegistersList__();
        this.__registerResource = <RegistersHistory>this._global.getResource('registerHistory');
        // if(!this.isDynamic){
        let __url:string;
        if(this._route.params['value'] && this._route.params['value']['id'] &&
        this._global.config['intRegex'].test(this._route.params['value']['id'])){ 
            this.param = this._route.params['value']['id'];
            this.editable = true;
            this.__hasParam = true;
            __url = this._page + this.param;
        }else{
            __url = this._page + '?sortby=id&sort=DESC&page=1&limit=1';
        }
        this._http.get(__url).subscribe(
            (item) => {
                if(item.error || !item.data || item.data.length === 0) { 
                    this.__clear();
                    return;
                }
                this.editItem = this.__hasParam ? <RegistersHistory>item.data : <RegistersHistory>item.data[0];
                for(let key in this.editItem){
                    if(this.editItem[key] !== null && this.editItem[key] !== undefined && this.formObject.value.hasOwnProperty(key)){
                        this.formObject.controls[key].setValue(this.editItem[key]);
                    }
                }
                if(this.editItem.case === 'open'){
                    this.editable = true;
                    this.param = this.editItem.id.toString();
                    this.__refreshExpected();
                }else{
                    this.__initFormsObject__();
                }
            },
            (response) => { 
                this._lab.__setAlerts__('connfail');
                this.__initFormsObject__();
            },
            () => {}
        );
        // }else{
        //     this.__clear();
        // }
    }

    __initFormsObject__():void{
        this.formObject = this._fb.group({
            openedAt           : [ null ],
            closedAt           : [ null ],
            case               : [ 'close' ],
            closure            : [ 1 ],
            counted            : [ 0 , Validators.pattern(this.priceRegex)],
            expected           : [ 0 , Validators.pattern(this.priceRegex)],
            costs              : [ 0 , Validators.pattern(this.priceRegex)],
            prices             : [ 0 , Validators.pattern(this.priceRegex)],
            discounts          : [ 0 , Validators.pattern(this.priceRegex)],
            taxes              : [ 0 , Validators.pattern(this.priceRegex)],
            totals             : [ 0 , Validators.pattern(this.priceRegex)],
            paids              : [ 0 , Validators.pattern(this.priceRegex)],
            expenses           : [ 0 , Validators.pattern(this.priceRegex)],
            register_paid      : [ 0 , Validators.pattern(this.priceRegex)],
            register_recive    : [ 0 , Validators.pattern(this.priceRegex)],
            bank_counted       : [ 0 , [ Validators.required , Validators.pattern(this.priceRegex)]],
            cash_counted       : [ 0 , [ Validators.required , Validators.pattern(this.priceRegex)]],
            cash_expected      : [ 0 , Validators.pattern(this.priceRegex)],
            credit_card_counted: [ 0 , [ Validators.required , Validators.pattern(this.priceRegex)]],
            credit_card_expected: [ 0 , Validators.pattern(this.priceRegex)],
            cheque_counted     : [ 0 , [ Validators.required , Validators.pattern(this.priceRegex)]],
            cheque_expected    : [ 0 , Validators.pattern(this.priceRegex)],
            open_note          : [ '', Validators.pattern(this.noteRegex)], 
            close_note         : [ '', Validators.pattern(this.noteRegex)],
            register           : [ '' ],
            register_id        : [ 0 ],
            open_amount        : [   , [Validators.required , Validators.pattern(this.floatRegex)]],
            employees          : [ [] ],
            employee_id        : [ 0 , [Validators.required , Validators.pattern(this.intRegex) ]],
            employee           : ['' , [Validators.required , Validators.pattern(this.nameRegex)]]
        });
    }

    private __refreshExpected():void{
        if(!this.__registerResource){
            this.__registerResource = this.editItem;
            this._global.setResource(this.__registerResource , 'registerHistory');
        }

        let __URL:string = 'reports/registerexpected/?contains=false&search=register_id-register_closure&register_id=';
        __URL += this.editItem.register_id+'&register_closure=' + this.editItem.closure;
        __URL += '&from=' + this._lab.__toDateAPI__(this.editItem.openedAt);
        __URL += '&to=' + this._lab.__toDateAPI__((this.editItem.closedAt ? this.editItem.closedAt : new Date()));

        this._http.get(__URL).subscribe(
            (response) => {
                if(response.error || !(response.data instanceof Array) || response.data.length !== 3){
                    this.__notRetrived = true;
                    return;
                }
                let __sellsArr:Sells[] = response.data[0] || [];
                let __expensesArr:Expenses[] = response.data[1] || [];
                let __paidsArr:Paids[] = response.data[2] || [];


                let __costs:number= 0, __prices:number = 0,__taxes:number=0,__discounts:number = 0,__totals:number = 0,__paids:number = 0;
                let __cash:number = 0, __credit:number = 0, __cheque:number = 0;
                let __bank:number = 0;
                let __expenses = 0, __register_paid = 0, __register_recive = 0;
                let multi:number = 1;
                __sellsArr.forEach((sell) => {
                    __costs     += sell.costs * multi;
                    __prices    += sell.prices * multi;
                    __taxes     += sell.taxes * multi;
                    __discounts += sell.discounts * multi;
                    __totals    += sell.totals * multi;
                    __paids      += sell.paid * multi;
                    if(!sell.payments || sell.payments.length === 0) return;
                    sell.payments.forEach((pay) => {
                        switch (pay.by) {
                            case 'CASH':
                                __cash += pay.paid * multi;
                                break;
                            case 'CREDIT':
                                __credit += pay.paid * multi;
                                break;
                            case 'CHEQUE':
                                __cheque += pay.paid * multi;
                            case 'BANK':
                                __bank += pay.paid * multi;
                                break;
                        }
                    });
                });

                __expensesArr.forEach((expense) => {
                    __expenses += expense.amount;
                });

                __paidsArr.forEach((paid) => {
                    __register_paid += paid.is_recive ? 0 : paid.amount
                    __register_recive += paid.is_recive ? paid.amount : 0;
                });

                this.formObject.controls['prices'].setValue(__prices);
                this.formObject.controls['discounts'].setValue(__discounts);
                this.formObject.controls['taxes'].setValue(__taxes);
                this.formObject.controls['totals'].setValue(__totals);
                this.formObject.controls['paids'].setValue(__paids);
                this.formObject.controls['expenses'].setValue(__expenses);
                this.formObject.controls['register_paid'].setValue(__register_paid);
                this.formObject.controls['register_recive'].setValue(__register_recive);
                this.formObject.controls['cash_counted'].setValue(0);
                this.formObject.controls['cash_expected'].setValue((__cash + this.formObject.value['open_amount']));
                this.formObject.controls['credit_card_counted'].setValue(__credit);
                this.formObject.controls['credit_card_expected'].setValue(__credit);
                this.formObject.controls['cheque_counted'].setValue(__cheque);
                this.formObject.controls['cheque_expected'].setValue(__cheque);
                this.formObject.controls['bank_counted'].setValue(__bank);
                this.__registerResource = this.formObject.value;
                this.editItem = this.formObject.value;
                // this.__initFormsObject__();
                this.__in = this.editItem.cash_expected + this.editItem.cheque_expected 
                          + this.editItem.credit_card_expected + this.editItem.register_recive;
                this.__out = this.editItem.expenses + this.editItem.register_paid;
                this._global.setResource(this.__registerResource , 'registerHistory');
                this.onUpdateValues();
            },(error) => {
                this._lab.__setErrors__(error);
            },() => {}
        );
    }

    private __clear():void{
        this.__initFormsObject__();
        this.submitted = false;
        this.param = null;
        this.editable = false;
        this.__notRetrived = false;
        this._global.removeResource('registerHistory');
    }

    private __initShortCut__():any{
        this._lab.__setShortCuts__(this , false);
    }
}