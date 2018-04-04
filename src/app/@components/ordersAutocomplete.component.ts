import { Component , OnInit , OnChanges , AfterViewInit , EventEmitter , Input , Output } from '@angular/core';
import { HttpRequestService } from './../@services';
import { LabProvider } from './../@providers';
import { FormControl } from '@angular/forms';

declare var $;

@Component({
    selector : 'orders-autocomplete',
    inputs : [
        'field',
        'template',
        'control',
        'search',
        'searchFields',
        'url',
        'isLocal',
        'class',
        'isSup'
    ],
    outputs : ['onsetvalue'],
    template : `
        <div class="col-md-12 autocomplete-cmp orders-autocomplete {{class}}" [hidden]="hide">
            <div class="col-md-12 col-sm-12 col-xs-12 no-p choseautocomplete">
                <ul class="chose-wrp col-md-12 col-sm-12 col-xs-12 no-p">
                    <li [ngClass]="{ 'active' : __searchType === 'PRODUCTS' }" (click)="__changeSearchType('PRODUCTS')">المنتجات و الخدمات</li>
                    <li [ngClass]="{ 'active' : __searchType === 'CONTACTS' && !isSup }" *ngIf="!isSup" (click)="__changeSearchType('CONTACTS')">العملاء و الزبائن</li>
                    <li [ngClass]="{ 'active' : __searchType === 'CONTACTS' && isSup  }" *ngIf="isSup" (click)="__changeSearchType('CONTACTS')">الموردين</li>
                    <li [ngClass]="{ 'active' : __searchType === 'EMPLOYEES'}" (click)="__changeSearchType('EMPLOYEES')">الموظفين</li>
                </ul>
            </div>
            <p class="loading" *ngIf="__searchType === 'PRODUCTS' && (!_items || _items.length === 0)" (click)="OnClickMe(null)">لايوجد نتائج للمنتجات و الخدمات<span class="float_opp">اخفاء</span></p>
            <p *ngFor='let item of _items' (click)="OnClickMe(item)"><a>
                <p class='auto-name-top'>{{ item.name }}</p><p class='auto-name-bottom small'>{{ item.sku }}</p>
            </a></p>
            <p class="loading" *ngIf="__searchType === 'CONTACTS' && (!_cusItems || _cusItems.length === 0)" (click)="OnClickMe(null)">لايوجد نتائج للزبائن<span class="float_opp">اخفاء</span></p>
            <p *ngFor='let cusItem of _cusItems' (click)="OnClickMe(cusItem , __CUSSUPSTR)"><a>
                <p class='auto-name-top'>{{ cusItem.name }}</p><p class='auto-name-bottom small'>{{ cusItem.code }}</p>
            </a></p>
            <p class="loading" *ngIf="__searchType === 'EMPLOYEES' && (!_empItems || _empItems.length === 0)" (click)="OnClickMe(null)">لايوجد نتائج للموظفين و المندوبين<span class="float_opp">اخفاء</span></p>
            <p *ngFor='let empItem of _empItems' (click)="OnClickMe(empItem , 'employee')"><a>
                <p class='auto-name-top'>{{ empItem.name }}</p><p class='auto-name-bottom small'>{{ empItem.code }}</p>
            </a></p>
            
        </div>
    `
})
export class OrdersAutocompleteComponent implements OnInit,AfterViewInit,OnChanges{

    public onsetvalue  :any = new EventEmitter();
    public field       :Array<string>;
    public detField    :Array<string>;
    public template    :string = '';
    public control     :FormControl;
    public search      :any;

    public url      :string;
    public isLocal  :boolean = true;
    public hide     :boolean = true;
    public isSup    :boolean = false;
    public class    :string = ''
    
    private __clicked:boolean;
    private __clickedSearch:string;
    private _items  :Array<any>;
    private _cusItems:Array<any>;
    private _empItems:Array<any>;
    private __CUSSUPSTR:string = 'customer';
    private __searchType:string = 'PRODUCTS';

    constructor(
        private _http:HttpRequestService,
        private _lab:LabProvider
        ){}

    ngOnInit():void{ 
        this.__CUSSUPSTR = this.isSup ? 'supplier' : 'customer';
        this.field = ['name' , 'sku'],
        this.detField = ['name' , 'code'];
        this.__clearData__();
    }

    ngAfterViewInit():void{
        this.__checkKeybardInputs();
    }

    ngOnChanges(props: any):void {
        if(!props.hasOwnProperty('search') || !props.search.currentValue) return;
        if(props.search.currentValue.length === 0){
            this.__clearData__();
            return;
        }
        if(props.search.currentValue === this.__clickedSearch){
            this.__clicked = !this.__clicked;
            this.__clickedSearch = null;
            return;
        }
        if((props.search.previousValue) && (props.search.currentValue === props.search.previousValue))
            return;

        this.hide = false;
        this.__getData__();
        this.__showAndHide__();
    }

