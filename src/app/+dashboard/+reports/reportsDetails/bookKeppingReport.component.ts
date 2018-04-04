import { Component, OnInit, OnChanges, AfterViewInit , EventEmitter } from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AutocompleteComponent } from './../../../@components';
import { GlobalProvider , LabProvider, RouterTransition } from './../../../@providers';
// import * as interfaces from './../../../@interfaces';
import { HttpRequestService } from './../../../@services';
import { MyCurrencyPipe } from './../../../@pipes';
import { DatePipe } from '@angular/common';

@Component({
    selector : 'bookkepping-report',
    templateUrl : './booksTree.html',
    providers : [
        GlobalProvider, 
        LabProvider, 
        HttpRequestService,
    ],
    inputs : ['by' , 'from' , 'to' , 'controls', 'changable' , 'isHTTP' , 'data'],
    outputs : ['onAction'],
    animations : [RouterTransition('Form')],
    host : {'[@RouterTransition]': ''}
})
export class BookKeppingReportComponent implements OnInit,OnChanges{

    public by:string = '';
    public from:Date;
    public to:Date;
    public controls:FormGroup;
    public changable:number;
    public isHTTP:boolean = true;
    public data:Array<any> = [];


    private __reportTitle__:string = '';
    private __dateRangeStr__:string = '';
    private __createdAt__:Date = new Date();
    private __list:Array<any> = [];
    private __pages:Array<any> = [];
    private __currentPage:number = 1;
    private __pagesCount = 0;
    private __perpage:number = 15;
    private __lang:Object;
    private __allowed:Object;
    private __loopArray:Array<string> = [];
    private __startPrinterPage:number = 0;
    private __endPrinterPage:number = 0;

    private __URL:string = 'reports/booktree/';
    private onAction = new EventEmitter();
    private __code:string = 'all';
    private __title:string = 'تقارير الحسابات';

    constructor(
        private _global:GlobalProvider,
        private _http:HttpRequestService,
        private _lab:LabProvider
    ){}

    ngOnInit():any{
        this.__prepareDateRange__();
        this.__perpage = this._global.config['report_perpage'];
        this._lab.__setReportsShortcuts(this);
    }

    ngOnChanges(props:any):void{
        this.__code = this._global.config['intRegex'].test(this.controls.value.book) ? this.controls.value.book : 'all';
        this.__init__();
        this.__reportTitle__ = '';
    }

    onActionReport($event):void{
        switch ($event.action) {
            case 'FILTER':
                this.__allowed = $event.allowed;
                this.from = $event.filter.start;
                this.to = $event.filter.end;
                this.__prepareLoopArray__();
                this.__getItems(true);    
                break;
            case 'GOBACK':
                this.onAction.emit({
                    action : $event.action
                });
                break;
            case 'PRINT':
            case 'PRINTDIALOG':
                this._lab.__OnReportActions__({ action:"PRINT" , noDialog : true } , this);
            default:
                this._lab.__OnReportActions__($event , this);
                break;
        }
    }

    private __checkDate__():void{
        if(!this.from || !this.to){
            this.__prepareDateRange__();
        }
    }

    private __prepareDateRange__():void{
        // back 6 days from today cus the 7th day is today
        let __day:number = (3600 * 24 * 6 * 1000);
        let __start:number = new Date().getTime();
            __start = (__start - __day);
        this.to = new Date((__start + __day - 1000));
        this.from = new Date(__start);
    }

    private __init__():void{
        // this.__allowed  =  { };
        // this.__lang = { };

        // this.__allowed['name_ar'] = true;
        // this.__allowed['name'] = false;
        // this.__allowed['code'] = false;
        // this.__allowed['creditor'] = true;
        // this.__allowed['debitor'] = true;


        // this.__lang['name_ar'] = 'الدليل';
        // this.__lang['name'] = 'الدليل لاتينى';
        // this.__lang['code'] = 'الكود';
        // this.__lang['creditor'] = 'دائن';
        // this.__lang['debitor'] = 'مدين';
                
        this.__prepareLoopArray__();
        this.__getItems();
    }

