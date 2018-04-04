import { Component, OnInit , OnChanges , AfterViewInit } from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AutocompleteComponent } from './../../../@components';
import { GlobalProvider , LabProvider, RouterTransition } from './../../../@providers';
import { Products , Storages , Brands , Types , Collections , Taxes , Options , Suppliers } from './../../../@interfaces';
import { HttpRequestService } from './../../../@services';
// import  * as child from './../../exports';

declare let $:any;
let time = new Date();

@Component({
    selector : 'products-details',
    templateUrl : './productsDetails.html',
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
export class ProductsDetailsComponent implements /*OnChanges,*/OnInit,AfterViewInit{
    
    private editable:boolean;
    private submitted:boolean;
    private formObject:FormGroup;
    private item:Products;
    private editItem:Products;
    private _page:string = 'products/';
    private __param:string;
    private __modal:string;
    private __optionsArray:Array<Options> = [];
    private __storagesArray:Array<Storages> = [];
    private __typesArray:Array<Types> = [];
    private __taxesArray:Array<Taxes> = [];
    private __collectionsArray:Array<Collections> = [];
    private __brandsArray:Array<Brands> = [];
    private __SEP__:string = ' / ';

    private __typo__:string = 'صنف';
    private __typoDesc__:string = 'الصنف هو السلعة اللتى تريد تسويقها أو بيعها لزبائنك و عملائك';

    private __settings:any;

    private alphanumdashed:RegExp;
    private tagsRegex:RegExp;
    private nameRegex:RegExp;
    private noteRegex:RegExp;
    private emailRegex:RegExp;
    private socialRegex:RegExp;
    private intRegex:RegExp;
    private floatRegex:RegExp;
    private priceRegex:RegExp;
    private phoneRegex:RegExp;
    private postRegex:RegExp;
    private siteRegex:RegExp;

    private __submittedByBarcode:boolean = false;
    private __keyPressedPerSec:number = 0;
    private __previousKey:number;

    private __product_costs:Object= {
                                        name : 'التكلفة الأولية',
                                        amount : 0,
                                        cost : 0
                                    };

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
        let self:ProductsDetailsComponent = this;
        $('#productchbx').click(function(e){
            self.__checkTypo__();
        });
    }

    //  ngOnChanges(props:any):void{
    //     console.log(props , this._http);
    //     if(props.editItem && props.editItem.currentValue && ((props.editable && props.editable.currentValue === true) || this.editable)){
    //         this.item = this.editItem;
    //         for(let key in this.item){
    //             if(this.item[key] !== null && this.item[key] !== undefined && this.formObject.value.hasOwnProperty(key)){
    //                 this.formObject.controls[key].setValue(this.item[key]);
    //             }
    //         }
    //         this.__checkTypo__();
    //         this.formObject.get('is_product').disable();
    //     }else if(((props.editable && props.editable.currentValue === false) || !this.editable) 
    //      || (props.param && props.param.currentValue === null)){
    //          this.__initFormsObject__();
    //          this.__getNewCode__();
    //     }
    // }

    ngOnInit():any{
        this.__settings = this._global.getToken()['settings'];
        this.__initFormsObject__();
        this.__init__();
    }

    OnSubmitForm(values:Products,valid:boolean , __continue:boolean = false):void{
        if(!__continue) return;
        if(this.__submittedByBarcode){
            this.__submittedByBarcode = !this.__submittedByBarcode;
            return;
        }
        this.submitted = true;
        
        if(false === valid) {
            this._lab.__setAlerts__('error' , 'الرجاء التأكد من الملاحظات الجانبية لكل حقل و تجنب الاخطاء لاتمام العملية');
            return;   
        }

        let obj:any;

        let __taxID:number = parseFloat(values['tax_id'].toString());
        values['tax_id'] = isNaN(__taxID) ? 0 : __taxID;
        let __tax:number = parseFloat(values['tax'].toString());
        values['tax'] = isNaN(__tax) || values['tax_id'] === 0 ? 0 : __tax;
        // let __type_id:number = parseInt(values['type_id'].toString());
        // values['type_id'] = isNaN(__type_id) ? 0 : __type_id;
        // let __types_main_id:number = parseInt(values['types_main_id'].toString());
        // values['types_main_id'] = isNaN(__types_main_id) ? 0 : __types_main_id;

        
        if(!values.option_one && !values.option_one_value && !values.option_two
        && !values.option_two_value && !values.option_three && !values.option_three_value){
            values.is_variaty = false;
            values.variaty_count = 0;
            values.variaties_arr = [];
        }

        this._lab.__setAlerts__();
        if(true === this.editable){
            obj = this._http.put(this._page + this.__param, values);
        }else{
            obj = this._http.post(this._page, values);
        }
        obj.subscribe(
            (item) => {
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
                }else{
                    this.__initFormsObject__();
                    this.__getNewCode__();
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

    public validateControl(name:string , error:boolean=false):boolean{
        return (!this.formObject.controls[name].valid && (!this.formObject.controls[name].pristine || this.submitted));
    }
    
    public onSelectItem($event:any):void{
        if(!$event || !$event.target) return;
        let __name:any = $event.target.name;
        let __value:any = $event.target.value;
        if(__value === '__ADDONE__'){
            this.onAddSelectItem(__name);
            return;
        }
        if(__name === 'type'){
            for(let i = 0; i < this.__typesArray.length; i++){
                if(this.__typesArray[i]['id'].toString() === __value.toString()){
                    this.formObject.controls['type_id']['setValue'](this.__typesArray[i]['id']);
                    this.formObject.controls['types_main_id']['setValue'](this.__typesArray[i]['main_id']);
                    this.formObject.controls['type']['setValue'](this.__typesArray[i]['name']);
                    break;
                }
            }
        }
        if(__name === 'collection'){
            for(let i = 0; i < this.__collectionsArray.length; i++){
                if(this.__collectionsArray[i]['name'] === __value){
                    this.formObject.controls['collection_id']['setValue'](this.__collectionsArray[i]['id']);
                    break;
                }
            }
        }
        if(__name === 'brand'){
            for(let i = 0; i < this.__brandsArray.length; i++){
                if(this.__brandsArray[i]['name'] === __value){
                    this.formObject.controls['brand_id']['setValue'](this.__brandsArray[i]['id']);
                    break;
                }
            }
        }
        if(__name === 'tax'){
            for(let i = 0; i < this.__taxesArray.length; i++){
                if(this.__taxesArray[i]['id'].toString() === __value.toString()){
                    this.formObject.controls['tax']['setValue'](this.__taxesArray[i]['tax']);
                    this.formObject.controls['tax_id']['setValue'](this.__taxesArray[i]['id']);
                    break;
                }
            }
        }
        if(__name === 'storage'){
            for(let i = 0; i < this.__storagesArray.length; i++){
                if(this.__storagesArray[i]['name'] === __value){
                    this.formObject.controls['storage_id']['setValue'](this.__storagesArray[i]['id']);
                    this.formObject.controls['storage_code']['setValue'](this.__storagesArray[i]['code']);
                    break;
                }
            }
        }
    }

    public onAddSelectItem(__name:string):void{
        switch(__name){
            case 'type':
                this.__modal = 'types';
                break;
            case 'storage':
                this.__modal = 'storages';
                break;
            case 'tax':
                this.__modal = 'taxes';
                break;
            case 'collection':
                this.__modal = 'collections';
                break;
            case 'brand':
                this.__modal = 'brands';
                break;
            case 'cost':
                this.__modal = 'costs';
                this.__product_costs = {
                    name : '',
                    amount : 0,
                    cost : 0
                };
                return this._lab.__modal('#show-dynamic-model');
            default :
                this.__modal = __name; 
                break;
        }
        this.formObject.controls[__name].setValue('');
        this._lab.__modal('#show-dynamic-model');
    }

    onAddedItemAction($event):void{
        if($event.action !== 'ADD' || !$event.item) return;
        switch(this.__modal){
            case 'storages':
                this.__storagesArray.push($event.item);
                break;
            case 'types':
                this.__typesArray.push($event.item);
                break;
            case 'option_one':
            case 'option_two':
            case 'option_three':
                this.__optionsArray.push($event.item);
                break;
            case 'taxes':
                this.__taxesArray.push($event.item);
                break;
            case 'collections':
                this.__collectionsArray.push($event.item);
                break;
            case 'brands':
                this.__brandsArray.push($event.item);
                break;
        }
    }

    private autocompletevaluechanged($event){
        if(!$event || !$event.item) return;
        if($event.class === 'supplier'){
            this.formObject.controls[$event.class + '_id'].setValue($event.item.id);
        }
        this.formObject.controls[$event.class].setValue($event.item.name);
    }

    public onchangeKeys($event){
        if(!$event.name) return;
        switch($event.name){
            case 'option_one_value':
            case 'option_two_value':
            case 'option_three_value':
                this.__createVariatyList__();
                break;
            case 'tags':
                break;
        }
    }

    OnCostsAction(action:string , index:number):void{
        let __costs:Array<Object> = <Array<Object>>this.formObject.value['product_costs'];
        if(!__costs || ((__costs.length === 0 || !__costs[index]) && action !== 'add')) return;
        switch (action) {
            case 'delete':
                if(index === 0){
                    return this._lab.__setAlerts__('warn' , 'يجب ان يحتوى المنتج على سعر تكلفة بمبلغ 0 أو أكثر');
                }
                if(__costs[index]['amount'] !== 0){
                    return this._lab.__setAlerts__('warn' , 'لايمكن حذف التكلفة حتى نفاذ الكمية\n عليك ازالة الكمية  المراد حذف تكلفتها');
                }
                if(!confirm("سيتم نقل الكمية الى سعر التكلفة الرئيسى\nهل تريد الاستمرار فى عملية الحذف")) return;
                let __costsTemp:Array<Object> = [];
                __costs.forEach((item , i) => {
                    if(index === i) return;
                    __costsTemp.push(item);
                });
                this.formObject.controls['product_costs'].setValue(__costsTemp);
                break;

            case 'edit':
                this.__product_costs = __costs[index];
                this.__modal = 'costs';
                return this._lab.__modal('#show-dynamic-model');

            case 'add':
                let __error:string = '';
                if(!this.nameRegex.test(this.__product_costs['name'])){
                    __error += 'لديك خطأ فى كتابة الاسم\n';
                } 
                if(!this.priceRegex.test(this.__product_costs['cost'])){
                    __error +=  'الرجاء كتابة السعر الصحيح فى الحقل';
                }
                if(__error && __error !== ''){
                    return alert(__error);
                }
                if(__costs && __costs instanceof Array){
                    this.formObject.value.product_costs.forEach((item , index) => {
                        if(item.name === this.__product_costs['name']){
                            __error += 'الاسم الذى أدخلته موجود بالقائمة مسبقا';
                        }
                        if(item.cost == this.__product_costs['cost']){
                            __error += 'السعر الذى أدخلته موجود بالقائمة مسبقا';
                        }
                    });
                }else{
                    __costs = [];
                }

                if(__error && __error !== ''){
                    return alert(__error);
                }
                __costs.push(this.__product_costs);
                this.formObject.controls['product_costs'].setValue(__costs);
                this.__product_costs = {
                    name : '',
                    amount : 0,
                    cost : 0
                };
                break;
        }
     }

    private __initFormsObject__():void{
        this.formObject = this._fb.group({
            product_costs      : [ [ this.__product_costs ] ],
            name               : ['' , [Validators.required, Validators.pattern(this.nameRegex)]],
            supplier           : ['' , Validators.pattern(this.nameRegex)],
            supplier_id        : [ 0 , Validators.pattern(this.intRegex)],
            supplier_code      : [ 0 , Validators.pattern(this.intRegex)],
            sku                : [ '1' , [Validators.required ,Validators.maxLength(16) , Validators.pattern(this.alphanumdashed)]],
            cost               : [ 0 , Validators.pattern(this.priceRegex)],
            price              : [ 0 , Validators.pattern(this.priceRegex)],
            price2             : [ 0 , Validators.pattern(this.priceRegex)],
            price3             : [ 0 , Validators.pattern(this.priceRegex)],
            price4             : [ 0 , Validators.pattern(this.priceRegex)],
            price5             : [ 0 , Validators.pattern(this.priceRegex)],
            tax                : [ 0 , Validators.pattern(this.priceRegex)],
            tax_id             : [ 0 , Validators.pattern(this.intRegex)],
            stock              : [ 0 , Validators.pattern(this.floatRegex)],
            stock_order_amount : [ 0 , Validators.pattern(this.floatRegex)],
            stock_order_point  : [ 0 , Validators.pattern(this.floatRegex)],
            limit_quantity     : [ 0 , Validators.pattern(this.floatRegex)],
            limit_sell_quantity: [ 0 , Validators.pattern(this.floatRegex)],

            storage            : [''],
            storage_code       : [''],
            storage_id         : [0 , Validators.pattern(this.intRegex)],

            is_multi_price     : [ false ],
            has_expire_date    : [ false ],
            expire_date        : [ ],

            option_one         : ['' , Validators.pattern(this.nameRegex)],
            option_two         : ['' , Validators.pattern(this.nameRegex)],
            option_three       : ['' , Validators.pattern(this.nameRegex)],
            option_one_value   : ['' , Validators.pattern(this.tagsRegex)],
            option_two_value   : ['' , Validators.pattern(this.tagsRegex)],
            option_three_value : ['' , Validators.pattern(this.tagsRegex)],

            variaty_count      : [ 0 , Validators.pattern(this.intRegex)],
            variaties_arr      : [[] , Validators.pattern(null)],
            variaty            : ['' , Validators.pattern(this.nameRegex)],
            brand              : ['' , Validators.pattern(this.nameRegex)],
            brand_id           : [ 0 , Validators.pattern(this.intRegex)],
            collection         : ['' , Validators.pattern(this.nameRegex)],
            collection_id      : [ 0 , Validators.pattern(this.intRegex)],
            type               : ['' , Validators.pattern(this.nameRegex)],
            type_id            : [ 0 , Validators.pattern(this.intRegex)],
            types_main_id      : [ 0 , Validators.pattern(this.intRegex)],
            tags               : [[]],

            is_active          : [ true ],
            is_trackable       : [ (!!this.__settings['is_trackable']) ],
            is_variaty         : [ (!!this.__settings.is_variaty) ],
            is_product         : [ (!(!!this.__settings['pro_type'] && this.__settings['pro_type'] === 'services')) ],
            is_main            : [ true ],
           
            description        : ['' , [Validators.maxLength(100) , Validators.pattern(this.noteRegex)]],
            main_id            : [ 0 , Validators.pattern(this.intRegex)]
        });
        this.formObject.controls['name'].setValue('');
        if(this.__storagesArray && this.__storagesArray.length > 0){
            this.formObject.controls['storage'].setValue(this.__storagesArray[(this.__storagesArray.length - 1)].name);
            this.formObject.controls['storage_id'].setValue(this.__storagesArray[(this.__storagesArray.length - 1)].id);
            this.formObject.controls['storage_code'].setValue(this.__storagesArray[(this.__storagesArray.length - 1)].code);
        }
    }

    private __init__():void{

        this.tagsRegex= this._global.config["tagsRegex"];
        this.nameRegex= this._global.config["nameRegex"];
        this.noteRegex= this._global.config["noteRegex"];
        this.emailRegex= this._global.config["emailRegex"];
        this.socialRegex= this._global.config["socialRegex"];
        this.intRegex = this._global.config["intRegex"];
        this.alphanumdashed = this._global.config["alphanumdashed"];
        this.floatRegex= this._global.config["floatRegex"];
        this.priceRegex= this._global.config["priceRegex"];
        this.phoneRegex= this._global.config["phoneRegex"];
        this.postRegex= this._global.config["postRegex"];
        this.siteRegex= this._global.config["siteRegex"];


        this.__getRouterParamsData__();
        this.__initShortCut__();
        this.__getSelection__();
    }

    private __getRouterParamsData__():void{
        this._lab.__setGlobal__(this._global);
        if(this._route.params['value'] && this._route.params['value']['id'] &&
            this._global.config['intRegex'].test(this._route.params['value']['id'])){
            this.__param = this._route.params['value']['id'];
            this._http.get(this._page + this.__param).subscribe(
                (item) => {
                    if(item.error !== null) {
                        this._global.navigatePanel(this._page);
                        return;
                    }
                    this.item = item.data;
                    for(let key in this.item){
                        if(this.item[key] !== null && this.item[key] !== undefined && this.formObject.value.hasOwnProperty(key)){
                            this.formObject.controls[key].setValue(this.item[key]);
                        }
                    }
                    this.__checkTypo__();
                    this.formObject.get('is_product').disable();
                    this.editable = true;
                },
                (response) => { 
                    this._global.navigatePanel(this._page);
                },
                () => {}
            );
        }else{
            this.__getNewCode__();
        }
    }

    private __checkTypo__():void{
        if(true === this.formObject.controls['is_product'].value){
            this.__typo__ = 'صنف';
            this.__typoDesc__ = 'الصنف هو السلعة اللتى تريد تسويقها أو بيعها لزبائنك و عملائك';
        }else{
            this.__typo__ = 'خدمة';
            this.__typoDesc__ = 'أضف الخدمة اللتى تقوم بتقديمها لزبائنك و عملائك';
        }
    }

    private __getNewCode__():void{
        this._http.get(this._page + 'next').subscribe(
            (item) => {
                if(item.data && item.data.sku){
                    this.formObject.controls['sku'].setValue(item.data.sku.toString());
                }
            },(error) => {
            }
        );
    }

    private __createVariatyList__():void{
        let values = this.formObject.value;
		let arr = [];
        let __variatyArr = [];

		if(values.option_one && values.option_one_value) __variatyArr.push(values.option_one_value.split(','));
		if(values.option_two && values.option_two_value) __variatyArr.push(values.option_two_value.split(','));
		if(values.option_three && values.option_three_value) __variatyArr.push(values.option_three_value.split(','));
        if(__variatyArr.length > 0){
            let title = '';
            for(let a=0; a < __variatyArr[0].length; a++){
                let start = __variatyArr[0][a];
                if(__variatyArr.length === 1){
                    arr.push([start]);
                    continue;
                }
                for(let b=0; b < __variatyArr[1].length; b++){
                    let mid = __variatyArr[1][b];
                    if(__variatyArr.length === 2){
                        arr.push([start ,mid]);
                        continue;
                    }
                    for(let c = 0; c < __variatyArr[2].length; c++){
                        arr.push([start,mid,__variatyArr[2][c]]);
                    }
                }
            }
			if(arr.length === 0) return;
            this.formObject.controls['variaties_arr'].setValue(__variatyArr);
        }else{
            this.formObject.controls['variaties_arr'].setValue([]);
        }
    }

    // private __removeProductFromList__(form:FormGroup,__formEleRef:any):void{
    //     this.__variatyList.forEach((item,index) =>{
    //         if(item === form) {
    //             this.__variatyListDeleted[index.toString()] = true;
    //         }
    //     });
    //     // if(__index && this.__variatyList[__index]) { delete this.__variatyList[__index]; }
    //     $(__formEleRef).fadeOut(300);
    // }

    // private __getVariatiesString__():string{
    //     if(this.formObject.controls['is_variaty'].value !== true) return null;
    //     let __variaties:any = { };
    //     this.__variatyList.forEach((item,index) =>{
    //         if(this.__variatyListDeleted[index.toString()]) return;
    //         let __values = item.controls;
    //         __variaties[index.toString()] =  [__values.sku.value , __values.stock.value , __values.cost.value , __values.price.value];
    //     });
    //     return JSON.stringify(__variaties);
    // }

    private __getSelection__():void{
        this._http.get('taxes?page=1&limit=10000000').subscribe(
            (items) => {
                if(!items.error && items.data){
                    this.__taxesArray = items.data;
                    if(!this.editable && !this.__param){
                        if(this.__settings['default_tax_id'] && typeof(this.__settings['default_tax_id']) === 'number'
                        && this.__settings['default_tax_id'] > 0){
                            for(let i=0; i < this.__taxesArray.length; i++){
                                if(this.__taxesArray[i].id === this.__settings['default_tax_id']){
                                    this.formObject.controls['tax'].setValue(this.__taxesArray[i]['tax']);
                                    break;
                                }
                            }
                        }
                    }
                }else{
                    this.__taxesArray = [];
                }
            },(error) => {
                this.__taxesArray = [];
            }
        );
        this._http.get('storages?page=1&limit=10000000').subscribe(
            (items) => {
                if(!items.error && items.data){
                    this.__storagesArray = items.data;
                    if(this.editable || !this.__storagesArray || this.__storagesArray.length === 0) return;
                    this.formObject.controls['storage'].setValue(this.__storagesArray[(this.__storagesArray.length - 1)].name);
                    this.formObject.controls['storage_id'].setValue(this.__storagesArray[(this.__storagesArray.length - 1)].id);
                    this.formObject.controls['storage_code'].setValue(this.__storagesArray[(this.__storagesArray.length - 1)].code);
                }else{
                    this.__storagesArray = [];
                }
            },(error) => {
                this.__storagesArray = [];
            }
        );
        this._http.get('types?page=1&limit=10000000').subscribe(
            (items) => {
                if(!items.error && items.data){
                    this.__typesArray = items.data;
                }else{
                    this.__typesArray = [];
                }
            },(error) => {
                this.__typesArray = [];
            }
        );
        this._http.get('options?page=1&limit=10000000').subscribe(
            (items) => {
                if(!items.error && items.data){
                    this.__optionsArray = items.data;
                }else{
                    this.__optionsArray = [];
                }
            },(error) => {
                this.__optionsArray = [];
            }
        );
        this._http.get('collections?page=1&limit=10000000').subscribe(
            (items) => {
                if(!items.error && items.data){
                    this.__collectionsArray = items.data;
                }else{
                    this.__collectionsArray = [];
                }
            },(error) => {
                this.__collectionsArray = [];
            }
        );
        this._http.get('brands?page=1&limit=10000000').subscribe(
            (items) => {
                if(!items.error && items.data){
                    this.__brandsArray = items.data;
                }else{
                    this.__brandsArray = [];
                }
            },(error) => {
                this.__brandsArray = [];
            }
        );
    }

    // private __timePerKeyFrame:number = 0;
    private __lastBarkeyCodePressedAt:number=0;
    private __timePerCharPress:number = 60;
    private __initShortCut__():any{
        let _self = this;
        var body:any = document.querySelector('body');
        body.onkeydown = null;
        body.onkeydown = function (e){
            let _error:any = $('div.errors p.error');
            if(_error) _error.remove();
            let CTRL:number = 17, A:number = 65, V:number = 86, C:number = 67, X:number = 88;
            if ((e.ctrlKey && (e.which !== A && e.which !== V && e.which !== C && e.which !== X)) 
            || (e.keyCode >= 112 && e.keyCode <= 123)) {
                e.preventDefault();
            }
            if(e.keyCode === 13){
                _self.OnSubmitForm(_self.formObject.value , _self.formObject.valid);
            }else{
                if((e.timeStamp - _self.__lastBarkeyCodePressedAt) >= _self.__timePerCharPress){
                    _self.__lastBarkeyCodePressedAt = e.timeStamp;
                    _self.__submittedByBarcode = false;
                }else{
                    _self.__lastBarkeyCodePressedAt = e.timeStamp;
                    _self.__submittedByBarcode = true;
                }
            }
            ///-----------------------------------------------------------
            // ALT + S Save Form
            if(e.ctrlKey && e.keyCode == 83) {
                _self.OnSubmitForm(_self.formObject.value,_self.formObject.valid , true);
            }
            // ALT + R Reset Form
            if(e.keyCode === CTRL && e.keyCode == 82){
                _self.__initFormsObject__();
            }
            // ALT + Q Close Form
            if(e.altKey && e.keyCode == 81) {
                _self._lab.__setAlerts__('warn' , 'سيتم تحويلك لصفحة عرض القوائم بناءا على طلبك');
                setTimeout(function() {
                    _self._global.navigatePanel(_self._page);
                }, 1000);
            }
            // press F5 to refresh hole page
            if(e.keyCode === 116){
                location.reload();
            }
            // press Home Button
            if(e.keyCode === 36 && e.ctrlKey && document.activeElement['type'] !== 'text' && document.activeElement['type'] !== 'textarea'){
                _self._lab.__setAlerts__('warn' , 'سيتم تحويلك للصفحة الرئيسية بناءا على طلبك');
                setTimeout(function() {
                    _self._global.navigatePanel('/index');
                }, 1000);
            }
            // press BackSpace Button
            if(e.ctrlKey && e.keyCode === 8 && history.length > 1){
                _self._global.History.pop();
                if(history.length > 1) history.back();
            }
            return true;
        }
    }
}