    OnClickMe(item:any = null , type:'customer'|'supplier'|'employee'|'search' = 'search'):void{
        if(item === null) {
            this.__clearData__();
            return;
        }
        if(item.template) delete item.template;
        if(item){
            this.__clicked = true;
            this.__clickedSearch = (<string>item.name);
            this.onsetvalue.emit({
                item : item,
                class : type
            });
        }
        this.__clearData__();
    }

    private __changeSearchType(type:string):void{
        this.__searchType = type;
        this._items = [];
        this._cusItems = [];
        this._empItems = [];
        this.__getData__();
    }

    private __getData__():void{
        if(this.__submittedByBarcode && this.__searchType === 'PRODUCTS') {
            return;
        }
        
        if(this.__searchType === 'PRODUCTS'){
            let __URL:string       = 'products/?page=1&limit=5&search=name-sku&name='+this.control.value+'&sku='+this.control.value+'&logic=||';
            this._http.get(__URL).subscribe(
                (items) => 
                {
                    if(items.errors){
                        this.__setErrors__(items.errors);
                        return;
                    }

                    if(items.count === 1){
                        for(let i:number=0; i < this.field.length ; i++){
                            if(items.data[0][this.field[i]].toString() === this.control.value.toString()){
                                this.OnClickMe(items.data[0]);
                                return;
                            }
                        }
                    }
                    if(!items.data || items.count === 0)
                        this._items = [];
                    else{
                        this._items = items.data;
                    }
                },
                (response) => { this.__setErrors__(response); },
                () => {}
            );
        }

        if(this.__searchType === 'PRODUCTS' && this.__submittedByBarcode){
            this.__submittedByBarcode = false;
            return;
        }
        // =======================================================
        // =======================================================
        // =======================================================
        // =======================================================
        if(this.__searchType === 'CONTACTS'){
            let __CUSSUP:string    = this.isSup ? 'suppliers' : 'customers';
            let __CUSSUPURL:string = __CUSSUP + '/?page=1&limit=5&search=name-code&name='+this.control.value+'&code='+this.control.value+'&logic=||';
            this._http.get(__CUSSUPURL).subscribe(
                (items) => 
                {
                    if(items.errors){
                        this.__setErrors__(items.errors);
                        this._cusItems = [];
                        return;
                    }
                    
                    if(!items.data || items.count === 0)
                        this._cusItems = [];
                    else{
                        this._cusItems = items.data;
                    }
                },
                (response) => { this.__setErrors__(response); this._cusItems = []; },
                () => {}
            );
        }
        // =======================================================
        // =======================================================
        // =======================================================
        // =======================================================
        if(this.__searchType === 'EMPLOYEES'){
            let __EMPURL:string    = 'employees/?page=1&limit=5&search=name-code&name='+this.control.value+'&code='+this.control.value+'&logic=||';
            this._http.get(__EMPURL).subscribe(
                (items) => 
                {
                    if(items.errors){
                        this.__setErrors__(items.errors);
                        this._empItems = [];
                        return;
                    }
                    
                    if(!items.data)
                        this._empItems = [];
                    else{
                        this._empItems = items.data;
                    }
                },
                (response) => { this.__setErrors__(response);this._empItems = []; },
                () => {}
            );
        }
    }
    private __setErrors__(errors:any):void{
    }
    private __clearData__():void{
        this.control.setValue('');
        this._items = [];
        this._cusItems = [];
        this._empItems = [];
        this.hide = true;
    }

    private __showAndHide__():void{
        let __input = $('input[name="' + this.class + '"]');
        let self = this;
        __input.focusout(function(e){
            setTimeout(function(){
                if(!self.hide) self.hide = true;
            },300);
        });
    }

    private __submittedByBarcode:boolean = false;
    private __lastBarkeyCodePressedAt:number=0;
    private __timePerCharPress:number = 60;
    private __checkKeybardInputs():void{
        let _self = this;
        _self._lab.jQuery(document).on('keydown' ,function(e){
            // e.preventDefault();
            if(e.keyCode === 13 && _self.__submittedByBarcode){
                _self.__getData__();
            }else{
                if((e.timeStamp - _self.__lastBarkeyCodePressedAt) >= _self.__timePerCharPress){
                    _self.__lastBarkeyCodePressedAt = e.timeStamp;
                    _self.__submittedByBarcode = false;
                }else{
                    _self.__lastBarkeyCodePressedAt = e.timeStamp;
                    _self.__submittedByBarcode = true;
                }
            }
            return true;
        });
    }
}