    private __setCodeCreditorANDebitor(items:Array<any>,__codes:any):void{

        items.forEach((item) => {
            // item.is_cred_deb = true;
            var reg:RegExp = new RegExp('^' + item.code);

            if(!item.creditor) item.creditor = 0;
            if(!item.debitor)  item.debitor  = 0;
            for(let code in __codes.creditor){
                if(reg.test(code)) {
                    item.creditor += __codes.creditor[code];
                }
            }
            for(let code in __codes.debitor){
                if(reg.test(code)) {
                    item.debitor += __codes.debitor[code];
                }
            }
            item.focus = true;
            if(item.children && item.children.length > 0/* && (this.__code === 'all' 
            || this.__code.charAt(0) === item.code.charAt(0))*/){
                let __children:Array<any> = Object['assign']([] , item.children);
                delete item.children;
                this.__setCodeCreditorANDebitor(__children , __codes);
                // if(this.__code === 'all' || (item.code.indexOf(this.__code) === 0)){
                    this.__list.push(item);
                // }
            }else{
                // if(this.__code === 'all' || (item.code.indexOf(this.__code) === 0)){
                //     console.log(item.code);
                    this.__list.push(item);
                // }
            }
        });
    }

    private __flattenData__(list:Array<any>):void{
        if(!list || list.length === 0) return;
        list.forEach((book) => {
            if(book.children && book.children.length > 0){
                let __children:Array<any> = Object['assign']([] , book.children);
                delete book.children;
                this.__list.push(book);
                this.__flattenData__(__children);
            }else{
                // if(this.__code === 'all' || (book.code.indexOf(this.__code) === 0)){
                    this.__list.push(book);
                // }
            }
        });
    }

    private __getItems(is_refresh:boolean = false):void{
        if(!this._global.getToken()['settings'].is_bookKepping){
            return this._lab.__setAlerts__('warn' , 'خدمة المحاسبة غير مفعلة حاليا');
        }
        this.__checkDate__();
        if(!is_refresh && (!this.isHTTP || !this.data || this.data.length === 0)){
            this.__list = new Array();
            this.__flattenData__(this.data);
            return this.__preparePages__();
        }
        let __URL__:string = this.__URL + this.__code;
        __URL__ += '?from=' + this._lab.__toDateAPI__(this.from,true,true);
        __URL__ += '&to=' + this._lab.__toDateAPI__(new Date(this.to.getTime() + (3600 * 24 * 1000) - 1000),true,true);
        this._http.get(__URL__).subscribe(
            (items)=> {
                if(items.error){
                    return this._lab.__setErrors__(items.error);
                }

                this._lab.__buildBooksTree__(this.data , (__tempList) => {
                    this.__list = new Array();
                    this.__setCodeCreditorANDebitor(__tempList , items.data);
                });
                this.__preparePages__();
            },(error)=>{
                this._lab.__setErrors__(error);
            },() => {}
        );
    }

    private __preparePages__():void{
        this.__pages = [];
        this.__currentPage = 1;
        this.__pagesCount = 1;
        this.__pagesCount = Math.ceil(this.__list.length / this.__perpage);

        let settings:any = this._global.getToken()['settings'];
        let currency = settings['currency'] || '$';

        for(let i = 0; i < this.__list.length; i++){
            let __number:number = (Math.ceil((i+1) / this.__perpage) - 1);
            for(let __key in this.__list[i]){
                switch (__key) {
                    case 'creditor':
                    case 'debitor':
                        let __value:string = this.__list[i][__key].toString();
                        if(__value.indexOf(currency) >= 0) return;
                        __value = new MyCurrencyPipe(this._global).transform(__value , []);
                        break;
                }
            }
            if(!this.__pages[__number]){
                this.__pages[__number] = [this.__list[i]];
            }else{
                this.__pages[__number].push(this.__list[i]);
            }
        }
    }

    changePage(page:number):void{
        if(page > this.__pagesCount) page = this.__pagesCount;
        if(page <= 0) page = 1;
        this.__currentPage = page;
    }

    __prepareLoopArray__():void{
        let __loopArray:Array<string> = [];
        for(let __key in this.__allowed){
            if(this.__allowed[__key]){
                __loopArray.push(__key);
            }
        }
        this.__loopArray = __loopArray;
    }
}