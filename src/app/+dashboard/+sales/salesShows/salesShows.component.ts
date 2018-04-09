import { Component, OnInit , OnChanges , EventEmitter } from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GlobalProvider , LabProvider, RouterTransition } from './../../../@providers';
import { Sales , Orders , Accounts } from './../../../@interfaces';
import { HttpRequestService } from './../../../@services';

// import  * as child from './../../exports';


@Component({
    selector : 'sales-shows',
    templateUrl : './salesShows.html',
    providers : [
        GlobalProvider,
        LabProvider,
        HttpRequestService,
    ],
    animations : [RouterTransition('Form')],
    host : {'[@RouterTransition]': ''},
    inputs : ['isDynamic' , 'backstr' , 'param' , 'data' , 'print' ],
    outputs : ['onAction']
})
export class SalesShowsComponent implements OnInit, OnChanges{

    public isDynamic:boolean = false;
    public param:string;
    public print:boolean = false;
    public data:any;
    public backstr:string = 'الرجوع للقائمة';
    public onAction = new EventEmitter();
    public item:any = { };
    private orders:Orders[] = [];
    private customer:any = { };
    private employee:any = { };
    private _page:string = 'sales/';
    private __param:string;
    private __isPrint:boolean = false;
    private __now:Date = new Date();
    private __firstLetterLogo:string = "";

    private __pages:Array<any> = [];
    private __list:Array<any> = [];
    private __currentPage:number = 1;
    private __pagesCount = 0;
    private __perpage:number = 10;
    private __pagesShown:Array<boolean> = [true];
    private __lasShownPage:number = 0;
    private __modal:string = "print";
    private __printFormObject:FormGroup;
    private submitted:boolean = false;


    constructor(
        private _router : Router,
        private _route : ActivatedRoute,
        private _fb:FormBuilder,
        private _global:GlobalProvider,
        private _http:HttpRequestService,
        private _lab:LabProvider
        ){}

    ngOnInit():any{
        // window['me'] = this;
        this.__init__();
        this.__perpage = this._global.config['report_perpage'];
        let __account:Accounts = this._global.getToken()['account'];
        if(!__account){
            this._lab.__setAlerts__('warn' , 'لا تملك التصريح لدخول الصفحة .... \n سيتم تحويل لصفحة الدخول');
            this._lab.__setLogout__(this._http);
            this._global.navigate('login');
            return;
        }
        this.__firstLetterLogo = __account.name.substr(0 , 1).toUpperCase();
    }

    ngOnChanges(props:any){
        if(props.param && props.param.currentValue){
            this.__getRouterParamsData__(props.param.currentValue);
        }
        if(props.data && props.data.currentValue){
            this.item = props.data.currentValue.item;
            this.customer = props.data.currentValue.customer;
            this.employee = props.data.currentValue.employee;
            this.orders = props.data.currentValue.orders;
            this.__preparePagesAndOrders();
        }
        if(props.print && props.print.currentValue && props.print.currentValue === true){
            this.onShowPrintDialog();
        }
    }

    OnDelete():void{
        if(!this.item || !this.item.id) return
        this._http.delete('sales/' + this.item.id).subscribe(
            (item) => {
                if(item.data && !item.error){
                    if(!this.isDynamic) this._global.navigatePanel('sales');
                    return;
                }
                this._lab.__setErrors__(item.error);
            },(error) => {
                this._lab.__setErrors__(error);
            },() => {}
        );
    }

    OnChangeStatus(status:string):void{
        if(!this.item || !this.item.id) return;
        this._http.put('sales/status/' + this.item.id , { status : status}).subscribe(
            (item) => {
                if(item.data && !item.error){
                    this.item = item.data;
                }else{
                    this._lab.__setErrors__(item.error);
                }
            },(error) => {
                this._lab.__setErrors__(error);
            },() => {}
        );
    }

    private __init__():void{
        this.__initPrintFormObject__();
        this.__getRouterParamsData__();
        this.__initShortCut__();
    }

    OnPrint():void{
        this._lab.__OnReportActions__({action:"PRINT"} , this);
    }

    private __initPrintFormObject__():void{
        let intRegex:RegExp = this._global.config["intRegex"];
        this.__printFormObject = this._fb.group({
            from : [1 , [Validators.required , Validators.pattern(intRegex)]],
            to   : [1 , [Validators.required , Validators.pattern(intRegex)]],
        });
    }

    private validateControl(name:string , error:boolean=false):boolean{
         if(!this.__printFormObject.value.hasOwnProperty(name)){
            return false;
        }
        return (!this.__printFormObject.controls[name].valid && (!this.__printFormObject.controls[name].pristine || this.submitted));
    }

    private __preparePagesAndOrders():void{
        this.__initPrintFormObject__();
        this.__pagesShown = [];
        this.__pagesShown;
        if(!this.orders || !this.orders.hasOwnProperty('length') || !this.orders.length){
            this.orders = [];
        }
        this.__pagesCount = Math.ceil(this.orders.length / this.__perpage);
        this.__printFormObject.controls['to'].setValue(this.__pagesCount);
        for(let i = 0; i < this.orders.length; i++){
            let __number:number = (Math.ceil((i+1) / this.__perpage) - 1);
            if(!this.__pages[__number]){
                this.__pages[__number] = [this.orders[i]];
                this.__pagesShown.push(__number === 0);
            }else{
                this.__pages[__number].push(this.orders[i]);
            }
        }
        this.__printFormObject.controls['to'].setValue(this.__pagesCount);
    }

