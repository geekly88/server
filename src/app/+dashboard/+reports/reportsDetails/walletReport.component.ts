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
    selector : 'wallet-report',
    templateUrl : './Report.html',
    providers : [
        GlobalProvider, 
        LabProvider, 
        HttpRequestService,
    ],
    inputs : ['by' , 'from' , 'to' , 'controls', 'changable'],
    outputs : ['onAction'],
    animations : [RouterTransition('Form')],
    host : {'[@RouterTransition]': ''}
})
export class WalletReportComponent implements OnInit,OnChanges{

    public by:string = '';
    public from:Date;
    public to:Date;
    public controls:FormGroup;
    public changable:number;
    
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
    private __byArray:Object = {};
    private __startPrinterPage:number = 0;
    private __endPrinterPage:number = 0;

    private __pagesShown:Array<boolean> = [true];
    private __lasShownPage:number = 0;
    private __modal:string = 'print';
    private submitted:boolean = false;
    private __printFormObject:FormGroup;

    private __sortby:string;
    private __order:string = 'ASC';
    private __URL:string = 'reports/wallet/';
    private onAction = new EventEmitter();

    constructor(
        private _fb:FormBuilder,
        private _global:GlobalProvider,
        private _http:HttpRequestService,
        private _lab:LabProvider
    ){}

    ngOnInit():any{
        this.__prepareDateRange__();
        this.__perpage = this._global.config['report_perpage'];
        this.__byArray = {
            expenses : 'تقارير المصاريف',
            paids : 'تقارير المدفوعات',
            recives : 'تقارير المقبوضات',
            total : 'تقارير الأجمالية للدفع و القبض'
        };
        this._lab.__setReportsShortcuts(this);
    }

    ngOnChanges(props:any):void{
        this.__init__();
        this.__reportTitle__ = this.__byArray[this.by];
    }

