import { Component , OnInit , OnChanges , AfterViewInit } from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GlobalProvider , LabProvider, RouterTransition } from './../../../@providers';
import { Sells, Customers, Types,Employees, Gifts , Orders, Products, Brands , Collections, Journals, Banks , RegistersHistory } from './../../../@interfaces';
import { HttpRequestService } from './../../../@services';

declare let $:any;

@Component({
    selector : 'sells-details',
    templateUrl : './sellsDetails.html',
    providers : [
        GlobalProvider, 
        LabProvider, 
        HttpRequestService,
    ],
    animations : [RouterTransition('Form')],
    host : {'[@RouterTransition]': ''},
})
export class SellsDetailsComponent implements OnInit,AfterViewInit{
    
    private __printSell__:boolean = false;
    private __showSellData:any = {};
    private __param:string;
    private __orderNumber:number = 1;
    private __type__:string = 'completed';
    private _editable:boolean = false;
    private submitted:boolean = false;
    private formObject:FormGroup;
    private searchForm:FormGroup;
    private __obj:Object;
    public __search:string;
    public __textArea:string;
    private _lastSell:Sells;
    private _variatyProduct:Products;
    private _customer:Customers = null;
    private _employee:Employees = null;
    private _variatiesArr:Array<Object>;
    private _selectedVariaty:Array<string> = [];
    private _page:string = 'sells/';
    private _modal:string = 'sells';
    private __sellDate:Date = new Date();
    private __paidDate:Date = new Date();
    private __hideEmployees:boolean = true;
    private shipping_by_company:boolean = true;
    private shipping_amount:number = 0;
    // private __showShippingData:boolean = false;
    private __showCustomerData:boolean = true;
    private __payAmount:any = 0;
    private __discountAmount:any = 0;
    private __discountType:string = 'AMOUNT';
    private __proDetails:Products = null;
    private __registerOpen:boolean = true;
    private __register:RegistersHistory;

    private __toggleSearch__ = '';
    private __showSearch:boolean = true;
    private __showCustomer:boolean = true;
    private __hasParkNote:boolean = false;
    private __showBrands:boolean= false;
    private __brands:Array<Brands> = [];
    private __showTags:boolean = false;
    private __tagsSearchDone:boolean = false;
    private __tags:Array<Object> = [];
    private __showCollections:boolean = true;
    private __collections:Array<Collections> = []; 
    private __showProducts:boolean = true;
    private __products:Array<Products> = []; 
    private __banks:Array<Banks> = [];
    private __tagsPage:number = 1;
    private __brandsPage:number = 1;
    private __collectionsPage:number = 1;
    private __productsPage:number = 1;
    private __brandsPages:number = 0;
    private __tagsPages:number = 0;
    private __collectionsPages:number = 0;
    private __productsPages:number = 0;
    private __tagName:string = '';
    private __brandName:string = '';
    private __collectionName:string = '';
    private __paid_arr_backup:Array<Object> = [];

    private __pagesLimit:number = 20;

    private __loopsArray:Array<number> = [
        0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19
    ];

    private alphanumdashed:RegExp;
    private nameRegex:RegExp;
    private noteRegex:RegExp;
    private intRegex:RegExp;
    private floatRegex:RegExp;
    private priceRegex:RegExp;
    private postRegex:RegExp;

    private __customerPointsToUse:any = 0;
    private __customerPointsAvailable:any = 0;


    private __orders:FormGroup[] = [];
    private __newSellNumber:number = -1;
    private __parkSells:Sells[] = [];
    private __foundParkSells__:string = 'NOACTION';
    private __units:Object = {};
    private __units_main_id:Object = {};
    private __units_count:number;
    private __showSide:string = 'ORDER';
    private __isParkEdit:boolean = false;
    private __stopQtyAlerts:Object = {};
    private __stopExpAlerts:Object = {};

