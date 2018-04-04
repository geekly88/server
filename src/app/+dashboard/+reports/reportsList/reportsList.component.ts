import { Component, OnInit/*, OnChanges, AfterViewInit*/ } from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AutocompleteComponent } from './../../../@components';
import { GlobalProvider , LabProvider, RouterTransition } from './../../../@providers';
import { Sells , Products , BooksTree } from './../../../@interfaces';
import { HttpRequestService } from './../../../@services';

@Component({
    selector : 'reports-list',
    templateUrl : './reportsList.html',
    providers : [
        GlobalProvider, 
        LabProvider, 
        HttpRequestService,
    ],
    animations : [RouterTransition('Form')],
    host : {'[@RouterTransition]': ''}
})
export class ReportsListComponent implements OnInit{
    
    private __CHANGABLE__:number = 0;
    private __DEPART__:string;
    private __BY__:string;
    private __from:Date;
    private __to:Date;
    private __showReport__:boolean = false;
    private __showCharts:boolean = false;
    private __showChartsType:string = 'sells';
    private __sellsChartsData:Array<any> = [];
    private __invoicesChartsData:Array<any> = [];
    private __buysChartsData:Array<any> = [];
    private __sortBy:string = 'date';
    private __filters:Object = { };
    private __zakat:Object = null;
    private __products:Array<Products> = [];
    private __booksArray:Array<BooksTree> = [];

    private __oldBy:string = '';
    private __oldDepart:string = '';


    private formObject:FormGroup;
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

    constructor(
        private _global:GlobalProvider,
        private _http:HttpRequestService,
        private _lab:LabProvider,
        private _fb:FormBuilder
        ){}

    ngOnInit():any{
        this.__prepareDateRange__();
        // this.__getChartsData('OnInit');
        this.__initFilters__();
        this.__initFormObject__();
        // this.__getBooksArray__();
        // console.log(this.__booksArray , "BOOKSARRAY");
    }

    prepareReport(__depart__:string=null,__by__:string = null):void{
        let __body:any = this._lab.jQuery('body');
        let __picker:any = __body.find('.daterangepicker.show-calendar.dropdown-menu');
        this._lab.jQuery('#show-filters button.close').click(); // dismiss any modals
        if(__picker && __picker.hasOwnProperty('remove')) __picker.remove();
        if(!__depart__ || !__by__) return;
        if((this.__filters[__depart__]) && (this.__filters[__depart__][__by__] 
        || this.__filters[__depart__]['all'])){
            /*if(__depart__ === 'BOOKKEPPING' && this.__booksArray.length === 0){
                this.__getBooksArray__();
            }else */if(__depart__ === 'ZAKAT'){
                this.__prepareZakatObject();
            }
            this.__oldBy = __by__;
            this.__oldDepart = __depart__;
            this.__showReport__ = false;
            this.formObject.reset();
            this._lab.__modal('#show-filters');        
        }else{
            if(__depart__ === 'BOOKKEPPING' && this.__booksArray.length === 0){
                this.__getBooksArray__();
            }
            this.__DEPART__ = __depart__;
            this.__BY__ = __by__;
            this.__oldBy = '';
            this.__oldDepart = '';
            this.__showReport__ = true;
            this.__CHANGABLE__++;
        }
    }

    onSubmitForm(__by:string = null , __depart:string = null):void{
        this.__BY__ = __by || this.__oldBy;
        this.__DEPART__ = __depart || this.__oldDepart;
        this._lab.jQuery('#show-filters button.close').click();
        this.__showReport__ = true;
        this.__CHANGABLE__++;
    }
    
    validateControl(control:string=''):boolean{
        if(!this.formObject.controls[control]){
            return false;
        }
        return this.formObject.controls[control].valid;
    }

    __initFilters__():void{
        this.__filters = {
            PRODUCTS : { 
                traffic : true 
            },
            RESULTS : {
                chose : true
            },
            ZAKAT : {
                all : true
            }/*,
            BOOKKEPPING : {
                all : true
            }*/
        }
    }