    onActionReport($event):void{
        switch ($event.action) {
            case 'FILTER':
                this.__allowed = $event.allowed;
                this.from = $event.filter.start;
                this.to = $event.filter.end;
                this.__prepareLoopArray__();
                this.__getItems();    
                break;
            case 'GOBACK':
                this.onAction.emit({
                    action : $event.action
                });
                break;
            case 'PRINTDIALOG':
                this.onShowPrintDialog();
                break;
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
        let __day:number = (3600 * 24 * 6 * 1000);
        let __start:number = new Date().getTime();
            __start = (__start - __day);
        this.to = new Date((__start + __day - 1000));
        this.from = new Date(__start);
    }

    private __init__():void{
        this.__initPrintFormObject__();
        this.__allowed  =  { };
        this.__lang = { };
        switch (this.by) {
            case 'expenses':
            case 'paids':
            case 'recives':
                this.__allowed['number'] = true;
                this.__allowed['reference'] = false;
                this.__allowed['title'] = true;
                this.__allowed['paid_date'] = true;
                this.__allowed['tax'] = true;
                this.__allowed['amount'] = true;
                this.__allowed['payment_way'] = false;
                this.__allowed['category'] = false;
                this.__allowed['to'] = false;
                if(this.by !== 'expenses') this.__allowed['from'] = false;
                if(this.by !== 'expenses') this.__allowed['name'] = false;
                
                this.__lang['number'] = 'المدفوع';
                this.__lang['reference'] = 'المرجع';
                this.__lang['title'] = 'السعر';
                this.__lang['paid_date'] = 'التاريخ';
                this.__lang['tax'] = 'الضريبة';
                this.__lang['amount'] = 'المبلغ';
                this.__lang['payment_way'] = 'طرق الدفع';
                this.__lang['category'] = 'التصنيف';
                this.__lang['to'] = 'الى';
                if(this.by !== 'expenses') this.__lang['from'] = 'من';
                if(this.by !== 'expenses') this.__lang['name'] = 'الاسم';
                this.__order = 'ASC';
                this.__sortby = 'paid_date';
                break;
            default:
                this.__allowed['account'] = true;
                this.__allowed['from'] = false;
                this.__allowed['amount'] = true;
                this.__allowed['count'] = true;
                this.__allowed['avrage'] = true;

                this.__lang['account'] = 'المعاملة';
                this.__lang['count'] = 'عدد المعاملات';
                this.__lang['amount'] = 'الاجمالى';
                this.__lang['avrage'] = 'المتوسط';
                this.__lang['from'] = 'من';
                this.__order = 'ASC';
                this.__sortby = 'id';
                break;
        }
        this.__prepareLoopArray__();
        this.__getItems();
    }

    private __getItems():void{
        this.__checkDate__();
        let __URL__:string = this.__URL + this.by + '?';
        if(this.by === 'all') __URL__ += 'sort=' + this.__order + '&sortby=' + this.__sortby;
        __URL__ += '&from=' + this._lab.__toDateAPI__(this.from,true,true);
        __URL__ += '&to=' + this._lab.__toDateAPI__(new Date(this.to.getTime() + (3600 * 24 * 1000) - 1000),true,true);
        this._http.get(__URL__).subscribe(
            (items)=> {
                if(items.error){
                    return this._lab.__setErrors__(items.error);
                }
                if(this.by === 'total'){
                    if(!items.data.hasOwnProperty('expenses') || !items.data.hasOwnProperty('paids') || !items.data.hasOwnProperty('recives'))
                        return;
                    let __obj = items.data['expenses'];
                    __obj['account'] = 'المصاريف';
                    this.__list.push(__obj);
                    __obj = items.data['paids'];
                    __obj['account'] = 'المدفوعات';
                    this.__list.push(__obj);
                    __obj = items.data['recives'];
                    __obj['account'] = 'المقبوضات';
                    this.__list.push(__obj);
                }else{
                    this.__list = items.data;
                }
                this.__prepareListPages__();
            },(error)=>{
                this._lab.__setErrors__(error);
            },() => {}
        );
    }

    private __prepareListPages__():void{
        this.__pagesShown = [];
        this.__pages = [];
        this.__currentPage = 1;
        this.__pagesCount = Math.ceil(this.__list.length / this.__perpage);
        this.__printFormObject.controls['to'].setValue(this.__pagesCount);
        for(let i = 0; i < this.__list.length; i++){
            let __number:number = (Math.ceil((i+1) / this.__perpage) - 1);
            for(let __key in this.__list[i]){
                switch (__key) {
                    case 'paids':
                    case 'total':
                    case 'recive':
                    case 'avrage':
                    case 'amount':
                    case 'tax':
                        this.__list[i][__key] = new MyCurrencyPipe(this._global).transform(this.__list[i][__key].toString() , []);
                        break;
                    case 'from':
                    case 'paid_date':
                    case 'paid_date':
                        if(__key === 'from' && this.by !== 'total') break;
                        this.__list[i][__key] = new DatePipe('medium').transform(this.__list[i][__key] , 'yyyy-MM-dd');
                        break;
                    default:
                        break;
                }
            }
            if(!this.__pages[__number]){
                this.__pages[__number] = [this.__list[i]];
                this.__pagesShown.push(__number === 0);
            }else{
                this.__pages[__number].push(this.__list[i]);
            }
        }
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

    OnPrint():void{
        this._lab.OnPrintReport(this);
    }

    private onShowPrintDialog():void{
        this._lab.onShowPrintDialog(this);
    }

    private OnSubmitPrintForm(value:any , valid:boolean):void{
        let __errMsg:boolean = false;
        this.submitted = true;
        if(this.__printFormObject.value.from <= 0){
            __errMsg = true;
            this.__printFormObject.controls['from'].setValue(1);
        }
        if(this.__printFormObject.value.from > this.__pagesCount){
            __errMsg = true;
            this.__printFormObject.controls['from'].setValue(1);
        }

        if(this.__printFormObject.value.to <= 0){
            __errMsg = true;
            this.__printFormObject.controls['to'].setValue(this.__pagesCount);
        }
        if(this.__printFormObject.value.to > this.__pagesCount){
            __errMsg = true;
            this.__printFormObject.controls['to'].setValue(this.__pagesCount);
        }
        if(__errMsg) return this._lab.__setAlerts__('warn' , 'الرجاء اختيار صفحات الطباعة مابين 1 الى ' + this.__pagesCount.toString());
        this.__showFromPageXToPageY(this.__printFormObject.value.from , this.__printFormObject.value.to);

        this._lab.jQuery('.modal .modal-header button.close').click();
        let self = this;
        setTimeout(function() {
            self.OnPrint();
        }, 1000);
    }
     
    private __showFromPageXToPageY(from:number , to:number):void{
        this._lab.showFromPageXToPageY(this , from , to);
    }

    private showLastShownPage():void{
        this._lab.showLastShownPage(this);
    }

    changePage(page:number):void{
        this._lab.changePage(this,page);
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