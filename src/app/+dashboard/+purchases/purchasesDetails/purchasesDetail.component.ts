import { Component , OnInit , OnChanges , AfterViewInit } from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AutocompleteComponent } from './../../../@components';
import { GlobalProvider , LabProvider, RouterTransition } from './../../../@providers';
import { Purchases, Storages, Branches, Suppliers,Journals ,Types, Employees , PurchaseOrders, Products, Brands , Collections , Banks } from './../../../@interfaces';
import { HttpRequestService } from './../../../@services';

declare let $:any;

@Component({
    selector : 'purchases-details',
    templateUrl : './purchasesDetails.html',
    providers : [
        GlobalProvider, 
        LabProvider, 
        HttpRequestService,
    ],
    animations : [RouterTransition('Form')],
    host : {'[@RouterTransition]': ''},
})
export class PurchasesDetailsComponent implements OnInit,AfterViewInit{
    
    private __printPurchase__:boolean = false;
    private __showPurchaseData:any = {};
    private __param:string;
    private __type__:string = 'completed';
    private _editable:boolean = false;
    private submitted:boolean = false;
    private formObject:FormGroup;
    private searchForm:FormGroup;
    private __obj:Object;
    public __search:string;
    public __textArea:string;
    private _lastPurchase:Purchases;
    private _variatyProduct:Products;
    private _supplier:Suppliers = null;
    private _employee:Employees = null;
    private _page:string = 'purchases/';
    private _modal:string = 'purchases';
    private __purchaseDate:Date = new Date();
    private __paidDate:Date = new Date();
    private __hideEmployees:boolean = true;
    private shipping_by_company:boolean = true;
    private shipping_amount:number = 0;
    // private __showShippingData:boolean = false;
    private __showSupplierData:boolean = true;
    private __payAmount:any = 0;
    private __discountAmount:any = 0;
    private __discountType:string = 'AMOUNT';
    private __proDetails:Products = null;

    private __toggleSearch__ = '';
    private __showSearch:boolean = true;
    private __showSupplier:boolean = false;
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


    private __purchaseOrders:FormGroup[] = [];
    private __newPurchaseNumber:number = -1;
    private __parkPurchases:Purchases[] = [];
    private __foundParkPurchases__:string = 'NOACTION';
    private __units:Object = {};
    private __units_main_id:Object = {};
    private __units_count:number;
    private __showSide:string = 'PURCHASEORDER';
    private __isParkEdit:boolean = false;
    private __stopQtyAlerts:Object = {};
    private __stopExpAlerts:Object = {};
    private __paid_arr_backup:Array<Object> = [];

    private __chosenBankID:number;
    // private _journal:Journals;
    private __branches:Branches[];
    private __storagesArray:Storages[] = [];
    private __quantityDir__:string = 'store';
    private __quantityDirID__:number = 0;

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
        this._lab.prepareDiscountPopover();
        this._lab.__setOrdersShortCuts__(this , "PURCHASE");
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
                this.addProductToPurchaseOrders(<Products>$event.item);
                break;
            case 'supplier':
                if(!$event.item) return this._supplier = null;
                this._supplier = $event.item;
                this.formObject.controls['supplier'].setValue($event.item.name);
                this.formObject.controls['supplier_code'].setValue($event.item.code);
                this.formObject.controls['supplier_id'].setValue($event.item.id);
                this.OnToggleSearchType('PRODUCTS' , false);
                break;
            case 'employee':
                if(!$event.item) return this._employee = null;
                this._employee = $event.item;
                this.formObject.controls['employee'].setValue($event.item.name);
                this.formObject.controls['employee_id'].setValue($event.item.id);
                break;
            
            case 'showPurchaseOrder':
                this.__showSide = 'PURCHASEORDER';
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

    OnAddSupplier():void{
        this.__showModalDetails__('suppliers')
    }
    
    OnSuppliersAdded($event:any):void{
        if($event.item) this._supplier = $event.item;
    }