    __initFormObject__():void{
        this.nameRegex= this._global.config["nameRegex"];
        this.intRegex = this._global.config["intRegex"];
        this.formObject = this._fb.group({
            product_name : ['' , Validators.pattern(this.nameRegex)],
            book         : ['all' , Validators.pattern(this.intRegex)]
        });
    }

    __prepareZakatObject():void{
        this._http.get('products?search=is_product&is_product=true&page=1&limit=1000000').subscribe(
            (response) => {
                if(response.data && response.data instanceof Array && response.data.length > 0){
                    this.__products = <Array<Products>>response.data;
                }else{
                    this.__products = [];
                    return this.__zakat = null
                }
                let prices:number=0,costs:number=0;
                this.__products.forEach((pro,index) => {
                    if(pro.is_trackable && pro.stock <= 0) return;
                    prices += pro.stock * pro.price;
                    costs  += pro.stock * pro.cost;
                });
                this.__zakat = {
                    prices : prices,
                    costs  : costs
                };
            },(error) => {
                this._lab.__setErrors__(error);
            },() => {}
        )
    }

    onAction($event):void{
        switch($event.action){
            case 'GOBACK':
                this.__showReport__ = false;
                break;
        }
    }
    __prepareDateRange__():void{
        this.__from = new Date();
        let __time = this.__from.getTime() - (3600 * 24);
        let __day:number = (3600 * 24 * 1000);
        let __endTime:number = new Date().getTime() + (__day - 1000); // to convert to last seconds of the day
        this.__to = new Date(__endTime);
    }

    private __getBooksArray__():void{
        this._lab.__getBooksTree__(this , '__booksArray' , () => {});
    }

    // changeShowingChart(show:boolean):void{
    //     this.__showCharts = show;
    //     if(show){
    //         this.__getChartsData();
    //     }
    // }
    
    // OnChangeChartType(type:string = 'sells'):void{
    //     switch (type) {
    //         default:
    //             this.__sortBy = 'date';
    //             break;
    //     }
    //     this.__showChartsType = type;
    //     this.__getChartsData();
    // }

    // private __getChartsData(from:string = ''):void{
    //     let __start:number = new Date().getTime();
    //     let __day:number = (3600 * 24 * 1000);
    //     let __to:string = this._lab.__toDateAPI__(new Date());
    //     let __from:string = this._lab.__toDateAPI__(new Date((__start - (__day * 15))));
    //     let __URL__:string = 'reports/charts/'+this.__showChartsType + '?sort=ASC&sortby='+this.__sortBy;
    //     //__URL__ += '&from='+__from+'&to='+__to;
    //     this._http.get(__URL__).subscribe(
    //         (response) => {
    //             if(response.data && response.data.length > 0){
    //                 let __model:string = '__' + this.__showChartsType + 'ChartsData';
    //                 this[__model] = response.data;
    //             }else{
    //                 this.__retriveMockingData();
    //             }
    //         },(error) => { this.__retriveMockingData(); 
    //         },() => {}
    //     );
    // }

    // private __retriveMockingData():void{
    //     let data:any = {
    //                         count : 1,
    //                         total : 3,
    //                         price : 5,
    //                         discount : 1,
    //                         sells_discount : 1,
    //                         tax : 1,
    //                         paid : 3,
    //                         date : '11/5'
    //                     };
    //     let data2:any = {
    //                         count : 0,
    //                         total : 0,
    //                         price : 0,
    //                         discount : 0,
    //                         sells_discount : 0,
    //                         tax : 0,
    //                         paid : 0,
    //                         date : '12/5'
    //                     };
    //     let data3:any = {
    //                         count : 0,
    //                         total : 0,
    //                         price : 0,
    //                         discount : 0,
    //                         sells_discount : 0,
    //                         tax : 0,
    //                         paid : 0,
    //                         date : '13/5'
    //                     };
    //     let data4:any = {
    //                         count : 0,
    //                         total : 0,
    //                         price : 0,
    //                         discount : 0,
    //                         sells_discount : 0,
    //                         tax : 0,
    //                         paid : 0,
    //                         date : '14/5'
    //                     };
    //     let __model:string = '__' + this.__showChartsType + 'ChartsData';
    //     this[__model] = [
    //         data,
    //         data2,
    //         data3,
    //         data4,
    //     ];
    // }
}