    private __isSell__:boolean = false;
    private __chosenBankID:number;
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
        let __sellType__:string = this._global.getToken()['settings']['sell_type'];
        if(__sellType__ === 'invoice' || __sellType__ === 'receipt'){
            this.__setSellType__((__sellType__ === 'receipt'));
        }
        this._lab.prepareDiscountPopover();
        this._lab.__setOrdersShortCuts__(this,"Sell");
    }

    ngOnInit():any{
        this.__init__();
        this.searchForm = this._fb.group({
            search             : ['' , Validators.pattern(null)],
        });
        this.__getUnits__();
    }

    onSideBarClick():void{
        this._lab.onSideBarclicked();
    }

    public autocompletevaluechanged($event):void{
        switch($event.class){
            case 'search':
                if(!$event.item) return;
                this.addProductToOrders(<Products>$event.item);
                break;
            case 'customer':
                if(!$event.item) {
                    this.formObject.controls['loyalty'].setValue({});
                    this.__customerPointsToUse = 0;
                    this.__countAvailablePointsToCustomer__();
                    return this._customer = null;
                }
                this._customer = $event.item;
                this.formObject.controls['customer'].setValue($event.item.name);
                this.formObject.controls['customer_code'].setValue($event.item.code);
                this.formObject.controls['customer_id'].setValue($event.item.id);
                this.__countAvailablePointsToCustomer__();
                break;
            case 'employee':
                if(!$event.item) return this._employee = null;
                this._employee = $event.item;
                this.formObject.controls['employee'].setValue($event.item.name);
                this.formObject.controls['employee_id'].setValue($event.item.id);
                if(this.__register && this.__registerOpen){
                    if(this.__register.employees && this.__register.employees instanceof Array){
                        let __employee:Object = this.__register.employees.pop();
                        if(__employee && typeof(__employee) === 'object'){
                            __employee['end'] = new Date();
                            this.__register.employees.push(__employee);
                        }else{
                            this.__register.employees.push({
                                id : this.formObject.value.employee_id,
                                name : this.formObject.value.employee,
                                start : new Date()
                            });
                        }
                    }else{
                        this.__register.employees = [{
                            id : this.formObject.value.employee_id,
                            name : this.formObject.value.employee,
                            start : new Date()
                        }];
                    }
                }
                break;
            case 'showSell':
                this.__showSide = 'ORDER';
                if(this._editable)  return;
                this.__clearProperties__();
                this.__createNewDetails__();
        }
    }

    OnToggleSearchType(type:string = 'PRODUCTS',__clear:boolean = true):void{
        this.__toggleSearch__ = type;
        switch(this.__toggleSearch__){
            case 'COLLECTIONS':
                this.__showTags = false;
                this.__showCollections = true;
                this.__showProducts = false;
                this.__showBrands = false;
                this.__retriveProductsTAGSBrandsAndCollections__('COLLECTIONS');
                break;
            case 'TAGS':
                this.__showTags = true;
                this.__showCollections = false;
                this.__showProducts = false;
                this.__showBrands = false;
                this.__retriveProductsTAGSBrandsAndCollections__('TAGS');
                break;
            case 'PRODUCTS':
                this.__showTags = false;
                this.__showCollections = false;
                this.__showProducts = true;
                this.__showBrands = false;
                if(__clear){
                    this.__brandName = '';
                    this.__collectionName = '';
                    this.__tagName = '';
                }
                this.__retriveProductsTAGSBrandsAndCollections__('PRODUCTS')
                break;
            case 'BRANDS':
            case '':
                this.__showTags = false;
                this.__showCollections = false;
                this.__showProducts = false;
                this.__showBrands = true;
                this.__retriveProductsTAGSBrandsAndCollections__('BRANDS');
                break;
        }
    }

    nextPage():void{
        switch(this.__toggleSearch__){
            case 'BRANDS':
                if(this.__brandsPage === this.__brandsPages) break;
                this.__brandsPage++;
                this.__retriveProductsTAGSBrandsAndCollections__('BRANDS');
                break;
            case 'TAGS':
                if(this.__tagsPage === this.__tagsPages) break;
                this.__tagsPage++;
                this.__retriveProductsTAGSBrandsAndCollections__('TAGS');
                break;
            case 'COLLECTIONS':
                if(this.__collectionsPage === this.__collectionsPages) break;
                this.__collectionsPage++;
                this.__retriveProductsTAGSBrandsAndCollections__('COLLECTIONS');
                break;
            case 'PRODUCTS':
                if(this.__productsPage === this.__productsPages) break;
                this.__productsPage++;
                this.__retriveProductsTAGSBrandsAndCollections__('PRODUCTS');
                break;
        }
    }

    prevPage():void{
        switch(this.__toggleSearch__){
            case 'TAGS':
                if(this.__tagsPage === 1) break;
                this.__tagsPage--;
                this.__retriveProductsTAGSBrandsAndCollections__('TAGS');
                break;
            case 'BRANDS':
                if(this.__brandsPage === 1) break;
                this.__brandsPage--;
                this.__retriveProductsTAGSBrandsAndCollections__('BRANDS');
                break;
            case 'COLLECTIONS':
                if(this.__collectionsPage === 1) break;
                this.__collectionsPage--;
                this.__retriveProductsTAGSBrandsAndCollections__('COLLECTIONS');
                break;
            case 'PRODUCTS':
                if(this.__productsPage === 1) break;
                this.__productsPage--;
                this.__retriveProductsTAGSBrandsAndCollections__('PRODUCTS');
                break;
        }
    }

    onOpenRegistry():void{
        this._global.navigatePanel('registersHistory/details');
    }

    OnAddCustomer():void{
        this.__showModalDetails__('customers')
    }
    
    OnCustomersAdded($event:any):void{
        if($event.item) this._customer = $event.item;
    }

    OnRemoveCustomer():void{
        if(!this.__continues__()) return;
        this._customer = null;
        // this.formObject.controls['loyalty'].setValue({gifted : 0 , spent : 0});
        this.__customerPointsToUse = 0;
        this.__countSaleEarnedLoyalty();
        this.__countAvailablePointsToCustomer__();
    }

    OnAddEmployee():void{
        this.__showModalDetails__('employees')
    }
    
    OnEmployeesAdded($event:any):void{
        if($event.item) this._employee = $event.item;
    }

    OnRemoveEmployee():void{
        if(!this.__continues__()) return;
        this._employee = null;
    }

    addProductToOrders(__product:Products = null):void{
        if(!this.__continues__()) return;
        if(__product.is_variaty && __product.is_main && __product.variaty_count > 0){
            this._variatyProduct = __product;
            this._variatiesArr = [];
            let obj = {}
            if(__product.option_one && __product.option_one_value){
                obj = {
                    focus : true,
                    name : __product.option_one,
                    arr  : __product.option_one_value.split(',') 
                };
                this._variatiesArr.push(obj);
            }
            if(__product.option_one !== '' && __product.option_two_value !== ''){
                obj = {
                    focus : false,
                    name : __product.option_two,
                    arr  : __product.option_two_value.split(',') 
                };
                this._variatiesArr.push(obj);
            }
            if(__product.option_three !== '' && __product.option_three_value !== ''){
                obj = {
                    focus : false,
                    name : __product.option_three,
                    arr  : __product.option_three_value.split(',') 
                };
                this._variatiesArr.push(obj);
            }
        
            this._selectedVariaty = [];
            setTimeout(() => {
                this._lab.__modal('#show-variaty-modal');
            },200);
            // this._lab.__modal('#show-variaty-modal');
        }else{
            this.__beepAddingProduct();
            let __index:number = this.__tryAppendProduct(__product);
            if(__index > -1) {
                this.__refreshOrderPrices(this.__orders[__index - 1]);
            }
        }
    };

    __beepAddingProduct():void{
        if(this._global.getToken()['settings']['is_beep'])
            this._lab.__beepAddingProduct__();
    }

    __tryAppendProduct(__product:Products):number{
        let __index:number = -1;
        let __returnIndex:boolean = true;
        let __holdQty:number = 1;
        let __match:boolean = false;
        let __qty:number = 1;
        let __multiplier:number = 1;
        this._lab.jQuery('input.form-control.order-search.autofocus').focus();
        for(let index = 0; index < this.__orders.length ; index++){
            if(this.__orders[index].controls['product_id'].value !== __product.id) continue;
            __holdQty += this.__orders[index].controls['quantity'].value;
            if((!this.__orders[index].value['variaty']) || (this.__orders[index].value['variaty'] && 
            this.__orders[index].value['variaty'].join(',') === this._selectedVariaty.join(','))){
                __match = true;
                __qty += this.__orders[index].controls['quantity'].value;
                __index = index;
                __multiplier = this.__orders[__index].value.multiplier;
                break;
            }
        }
        if(__product.is_product && __product.is_trackable && (__multiplier * __holdQty) > __product.stock){
            if(this._global.getToken()['settings']['is_ask_qty'] && !this.__stopQtyAlerts[__product.id.toString()]){
                try {
                    if(!confirm('الكمية اللتى طلبتها أكبر من الكمية المتوفرة\nهل تريد الاستمرار فى اضافة الكمية')){
                        this._lab.__setAlerts__('warn' , 'يرجى تعديل الكميات الصادرة لتفادى الأخطاء');
                        return -1;
                    }else{
                        this.__stopQtyAlerts[__product.id.toString()] = true;
                    }
                } catch (error) {
                    return -1;    
                }
            }
        }
        if(__product.is_product && this._global.getToken()['settings']['is_notify_expired'] && !this.__stopExpAlerts[__product.id.toString()]){
            if(__product.has_expire_date && (new Date() <= new Date())){
                var __expire:any = __product.expire_date;
                __expire = new Date(__expire);
                if(__expire <= new Date()){
                    try {
                        if(!confirm('الصنف الذى طلبته منتهى الصلاحية\nهل تريد الاستمرار فى عملية البيع')){
                            return -1;
                        }else{
                            this.__stopExpAlerts[__product.id.toString()] = true;
                        }
                    } catch (error) {
                        return -1;
                    }
                }
            }
        }
        if(__match && this._global.getToken()['settings']['is_append_products']){
            this.__orders[__index].controls['quantity'].setValue(__qty);
            this.__orders[__index].controls['multiplier'].setValue(__multiplier);
            this.onUpdateOrder(this.__orders[__index]);
            return (__index + 1);
        }else{
            if(__product.is_product && __product.is_trackable && !__match && __product.stock <= 0){
                if(this._global.getToken()['settings']['is_ask_qty'] && !this.__stopQtyAlerts[__product.id.toString()]){
                    try {
                        if(!confirm('الكمية اللتى طلبتها أكبر من الكمية المتوفرة\nهل تريد الاستمرار فى اضافة الكمية')){
                            this._lab.__setAlerts__('warn' , 'يرجى تعديل الكميات الصادرة لتفادى الأخطاء');
                            return -1;
                        }else{
                            this.__stopQtyAlerts[__product.id.toString()] = true;
                        }
                    } catch (error) {
                        return -1;    
                    }
                }
            }
            if(__product.is_product && !__match && this._global.getToken()['settings']['is_notify_expired'] && !this.__stopExpAlerts[__product.id.toString()]){
                if(__product.has_expire_date && (new Date() <= new Date())){
                    var __expire:any = __product.expire_date;
                    __expire = new Date(__expire);
                    if(__expire <= new Date()){
                        try {
                            if(!confirm('الصنف الذى طلبته منتهى الصلاحية\nهل تريد الاستمرار فى عملية البيع')){
                                return -1;
                            }else{
                                this.__stopExpAlerts[__product.id.toString()] = true;
                            }
                        } catch (error) {
                            return -1;
                        }
                    }
                }
            }
        }
        if(__match){
            this._lab.jQuery('input.form-control.order-search.autofocus').focus();
            return this.__orders.push(this.__createOrderFormGroup__(__product , 1));
        }
        else{
            this._lab.jQuery('input.form-control.order-search.autofocus').focus();
            return this.__orders.push(this.__createOrderFormGroup__(__product));
        }
    }

    onSelectVariaty(__variaty:string,__index:number):void{
        if(!this.__continues__(false)) return;
        this._variatiesArr[__index]['focus'] = false;
        if(__variaty && __variaty !== ''){
            if(this._selectedVariaty.length - 1 > __index)
                this._selectedVariaty[__index] = __variaty;
            else
               this._selectedVariaty.push(__variaty);
        }
        if((__index + 1) === this._variatiesArr.length){
            this.__getVariatyItem__();
        }else{
            this._variatiesArr[(__index + 1)]['focus'] = true;
        }
    }

    onFocusOrder(form:FormGroup , __id:number){
        if(!this.__continues__()) return;
        this.__orders.forEach((__form) => {
            if(__form === form) return;
            __form.controls['focus'].setValue(false);
        });
        if(!form.value.product){
            this._http.get('products/' + form.value.product_id.toString()).subscribe(
                (product) => {
                    if(product.error !== null || !product.data) return;
                    form.controls['product'].setValue(product.data);
                },(error) => {
                    if(error.status === 0){
                        this._lab.__setAlerts__('warn' , 'لايمكن جلب بيانات الطلب ... الرجاء التأكد من سلامة الاتصال لديك');
                        return;
                    }   
                }
            );
        }
        let _self:SellsDetailsComponent = this;
        this.__orders[__id].controls['focus'].setValue(!this.__orders[__id].controls['focus'].value);
        setTimeout(()=> {
            if(this.__orders[__id].controls['focus'].value) _self._lab.jQuery('.order_' + __id.toString() + ' .form-control.autofocus').focus();
        } , 200);
    }

    onUpdateOrder(form:FormGroup , from:string = null):void{
        if(!this.__continues__()) return;
        this.__refreshOrderPrices(form , from);
    }

    onRevemoOrder(form:FormGroup , index:number):void{
        if(!this.__continues__()) return;
        let __tempOrders:FormGroup[] = [];
        this.__orders.forEach((__form , __index)=>{
            if(__index === index) return;
            __tempOrders.push(__form);
        });
        this.__orders = __tempOrders;
        this.__refreshPrices();
        this.__countSaleEarnedLoyalty();
        this.__countAvailablePointsToCustomer__();
    }

    onParkOrders():void{
        if(!this.__registerOpen){
            return this._lab.__setAlerts__('warn' , 'عليك تفعيل المسجل أولا');
        }
        if(this.formObject.value.status === 'parked'){
            return this._lab.__setAlerts__('warn' , 'الطلب محفوظ مسبقا كطلب مؤقت');
        }
        if(this.__orders.length === 0){
            return this._lab.__setAlerts__('warn' , 'لايوجد لديك طلبات لركنها و حفظها كمسودة ');
        }
        if(false === this.formObject.valid) {
            if(this.formObject.controls['number'].valid !== true)
                if(this.__type__ === 'returned')
                    return this._lab.__setAlerts__('error' , 'يجب كتابة رقم الايصال المعاد للحفظ كمسودة');
                else
                    if(this.__newSellNumber > 0){
                        this.formObject.controls['number'].setValue(this.__newSellNumber);
                    }else{
                        this.__createNewDetails__();
                    }
        }
        this.formObject.controls['status'].setValue('parked');
        this.onCompletePayment('',true, (values) => {
            if(this.__orders && this.__orders.length){
                let __orders:Orders[] = [];
                this.__orders.forEach((order , index) => {
                    __orders.push(order.value);
                });
                this.formObject.controls['orders'].setValue(__orders);
            }
            this.__parkSells.push(Object['assign']({} , values));
            this._lab.jQuery('#show-sell-details-modal button.close').click();
            this._lab.jQuery('input.form-control.order-search.autofocus').focus();
        });        
    }

    onRemoveAllOrders():void{
        if(!this.__continues__()) return;
        this.__orders = [];
        this.__countSaleEarnedLoyalty();
        this.__countAvailablePointsToCustomer__();
        this.__refreshPrices();
    }

    OnSubmitForm(values:Sells,valid:boolean):void{
        this.submitted = true;
        if(false === valid) {
            if(this.formObject.controls['number'].valid !== true)
                if(this.__type__ === 'completed'){
                    if(this.__newSellNumber){
                        this.formObject.controls['number'].setValue(this.__newSellNumber);
                    }
                }else            
                    this._lab.__setAlerts__('error' , 'الرجاء كتابة رقم ايصال الطلبات المعادة');
            else            
                this._lab.__setAlerts__('error' , 'الرجاء التأكد من الملاحظات الجانبية لكل حقل و تجنب الاخطاء لاتمام العملية');
            return;   
        }
        let __status:string = this.__type__;
        // if(__status === 'completed'){
        //     if(this.__newSellNumber){
        //         this.formObject.controls['number'].setValue(this.__newSellNumber);
        //     }else{
        //         this.__createNewDetails__();
        //     }
        //     this._lab.jQuery('#show-sell-details-modal button.close').click();
        //     this._lab.jQuery('input.form-control.order-search.autofocus').focus();
        //     return;
        // }
    
        this.__adjustDates__();
        this._http.get(this._page + '?contains=false&limit=1&page=1&search=number-status-register_id&number='
        + this.formObject.value.number + '&status=' + __status + '&register_id='+this.formObject.value['register_id']).subscribe(
            (item) => 
            {
                if(item.error !== null){
                    this._lab.__setErrors__(item.error);
                    return;
                }
                // if(__status === 'completed'){
                //     if((item.data && item.data.length === 1 && item.data[0].number === this.formObject.value.number)) {
                //         if((item.data[0].id !== this.formObject.value.id)){
                //             this._lab.__setAlerts__('warn' , 'رقم الايصال موجود مسبقا ... يرجى التأكد من رقم الايصال و الحالة (مبيعات أو اعادة طلبات)');
                //             this.formObject.controls['number'].setErrors({'rule' : 'sell number is already exists'});
                //             return;
                //         }
                //     }
                // }else{
                if((item.data && item.data.length > 0)) {
                    this._lab.__setAlerts__('warn' , 'رقم الايصال موجود مسبقا ضمن  قائمة الطلبات المعادة)');
                    this.formObject.controls['number'].setErrors({'rule' : 'sell number is already exists'});
                    return;
                }
                // else{
                //         this._lab.__setAlerts__('warn' , 'رقم الايصال موجود مسبقا ... يرجى التأكد من رقم الايصال و الحالة (مبيعات أو اعادة طلبات)');
                //         return;
                // }
                // }
                this._lab.jQuery('#show-sell-details-modal button.close').click();
                this._lab.jQuery('input.form-control.order-search.autofocus').focus();
            },
            (error) => { 
                this._lab.__setErrors__(error);
            },
            ()=> { }
        );
    }

    __adjustDates__(sell:Sells = null):void{
        if(typeof(this.formObject.value.date) === 'string'){
            this.__sellDate = new Date(this.formObject.value.date);
            this.formObject.controls['date'].setValue(this.__sellDate);
        }else if(typeof(this.formObject.value.date) === 'object'){
            if(!this.formObject.value.date ||  isNaN(this.formObject.value.date.getDay())) {
                let __date:Date = new Date();
                if(this._lastSell && this._lastSell.id === this.formObject.value.id && typeof this._lastSell.date === 'string'){ 
                    __date = new Date(<any>this._lastSell.date);
                }
                this.__paidDate = __date;
                this.formObject.controls['date'].setValue(__date);
            }
        }
        if(typeof(this.formObject.value.paid_date) === 'string'){
            this.__paidDate = new Date(this.formObject.value.paid_date);
            this.formObject.controls['paid_date'].setValue(this.__paidDate);
        }else if(typeof(this.formObject.value.paid_date) === 'object'){
            if(!this.formObject.value.paid_date ||  isNaN(this.formObject.value.paid_date.getDay())) {
                let __date:Date = new Date();
                if(this._lastSell && this._lastSell.id === this.formObject.value.id && typeof this._lastSell.paid_date === 'string'){ 
                    __date = new Date(<any>this._lastSell.paid_date);
                }
                this.__paidDate = __date;
                this.formObject.controls['paid_date'].setValue(__date);
            }
        }
    }

    OnPayClick():void{
        if(this.__continues__()){
            if(this.formObject.controls['number'].valid !== true){
                if(this.__type__ === 'returned'){
                    this._lab.__setAlerts__('error' , 'عليك كتابة رقم الايصال فى حالة ركن اعادة طلبات');
                    this.__showModalDetails__();
                    return;
                }else{
                    if(this.__newSellNumber > 0)
                        this.formObject.controls['number'].setValue(this.__newSellNumber);
                    else
                        this.__createNewDetails__();
                }
            }

            if(this.__orders.length === 0){
                this._lab.__setAlerts__('error' , 'عليك اضافة الطلبات أولا لتتمكن من اتمام عملية الدفع');
                return;
            }
        }else{
            this._lab.__setAlerts__('warn' ,'يمكنك تعديل واضافة عملية الدفع فقط');
        }

        this.__refreshPrices();
        let __pay:any = this._lab.jQuery('.PayDetails');
        let __height:number = __pay.parent().outerHeight();
        __height = __height;
        this.__payAmount = (parseFloat(this.__obj['total']) - this.formObject.value.paid);
        this.__showSide = 'PAY';
        this._lab.jQuery('.PayDetails').addClass('bounce'); 
        this._lab.jQuery('.PayDetails div.pay-side,.PayDetails div.details-side').css({'max-height' :__height.toString() + 'px' , 'height' :__height.toString() + 'px' }); 
        __height = __height - 112;
        let _self:SellsDetailsComponent = this;
        this._lab.jQuery('.PayDetails div.pay-items').css({ 'max-height':__height.toString() + 'px' ,'height' :__height.toString() + 'px' }); 
        setTimeout(function() {
            _self._lab.jQuery('.PayDetails .pay-side ._paycontrol_').focus()
        }, 200);
    }

    onBackToOrdering():void{
        this.__countSaleEarnedLoyalty();
        this.__countAvailablePointsToCustomer__();
        this.__showSide = 'ORDER';
        this._lab.jQuery('.PayDetails').removeClass('bounce');
        let _self:SellsDetailsComponent = this;        
        setTimeout(function() {
            _self._lab.jQuery('input.form-control.order-search.autofocus').focus();
        }, 200);
    }

    OnProductDetails(__form:FormGroup):void{
        if(__form.value.product){
            this.__showProductDetials(__form.value.product);
        }else{
            this._http.get('products/'+__form.value.product_id).subscribe(
                (product) => {
                    if(!product.data)
                        return this._lab.__setAlerts__('error' , 'يبدو أن المنتج أو الخدمة غير متوفرة أو تم ازالتها مسبقا');
                    
                    __form.controls['product'].setValue(product.data);
                    this.__showProductDetials(__form.value.product);
                },(error) => {
                    this._lab.__setAlerts__('error' , 'يبدو أن المنتج أو الخدمة غير متوفرة أو تم ازالتها مسبقا');
                },() => {}
            );
        }
    }

    private __showProductDetials(__pro:Products):void{
        this.__proDetails =  __pro;
        this.__showModalDetails__('proDetails');
    }

    onCompletePayment(type:string , __save:boolean = false, cb:Function = null):void{
        if(!this.__registerOpen) return;

        if(!this.__continues__()) return this.onCompletePaymentUpdate(type);

        let __continue:boolean = true;        
        let __orders:Array<Orders> = [];
        let __products:Array<Products> = [];

        let __didPayOut:boolean = false;
        if(type !== '') this.formObject.controls['status'].setValue(this.__type__);
        __didPayOut = this.__payAmountMethod__(type);
        if(!__didPayOut) return;

        if(this.__continues__(false)){
            this.__orders.forEach((form , index) => {
                if(!form.valid) {
                    form.controls['focus'].setValue(true);
                    __continue = false;
                    return;
                }
                let __value = <Orders>form.value;
                if(__value.product) {
                    __products.push(<Products>__value.product);
                    delete __value.product;
                }
                __value.cost = __value.cost * __value.multiplier;
                let __types_main_id:number = parseInt(__value.type_main_id.toString());
                __value.type_main_id = isNaN(__types_main_id) ? 0 : __types_main_id;
                // __value.quantity = __value.quantity * __value.multiplier;
                __orders.push(__value);
            });
        }

        this.formObject.controls['costs'].setValue(this.__obj['cost']);
        this.formObject.controls['prices'].setValue(this.__obj['price']);
        this.formObject.controls['discounts'].setValue(this.__obj['discount']);
        this.formObject.controls['taxes'].setValue(this.__obj['tax']);
        this.formObject.controls['totals'].setValue(this.__obj['total']);
        this.formObject.controls['count'].setValue(__orders.length);
        this.formObject.controls['orders'].setValue(__orders);

        if(!__continue){
            this._lab.__setAlerts__('error' , 'الرجاء التأكد من الاخطاء الموجودة بقائمة طلباتك');
            return;
        }

        this.formObject.controls['park_completed'].setValue(this.__type__ === 'completed');
        this.formObject.controls['description'].setValue(this.__textArea);
        if(!this._editable || this.__isParkEdit){
            this.formObject.controls['register'].setValue(this.__register.register);
            this.formObject.controls['register_id'].setValue(this.__register.register_id);
            this.formObject.controls['register_closure'].setValue(this.__register.closure);
        }
        
        let __obj;
        this.__countSaleEarnedLoyalty(true);
        this.__countAvailablePointsToCustomer__(true);
        if((this._editable && this.__param)){ 
            __obj = this._http.put(this._page + this.__param , this.formObject.value);
        }else{
            this.__adjustDates__();
            __obj = this._http.post(this._page , this.formObject.value);
        }

        __obj.subscribe(
            (items) => {
                if(items.error !== null && (!items.data || items.data.length === 0)){
                    let __paid_arr:Array<any> = [ ];
                    if(!__save){
                        this.formObject.value.payments.forEach((payment,index) => {
                            __paid_arr.push(payment);
                        });
                        __paid_arr.pop();
                    }
                    this.formObject.controls['payments'].setValue(__paid_arr);
                    this.onBackToOrdering(); 
                    this._lab.__setErrors__(items.error);
                    return;
                }
                if(cb) cb(items.data);
                // let __isParkedItem:boolean = this.formObject.value.status === 'parked';
                // if(__isParkedItem){
                //     }
                if(!this._editable || this.__isParkEdit) {
                    if(this.__isParkEdit){
                        this._lab.__setAlerts__('success' , 'لقد تم اضافة الطلبات لقائمة الطلبات المحفوظة');
                    }else{
                        this._lab.__setAlerts__('success' , 'لقد تم اضافة الطلبات ... يمكنك اضافة قائمة أخرى');
                    }
                    if(this._global.getToken()['settings']['is_show_invoice']){
                        // this.__showModalDetails__('showSellPaper', { backdrop : 'static' });
                        let self:SellsDetailsComponent = this;
                        this.__showSellData = {
                            item : items.data,
                            orders : __orders,
                            customer : this._customer,
                            employee : this._employee
                        }
                        this.__showSide = 'PRINT';
                        self.__printSell__ = false;
                        setTimeout(function() {
                            if(self._global.getToken()['settings']['is_print_by_thermal']){
                                // Print receipt Here Ahmed
                                // this._lab.jQuery('#show-sell-details-modal input.autofocus').focus(); 
                                self._lab.jQuery('.modal-header button.close').click(function(e){
                                    // self.__showSide = 'ORDER';
                                    self._lab.jQuery('input.form-control.order-search.autofocus').focus();
                                    self.__clearProperties__(false);
                                    self.__createNewDetails__();
                                });
                            }else{
                                // self.__printSell__ = true;
                                self.__clearProperties__(false);
                                self.__createNewDetails__();
                            }
                        }, 1000);
                        this._lab.jQuery('input.form-control.order-search.autofocus').focus();
                    }else{
                        this.__clearProperties__();
                        this.__createNewDetails__();
                    }
                }else{
                    if(this.__continues__())
                        this._lab.__setAlerts__('success' , 'لقد تم تغيير حالة الفاتورة رقم  #' + this.formObject.value.number + ' بنجاح');
                    else
                        if(this._lastSell.status === 'parked' && __didPayOut){
                            this._lab.__setAlerts__('success' , 'لقد تم اضافة الدفع للفاتورة رقم  #' + this.formObject.value.number);
                            this.__createNewDetails__();
                        }else{
                            this._lab.__setAlerts__('success' , 'لقد تم تعديل الطلبات رقم  #' + this.formObject.value.number);
                        }
                    this._lastSell = items.data;
                }
            },
            (error) => {
                this._lab.__setAlerts__(error);
                let __paidarr:Array<Object> = this.formObject.value.payments;
                __paidarr.pop();
                this.formObject.controls['payments'].setValue(__paidarr);
                this.onBackToOrdering();
            },() => {
            }
        );
    }

    onCompletePaymentUpdate(type:string):void{
        let __didPayOut:boolean = false;
        if(type !== '') this.formObject.controls['status'].setValue(this.__type__);
        __didPayOut = this.__payAmountMethod__(type);
        if(!__didPayOut) return;

        let __values:Object = { 
            payments : this.formObject.value.payments,
            paid     : this.formObject.value.paid 
        };
        if(__values['payments'].length === 0 && this.__paid_arr_backup.length === 0) return;
        this._http.put(this._page + 'updatePayments/' + this.__param , __values).subscribe(
            (items) => {
                if(items.error !== null && (!items.data || items.data.length === 0)){
                    let __paid_arr:Array<any> = [ ];
                    this.onBackToOrdering();    
                    this._lab.__setErrors__(items.error);
                    this.__resetPayment();
                    return;
                }
                this.onBackToOrdering();
                this._lab.__setAlerts__('success' , 'لقد تم تعديل الدفع للطلب رقم  #' + this.formObject.value.number);
            },
            (error) => {
                this._lab.__setAlerts__('error' , 'حدث خطأ ... الرجاء اعادة عملية الدفع');
                this.formObject.controls['payments'].setValue(this.__paid_arr_backup);
                this.__resetPayment();
                this.onBackToOrdering();
            },() => {
            }
        );
    }

    private __resetPayment():void{
        let __paid:number = 0;
        this.__paid_arr_backup.forEach((payment , index) => {
            __paid += payment['paid'];
        });
        this.formObject.controls['paid'].setValue(__paid);
        this.formObject.controls['payments'].setValue(this.__paid_arr_backup);
        this.__payAmount = this.formObject.value.totals - __paid;
    }

    private __payAmountMethod__(type:string = ''):boolean{
        //=================== PAYMENT ===============================\\
        //=================== PAYMENT ===============================\\
        //=================== PAYMENT ===============================\\
        //=================== PAYMENT ===============================\\
        let __paid_arr:Array<any> = [ ];
        let __paid:number = 0;
        let __total:number = this.__obj['total'];
        if(type === '') return true;

        this.formObject.value.payments.forEach((payment,index) => {
            __paid_arr.push(payment);
            __paid += parseFloat(payment.paid);
        });

        let __payAmount:number = parseFloat(this.__payAmount);

        if(isNaN(__payAmount)){
            this._lab.__setAlerts__('warn' , 'لم يتم اضافة أى مبلغ مالى لحفظ عملية الدفع');
            return false;
        }

        if(__payAmount > (__total - this.formObject.value.paid)){
            this._lab.__setAlerts__('warn' , 'لايمكن دفع أكثر من المبلغ المطلوب');
            return false;
        }


        if(__paid < 0 ){
            this._lab.__setAlerts__('warn' , 'لايمكن ارجاع أكثر من المبلغ المستلم من قبل الزبون');
            return false;
        }
        
        if(this.__payAmount !== 0){
            let __paid_item:Object ={
                from : 'Sells',
                by   : type,
                paid : __payAmount,
                debt : (__total - (__payAmount + this.formObject.value.paid)),
                date : Date.now()
            };

            if(type === 'BANK' && this.__chosenBankID){
                this.__chosenBankID = parseInt(this.__chosenBankID.toString());
                for(let i=0; i < this.__banks.length; i++){
                    if(this.__banks[i].id !== this.__chosenBankID) continue;
                    __paid_item['bank'] = this.__banks[i].name;
                    __paid_item['account_number'] = this.__banks[i].number;
                }
                this._lab.jQuery('#show-sell-details-modal button.close').click();
            }
            __paid_arr.push(__paid_item); 
            this.formObject.controls['payments'].setValue(__paid_arr);
            this.formObject.controls['paid'].setValue((__paid + __payAmount));
            if(__paid_item['debt'] !== 0)
                this._lab.__setAlerts__('success' , 'تم اضافة المبلغ ' + __payAmount + ' لعمليات الدفع');
        }
        this.__refreshPrices();
        return this.__payAmount === 0;
    }

    public validateControl(name:string , parent:string = null):boolean{
        return (!this.formObject.controls[name].valid && (!this.formObject.controls[name].pristine || this.submitted));
    }

    private __init__():void{
        this.OnToggleSearchType('PRODUCTS');
        this.alphanumdashed = this._global.config["alphanumdashed"];
        this.nameRegex= this._global.config["nameRegex"];
        this.noteRegex= this._global.config["noteRegex"];
        this.intRegex = this._global.config["intRegex"];
        this.floatRegex= this._global.config["floatRegex"];
        this.priceRegex= this._global.config["priceRegex"];
        this.postRegex= this._global.config["postRegex"];
        // this._lab.getCurrentJournal(this , (error) =>{
        //     if(error){
        //         this._lab.__setAlerts__('connfail');
        //         setTimeout(function() {
        //             this._global.navigatePanel('sells');
        //         }, 1000);
        //     }
            this.__initFormObject__();
            this.__obj = {
                total : 0,
                price : 0,
                tax : 0,
                discount : 0,
                cost : 0,
            };
            this.__checkIsSell__();
            this.__getRouterParamsData__();
        // });
    }

    private __initFormObject__():void{
        this.__textArea = this._global.getToken()['settings']['sell_terms'] || '';
        this.formObject = this._fb.group({
            id                 : [ 0 , Validators.pattern(this.intRegex)],
            is_sell            : [ this.__isSell__ ],
            
            register           : [ '' ],
            register_id        : [ 0 ],
            register_closure   : [ 0 , [Validators.required , Validators.pattern(this.intRegex)]],
            number             : [ 1 , [Validators.required, Validators.pattern(this.intRegex)]],
            // page               : [ this.__journal.page , [Validators.required , Validators.pattern(this.intRegex)]],
            order_number       : [ this.__orderNumber , [Validators.required, Validators.pattern(this.intRegex)]],
            notebook_number    : [ 1 , [Validators.required, Validators.pattern(this.intRegex)]],
            handler            : ['' , Validators.pattern(this.alphanumdashed)],
            customer           : ['' , Validators.pattern(this.nameRegex)],
            customer_code      : ['' , Validators.pattern(this.intRegex)],
            customer_id        : [ 0 , Validators.pattern(this.intRegex)],
            employee           : ['' , Validators.pattern(this.nameRegex)],
            employee_id        : [ 0 , Validators.pattern(this.intRegex)],
            count              : [ 0 , Validators.pattern(this.floatRegex)],
            gift_discount      : [ 0 , Validators.pattern(this.floatRegex)],
            gift_code          : ['' , Validators.pattern(this.alphanumdashed)],
            gift_percent       : [ 0 , Validators.pattern(this.floatRegex)],
            gift               : [{ }],
            
            loyalty            : [{ }],

            costs              : [ 0 , Validators.pattern(this.priceRegex)],
            prices             : [ 0 , Validators.pattern(this.priceRegex)],
            taxes              : [ 0 , Validators.pattern(this.priceRegex)],
            discounts          : [ 0 , Validators.pattern(this.priceRegex)],
            all_discount       : [ 0 , Validators.pattern(this.priceRegex)],
            shipping_amount    : [ 0 , Validators.pattern(this.priceRegex)],
            shipping_by_company: [ this._global.getToken()['settings']['free_shipping'] ],
            shipping_cost      : [ 0 , Validators.pattern(this.priceRegex)],
            totals             : [ 0 , Validators.pattern(this.priceRegex)],

            paid               : [ 0 , Validators.pattern(this.priceRegex)],
            payments           : [ [] ],
            status             : [ 'completed' ],
            park_completed     : [ true ],

            date               : [ new Date() , Validators.nullValidator ],
            paid_date          : [ new Date() , Validators.nullValidator ],
            createdAt          : ['' , Validators.nullValidator ],
            updatedAt          : ['' , Validators.nullValidator ],
           
            description        : [ this.__textArea , Validators.pattern(this.noteRegex)],
            parked_msg         : ['' , Validators.pattern(this.noteRegex)],
            parent_id          : ['' , Validators.pattern(this.intRegex)],
            company_id         : ['' , Validators.pattern(this.intRegex)],
            author_id          : ['' , Validators.pattern(this.intRegex)],
            orders             : [[]]
        });
    }

    private __getRouterParamsData__(sell:Sells = null):void{
        this._lab.__setGlobal__(this._global);
        let __token = this._global.getToken();
        if(!__token['admin'] && (!__token['register_id'] || __token['register_id'] < 0)){
            this._lab.__setAlerts__('warn' , 'يبدو أنك لا تملك الصلاحية لاتمام عمليات البيع');
            setTimeout(function() {
                this._global.navigatePanel('sells');
            }, 1000);
            return;
        }
        if(sell && sell.id && sell.id > 0){
            this._editable = true;
            this.__param = sell.id.toString();
            this.__isParkEdit = true;
            for(let key in sell){
                if(sell[key] !== null && this.formObject.value.hasOwnProperty(key)){
                    this.formObject.controls[key].setValue(sell[key]);
                }
            }

            if(this.formObject.value.gift && this.formObject.value.gift.code){
                this.formObject.controls['gift_code'].setValue(this.formObject.value.gift.code);
            }
            if(this._employee){
                this.formObject.controls['employee'].setValue(this._employee.name);
                this.formObject.controls['employee_id'].setValue(this._employee.id);
            }else{
                this.formObject.controls['employee'].setValue('');
                this.formObject.controls['employee_id'].setValue(0);
            }

            this.__textArea = this.formObject.value['description'];
            this._lastSell = <Sells>sell;
            if(this.formObject.value.parked_msg){
                this.__hasParkNote = true;
                this.__showModalDetails__('parkMsg');
            }
            this.__type__ = this.formObject.value.park_completed ? 'completed' : 'returned';
            this.formObject.controls['status'].setValue(this.__type__);
            if(sell.customer_id && sell.customer_id > 0) {
                this.__getCustomerAndEmployee__(true,false);
            }
            if(sell.orders && sell.orders.length > 0){
                this.__orders = [];
                (<Array<Orders>>sell.orders).forEach((order,index)=>{
                    order.cost = order.cost / order.multiplier;
                    // order.quantity = order.quantity / order.multiplier;
                    this.__orders.push(this.__createOrderFormGroup__(order));
                });
                this.__refreshPrices();
            }else{
                this.__retriveOrders__(true);
            }
            this.__showModalDetails__('sells');
            this._lab.jQuery('input.form-control.order-search.autofocus').focus();
            this.__paid_arr_backup = this.formObject.value['payments'];
            setTimeout(() => { this.__adjustDates__(sell) } , 1000);
        }else if(this._route.params['value'] && this._route.params['value']['id'] &&
            this._global.config['intRegex'].test(this._route.params['value']['id'])){ 
            this.__param = this._route.params['value']['id'];
            this._editable = true;
            this.__isParkEdit = false;
            this.__hasParkNote = false;
            this._http.get(this._page + this.__param).subscribe(
                (item) => {
                    if(item.error !== null || !item.data || item.data.length === 0) { 
                        this._global.navigatePanel('sells');
                        return;
                    }
                    for(let key in item.data){
                        if(item.data[key] !== null && this.formObject.value.hasOwnProperty(key)){
                            this.formObject.controls[key].setValue(item.data[key]);
                        }
                    }

                    if(this.formObject.value.gift && this.formObject.value.gift.code){
                        this.formObject.controls['gift_code'].setValue(this.formObject.value.gift.code);
                    }

                    this.__textArea = this.formObject.value['description'];
                    this._lastSell = <Sells>item.data;
                    if(this.formObject.value.status === 'parked' && this.formObject.value.parked_msg && this._lastSell.parked_msg !== ''){
                        this.__hasParkNote = true;
                        this.__showModalDetails__('parkMsg');
                    }
                    this.__type__ = this.formObject.value.park_completed ? 'completed' : 'returned';
                    this.formObject.controls['status'].setValue(this.__type__);
                    this.__getCustomerAndEmployee__();
                    this.__retriveOrders__();
                    this.__paid_arr_backup = this.formObject.value['payments'];
                },
                (response) => { 
                    this._lab.__setAlerts__('warn' , 'يبدو أن الفاتورة اللتى طلبت غير متوفرة أو تم ازالتها')
                    setTimeout(() => {
                        this._global.navigatePanel('sells');
                    } , 1000);
                },
                () => {}
            );
        }else{
            this.__createNewDetails__();
            this._lab.jQuery('input.form-control.order-search.autofocus').focus();
        }
        if(!sell || !sell.id) this.__initRegister__();
    }

    __initRegister__():void{
        this.__register = <RegistersHistory>this._global.getResource('registerHistory');
        if(!this.__register || !this.__register.case || this.__register.case === 'close'){
            this.__checkRegisterOpens__();
        }else{
            let __emp_id:number;
            
            if(this.__register.employees instanceof Array && this.__register.employees.length > 0){
                let __emp:Object = this.__register.employees[this.__register.employees.length - 1];
                if(__emp){
                    this.formObject.controls['employee_id'].setValue(__emp['id']);
                    this.__getCustomerAndEmployee__(false,true);
                }
            }
            this.formObject.controls['employee_id'].setValue(__emp_id);
            this.__registerOpen = true;
        }
    }

    __checkRegisterOpens__():void{
        let __url = 'registersHistory/?sortby=id&sort=DESC&page=1&limit=1'
        this._http.get(__url).subscribe(
            (item) => {
                if(item.data && item.data instanceof Array && item.data[0]){
                    if(!item.data[0].case || item.data[0].case === 'close'){
                        this.__registerOpen = false;
                        return;
                    }
                    this.__registerOpen = true;
                    this.__register = item.data[0];
                    let __emp_id:number = 0;
                    if(this.__register.employees instanceof Array && this.__register.employees.length > 0){
                        let __emp:Object = this.__register.employees[this.__register.employees.length - 1];
                        if(__emp){
                            this.formObject.controls['employee_id'].setValue(__emp['id']);
                            this.__getCustomerAndEmployee__(false,true);
                        }
                    }
                    this.formObject.controls['employee_id'].setValue(__emp_id);
                    // if(!this._editable || this.__isParkEdit){
                    //     this.formObject.controls['register_closure'].setValue(this.__register.closure);
                    //     this.formObject.controls['register'].setValue(this.__register.register);
                    //     this.formObject.controls['register_id'].setValue(this.__register.register_id);
                    // }
                    this._global.setResource( item.data[0] , 'registerHistory');
                }else{
                    this.__registerOpen = false;
                }
            },
            (response) => { 
                this._lab.__setAlerts__('connfail');
                // this.__initFormObject__();
            },
            () => {}
        );
    }

    __checkParkSells__():void{
        if(this.__foundParkSells__ !== 'NODATA'){
            this.__getMoreParkSells(true);
        }
        this.__showModalDetails__('parksells');
    }

    __getMoreParkSells(first:boolean = false):void{
        if(!this.__registerOpen || !this.__register) return;
        // if(this.__parkSells.length < this._global.getToken['settings']['perpage']) return;
        let __page:number = first ? 1 : (Math.ceil(this.__parkSells.length / this._global.getToken()['settings']['perpage']) + 1);
        let __URL__:string = 'sells/?sortby=id&sort=DESC&search=status-register_id&status=parked';
        __URL__ += '&register_id='+this.__register.register_id+'&limit='+this._global.getToken()['settings']['perpage'];
        __URL__ += '&page=' + (Math.ceil(this.__parkSells.length / this._global.getToken()['settings']['perpage']) + 1);
        this._http.get(__URL__).subscribe(
            (items) => {
                if(items.error){
                    this._lab.__setAlerts__('error' , 'عذرا يوجد خطأ فى عملية الطلب');
                } else if(items.data && items.data instanceof Array && items.data.length > 0){
                    this.__foundParkSells__ = 'HASDATA';
                        for(let i=0; i < items.data.length; i++){
                            this.__parkSells.push(items.data[i]);
                        }
                }else{
                    if(items.data.length === 0){
                        return this._lab.__setAlerts__('warn' , 'لايوجد طلبات أخرى لاظهارها');
                    }
                    this.__foundParkSells__ = 'NODATA';
                }
            },(errorr)=>{
                this._lab.__setAlerts__('error' , 'الرجاء التأكد من سلامة الاتصال');
            },() => {}
        );
    }

    __onParkedSellAction(sell:Sells , action:string):void{
        switch (action) {
            case 'DELETE':
                if(sell.id > 0) return;
                this._http.delete('sells/' + sell.id).subscribe(
                    (item) => {
                        if(item.error){
                            return this._lab.__setErrors__(item.error);
                        }
                        if(item.data){
                            this.__removeParkSellFromArray__(sell);
                        }
                    }
                );
                break;
            case 'EDIT':
                this.__clearProperties__();
                this.__getRouterParamsData__(sell);
                break;
        }
    }

    private __removeParkSellFromArray__(sell:Sells):void{
        let __sells:Array<Sells> = this.__parkSells;
        this.__parkSells = [];
        __sells.forEach((__sell , index) => {
            if(__sell.id !== sell.id){
                this.__parkSells.push(__sell);
            }
        });
    }

    private __initOrderInformations__():void{
        if(this._editable && this.__param) return;
        this._http.get(this._page + '?limit=1&page=1').subscribe(
            (item) => {
                if(item.error !== null || !item.data || item.data.length === 0)
                    return this.__createNewDetails__();
                this._lastSell = <Sells>item.data[0];
                if(this._lastSell.status === 'incompleted' || this._lastSell.status === 'parked'){
                    for(let key in this._lastSell){
                        if(this._lastSell[key] !== null && this._lastSell[key] !== undefined && this.formObject.value.hasOwnProperty(key)){
                            this.formObject.controls[key].setValue(this._lastSell[key]);
                        }
                    }
                    if(this.formObject.value.count > 0)
                    {
                        this.__retriveOrders__();
                        if(!this._global.getToken()['is_show_invoice_details']) return;
                        this.__showModalDetails__('sells');
                        setTimeout(()=>{
                            this._lab.jQuery('#show-sell-details-modal input.autofocus').focus();
                        },500);
                    }
                    return;
                }else{
                    this.__createNewDetails__();                    
                }
            },(error) => {
                this._lab.__setAlerts__('warn' , 'الرجاء اعادة المحاولة عند التأكد من سلامة الاتصال');
                setTimeout(() => {
                    this._global.navigatePanel('sells');
                } , 1000);
            },() => { }
        );
    }

    private __createNewDetails__():void{
        this._http.get(this._page  + 'next?is_sell='+this.__isSell__).subscribe(
            (next) => {
                if(next.data && next.data.number && next.data.number > 0) {
                    this.formObject.controls['number'].setValue(next.data.number);
                    this.__newSellNumber = next.data.number;
                }else{
                    this.formObject.controls['number'].setValue(1);
                    this.__newSellNumber = 1;
                }
                // if(!this._global.getToken()['is_show_invoice_details']) return;
                // this.__showModalDetails__('sells');
                // setTimeout(()=>{
                //     this._lab.jQuery('#show-sell-details-modal input.autofocus').focus();
                // },500);
            },(error) => {
                this._lab.__setAlerts__('warn' , 'الرجاء اعادة المحاولة عند التأكد من سلامة الاتصال');
                setTimeout(() => {
                    this._global.navigatePanel('sells');
                } , 1000);
            },() => {});
    }

    __getUnits__():void{
        this.__units = {};
        this.__units_main_id = {};
        this._http.get('types/').subscribe(
            (units) => {
                if(units.data && !units.error){
                    let __units:Array<Types> = units.data;
                    let __mains:Array<string> = [];
                    for(let i =0; i < units.data.length ; i++){
                        let unit:Types = units.data[i];
                        let __id:string = unit.main_id.toString();
                        // { unit name : unit id } => { unit1 : 1 };
                        this.__units[unit.name] = unit.main_id;

                        if(!(this.__units_main_id.hasOwnProperty(__id))) this.__units_main_id[__id] = [];
                        this.__units_main_id[__id][parseInt(unit.index)] = unit;
                    }
                    this.__units_count = units.data.length;
                }
            },(error) => {
                this.__units_count = -1;
            },() => { }
        );
    }

    private __checkIsSell__():void{

        if(this.__param && this._editable) return;
        this.__isSell__ = Boolean(this._global.getResource('is_sell'));
        this.formObject.controls['is_sell'].setValue(this.__isSell__);
    }

    private __setSellType__(is_sell:boolean = true):void{
        if(this.__param && this._editable) return;
        this.__isSell__ = is_sell;
        this.formObject.controls['is_sell'].setValue(this.__isSell__);
        this._global.setResource(this.__isSell__ , 'is_sell');
        this.__createNewDetails__();
    }

    private __getCustomerAndEmployee__(cus:boolean=true,emp:boolean=true){
        if(cus && !this._customer){
            if(this.formObject.value.customer_id || this.formObject.value.customer_id > 0){
                this._http.get('customers/' + this.formObject.value.customer_id).subscribe(
                    (item) => {
                        if(item.data && !item.error)
                            this._customer = <Customers>item.data;
                            this.formObject.controls['customer'].setValue(this._customer.name);
                            this.formObject.controls['customer_code'].setValue(this._customer.code);
                            if(this.formObject.value.loyalty){
                                if(this.formObject.value.loyalty.earned && this.formObject.value.loyalty.earned > 0){
                                    this._customer.loyalty += this.formObject.value.loyalty.earned;
                                }
                                if(this.formObject.value.loyalty.gifted && this.formObject.value.loyalty.gifted > 0){
                                    this._customer.loyalty += this.formObject.value.loyalty.gifted;
                                }
                                if(this.formObject.value.loyalty.spent && this.formObject.value.loyalty.spent > 0){
                                    this._customer.loyalty -= this.formObject.value.loyalty.spent;
                                    this.__customerPointsToUse = this.formObject.value.spent;
                                }
                            }
                    },(response) =>{
                    },()=>{}
                );
            }
        }
        if(emp && !this._employee){
            if(this.formObject.value.employee_id && this.formObject.value.employee_id > 0){
                this._http.get('employees/' + this.formObject.value.employee_id).subscribe(
                    (item) => {
                        if(item.data && !item.error)
                            this._employee = <Employees>item.data;
                    },(response) =>{
                    },()=>{}
                );
            }
        }
    }

    __retriveOrders__(__continue:boolean = false):void{
        if(!__continue && (!this._editable || !this.__param)) return;
        let __url:string = '';
        __url  = 'orders/?contains=false&search=father_id&father_id=' + this.formObject.value.id;
        this._http.get(__url).subscribe(
            (items) => {
                if(!items.error === null || !items.data || items.data.length === 0 
                && (this.formObject.value.status === 'parked' || this.formObject.value.status === 'incompleted')){
                    this._lab.__setAlerts__('error' , 'فشل فى عملية جلب قائمة الطلبات يرجى التأكد من سلامة الاتصال  و اعادة الطلب مرة أخرى')
                    return;
                }

                this.__orders = [];
                (<Array<Orders>>items.data).forEach((order,index)=>{
                    order.cost = order.cost / order.multiplier;
                    // order.quantity = order.quantity / order.multiplier;
                    this.__orders.push(this.__createOrderFormGroup__(order));
                });
                this.__refreshPrices();
            },(error) => { this._lab.__setErrors__(error);
            },() => {}
        );
    }

    __showModalDetails__(modal:string = 'sells' , __opt = {}){
        this._modal = modal;
        this._lab.__modal('#show-sell-details-modal', __opt);
        if(this._modal === 'shows') return;
        if(this._modal === 'chooseBank'){
            if(this.__banks.length === 0) return this.__getBanks__();
        }
        let _self:SellsDetailsComponent = this;
        setTimeout(()=>{
            _self._lab.jQuery('input.form-control.order-search.autofocus').focus();
        },500);
    }

    private __getBanks__():void{
        this._http.get('banks/?page=1&limit=1000000').subscribe(
            (response) => {
                if(response.error !== null || !response.data) return;
                    this.__banks = response.data;
            },(error) => {
            }
        );
    }

    private __getVariatyItem__():void{
        if(!this.__continues__(false)) return;
        this.__beepAddingProduct();
        this.__tryAppendProduct(this._variatyProduct);
        this._lab.jQuery('.modal .variaty-modal-header button.close').click();
    }

    private __createOrderFormGroup__(item:any , qty:number = null):FormGroup{
        if(!item) return;
        let __is_product:boolean = false;
        let __quantity:number;
        let __pro_name:string;
        let __pro_id:number;
        // let __cost:number = 0;
        let __total:number = 0;
        let __pro:Products = null;
        let __invnmbr:string = '0';
        let __invid:number = 0;
        let __handler:string = '';
        let __pro_type:string = item.type;
        let __variaty:Array<Object> = [];
        let __multiplier:number = 0;
        let __types_main_id:number = 0;
        if(item.hasOwnProperty('limit_sell_quantity')){
            __is_product = true;
            if(!qty && typeof(qty) !== 'number'){
                __quantity = item.limit_sell_quantity > 0 ? item.limit_sell_quantity : 1;
            }
            else{
                __quantity = qty;
            }
            __pro_id = item.id;
            __pro_name = item.name;
            try {
                __handler = (item.is_variaty) && this._selectedVariaty.length > 0 ? this._selectedVariaty.join('\\') : '';
            } catch (error) { }
            // if(item.sku !== '0') {
            //     if(__handler) __handler += '\\' + item.sku;
            //     else __handler = item.sku;
            // }
            __pro = item;
            __invid = this.formObject.value.id || 0;
            __invnmbr = this.formObject.value.number;
            // __cost = (item.cost + (item.cost * (item.tax / 100)));
            if(this._selectedVariaty && this._variatiesArr){
                __variaty = this._selectedVariaty;
            }
            __types_main_id = item.types_main_id;
        }else{
            __quantity = item.quantity;
            // __cost = item.cost;
            __multiplier = item.multiplier
            __total = item.total;
            __pro_name = item.product_name;
            __pro_id = item.product_id;
            __invid = item.father_id;
            __invnmbr = item.number;
            __handler = item.product_handler;
            __variaty = item.variaty;
            __types_main_id = item.type_main_id;
        }
        let __discount:number = item['discount'] ? item['discount'] : 0;
        let __tax:number      = item.tax  ? item.tax : 0;
        let __order:FormGroup = this._fb.group({
            product_handler : [ __handler] ,
            father_id    : [ __invid ],
            number       : [ __invnmbr ],
            product_name : [ __pro_name ,Validators.required],
            product_id   : [ __pro_id , Validators.required],
            price        : [ item.price , Validators.pattern(this.priceRegex)],
            price_title  : ['سعر البيع'],
            total        : [ __total , Validators.pattern(this.priceRegex)],
            cost         : [ item.cost , Validators.pattern(this.floatRegex)],
            storage_id   : [ item.storage_id ],
            storage_code : [ item.storage_code ],
            tax          : [ __tax, Validators.pattern(this.floatRegex)],
            discount     : [ __discount, Validators.pattern(this.priceRegex)],
            quantity     : [ __quantity, Validators.pattern(this.floatRegex)],
            multiplier   : [ __multiplier, Validators.pattern(this.floatRegex)],
            variaty      : [ __variaty , Validators.pattern(null) ],
            description  : [ item.description , [Validators.pattern(this.noteRegex)]],
            focus        : [ false ],
            product      : [ __pro ],
            type         : [ __pro_type , Validators.pattern(this.nameRegex) ],
            type_main_id : [ __types_main_id.toString() , Validators.pattern(this.intRegex) ],
        });
        if(__is_product)
            this.__changeOrderPrice__(__order , false);
        if(!this.__continues__()){
            __order.disable();
        }
        this.__countSaleEarnedLoyalty();
        this.__countAvailablePointsToCustomer__();
        return __order;
    }

    __changeOrderPrice__(order:FormGroup,__clickFromHtml:boolean = true):void{

        let __pro:Products = order.controls['product'].value as Products;
        if(__pro.is_multi_price){
            let __price:number = order.controls['price'].value as number;
            if(__clickFromHtml){
                if(__price === __pro.price){
                    order.controls['price'].setValue(__pro.price2);
                    order.controls['price_title'].setValue('نصف الجملة');
                }else if(__price === __pro.price2){
                    order.controls['price'].setValue(__pro.price3);
                    order.controls['price_title'].setValue('سعر الجملة');
                }else if(__price === __pro.price3){
                    order.controls['price'].setValue(__pro.price4);
                    order.controls['price_title'].setValue('جملة الجملة');
                }else if(__price === __pro.price4){
                    order.controls['price'].setValue(__pro.price5);
                    order.controls['price_title'].setValue('سعر اضافى');
                }else{
                    order.controls['price'].setValue(__pro.price);
                    order.controls['price_title'].setValue('سعر البيع');
                }
            }else
            {
                order.controls['price'].setValue(__pro.price);
                order.controls['price_title'].setValue('سعر البيع');
            }
        }
        this.onUpdateOrder(order);
    }

    __refreshOrderPrices(form:FormGroup , from:string = null):void{
        if(!form) return;
        if(typeof(form.value.quantity) !== 'number'){
            let qty:number = parseFloat(form.value['quantity']);
            if(isNaN(form.value.quantity)) qty = 1;
            form.controls['quantity'].setValue(qty);
        }
        let tax:number = 0;let discount:number = 0;
        let __cost:number = 0;
        let price:number  = parseFloat(form.value.price);
        if(isNaN(price)){
            if(form.value.product && form.value.product.price) form.controls['price'].setValue(form.value.product.price);
            else form.controls['price'].setValue(0);
            price = form.value.price;
        }
        let multiplier:number = 1;
        if(form.value.type && form.value.type !== form.value.product.type){
            if(form.value.product && form.value.product.type && form.value.product.type !== ''){
                let __sorted_units:Array<Types> = this.__units_main_id[form.value.type_main_id];
                let __val:number = -1;
                let __org:number = -1;
                __sorted_units.forEach((unit , index)=>{
                    if(unit.name === form.value.product.type){
                        __org = index;
                    }
                    if(unit.name === form.value.type){
                        __val = index;
                    }
                });
                let __start:number = __org;
                let __end:number = __val;
                let __reverse:boolean = false;
                if(__org > __val){
                    __reverse = !__reverse;
                    __start = __val;
                    __end = __org;
                }
                if((__val < 0 || __val > __sorted_units.length) || (__val < 0 || __val > __sorted_units.length)){
                }else{
                    let __looper:number = 0;
                    for(let i=__start; i <= __end; i++) {
                        if(__org < __val && i === __org) continue;
                        if(__org > __val && i === __val) continue;
                        multiplier = multiplier * __sorted_units[i].child_quantity;
                        if(__looper > __sorted_units.length) break;
                        __looper++;
                    }
                    if(!__reverse){
                        multiplier = 1/multiplier;
                    }
                }
            }
        }
        form.controls['multiplier'].setValue(multiplier);
        if(form.value.product && this._global.getToken()['settings']['is_ask_qty'] 
        && (form.value.quantity * multiplier) > form.value.product.stock){
            if(!this._global.getToken()['settings']['is_ask_qty'] 
            && !this.__stopQtyAlerts[form.value.product_id.toString()]){
                this._lab.__setAlerts__('warn' , 'الكمية المضافة أكبر من المتوفرة : ' + form.value.product.stock + ' ' + form.value.product.type);
            }
        }
        price = price * multiplier;
        if(isNaN(form.value.tax)) form.controls['tax'].setValue(0);
        if(isNaN(form.value.discount)) form.controls['discount'].setValue(0);
        if(this._global.getToken()['settings']['tax_position'] === 'after'){
            tax           = (price * (form.value.tax / 100));
            discount      = ((price + tax) * (form.value.discount / 100));
        }else{
            discount      = (price * (form.value.discount / 100));
            tax           = (price + discount * (form.value.tax / 100));
        }
        let prices:number = ((price + tax ) - discount);
        let total:number  = (prices * form.value.quantity);
        form.controls['total'].setValue(total);
        form.controls['multiplier'].setValue(multiplier); // 1000 kilo to 1000 unit of gram product
        this.__refreshPrices();
    }

    __refreshPrices():void{
        let price:number=0,tax:number=0,discount:number=0,total:number=0,cost:number=0;
        if(this.__orders.length > 0){
            this.__orders.forEach((form,index) =>{
                let __qty:number = parseFloat(form.value.quantity);
                if(isNaN(__qty)) __qty = 0;
                __qty = __qty * form.value.multiplier;
                let __price:number = parseFloat(form.value.price) * __qty;
                if(isNaN(__price)) __price = 0;
                let __tax:number = (__price * (parseFloat(form.value.tax) / 100));
                if(isNaN(__tax)) __tax = 0;
                price    += __price;
                tax      += __tax;
                discount += ((__price + __tax) * (parseFloat(form.value.discount) / 100));
                cost     += (parseFloat(form.value.cost) * form.value.multiplier) * __qty ;
                total    += parseFloat(form.value.total);
            });
        }
        let __disAmount:number = parseInt(this.__discountAmount);
        __disAmount = isNaN(__disAmount) ? 0 : __disAmount;
        this.__discountAmount = __disAmount; // if isNan then will be = 0;
        if(this.__discountType === 'PERCENT'){
            __disAmount = ((__disAmount / 100 ) * total);
        }

        this.formObject.controls['all_discount'].setValue(__disAmount + discount);
        this.__obj = {
            price : price,
            discount : discount + __disAmount,
            tax : tax,
            total : (total - __disAmount),
            paid : this.formObject.value.paid,
            cost : cost
        };

        let __pointsMultiplier:number = this._global.getToken()['settings']['loyalty_money_for_point'];
        if(!isNaN(__pointsMultiplier)) __pointsMultiplier = 0;
        if(this.formObject.value.gift && this.formObject.value.gift.id > 0){
            let __giftDiscount:number = 0;
            let __gift:Gifts = this.formObject.value.gift;
            if((__gift.type === 'discount') && __gift.is_percentage){
                __giftDiscount = ((__gift.amount / 100) * this.__obj['total']);
            }else if(__gift.type === 'loyalty'){
                // __giftDiscount =  __gift.amount * __pointsMultiplier;
                // add points to customer to use it immediatly by adding it to loyalty.gifted
                let __temp_loyalty:any = this.formObject.value.loyalty;
                if(!__temp_loyalty) __temp_loyalty = { };
                __temp_loyalty['gifted'] = __gift.amount;
                this.formObject.controls['loyalty'].setValue(__temp_loyalty);
            }else{
                __giftDiscount = __gift.amount;
            }
            this.formObject.controls['all_discount'].setValue(__disAmount + discount + __giftDiscount);
            this.__obj['total'] = this.__obj['total'] - __giftDiscount;
            this.formObject.controls['gift_discount'].setValue(__giftDiscount);
        }else{
            this.formObject.controls['gift_discount'].setValue(0);
        }


        let __pointsToCashDiscount:number;
        if(this.__customerPointsToUse > 0){
            let __pointsMultiplier:number = this._global.getToken()['settings']['loyalty_money_for_point'];
            __pointsToCashDiscount =  this.__customerPointsToUse * __pointsMultiplier;
            this.formObject.controls['all_discount'].setValue(this.formObject.value['all_discount'] + __pointsToCashDiscount);
            this.__obj['total'] = this.__obj['total'] - __pointsToCashDiscount;
        }
        this.shipping_amount = parseFloat(this.shipping_amount.toString());
        if(isNaN(this.shipping_amount)) this.shipping_amount = 0;
        this.formObject.controls['shipping_by_company'].setValue(!!this.shipping_by_company);
        this.formObject.controls['shipping_amount'].setValue(this.shipping_amount);
        if(this.shipping_by_company){
            this.formObject.controls['shipping_cost'].setValue(this.shipping_amount);
        }else{
            this.__obj['total'] = this.__obj['total'] - this.shipping_amount;
        }
        this.__payAmount = this.__obj['total'] - this.formObject.value.paid;
        this.__countAvailablePointsToCustomer__();
    }

    OnRemovePayment(__index:number):void{
        let __paymenstTemp:Array<any> = [];
        let __paid = this.formObject.value.paid;
        this.formObject.value.payments.forEach((__payment , index) => {
            if(index === __index){
                __paid -= __payment.paid;
                return;
            }
            __paymenstTemp.push(__payment);
        });
        this.formObject.controls['payments'].setValue(__paymenstTemp);
        this.formObject.controls['paid'].setValue(__paid);
        this.__refreshPrices();
    }

    __clearProperties__(__back:boolean = true){
        if(!this._editable || this.__isParkEdit){
            this.searchForm.controls['search'].setValue('');
            this._lastSell = <Sells>this.formObject.value;
            this.submitted = false;
            this.__payAmount = 0;
            this.__discountAmount = 0;
            this.__textArea = '';
            this._variatyProduct = null;
            this._variatiesArr = [];
            this.__orders = [];
            this.__initFormObject__();
            this.__refreshPrices();
            if(this.__isParkEdit){
                this._editable = false;
                this.__param = null;
                this.__isParkEdit = false;
                this.__hasParkNote = false;
                this.__removeParkSellFromArray__(this._lastSell);
            }
            // this.formObject.controls['register_closure'].setValue(this.__register.closure);
            // this.formObject.controls['register'].setValue(this.__register.register);
            // this.formObject.controls['register_id'].setValue(this.__register.register_id);
        }
        if(__back) this.onBackToOrdering();
    }

    private __onSelectTag__(tag:any):void{
        if(this.__tagName === tag.name) return;
        
        this.__tagName = tag.name;
        this.__brandName = '';
        this.__collectionName = '';
        this.__productsPage = 1;
        this.OnToggleSearchType('PRODUCTS' , false);
        this.__retriveProductsTAGSBrandsAndCollections__('PRODUCTS');
    
    }

    private __onSelectBrand__(brand:Brands):void{
        if(this.__brandName === brand.name) return;
        
        this.__brandName = brand.name;
        this.__tagName = '';
        this.__collectionName = '';
        this.__productsPage = 1;
        this.OnToggleSearchType('PRODUCTS' , false);
        this.__retriveProductsTAGSBrandsAndCollections__('PRODUCTS');
    
    }

    private __onSelectCollection__(collection:Collections):void{
        if(this.__collectionName === collection.name) return;
        this.__collectionName = collection.name;
        this.__brandName = '';
        this.__tagName = '';
        this.__productsPage = 1;
        this.OnToggleSearchType('PRODUCTS' , false)
        this.__retriveProductsTAGSBrandsAndCollections__('PRODUCTS');
    
    }

    private __retriveProductsTAGSBrandsAndCollections__(type:string = null):void{
        let __limit:string = this.__pagesLimit.toString();
        if(type === null || type === 'BRANDS'){
            this._http.get('brands?limit='+__limit+'&page='+this.__brandsPage).subscribe(
                (items) => {
                    if(items && items.data){
                        this.__brands = items.data;
                        this.__brandsPages = items.pages;
                    }
                    this._lab.invoiceResize();
                },(error) => {
                    this._lab.invoiceResize();
                    this._lab.__setErrors__(error);
                }
            );
        }
        if(type === null || type === 'TAGS'){
            if(this.__tagsSearchDone) return;
            this._http.get('reports/tags?limit='+__limit+'&page='+this.__tagsPage).subscribe(
                (items) => {
                    if(items && items.data){
                        if(items.error || !items.data){
                            this._lab.invoiceResize();
                            return;
                        }
                        this.__tags = [];
                        let __words:Object = {};
                        for(let i in items.data){
                            if(!items.data[i].tags) continue;
                            let tags:Array<string> = items.data[i].tags.split(',');
                            tags.forEach((val , i) => {
                                if(!__words[val]){
                                    __words[val] = 1;
                                    this.__tags.push({name : val});
                                }else{
                                    __words[val]++;
                                }
                            });
                        }
                        this.__tagsPages = Math.ceil((this.__tags.length / this.__pagesLimit));
                        this.__tagsSearchDone = true;
                    }
                    this._lab.invoiceResize();
                },(error) => {
                    this.__tagsSearchDone = false;
                    this._lab.__setErrors__(error);
                    this._lab.invoiceResize();
                }
            );
        }
        if(type === null || type === 'COLLECTIONS'){
            this._http.get('collections?limit='+__limit+'&page='+this.__collectionsPage).subscribe(
                (items) => {
                    if(items && items.data){
                        this.__collections = items.data;
                        this.__collectionsPages = items.pages;
                    }
                    this._lab.invoiceResize();
                },(error) => {
                    this._lab.invoiceResize();
                    this._lab.__setErrors__(error);
                }
            );
        }
        if(type === null || type === 'PRODUCTS'){
            let __srch:string = '&search=is_main&is_main=true';
            if(this.__tagName !== '') __srch = '&search=is_main-tags&is_main=true&contains=true&tags='+this.__tagName;
            if(this.__brandName !== '') __srch = '&search=is_main-brand&is_main=true&brand='+this.__brandName;
            if(this.__collectionName !== '') __srch = '&search=is_main-collection&is_main=true&collection='+this.__collectionName;

            this._http.get('products?limit='+__limit+'&page='+this.__productsPage+__srch).subscribe(
                (items) => {
                    if(items && items.data){
                        this.__products = items.data;
                        this.__productsPages = items.pages;
                    }
                    this._lab.invoiceResize();
                },(error) => {
                    this._lab.__setErrors__(error);
                    this.__showProducts = true;
                    this._lab.invoiceResize();
                }
            );
        }
    }

    private __continues__(is_msg:boolean = true):boolean{
        // if(this._editable && this.__param && !this.__isParkEdit && this._lastSell.status !== 'parked'){
        //     if(is_msg)
        //         this._lab.__setAlerts__('warn' , 'لايمكنك تعديل الطلبات اللتى تم حفظها مسبقا ... يمكن اضافة الدفع فقط');
        //     return false;
        // }
        return true;
    }

    __getDateNow__():Date{
        let __date:string = '';
        let __now = new Date();
        let __day:number = __now.getDate(); 
        let __month:number = (1 + __now.getMonth());
        if(__day < 10){
            __date += '0';
        }
        __date += __day + '-'; 
        if(__month < 10){
            __date += '0';
        }
        __date += __month + '-' + __now.getFullYear() + ' ' + __now.getHours() + ':' + __now.getMinutes();
        return new Date(__date);
    }

    onAddingGiftCopun():void{
        let __code:string = this.formObject.value.gift_code;
        if(!__code){
            if(this.formObject.value.gift && this.formObject.value.gift.id){
                this._lab.__setAlerts__('warn' , 'الكوبون الذى تم ادخاله غير صحيح');
                this.formObject.controls['gift'].setValue({});
                this.__refreshPrices();
            }
            return;
        }

        this._http.get('gifts?contains=false&limit=1&page=1&search=code&code='+__code).subscribe(
            (item) => {
                if(item && item.data && item.data[0]){
                    let __gift:Gifts = item.data[0];
                    if(__gift.expire_date < new Date()){
                        this.formObject.controls['gift_code'].setValue('');
                        this.formObject.controls['gift'].setValue({});
                        let __temp_loyalty:any = this.formObject.value.loyalty;
                        if(!__temp_loyalty) __temp_loyalty = { };
                        __temp_loyalty['gifted'] = 0;
                        this.formObject.controls['loyalty'].setValue(__temp_loyalty);
                        this.__refreshPrices();
                        return this._lab.__setAlerts__('warn' , 'الكوبون المدخل منتهى الصلاحية');
                    }
                    if(__gift.limit > 0 && __gift.counter >= __gift.limit){
                        this.formObject.controls['gift_code'].setValue('');
                        this.formObject.controls['gift'].setValue({});
                        let __temp_loyalty:any = this.formObject.value.loyalty;
                        if(!__temp_loyalty) __temp_loyalty = { };
                        __temp_loyalty['gifted'] = 0;
                        this.formObject.controls['loyalty'].setValue(__temp_loyalty);
                        this.__refreshPrices();
                        return this._lab.__setAlerts__('warn' , 'الكوبون المدخل بلغ الحد الأعلى لعملية السحب ' + __gift.limit);
                    }
                    let __giftObj:Object = {};
                    __giftObj['id'] = __gift.id;
                    __giftObj['type'] = __gift.type;
                    __giftObj['code'] = __gift.code;
                    if(__gift.type === 'discount') __giftObj['is_percentage'] = __gift.is_percentage;
                    __giftObj['amount'] = __gift.amount;
                    this.formObject.controls['gift'].setValue(__giftObj);
                    this._lab.__setAlerts__('success' , 'تم ادخال الكوبون بنجاح');
                    this.__refreshPrices();
               }else{
                    this.formObject.controls['gift'].setValue({});
                    this.__refreshPrices();
                }
            }
        );
    }

    onCustomerPointsToUseChanged():boolean{
        if(!this._customer){
            this.__customerPointsToUse = 0;
            this.__customerPointsAvailable = 0;
            return false;
        }else if(!this._customer.loyalty){
            this._customer.loyalty = 0;
            this.__customerPointsToUse = 0;
            this.__customerPointsAvailable = 0;
            return false;
        }else{
            this.__customerPointsToUse = 0;
        }
        let __temp_loyalty:any = this.formObject.value.loyalty;
        if(!__temp_loyalty) __temp_loyalty = { };
        if(typeof(this.__customerPointsToUse) !== 'number'){
            this.__customerPointsToUse = parseInt(this.__customerPointsToUse);
            if(isNaN(this.__customerPointsToUse)) 
            {
                this.__customerPointsToUse = 0;
                this._lab.__setAlerts__('error' , 'الرجاء ادخال القيمة الصحيحة');
                this.__countAvailablePointsToCustomer__();
                return false;
            }
        }
        let __limitPoints:number = this._customer.loyalty > 0 ? this._customer.loyalty : 0;
        if(__temp_loyalty.gifted){
            __limitPoints += __temp_loyalty.gifted;
        }
        if(__temp_loyalty.earned){
            __limitPoints += __temp_loyalty.earned;
        }
        if(this._global.getToken()['settings']['loyalty_max_points'] > 0 
        &&__limitPoints > this._global.getToken()['settings']['loyalty_max_points']){
            __limitPoints = this._global.getToken()['settings']['loyalty_max_points'];
        }
        if(this.__customerPointsToUse > __limitPoints){
            this.__customerPointsToUse = __limitPoints;            
            this._lab.__setAlerts__('warn' , 'لايمكن استخدام عدد نقاط أكثر من النقاط المحصلة للزبون');
        }

        __temp_loyalty['spent'] = this.__customerPointsToUse;
        this.formObject.controls['loyalty'].setValue(__temp_loyalty);
        this.__refreshPrices();
        return true;
    }

    private __countSaleEarnedLoyalty(isEndOfSale:boolean = false):void{
        if(!this._global.getToken()['settings']['loyalty_active'] 
        || (this._global.getToken()['settings']['loyalty_count_after_sale'] && !isEndOfSale)){
           return; 
        }
        let __loyalty_by:string= this._global.getToken()['settings']['loyalty_by'];
        let __temp_loyalty:any = this.formObject.value.loyalty;
        if(!__temp_loyalty) __temp_loyalty = {};
        let __for_point:number = this._global.getToken()['settings']['loyalty_nedded_for_point'];
        if(!__for_point) return;
        switch (__loyalty_by) {
            case 'products':
                let __pro_indexes:Array<number> = this._global.getToken()['settings']['loyalty_products'] as Array<number>;
                if(!__pro_indexes || !(__pro_indexes instanceof Array) || __pro_indexes.length === 0) return;
                let __earned:number = 0;
                for(let i:number = 0; i < this.__orders.length; i++){
                    if(__pro_indexes.indexOf(this.__orders[i].controls['product_id'].value) >= 0){
                        __earned += Math.floor(this.__orders[i].controls['quantity'].value / __for_point);
                    }
                };
                __temp_loyalty['earned'] = __earned;
                this.formObject.controls['loyalty'].setValue(__temp_loyalty);
                return;
            //---------------------------------------------------------------------------------
            case 'sells':
                __temp_loyalty['earned'] = 1;
                this.formObject.controls['loyalty'].setValue(__temp_loyalty);
                return;
            //---------------------------------------------------------------------------------
            case 'money':
                __temp_loyalty['earned'] = Math.floor(this.__obj['total'] / __for_point);
                this.formObject.controls['loyalty'].setValue(__temp_loyalty);
                return;
        }
    }

    // __searchProductForLoyaltyPoints(__order:any , __pro_indexes:Array<number>,__temp_loyalty:any):any{
    //     if(__pro_indexes.indexOf(__order.value['product_id'])){
    //         __temp_loyalty['earned'] += Math.floor(__order.value.quantity / this._global.getToken()['settings']['loyalty_money_for_point']);
    //     }
    //     return __temp_loyalty;
    // }

    private __countAvailablePointsToCustomer__(isEndOfSale:boolean = false):void{
        if(!this._global.getToken()['settings']['loyalty_active'] 
        || (this._global.getToken()['settings']['loyalty_count_after_sale'] && !isEndOfSale)){
           return; 
        }
        let __temp_loyalty:any = this.formObject.value.loyalty;
        this.__customerPointsAvailable = this._customer && this._customer.loyalty > 0 ? this._customer.loyalty : 0;
        if(__temp_loyalty.gifted){
            this.__customerPointsAvailable += __temp_loyalty.gifted;
        }
        if(__temp_loyalty.earned){
            this.__customerPointsAvailable += __temp_loyalty.earned;
        }
        if(this.__customerPointsToUse > this.__customerPointsAvailable) this.__customerPointsToUse = this.__customerPointsAvailable;
        this.__customerPointsAvailable -= this.__customerPointsToUse;
    }

    private __onShowCustomerData():void{
        this.__showCustomer = true;
        this.__countSaleEarnedLoyalty();
        this.__countAvailablePointsToCustomer__();
        this.__showModalDetails__('customerandemployees');
    }
}