    OnRemoveSupplier():void{
        if(!this.__continues__()) return;
        this._supplier = null;
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

    addProductToPurchaseOrders(__product:Products = null , __qty:number = 1, refill:boolean = false):void{
        if(!this.__continues__()) return;
        else if(this._global.getToken()['supplier_required'] &&(!refill 
        && (!this._supplier || !this.formObject.value['supplier_id']))){
            return this._lab.__setAlerts__('error' , 'يجب اختيار المورد لاتمام فاتورة الشراء');
        }
        this.__beepAddingProduct();
        let __index:number = this.__tryAppendProduct(__product , __qty);
        if(__index > -1) {
            this.__refreshPurchaseOrderPrices(this.__purchaseOrders[__index - 1]);
        }
    };

    __beepAddingProduct():void{
        if(this._global.getToken()['settings']['is_beep'])
            this._lab.__beepAddingProduct__();
    }

    __tryAppendProduct(__product:Products , __qty:number = 1):number{
        let __index:number = -1;
        let __returnIndex:boolean = true;
        let __match:boolean = false;
        this._lab.jQuery('input.form-control.order-search.autofocus').focus();
        for(let index = 0; index < this.__purchaseOrders.length ; index++){
            if(this.__purchaseOrders[index].controls['product_id'].value !== __product.id) continue;
            __match = true;
            __qty += this.__purchaseOrders[index].controls['quantity'].value;
            __index = index;
            break;
        }
        // if(__product.is_product && this._global.getToken()['settings']['is_notify_expired'] && !this.__stopExpAlerts[__product.id.toString()]){
        //     if(__product.has_expire_date && (new Date() <= new Date())){
        //         var __expire:any = __product.expire_date;
        //         __expire = new Date(__expire);
        //         if(__expire <= new Date()){
        //             if(!confirm('الصنف الذى طلبته منتهى الصلاحية\nهل تريد الاستمرار فى عملية الشراء')){
        //                 return;
        //             }else{
        //                 this.__stopExpAlerts[__product.id.toString()] = true;
        //             }
        //         }
        //     }
        // }
        if(__match && this._global.getToken()['settings']['is_append_products']){
            this.__purchaseOrders[__index].controls['quantity'].setValue(__qty);
            this.onUpdatePurchaseOrder(this.__purchaseOrders[__index]);
            return (__index + 1);
        // }else{
            // if(__product.is_product && !__match && this._global.getToken()['settings']['is_notify_expired'] && !this.__stopExpAlerts[__product.id.toString()]){
            //     if(__product.has_expire_date && (new Date() <= new Date())){
            //         var __expire:any = __product.expire_date;
            //         __expire = new Date(__expire);
            //         if(__expire <= new Date()){
            //             if(!confirm('الصنف الذى طلبته منتهى الصلاحية\nهل تريد الاستمرار فى عملية الشراء')){
            //                 return -1;
            //             }else{
            //                 this.__stopExpAlerts[__product.id.toString()] = true;
            //             }
            //         }
            //     }
            // }
        }
        if(__match){
            this._lab.jQuery('input.form-control.order-search.autofocus').focus();
            return this.__purchaseOrders.push(this.__createPurchaseOrderFormGroup__(__product , true , 1));
        }
        else{
            this._lab.jQuery('input.form-control.order-search.autofocus').focus();
            return this.__purchaseOrders.push(this.__createPurchaseOrderFormGroup__(__product , true , __qty ));
        }
    }

    onFocusPurchaseOrder(form:FormGroup , __id:number){
        if(!this.__continues__()) return;
        this.__purchaseOrders.forEach((__form) => {
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
        this.__purchaseOrders[__id].controls['focus'].setValue(!this.__purchaseOrders[__id].controls['focus'].value);
        let __self:PurchasesDetailsComponent = this;
        setTimeout(()=> {
            if(this.__purchaseOrders[__id].controls['focus'].value) __self._lab.jQuery('.purchaseOrder_' + __id.toString() + ' .form-control.autofocus').focus();
        } , 200);
    }

    onUpdatePurchaseOrder(form:FormGroup , from:string = null):void{
        if(!this.__continues__()) return;
        this.__refreshPurchaseOrderPrices(form , from);
    }

    onRevemoPurchaseOrder(form:FormGroup , index:number):void{
        if(!this.__continues__()) return;
        let __tempPurchaseOrders:FormGroup[] = [];
        this.__purchaseOrders.forEach((__form , __index)=>{
            if(__index === index) return;
            __tempPurchaseOrders.push(__form);
        });
        this.__purchaseOrders = __tempPurchaseOrders;
        this.__refreshPrices();
    }

    onParkPurchaseOrders():void{
        if(this.formObject.value.status === 'parked'){
                return this._lab.__setAlerts__('warn' , 'الفاتورة محفوظة مسبقا كفاتورة مؤقت');
        }
        if(this.__purchaseOrders.length === 0){
            return this._lab.__setAlerts__('warn' , 'لايوجد لديك طلبات لركنها و حفظها كمسودة ');
        }
        if(false === this.formObject.valid) {
            if(this.formObject.controls['number'].valid !== true)
                if(this.__type__ === 'returned')
                    return this._lab.__setAlerts__('error' , 'يجب كتابة رقم الفاتورة المعادة للحفظ كمسودة');
                else
                    if(this.__newPurchaseNumber > 0){
                        this.formObject.controls['number'].setValue(this.__newPurchaseNumber);
                    }else{
                        this.__createNewDetails__();
                    }
        }
        this.formObject.controls['status'].setValue('parked');
        this.onCompletePayment('',true , (values) => {
            if(this.__purchaseOrders && this.__purchaseOrders.length){
                let __purchaseOrders:PurchaseOrders[] = [];
                this.__purchaseOrders.forEach((purchaseOrder , index) => {
                    __purchaseOrders.push(purchaseOrder.value);
                });
                this.formObject.controls['purchaseOrders'].setValue(__purchaseOrders);
            }
            this.__parkPurchases.push(values);
            this._lab.jQuery('#show-purchase-details-modal button.close').click();
            this._lab.jQuery('input.form-control.order-search.autofocus').focus();
        });
    }

    onRemoveAllPurchaseOrders():void{
        if(!this.__continues__()) return;
        this.__purchaseOrders = [];
        this.formObject.controls['payments'].setValue([]);
        this.__refreshPrices();
    }

    OnSubmitForm(values:Purchases,valid:boolean):void{
        this.submitted = true;
        let __status:string = this.__type__;
        if(false === valid) {
            if(this.formObject.controls['number'].valid !== true)
                if(__status === 'completed')     
                    this._lab.__setAlerts__('error' , 'الرجاء كتابة رقم الفاتورة المعادة');
            else            
                this._lab.__setAlerts__('error' , 'الرجاء التأكد من الملاحظات الجانبية لكل حقل و تجنب الاخطاء لاتمام العملية');
            return;   
        }
        this._http.get(this._page + '?contains=false&limit=1&page=1&search=number-status-&number='
        + this.formObject.value.number + '&status=' + __status).subscribe(
            (item) => 
            {
                if(item.error !== null){
                    this._lab.__setErrors__(item.error);
                    return;
                }
                if(__status === 'completed'){
                    if((item.data && item.data.length === 1 && item.data[0].number === this.formObject.value.number)) {
                        if((item.data[0].id !== this.formObject.value.id)){
                            this._lab.__setAlerts__('warn' , 'رقم الفاتورة موجود مسبقا ... يرجى التأكد من رقم الفاتورة و الحالة (مبيعات أو اعادة طلبات)');
                            this.formObject.controls['number'].setErrors({'rule' : 'purchase number is already exists'});
                            return;
                        }
                    }
                }else{
                    if((item.data && item.data.length > 0)) {
                        this._lab.__setAlerts__('warn' , 'رقم الفاتورة موجود مسبقا ضمن  قائمة الطلبات المعادة)');
                        this.formObject.controls['number'].setErrors({'rule' : 'purchase number is already exists'});
                        return;
                    }
                }
                this._lab.jQuery('#show-purchase-details-modal button.close').click();
                this._lab.jQuery('input.form-control.order-search.autofocus').focus();
            },
            (error) => { 
                this._lab.__setErrors__(error);
            },
            ()=> { }
        );
    }

    onPayClick():void{
        if(this.__continues__()){
            if(this.formObject.controls['number'].valid !== true){
                if(this.__type__ === 'returned'){
                    this._lab.__setAlerts__('error' , 'عليك كتابة رقم الفاتورة فى حالة ركن اعادة طلبات');
                    this.__showModalDetails__();
                    return;
                }else{

                    if(this.__newPurchaseNumber > 0)
                        this.formObject.controls['number'].setValue(this.__newPurchaseNumber);
                    else
                        this.__createNewDetails__();
                    // }
                }
            }

            if(this.__purchaseOrders.length === 0){
                this._lab.__setAlerts__('error' , 'عليك اضافة الطلبات أولا لتتمكن من اتمام عملية الدفع');
                return;
            }
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
        this._lab.jQuery('.PayDetails div.pay-items').css({ 'max-height':__height.toString() + 'px' ,'height' :__height.toString() + 'px' }); 
        let __self:PurchasesDetailsComponent = this;
        setTimeout(function() {
            __self._lab.jQuery('.PayDetails .pay-side ._paycontrol_').focus()
        }, 200);
    }

    onBackToPurchaseOrdering():void{
        this.__showSide = 'PURCHASEORDER';
        this._lab.jQuery('.PayDetails').removeClass('bounce');
        let __self:PurchasesDetailsComponent = this;
        setTimeout(function() {
            __self._lab.jQuery('.mainDetails .order-search-side form .form-group input.order-search').focus();
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

    onCompletePayment(type:string , __save:boolean = false , cb:Function = null):void{
        if(!this.__continues__(false)) return this.onCompletePaymentUpdate(type);

        let __continue:boolean = true;        
        let __purchaseOrders:Array<PurchaseOrders> = [];
        let __products:Array<Products> = [];

        let __didPayOut:boolean = false;
        if(type !== '') this.formObject.controls['status'].setValue(this.__type__);
        __didPayOut = this.__payAmountMethod__(type);
        if(!__didPayOut) return;

        if(this.__continues__(false)){
            this.__purchaseOrders.forEach((form , index) => {
                if(!form.valid) {
                    form.controls['focus'].setValue(true);
                    __continue = false;
                    return;
                }
                let __value = <PurchaseOrders>form.value;
                if(__value.product) {
                    __products.push(<Products>__value.product);
                    delete __value.product;

                }
                let __types_main_id:number = parseInt(__value.type_main_id.toString());
                __value.type_main_id = isNaN(__types_main_id) ? 0 : __types_main_id;
                __purchaseOrders.push(__value);
            });
        }

        this.formObject.controls['costs'].setValue(this.__obj['cost']);
        this.formObject.controls['prices'].setValue(this.__obj['price']);
        this.formObject.controls['discounts'].setValue(this.__obj['discount']);
        this.formObject.controls['taxes'].setValue(this.__obj['tax']);
        this.formObject.controls['totals'].setValue(this.__obj['total']);
        this.formObject.controls['count'].setValue(__purchaseOrders.length);
        this.formObject.controls['purchaseOrders'].setValue(__purchaseOrders);

        if(!__continue){
            this._lab.__setAlerts__('error' , 'الرجاء التأكد من الاخطاء الموجودة بقائمة طلباتك');
            return;
        }
        this.formObject.controls['park_completed'].setValue(this.__type__ === 'completed');
        this.formObject.controls['description'].setValue(this.__textArea);
        let __obj;
        let __values:any = this.formObject.value;

        if((this._editable && this.__param)){
            __obj = this._http.put(this._page + this.__param ,__values);
        }else{
            // this.__setCosts__(__values);
            // if(__values.length !== 1) return;
            if(!this.formObject.value.date || (this.formObject.value.date instanceof Date
            && isNaN(this.formObject.value.date.getDay()))) {
                this.formObject.controls['date'].setValue(new Date());
                __values['date'] = new Date();
            }else if(typeof this.formObject.value.date === 'string'){
                this.formObject.controls['date'].setValue(new Date(<any>this.formObject.value.date));
                __values['date'] = this.formObject.value.date;
            }

            if(!this.formObject.value.paid_date || (this.formObject.value.paid_date instanceof Date 
            && isNaN(this.formObject.value.paid_date.getDay()))) {
                this.formObject.controls['paid_date'].setValue(new Date());
                __values['paid_date'] = new Date();
            }else if(typeof this.formObject.value.paid_date === 'string'){
                this.formObject.controls['paid_date'].setValue(new Date(<any>this.formObject.value.paid_date));
                __values['paid_date'] = this.formObject.value.paid_date;
            }
            __obj = this._http.post(this._page ,__values);
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
                    this.onBackToPurchaseOrdering();    
                    this._lab.__setErrors__(items.error);
                    return;
                }
                if(cb) cb(items.data);
                if(!this._editable || this.__isParkEdit) {
                    if(this.__isParkEdit){
                        this._lab.__setAlerts__('success' , 'لقد تم اضافة الطلبات لقائمة الطلبات المحفوظة');
                    }else{
                        this._lab.__setAlerts__('success' , 'لقد تم اضافة الطلبات ... يمكنك اضافة قائمة أخرى');
                    }


                    if(this._global.getToken()['settings']['is_show_invoice']){
                        // this.__showModalDetails__('showSalePaper', { backdrop : 'static' });
                        let self:PurchasesDetailsComponent = this;
                        this.__showPurchaseData = {
                            item : items.data,
                            purchaseOrders : __purchaseOrders,
                            supplier : this._supplier,
                            employee : this._employee
                        }
                        this.__showSide = 'PRINT';
                        self.__printPurchase__ = false;
                        setTimeout(function() {
                            // self.__printPurchase__ = true;
                            // if(self._global.getToken()['settings']['is_print_by_thermal']){
                            //     // Print receipt Here Ahmed
                            //     // this._lab.jQuery('#show-sale-details-modal input.autofocus').focus(); 
                            //     this._lab.jQuery('.modal-header button.close').click(function(e){
                            //         this.__showSide = 'PURCHASEORDER';
                            //         this._lab.jQuery('input.form-control.order-search.autofocus').focus();
                            //         this.__clearProperties__();
                            //         this.__createNewDetails__();
                            //     });
                            // }
                            self.__clearProperties__(false);
                            self.__createNewDetails__();
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
                        if(this._lastPurchase.status === 'parked' && __didPayOut){
                            this._lab.__setAlerts__('success' , 'لقد تم اضافة الدفع للفاتورة رقم  #' + this.formObject.value.number);
                            this.__createNewDetails__();
                        }else{
                            this._lab.__setAlerts__('success' , 'لقد تم تعديل الطلبات للفاتورة رقم  #' + this.formObject.value.number);
                        }
                    this._lastPurchase = items.data;
                }
            },
            (error) => {
                this._lab.__setAlerts__(error);
                let __paidarr:Array<Object> = this.formObject.value.payments;
                __paidarr.pop();
                this.formObject.controls['payments'].setValue(__paidarr);
                this.onBackToPurchaseOrdering();
            },() => {
            }
        );
    }

    __updateCosts__(__values:any):void{
    }

    // __setCosts__(__values:any):void{
    //     // ==================== IF AVRAGE COSTS =================================
    //     if(this._global.getToken()['settings']['handle_costsddds'] !== 'avrage'){
    //         let __costsArr:Array<any> = [];
    //         this.__purchaseOrders.forEach((item , index) => {
    //             if(!item['product'] || item['product'] === item['cost']) return;
    //             let __cost:number = (item['cost'] * item['amount']);
    //             if(this.formObject.value['status'] === 'returned') __cost = -__cost;
    //             let __oldCost:number = (item['product']['stock'] * item['product']['cost']);
    //             __cost = ((item['costs'] + __oldCost) / (item['product']['stock'] + item['amount']))
    //             let __costObj:Object = {
    //                 amount : (item['amount'] + item['product']['stock']),
    //                 cost : __cost,
    //                 id : item['product_id']
    //             }
    //             __costsArr.push(__costObj);
    //         });
    //         if(__costsArr.length > 0) __values['avrage_costs'] + JSON.stringify(__costsArr);
    //     }
    //     // ==================== ENDIF AVRAGE COSTS ==============================
    // }

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
                    this.onBackToPurchaseOrdering();    
                    this._lab.__setErrors__(items.error);
                    this.__resetPayment();
                    return;
                }
                this.onBackToPurchaseOrdering();
                this._lab.__setAlerts__('success' , 'لقد تم تعديل الدفع للطلب رقم  #' + this.formObject.value.number);
            },
            (error) => {
                this._lab.__setAlerts__('error' , 'حدث خطأ ... الرجاء اعادة عملية الدفع');
                this.formObject.controls['payments'].setValue(this.__paid_arr_backup);
                this.__resetPayment();
                this.onBackToPurchaseOrdering();
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

        if(__payAmount > (this.__obj['total'] - this.formObject.value.paid)){
            this._lab.__setAlerts__('warn' , 'لايمكن دفع أكثر من المبلغ المطلوب');
            return false;
        }


        if(__paid < 0 ){
            this._lab.__setAlerts__('warn' , 'لايمكن ارجاع أكثر من المبلغ المستلم من قبل الزبون');
            return false;
        }


        if(this.__payAmount !== 0){
            let __paid_item:Object ={
                from : 'Purchase',
                by   : type,
                paid : __payAmount,
                debt : (this.formObject.value.totals - (__payAmount + this.formObject.value.paid)),
                date : Date.now()
            };

            if(type === 'BANK' && this.__chosenBankID){
                this.__chosenBankID = parseInt(this.__chosenBankID.toString());
                for(let i=0; i < this.__banks.length; i++){
                    if(this.__banks[i].id !== this.__chosenBankID) continue;
                    __paid_item['bank'] = this.__banks[i].name;
                    __paid_item['account_number'] = this.__banks[i].number;
                }
                this._lab.jQuery('#show-purchase-details-modal button.close').click();
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
        this.__branches = <Branches[]>this._global.getResource('branches');
        if(this.__branches.length > 1){
            this._lab.__setAlerts__('warn' , 'عليك مزامنة الفرع المسؤؤل عن عملية الشراء فقط');
            this._global.navigatePanel(this._page.replace('/' , ''));
        }
        
        this.__storagesArray = <Storages[]>this._global.getResource('storages') || [];
        
        this.__quantityDir__ = <string>this._global.getResource('quantity_dir');
        if(!this.__quantityDir__) this.__quantityDir__ = 'store';
        let __quantity_dir_id:number = <number>this._global.getResource('quantity_dir_id') || null;
        if(isNaN(__quantity_dir_id) || __quantity_dir_id <= 0 
        || this.__quantityDir__ === 'store' || !this.__storagesArray.length){
            this.__quantityDir__ = 'store';
            this._global.setResource('store' , 'quantity_dir');
            this._global.setResource( 0 , 'quantity_dir_id');
        }else{
            let __found:boolean = false;
            for(let i:number = 0; i < this.__storagesArray.length; i++){
                if(this.__storagesArray[i].id === __quantity_dir_id){
                    this.__quantityDir__ = 'storage';
                    this._global.setResource('storage' ,'quantity_dir');
                    this._global.setResource(__quantity_dir_id ,'quantity_dir_id');
                    __found = !__found;
                    break;
                }
            }
            if(!__found){
                this.__quantityDir__ = 'store';
                this._global.setResource('store' , 'quantity_dir');
                this._global.setResource( 0 , 'quantity_dir_id');
            }
        }
        this.OnToggleSearchType('PRODUCTS');
        this.alphanumdashed = this._global.config["alphanumdashed"];
        this.nameRegex= this._global.config["nameRegex"];
        this.noteRegex= this._global.config["noteRegex"];
        this.intRegex = this._global.config["intRegex"];
        this.floatRegex= this._global.config["floatRegex"];
        this.priceRegex= this._global.config["priceRegex"];
        this.postRegex= this._global.config["postRegex"];
        this.__initFormObject__();
        
        this.__obj = {
            total : 0,
            price : 0,
            tax : 0,
            discount : 0,
            cost : 0,
        };
        this.__getRouterParamsData__();
    }

    private __initFormObject__():void{
        this.formObject = this._fb.group({
            branch_id          : [ this._global.getResource('branches')[0].id, [ Validators.required , Validators.pattern(this.intRegex)]],
            id                 : [ 0 , Validators.pattern(this.intRegex)],
            number             : [ 1 , [Validators.required, Validators.pattern(this.intRegex)]],
            // page               : [ this._journal.page , [Validators.required , Validators.pattern(this.intRegex)]],
            notebook_number    : [ 1 , [Validators.required, Validators.pattern(this.intRegex)]],
            handler            : ['' , Validators.pattern(this.alphanumdashed)],
            supplier           : ['' , Validators.pattern(this.nameRegex)],
            supplier_code      : [ ],
            supplier_id        : [ 0 , Validators.pattern(this.intRegex)],
            employee           : ['' , Validators.pattern(this.nameRegex)],
            employee_id        : [ 0 , Validators.pattern(this.intRegex)],
            count              : [ 0 , Validators.pattern(this.floatRegex)],
            // gift_code          : ['' , Validators.pattern(this.alphanumdashed)],//check on server history may outdate when update
            // gift               : [ {} ],
            costs              : [ 0 , Validators.pattern(this.priceRegex)],
            prices             : [ 0 , Validators.pattern(this.priceRegex)],
            taxes              : [ 0 , Validators.pattern(this.priceRegex)],
            discounts          : [ 0 , Validators.pattern(this.priceRegex)],
            all_discount       : [ 0 , Validators.pattern(this.priceRegex)],
            shipping_amount    : [ 0 , Validators.pattern(this.priceRegex)],
            shipping_by_company: [ this._global.getToken()['settings']['free_shipping'] ],
            shipping_cost      : [ 0 , Validators.pattern(this.priceRegex)],
            totals             : [ 0 , Validators.pattern(this.priceRegex)],

            quantity_dir       : [ this.__quantityDir__ , [Validators.required , Validators.pattern(this.nameRegex)]],
            quantity_dir_id    : [ this._global.getResource('quantity_dir_id') , [Validators.required , Validators.pattern(this.intRegex)]],

            paid               : [ 0 , Validators.pattern(this.priceRegex)],
            payments           : [ [] ],
            status             : [ 'completed' ],
            park_completed     : [ true ],

            date               : [ new Date() , Validators.nullValidator ],
            paid_date          : [ new Date() , Validators.nullValidator ],
            createdAt          : ['' , Validators.nullValidator ],
            updatedAt          : ['' , Validators.nullValidator ],
           
            description        : ['' , Validators.pattern(this.noteRegex)],
            parked_msg         : ['' , Validators.pattern(this.noteRegex)],
            parent_id          : ['' , Validators.pattern(this.intRegex)],
            company_id         : ['' , Validators.pattern(this.intRegex)],
            author_id          : ['' , Validators.pattern(this.intRegex)],
            purchaseOrders            : [[]]
        });

        if(!this.__continues__ && this._supplier){
            this.formObject.controls['supplier'].setValue(this._supplier.name);
            this.formObject.controls['supplier_code'].setValue(this._supplier.code);
            this.formObject.controls['supplier_id'].setValue(this._supplier.id);
        }
    }

    private __getRouterParamsData__(purchase:Purchases = null):void{
        this._lab.__setGlobal__(this._global);
        if(purchase && purchase.id && purchase.id > 0){
            this._editable = true;
            this.__param = purchase.id.toString();
            this.__isParkEdit = true;
            for(let key in purchase){
                if(purchase[key] !== null && this.formObject.value.hasOwnProperty(key)){
                    this.formObject.controls[key].setValue(purchase[key]);
                }
            }

            if(this._employee){
                this.formObject.controls['employee'].setValue(this._employee.name);
                this.formObject.controls['employee_id'].setValue(this._employee.id);
            }else{
                this.formObject.controls['employee'].setValue('');
                this.formObject.controls['employee_id'].setValue(0);
            }

            this.__textArea = this.formObject.value['description'];
            this._lastPurchase = <Purchases>purchase;
            if(this.formObject.value.parked_msg){
                this.__hasParkNote = true;
                this.__showModalDetails__('parkMsg');
            }else
            {
                if(this._global.getToken()['settings']['is_show_invoice_details']){
                    this.__showModalDetails__('purchases');
                    let __self:PurchasesDetailsComponent = this;
                    setTimeout(()=>{
                        __self._lab.jQuery('#show-purchase-details-modal input.autofocus').focus();
                    },500);
                }
            }
            this.__type__ = this.formObject.value.park_completed ? 'completed' : 'returned';
            this.formObject.controls['status'].setValue(this.__type__);
            if(purchase.supplier_id && purchase.supplier_id > 0) {
                this.__getSupplierAndEmployee__(true,false);
            }
            if(purchase.purchaseOrders && purchase.purchaseOrders.length > 0){
                this.__purchaseOrders = [];
                (<Array<PurchaseOrders>>purchase.purchaseOrders).forEach((purchaseOrder,index)=>{
                    this.__purchaseOrders.push(this.__createPurchaseOrderFormGroup__(purchaseOrder,false));
                });
                this.__refreshPrices();
            }else{
                this.__retrivePurchaseOrders__();
            }
        }else if(this._route.params['value'] && this._route.params['value']['id'] &&
            this._global.config['intRegex'].test(this._route.params['value']['id'])){ 
            this.__param = this._route.params['value']['id'];
            this._editable = true;
            this.__isParkEdit = false;
            this.__hasParkNote = false;
            this._http.get(this._page + this.__param).subscribe(
                (item) => {
                    if(item.error !== null || !item.data || item.data.length === 0) { 
                        this._global.navigatePanel('purchases');
                        return;
                    }
                    for(let key in item.data){
                        if(item.data[key] !== null && this.formObject.value.hasOwnProperty(key)){
                            this.formObject.controls[key].setValue(item.data[key]);
                        }
                    }
                    this.__textArea = this.formObject.value['description'];
                    this._lastPurchase = <Purchases>item.data;
                    if(this.formObject.value.status === 'parked' && this.formObject.value.parked_msg && this._lastPurchase.parked_msg !== ''){
                        this.__hasParkNote = true;
                        this.__showModalDetails__('parkMsg');
                    }else
                    {
                        if(this._global.getToken()['settings']['is_show_invoice_details']){
                            this.__showModalDetails__('purchases');
                            let __self:PurchasesDetailsComponent = this;
                            setTimeout(()=>{
                                __self._lab.jQuery('#show-purchase-details-modal input.autofocus').focus();
                            },500);
                        }
                    }
                    this.__type__ = this.formObject.value.park_completed ? 'completed' : 'returned';
                    this.formObject.controls['status'].setValue(this.__type__);
                    this.__getSupplierAndEmployee__();
                    this.__retrivePurchaseOrders__();
                },
                (response) => { 
                    this._lab.__setAlerts__('warn' , 'يبدو أن الفاتورة اللتى طلبت غير متوفرة أو تم ازالتها')
                    setTimeout(() => {
                        this._global.navigatePanel('purchases');
                    } , 2000);
                },
                () => {}
            );
        }else{
            let __queryParams:any = this._router.routerState.root.queryParams['value'];
            if(!__queryParams || __queryParams.length === 0 || !__queryParams['id']){
                let __baseurl:string = this._router.url;
                let __baseArray:Array<string> = __baseurl.split('?');
                if(__baseArray.length === 2){
                    let __queryArray:Array<string> = __baseArray[1].split('&');
                    __queryParams = {};
                    __queryArray.forEach((value , index) => {
                        let __splitter:Array<string> = value.split('=');
                        if(__splitter.length !== 2) return;
                        __queryParams[__splitter[0]] = __splitter[1];    
                    });
                }
            }
            if(__queryParams && __queryParams['id'] && __queryParams['q'] && __queryParams['q'] === 'refill'){
                let __id:number = __queryParams['id'] ? parseInt(__queryParams['id']) : null;
                let __amount:number = __queryParams['amount'] ? parseFloat(__queryParams['amount']) : null;
                if(__id && __id > 0 &&  __amount && __amount > 0){
                    this._http.get('products/'+__id).subscribe(
                        (response) => {
                            if(response && response.data){
                                if(!this._supplier){
                                    this._lab.__setAlerts__('warn' , 'من الأفضل اختيار المورد للطلب');
                                }
                                let __product:Products = <Products>response.data;
                                this.addProductToPurchaseOrders(__product , __amount);
                            }else{
                                this._lab.__setAlerts__('warn' , 'الصنف الذى طلبت غير موجود فى قائمة الأصناف حاليا');
                            }
                        },
                        (error) => { this._lab.__setErrors__(error); }
                    );
                }
            }
            this._lab.jQuery('input.form-control.order-search.autofocus').focus();
            this.__createNewDetails__();
        }
    }

    __checkParkPurchases__():void{
        if(this.__foundParkPurchases__ !== 'NODATA'){
            this.__getMoreParkPurchases(true);
        }
        this.__showModalDetails__('parkpurchases');
    }

    __getMoreParkPurchases(first:boolean = false):void{
        // if(this.__parkPurchases.length < this._global.getToken['settings']['perpage']) return;
        let __page:number = first ? 1 : (Math.ceil(this.__parkPurchases.length / this._global.getToken()['settings']['perpage']) + 1);
        let __URL__:string = 'purchases/?sortby=id&sort=DESC&search=status&status=parked';
        __URL__ += '&limit='+this._global.getToken()['settings']['perpage'];
        __URL__ += '&page=' + (Math.ceil(this.__parkPurchases.length / this._global.getToken()['settings']['perpage']) + 1);
        this._http.get(__URL__).subscribe(
            (items) => {
                if(items.error){
                    this._lab.__setAlerts__('error' , 'عذرا يوجد خطأ فى عملية الطلب');
                } else if(items.data && items.data instanceof Array && items.data.length > 0){
                    this.__foundParkPurchases__ = 'HASDATA';
                        for(let i=0; i < items.data.length; i++){
                            this.__parkPurchases.push(items.data[i]);
                        }
                }else{
                    if(items.data.length === 0){
                        return this._lab.__setAlerts__('warn' , 'لايوجد طلبات أخرى لاظهارها');
                    }
                    this.__foundParkPurchases__ = 'NODATA';
                }
            },(errorr)=>{
                this._lab.__setAlerts__('error' , 'الرجاء التأكد من سلامة الاتصال');
            },() => {}
        );
    }

    __onParkedPurchaseAction(purchase:Purchases , action:string):void{
        switch (action) {
            case 'DELETE':
                if(purchase.id > 0) return;
                this._http.delete('purchases/' + purchase.id).subscribe(
                    (item) => {
                        if(item.error){
                            return this._lab.__setErrors__(item.error);
                        }
                        if(item.data){
                            this.__removeParkPurchaseFromArray__(purchase);
                        }
                    }
                );
                break;
            case 'EDIT':
                this.__clearProperties__();
                this.__getRouterParamsData__(purchase);
                break;
            default:
                break;
        }
    }

    private __removeParkPurchaseFromArray__(purchase:Purchases):void{
        let __purchases:Array<Purchases> = Object['assign']([] , this.__parkPurchases);
        this.__parkPurchases = [];
        __purchases.forEach((__purchase , index) => {
            if(__purchase.id !== purchase.id){
                this.__parkPurchases.push(__purchase);
            }
        });
    }

    private __initPurchaseOrderInformations__():void{
        if(this._editable && this.__param) return;

        this._http.get(this._page + '?limit=1&page=1').subscribe(
            (item) => {
                if(item.error !== null || !item.data || item.data.length === 0)
                    return this.__createNewDetails__();
                this._lastPurchase = <Purchases>item.data[0];
                if(this._lastPurchase.status === 'incompleted' || this._lastPurchase.status === 'parked'){
                    for(let key in this._lastPurchase){
                        if(this._lastPurchase[key] !== null && this._lastPurchase[key] !== undefined && this.formObject.value.hasOwnProperty(key)){
                            this.formObject.controls[key].setValue(this._lastPurchase[key]);
                        }
                    }
                    if(this.formObject.value.count > 0)
                    {
                        this.__retrivePurchaseOrders__();
                        if(this._global.getToken()['settings']['is_show_invoice_details']){
                            this.__showModalDetails__('purchases');
                            let __self:PurchasesDetailsComponent = this;
                            setTimeout(()=>{
                                __self._lab.jQuery('#show-purchase-details-modal input.autofocus').focus();
                            },500);
                        }
                    }
                    return;
                }else{
                    this.__createNewDetails__();                    
                }
            },(error) => {
                this._lab.__setErrors__(error);
                setTimeout(() => {
                    this._global.navigatePanel('purchases');
                } , 2000);
            },() => { }
        );
    }

    private __createNewDetails__():void{
        this._http.get(this._page  + 'next').subscribe(
            (next) => {
                if(next.data && next.data.number && next.data.number > 0) {
                    this.formObject.controls['number'].setValue(next.data.number);
                    this.__newPurchaseNumber = next.data.number;
                }else{
                    this.formObject.controls['number'].setValue(1);
                    this.__newPurchaseNumber = 1;
                }
                if(this._global.getToken()['settings']['is_show_invoice_details']){
                    this.__showModalDetails__('purchases');
                    let __self:PurchasesDetailsComponent = this;
                    setTimeout(()=>{
                        __self._lab.jQuery('#show-purchase-details-modal input.autofocus').focus();
                    },500);
                }
            },(error) => {
                this._lab.__setErrors__(error);
                setTimeout(() => {
                    this._global.navigatePanel('purchases');
                } , 2000);
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
                };
            },(error) => {
                this.__units_count = -1;
            },() => { }
        );
    }

    private __getSupplierAndEmployee__(cus:boolean=true,emp:boolean=true){
        if(cus && !this._supplier){
            if(this.formObject.value.supplier_id || this.formObject.value.supplier_id > 0){
                this._http.get('suppliers/' + this.formObject.value.supplier_id).subscribe(
                    (item) => {
                        if(item.data && !item.error)
                            this._supplier = <Suppliers>item.data;
                            this.formObject.controls['supplier_code'].setValue(this._supplier.code);
                            this.formObject.controls['supplier'].setValue(this._supplier.name);
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

    __retrivePurchaseOrders__():void{
        if(!this._editable || !this.__param) return;
        let __url:string = '';
        __url = 'purchaseOrders/?search=father_id&father_id=' + this.formObject.value.id + '&contains=false';
        this._http.get(__url).subscribe(
            (items) => {
                if(!items.error === null || !items.data || items.data.length === 0 
                && (this.formObject.value.status === 'parked' || this.formObject.value.status === 'incompleted')){
                    this._lab.__setAlerts__('error' , 'فشل فى عملية جلب قائمة الطلبات يرجى التأكد من سلامة الاتصال  و اعادة الطلب مرة أخرى')
                    return;
                }

                this.__purchaseOrders = [];
                (<Array<PurchaseOrders>>items.data).forEach((purchaseOrder,index)=>{
                    this.__purchaseOrders.push(this.__createPurchaseOrderFormGroup__(purchaseOrder , false));
                });
                this.__refreshPrices();
            },(error) => { this._lab.__setErrors__(error);
            },() => {}
        );
    }

    __showModalDetails__(modal:string = 'purchases'){
        this._modal = modal;
        this._lab.__modal('#show-purchase-details-modal', {
            // backdrop: 'static'
        });
        if(this._modal === 'shows') return;
        if(this._modal === 'chooseBank'){
            if(this.__banks.length === 0) return this.__getBanks__();
        }
        let __self:PurchasesDetailsComponent = this;            
        setTimeout(()=>{
            __self._lab.jQuery('#show-purchase-details-modal input.autofocus').focus();
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

    private __createPurchaseOrderFormGroup__(item:any , is_product:boolean  , qty:number = null):FormGroup{
        if(!item) return;
        let __is_product:boolean = false;
        let __quantity:number;
        let __pro_name:string;
        let __pro_id:number;
        let __total:number = 0;
        let __pro:Products = null;
        let __invnmbr:string = '0';
        let __invid:number = 0;
        let __handler:string = '';
        let __pro_type:string = item.type;
        let __variaty:Array<Object> = [];
        let __price:number = 0;
        let __multiplier:number = 1;
        let __types_main_id:number = 0;
        if(is_product){
            if(!qty && typeof(qty) !== 'number'){
                __quantity = item.limit_sale_quantity > 0 ? item.limit_sale_quantity : 1;
            }
            else{
                __quantity = qty;
            }
            __price = item.cost;
            __pro_id = item.id;
            __pro_name = item.name;
            // __handler += item.sku && item.sku.toString() !== '0' && this.intRegex.test(item.sku.toString()) ? item.sku.toString() : '';
            __pro = item;
            __invid = this.formObject.value.id || 0;
            __invnmbr = this.formObject.value.number;
            __types_main_id = item.types_main_id;
        }else{
            __quantity = item.quantity;
            __price = item.price;
            __total = item.total;
            __pro_name = item.product_name;
            __pro_id = item.product_id;
            __invid = item.father_id;
            __invnmbr = item.number;
            __handler = item.product_handler;
            __types_main_id = item.type_main_id;
            __multiplier = item.multiplier;
        }
        let __discount:number = item['discount'] ? item['discount'] : 0;
        let __tax:number      = item.tax  ? item.tax : 0;
        let __quantity_dir:string = item.hasOwnProperty('quantity_dir') ? item.quantity_dir : this.formObject.value.quantity_dir;
        let __quantity_dir_id:number = item.hasOwnProperty('quantity_dir_id') ? item.quantity_dir_id : this.formObject.value.quantity_dir_id;
        __quantity_dir_id = __quantity_dir === 'store' ? 0 : __quantity_dir_id;
        let __purchaseOrder:FormGroup = this._fb.group({
            product_handler : [ __handler] ,
            father_id    : [ __invid ],
            number       : [ __invnmbr ],
            product_name : [ __pro_name ,Validators.required],
            product_id   : [ __pro_id , Validators.required],
            price        : [ __price , Validators.pattern(this.priceRegex)],
            total        : [ __total , Validators.pattern(this.priceRegex)],
            // cost         : [ item.cost, Validators.pattern(this.floatRegex)],
            quantity_dir : [ __quantity_dir ],
        quantity_dir_id  : [ __quantity_dir_id ],
            tax          : [ __tax, Validators.pattern(this.floatRegex)],
            discount     : [ __discount, Validators.pattern(this.priceRegex)],
            quantity     : [ __quantity, Validators.pattern(this.floatRegex)],
            multiplier   : [ __multiplier , Validators.pattern(this.floatRegex)],
            variaty      : [ __variaty , Validators.pattern(null) ],
            description  : [ item.description , Validators.pattern(this.noteRegex)],
            focus        : [ false ],
            product      : [ __pro ],
            type         : [ __pro_type , Validators.pattern(this.nameRegex) ],
            type_main_id : [ __types_main_id.toString() , Validators.pattern(this.intRegex) ],
        });
        // if(__is_product)
        //     this.__changePurchaseOrderPrice__(__purchaseOrder);
        if(!this.__continues__()){
            __purchaseOrder.disable();
        }
        return __purchaseOrder;
    }

    __setQuantityDir__(type:string = null,$event:any=null):void{
        console.log($event);
        let id:number = !$event ? null : parseInt($event.target.value);
        if(isNaN(id) || id < 0) id = null;
        if(!type || /*this.__storagesArray.length === 0 ||*/ type === 'store' || id === 0){
            if(this.__storagesArray.length === 0){
                this._lab.__setAlerts__('warn' , 'عليك اضافة المخزن المراد السحب منه');
            }
            type = 'store';
            id = <number>this._global.getResource('branches')[0].id;
        }else{
            if(!id) id = this.__storagesArray.length === 0 ? 0 : this.__storagesArray[0].id;
            this._lab.__setAlerts__('warn' , 'عليك اختيار المخزن لعملية السحب');
        }
        this.__quantityDir__ = type;
        this.formObject.controls['quantity_dir'].setValue(type);
        this.formObject.controls['quantity_dir_id'].setValue(id);
        this._global.setResource(type, 'quantity_dir');
        this._global.setResource(id  , 'quantity_dir_id');
    }

    __setQuantityDirForm__(form:FormGroup , $event):void{
        if(!form) return;
        let id = parseInt($event.target.value);
        if(isNaN(id)) id = this.formObject.value['quantity_dir_id'];
        if(id === 0) form.controls['quantity_dir'].setValue('store');
        else form.controls['quantity_dir'].setValue('storage');
        form.controls['quantity_dir_id'].setValue(id);
    }

    __changePurchaseOrderPrice__(purchaseOrder:FormGroup):void{
        let __pro:Products = purchaseOrder.controls['product'].value as Products;
        purchaseOrder.controls['price'].setValue(__pro.price);
        this.onUpdatePurchaseOrder(purchaseOrder);
    }

    __refreshPurchaseOrderPrices(form:FormGroup , from:string = null):void{
        if(typeof(form.value.quantity) !== 'number'){
            let qty:number = parseFloat(form.value['quantity']);
            if(isNaN(form.value.quantity)) qty = 1;
            form.controls['quantity'].setValue(qty);
        }
        let tax:number = 0;let discount:number = 0;
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
        form.controls['multiplier'].setValue(multiplier);
        this.__refreshPrices();
    }

    __refreshPrices():void{
        let price:number=0,tax:number=0,discount:number=0,total:number=0,cost:number=0;
        if(this.__purchaseOrders.length > 0){
            this.__purchaseOrders.forEach((form,index) =>{
                let __qty:number = parseFloat(form.value.quantity);
                if(isNaN(__qty)) __qty = 0;
                __qty = __qty * form.value.multiplier;
                let __price:number = parseFloat(form.value.price) * __qty;
                if(isNaN(__price)) __price = 0;
                let __tax:number = (__price * (parseFloat(form.value.tax) / 100));
                if(isNaN(__price)) __price = 0;
                price    += __price;
                tax      += __tax;
                discount += ((__price + __tax) * (parseFloat(form.value.discount) / 100));
                total    += parseFloat(form.value.total);
            });
        }
        let __disAmount:number = parseInt(this.__discountAmount);
        __disAmount = isNaN(__disAmount) ? 0 : __disAmount;
        this.__discountAmount = __disAmount;
        if(this.__discountType === 'PERCENT'){
            __disAmount = ((__disAmount / 100 ) * total);
        }
        let __shipp:number = parseFloat(this.shipping_amount.toString());
        __shipp = isNaN(__shipp) || __shipp < 0 ? 0 : __shipp;
        this.shipping_amount = __shipp;
        this.formObject.controls['shipping_by_company'].setValue(this.shipping_by_company);
        this.formObject.controls['shipping_cost'].setValue(this.shipping_amount);
        if(!this.shipping_by_company){
            total += this.shipping_amount;
        }
        this.formObject.controls['all_discount'].setValue(__disAmount + discount);
        this.__obj = {
            price : price,
            discount : discount + __disAmount,
            tax : tax,
            total : (total - __disAmount),
            paid : this.formObject.value.paid
        };
        this.__payAmount = this.__obj['total'] - this.formObject.value.paid;
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
            this._lastPurchase = <Purchases>this.formObject.value;
            this.submitted = false;
            this.__payAmount = 0;
            this.__discountAmount = 0;
            this.__textArea = '';
            this._variatyProduct = null;
            this.__purchaseOrders = [];
            this.__initFormObject__();
            this.__refreshPrices();
            if(this.__isParkEdit){
                this._editable = false;
                this.__param = null;
                this.__isParkEdit = false;
                this.__hasParkNote = false;
                this.__removeParkPurchaseFromArray__(this._lastPurchase);
            }
        }
        if(__back)this.onBackToPurchaseOrdering();
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
                    this._lab.__setErrors__(error);
                    this._lab.invoiceResize();
                }
            );
        }
        if(type === null || type === 'TAGS'){
            if(this.__tagsSearchDone) return;
            this._http.get('reports/tags?limit='+__limit+'&page='+this.__tagsPage).subscribe(
                (items) => {
                    if(items && items.data){
                        if(items.error || !items.data) {
                            this._lab.invoiceResize();
                            return;
                        }
                        this.__tags = [];
                        let __words:Object = {};
                        for(let i in items.data){
                            if(!items.data[i].tags) continue;
                            let tags:Array<string> = items.data[i].tags.split(',');
                            this.__tags = [];
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
                        this._lab.invoiceResize();
                    }
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
                    this._lab.__setErrors__(error);
                    this._lab.invoiceResize();
                }
            );
        }
        if(type === null || type === 'PRODUCTS'){
            let __supId:number = this.formObject && this.formObject.value && this.formObject.value.supplier_id ? this.formObject.value.supplier_id : 0;
            // if(__supId <= 0){
            //     this._lab.__setAlerts__('warn' , 'الرجاء كاتبة المورد لجب المنتجات الخاصة به');
            // }else{
                let __srch:string = '&search=is_main-is_product&is_main=true&is_product=true';//&supplier_id='+__supId;
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
            // }
        }
    }

    private __continues__(is_msg:boolean = true):boolean{
        // if(!this._supplier ){
        //     this._lab.__setAlerts__('error' , 'يجب اختيار المورد لاتمام فاتورة الشراء');
        //     return false;
        // }
        // if(this._editable && this.__param && !this.__isParkEdit && this._lastPurchase.status !== 'parked'){
        //     if(is_msg)
        //         this._lab.__setAlerts__('warn' , 'لايمكنك تعديل طلبات الفاتورة اللتى تم حفظها مسبقا ... يمكن اضافة الدفع فقط');
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

    private __onShowSupplierData():void{
        this.__showSupplier = true;
        this.__showModalDetails__('supplierandemployees');
    }
}