    private onShowPrintDialog():void{
        this.__modal = 'print';
        this._lab.__modal('#show-invoice-modal');
    }

    private OnSubmitPrintForm(value:any , valid:boolean):void{
        let __errMsg:boolean = false;
        this.submitted = true;
        let __from:any = this.__printFormObject.value.from;
        let __to:any   = this.__printFormObject.value.to;
        if(typeof(__from) !== 'number'){
            let __fromStr:string = __from.toString();
            __from = parseInt(__fromStr) > 0 ? parseInt(__fromStr) : 1;
        }
        if(typeof(__to) !== 'number'){
            let __toStr:string = __to.toString();
            __to = parseInt(__toStr) > 0 ? parseInt(__toStr) : this.__pagesCount;
        }
        if(__from <= 0){
            __errMsg = true;
            this.__printFormObject.controls['from'].setValue(1);
        }
        if(__from > this.__pagesCount){
            __errMsg = true;
            this.__printFormObject.controls['from'].setValue(1);
        }
        if(__to <= 0){
            __errMsg = true;
            this.__printFormObject.controls['to'].setValue(this.__pagesCount);
        }
        if(__to > this.__pagesCount){
            __errMsg = true;
            this.__printFormObject.controls['to'].setValue(this.__pagesCount);
        }
        if(__errMsg) return this._lab.__setAlerts__('warn' , 'الرجاء اختيار صفحات الطباعة مابين 1 الى ' + this.__pagesCount.toString());
        this.__showFromPageXToPageY(__from , __to);
        this._lab.jQuery('.modal .modal-header button.close').click();
        let self = this;
        setTimeout(function() {
            self.OnPrint();
        }, 1000);
    }

    private __showFromPageXToPageY(from:number , to:number):void{
        if(from < 1 || from > to || from > this.__pagesCount) from = 1;
        if(to  > this.__pagesCount || from > to) to = this.__pagesCount;
        let __editShown:boolean = false;
        this.__pagesShown.forEach((focus , index) => {
            if(!__editShown && focus === true){
                __editShown = focus;
                this.__lasShownPage = index;
            }
            this.__pagesShown[index] = index >= (from - 1) && index < to;
        });
        this.__currentPage = from;
        if(!__editShown) this.__lasShownPage = 0;
        this.__printFormObject.controls['to'].setValue(this.__pagesCount);
    }

    private showLastShownPage():void{
        this.__pagesShown.forEach((focus , index) => {
            this.__pagesShown[index] = index === this.__lasShownPage;
        })
    }

    changePage(page:number):void{
        if(page <= 0 || page > this.__pagesCount) return;
        this.__currentPage = page;
        this.__showFromPageXToPageY(page , page);
    }

    private __getRouterParamsData__(__param:string = null):void{
        this._lab.__setGlobal__(this._global);
        if(!this.isDynamic){
            if(this._route.params['value'] && this._route.params['value']['id'] &&
                this._global.config['intRegex'].test(this._route.params['value']['id'])){
                this.__param = this._route.params['value']['id'];
            }
        }
        else{
            if(__param !== null){
                this.__param = __param;
            }
        }
        if(this.__param){
            this._http.get(this._page + this.__param).subscribe(
                (item) => {
                    if(item.error !== null) {
                        this._lab.__setErrors__(item.error);
                        return;
                    }
                    if(item.data.status === 'parked'){
                        if(!this.isDynamic){
                            this._lab.__setAlerts__('error' , 'لايمكن عرض فاتورة غير منتهية البيانات');
                            return this._global.navigatePanel('sales');
                        }
                    }
                    this.item = item.data;
                    this.__getOrders__();
                    this.__getCustomer__();
                },
                (error) => {
                    if(!this.isDynamic){
                        this._lab.__setErrors__(error);
                        this._global.navigatePanel('sales');
                    }
                },
                () => {}
            );
        }else{
            if(this.isDynamic === false){
                this._lab.__setAlerts__('error' , 'يبد أن الفاتورة اللتى طلبتها غير موجودة أو تم حذفها');
                this._global.navigatePanel('sales');
            }
        }
    }

    private __getOrders__():void{
        this._http.get('orders/?contains=false&search=father_id&father_id=' + this.item.id).subscribe(
            (items) => {
                if(!items.error === null || !items.data || items.data.length === 0){
                    this.orders = [];
                    this.__pagesShown = [true];
                    this._lab.__setAlerts__('error' , 'فشل فى عملية جلب قائمة الطلبات يرجى التأكد من سلامة الاتصال  و اعادة الطلب مرة أخرى')
                    return;
                }
                this.orders = <Orders[]>items.data;
                this.__preparePagesAndOrders();
            },(error) => { this._lab.__setErrors__(error);
            },() => {}
        );
    }

    private __getCustomer__():void{
        if(!this.item.customer || !this.item.customer_id) return;
        this._http.get('customers/'+ this.item.customer_id).subscribe(
            (items) => {
                if(!items.error === null || !items.data || items.data.length === 0){
                    return;
                }
                this.customer = items.data;

            },(error) => { this._lab.__setErrors__(error);
            },() => {}
        );
    }

    private __initShortCut__():any{
        // let _self = this;
    }
}
