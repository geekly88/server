import { Component, OnInit, OnChanges, AfterViewInit } from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AutocompleteComponent } from './../../../@components';
import { GlobalProvider , LabProvider, RouterTransition } from './../../../@providers';
import { Settings , Taxes , Products , BooksTree } from './../../../@interfaces';
import { HttpRequestService } from './../../../@services';

declare let $:any;

@Component({
    selector : 'settings-details',
    templateUrl : './settingsDetails.html',
    providers : [
        GlobalProvider, 
        LabProvider, 
        HttpRequestService,
    ],
    animations : [RouterTransition('Form')],
    host : {'[@RouterTransition]': ''},
    inputs : ['isDynamic']
})
export class SettingsDetailsComponent implements OnInit,AfterViewInit{
    
    public isDynamic:boolean = true;
    private _editable:boolean;
    private submitted:boolean;
    private formObject:FormGroup;
    private searchForm:FormGroup;
    private dbFormObject:FormGroup;
    private item:any;
    private errors:any;
    private __isAuth:boolean = false;
    private __generalSettings:boolean = (1 === 1);
    private __databaseSettings:boolean = false;
    private __accountingSettings:boolean = false;
    private __loyaltySettings:boolean = false;
    private __param:string;
    private __sections:Object = {};
    private __token:any;
    private __obj:any = {};
    private __modal:string = '';
    private __taxesArray:Array<Taxes>;
    private _page:string = 'settings/';
    private __productsArray:Array<Products> = [];
    private __accountingBooks:Array<BooksTree> = [];
    private __booksArray:Array<string> = [];

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
        this.__isAuth = this._lab.__checkAuthPage('dashboard/settings');
    }

    ngOnInit():any{
        // console.log(document.referrer);
        
        let nameRegex:RegExp   = this._global.config["nameRegex"];
        let noteRegex:RegExp   = this._global.config["noteRegex"];
        let intRegex:RegExp    = this._global.config["intRegex"];
        let floatRegex:RegExp  = this._global.config["floatRegex"];
        let priceRegex:RegExp  = this._global.config["priceRegex"];
        this.formObject        = this._fb.group({
            handle_costs       : [ 'avrage' ],
            is_tax             : [ true ],
            is_variaty         : [ true ],
            is_beep            : [ false ],
            is_append_products : [ false ],
            is_show_invoice    : [ true ],
            is_show_invoice_details:[false],
            is_print_by_thermal: [ false ],
            is_notify_expired  : [ true ],
            is_ask_qty         : [ true ],
            is_trackable       : [ false ],
            is_registered      : [ false ],
            free_shipping      : [ true ],
            supplier_required  : [ false ],
            perpage            : [ 15 , [ Validators.required , Validators.pattern(intRegex)]],
            language           : [ 'ar' , [ Validators.required , Validators.pattern(nameRegex)]],
            sale_type          : [ 'both' , [ Validators.required , Validators.pattern(nameRegex)]],
            pro_type           : [ 'both' , Validators.pattern(nameRegex) ],
            theme              : [ 'default' , Validators.pattern(nameRegex) ],
            
            currency_position  : [ 'after' , Validators.pattern(nameRegex)],
            currency           : [ 'دل' , [Validators.minLength(2) , Validators.maxLength(3) , Validators.pattern(nameRegex)]],
            currency_country   : [ 'LY' , Validators.pattern(nameRegex)],
            money_comma        : [ ',' ,[Validators.maxLength(1)]],
            fraction_comma     : [ '.' ,[Validators.maxLength(1)]],
            fraction_degree    : [ 2 , Validators.pattern(intRegex)],
            fraction_tax_degree: [ 2 , Validators.pattern(intRegex)],
            
            default_tax_name   : ['' , Validators.pattern(nameRegex)],
            default_tax_id     : [ 0 , Validators.pattern(intRegex)],
            default_tax        : [ 0 , Validators.pattern(priceRegex)],
            tax_position       : ['after' , Validators.pattern(nameRegex)],
            is_allow_logo      : [ true ],

            is_bookKepping             : [true],

            branch_code                : ['121'],
            storage_code               : ['122'],
            beginning_inventory_code   : ['123'],

            cash_code                  : ['111'],
            banks_code                 : ['112'],
            cheques_codes              : ['113'],
            credit_card_code           : ['114'],
            
            customers_code             : ['131'],
            suppliers_code             : ['221'],
            employees_code             : ['222'],
            bad_debt_code              : ['355'],
            products_accum_code        : ['231'],
           
            purchaseOrders_taxes_code  : ['241'],
            income_taxes_code          : ['356'],
          
            purchases_code             : ['341'],
            sales_returns_code         : ['342'],
            sales_discounts_code       : ['343'],
            sales_gifts_code           : ['344'],
            sales_loyalty_code         : ['345'],
            inventory_costs_code       : ['346'],
            // sales_cost_code            : ['4512'],
           
            sales_code                      : ['411'],
            purchaseOrders_returns_code     : ['412'],
            purchaseOrders_discounts_code   : ['413'],
           

            inventory_costs_book       : ['' , Validators.pattern(nameRegex)],
            purchases_book             : ['' , Validators.pattern(nameRegex)],
            storage_book               : ['' , Validators.pattern(nameRegex)],
            branch_book                : ['' , Validators.pattern(nameRegex)],
            cash_book                  : ['' , Validators.pattern(nameRegex)],
            cheques_book               : ['' , Validators.pattern(nameRegex)],
            credit_card_book           : ['' , Validators.pattern(nameRegex)],
            customers_book             : ['' , Validators.pattern(nameRegex)],
            suppliers_book             : ['' , Validators.pattern(nameRegex)],
            employees_book             : ['' , Validators.pattern(nameRegex)],
            bad_debt_book              : ['' , Validators.pattern(nameRegex)],
            products_accum_book        : ['' , Validators.pattern(nameRegex)],
            sales_book                 : ['' , Validators.pattern(nameRegex)],
            // sales_cost_book            : ['' , Validators.pattern(nameRegex)],
            income_taxes_book          : ['' , Validators.pattern(nameRegex)],
            sales_returns_book         : ['' , Validators.pattern(nameRegex)],
            sales_discounts_book       : ['' , Validators.pattern(nameRegex)],
            sales_gifts_book           : ['' , Validators.pattern(nameRegex)],
            sales_services_exp_book    : ['' , Validators.pattern(nameRegex)],
            sales_loyalty_book         : ['' , Validators.pattern(nameRegex)],
            purchaseOrders_taxes_book       : ['' , Validators.pattern(nameRegex)],
            purchaseOrders_returns_book     : ['' , Validators.pattern(nameRegex)],
            purchaseOrders_discounts_book   : ['' , Validators.pattern(nameRegex)],
            beginning_inventory_book   : ['' , Validators.pattern(nameRegex)],
            banks_book                 : ['' , Validators.pattern(nameRegex)],

            gift_code_len              : [ 8 ],
           
            loyalty_nedded_for_point   : [ 1 , Validators.pattern(floatRegex)],
            loyalty_money_for_point    : [ 1 , Validators.pattern(floatRegex) ],
            loyalty_by                 : [ 'money' , Validators.pattern(nameRegex)],
            loyalty_active             : [ false ],
            loyalty_start_point        : [ 0 , Validators.pattern(intRegex) ],
            loyalty_max_points         : [ 50 , Validators.pattern(intRegex)],
            loyalty_products           : [ [] ],
            loyalty_count_after_sale   : [ false ],

            sale_terms                 : ['' , [Validators.pattern(noteRegex)]]
        });

        this.searchForm   = this._fb.group({
            search        : ['' , Validators.pattern(nameRegex)]
        });

        this.dbFormObject = this._fb.group({
            customers     : [true],
            employees     : [true],
            suppliers     : [true],
            products      : [true],
            // invoices      : [true],
            sales         : [true],
            purchases          : [true],
            expenses      : [true],
            paids         : [true],
            // users         : [true],
            collections   : [true],
            types         : [true],
            taxes         : [true],
            options       : [true],
            brands        : [true],
            banks         : [true],
            storages      : [true],
            branches      : [true],
            gifts         : [true],
            booksTree     : [true],
            bookKepping   : [true],
            ALL           : [true],
        });

        this.__init__();
        // this.__prepareAccountingBooks();
    }

    OnSelectSection(section:string=''):void{
        for(let section in this.__sections){
            this.__sections[section] = false;
        }
        if(this.__sections.hasOwnProperty(section)){
            this.__sections[section] = true;
        }else{
            this.__sections['__mainSection'] = true;
        }
    }

    onExportDatabase(values:any , valid:boolean = false):void{
        if(!valid){
            return this._lab.__setAlerts__('error' , 'الرجاء التأكد من خياراتك قبل اتمام العملية');
        }
        this._http.post('settings/export' , values).subscribe(
            (items) => {
                if(items && items.data){
                    return this._lab.__setAlerts__('success' , 'تم تصدير قاعدة البيانات داخل المسار : ' + items.data);
                }
                this._lab.__setErrors__({status : 400});
            },(error) => {
                this._lab.__setErrors__(error);
            }, () => {}
        );

    }

    public onSelectItem($event:any):void{
        if(!$event.name) return;
        switch($event.name){
            case 'default_tax':
                this.formObject.controls[$event.name+'_name']['setValue']($event.item.name);
                this.formObject.controls[$event.name+'_id']['setValue']($event.item.id);
                this.formObject.controls[$event.name]['setValue']($event.item.tax);
                break;
        }
    }

    public onAddSelectItem($event:any):void{
        if(!$event.name) return;
        switch($event.name){
            case 'default_tax':
                this.__showModalDetails('taxes');
                break;
        }
    }

    OnSubmitForm():void{
        if(!this.__isAuth) return;
        this.submitted = true;
        if(false === this.formObject.valid) {
            this._lab.__setAlerts__('error' , 'الرجاء التأكد من الملاحظات الجانبية لكل حقل و تجنب الاخطاء لاتمام العملية');
            return;   
        }

        this._lab.__setAlerts__();
        this._http.put(this._page, this.formObject.value).subscribe(
            (item) => 
            {
                if(item.error) { 
                    this._lab.__setErrors__(item.error);
                    return;
                }
                if(!item || !item.data || !item.token){
                    this._lab.__setErrors__(null);
                    for(let key in this.__token.settings){
                        if(this.__token.settings[key] !== null && this.__token.settings[key] !== undefined && this.formObject.value.hasOwnProperty(key)){
                            this.formObject.controls[key].setValue(this.__token.settings[key]);
                        }
                    }
                    return;
                }
                
                this.item = item.data;
                for(let key in this.item){
                    if(this.item[key] !== null && this.item[key] !== undefined && this.formObject.value.hasOwnProperty(key)){
                        this.formObject.controls[key].setValue(this.item[key]);
                    }
                }
                this.__token.settings = this.formObject.value;
                this.__token.token = item.data.token || this.__token.token;
                this._global.setToken({ data : this.__token} , null , false);
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


    private __init__():void{
        this.__getRouterParamsData__();
        this.__initObjects__();
        this.__sections = {
            __mainSection : true,
            __invoiceSection : false,
            __taxSection : false,
            __currencySection : false,
        };

        this.__initShortCut__();
    }

    private __getRouterParamsData__():void{
        this._lab.__setGlobal__(this._global);
        let token = this._global.getToken();
        if(!token && !token['settings']) {
            return this._global.navigatePanel('login');
        }
        this.__token = token;
        this.item = token['settings'];
        for(let key in this.item){
            if(this.item[key] !== null && this.item[key] !== undefined && this.formObject.value.hasOwnProperty(key)){
                this.formObject.controls[key].setValue(this.item[key]);
            }
        }
    }

     private __initObjects__():boolean{
        this.__obj = {
            select : {
                default_tax : {
                    name : 'default_tax',
                    url : null,
                    searchField : 'name',
                    options : this.__taxesArray,
                    optionItems : ['name','tax'],
                    optionString : '#0 --> #1%',
                    defaultValueId : null,
                }
            }
        }
        return true;
    }

    private __getSelection__():void{
        if(!this.__initObjects__()) return;
        let __select:any = this.__obj.select;
        this._http.get('taxes').subscribe(
            (items) => {
                if(!items.error && items.data){
                    this.__taxesArray = items.data;
                    __select.tax.options = this.__taxesArray;
                }else{
                    this.__taxesArray = [];
                }
            },(error) => {
                this.__taxesArray = [];
            }
        );
    }

    private autocompletevaluechanged($event){
        if(!$event || !$event.item) return;
        if($event.class === 'products'){
            let __proArr:Array<number> = this.formObject.value['loyalty_products'];
            if(!__proArr) __proArr = [];
            if(__proArr.indexOf($event.item.id) >= 0)
                return this._lab.__setAlerts__('warn' , 'المنتج أو الخدمة مضاف مسبقا فى القائمة');
            __proArr.push($event.item.id);
            this.formObject.controls['loyalty_products'].setValue(__proArr);
            this.__productsArray.push($event.item);
        }
    }

    private __getLoyaltyProducts():void{
        if(this.__productsArray.length > 0 || !this.formObject.value['loyalty_products'] || this.formObject.value['loyalty_products'].length === 0) 
            return;
        let __url:string = 'products/' + this.formObject.value['loyalty_products'].join(',') + '?arr=true';
        this._http.get(__url).subscribe(
            (items) => {
                if(!items.error && items.data){
                    this.__productsArray = items.data;
                }else{
                    this.__productsArray = [];
                }
            },(error) => {
                this.__productsArray = [];
            }
        );
    }

    private __removeProduct(__product:Products):void{
        let __tempProductsArray:Array<Products> = [];
        let __tempProductsIds:Array<number> = [];

        this.__productsArray.forEach((__pro , index) => {
            if(__pro.id !== __product.id) __tempProductsArray.push(__pro);
        });
        this.formObject.value['loyalty_products'].forEach((id) => {
            if(id !== __product.id) __tempProductsIds.push(id);
        });

        this.__productsArray = __tempProductsArray;
        this.formObject.controls['loyalty_products'].setValue(__tempProductsIds);
    }

    public validateControl(name:string , parent:string = null):boolean{
        let __parent:any;
        if(parent)
            __parent = this.formObject.controls[parent];
        else
            __parent = this.formObject;
        try{
            return (!__parent.controls[name].valid && (!__parent.controls[name].pristine || this.submitted));
        }catch(e){
            return false;
        }
    }

    __switchTab(tab:string="GEN"):void{
        switch (tab) {
            case 'GEN':
                this.__generalSettings = true;
                this.__databaseSettings = false;
                this.__accountingSettings = false;
                this.__loyaltySettings = false;
                break;
            case 'DB':
                this.__generalSettings = false;
                this.__databaseSettings = true;
                this.__accountingSettings = false;
                this.__loyaltySettings = false;
                break;
            case 'ACC':
                this.__generalSettings = false;
                this.__databaseSettings = false;
                this.__accountingSettings = true;
                this.__loyaltySettings = false;
                break;
            case 'LTY':
                this.__generalSettings = false;
                this.__databaseSettings = false;
                this.__accountingSettings = false;
                this.__loyaltySettings = true;
                break;
            default:
                break;
        }
    }

    __prepareAccountingBooks():void{
        this.__booksArray = this._global.config['bookCodes'];
        this._lab.__getBooksTree__(this , '__accountingBooks' , () => {
            this.__setBooksNames__();
        });
    }

    private onChangeBookAccount(book:string , index:number = -11):void{
        let __code:string = this.formObject.value[book + '_code'];
        if(!__code) return;
        for(let i=0; i < this.__accountingBooks.length; i++){
            if(this.__accountingBooks[i].code === __code) {
                this.formObject.controls[book + '_book'].setValue(this.__accountingBooks[i].name_ar);
                return;
            }
        }
    }

    private __setBooksNames__():void{
        this.__booksArray.forEach((book , index) => {
            this.onChangeBookAccount(book , index);
        });
    }

    private __showModalDetails(__modal:string):void{
        this.__modal = __modal;
        this._lab.__modal('#show-dynamic-model');
    }

    private onShowAddProducts():void{
        this.__showModalDetails('addingProducts');
        this.__getLoyaltyProducts();
    }

    private __initShortCut__():any{
        this._lab.__setShortCuts__(this , false);
    }
}