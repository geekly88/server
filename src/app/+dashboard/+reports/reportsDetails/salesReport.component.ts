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
    selector : 'sales-report',
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
export class SaleReportComponent implements OnInit,OnChanges{

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

    private __pagesShown:Array<boolean> = [true];
    private __lasShownPage:number = 0;
    private __modal:string = 'print';
    private submitted:boolean = false;
    private __printFormObject:FormGroup;

    private __sortby:string;
    private __order:string = 'ASC';
    private __URL:string = 'reports/sales/';
    private onAction = new EventEmitter();

    constructor(
        private _fb:FormBuilder,
        private _global:GlobalProvider,
        private _http:HttpRequestService,
        private _lab:LabProvider
    ){}

    ngOnInit():any{
        this.__prepareDateRange__();
        this.__perpage = this._global.config['sales_report_perpage'];
        this.__byArray = {
            customer : 'المبيعات حسب الزبون',
            employee : 'المبيعات حسب الموظف',
            author : 'المبيعات حسب المستخدم',
            all : 'جميع المبيعات'
        };
        this.__reportTitle__ = this.__byArray.hasOwnProperty(this.by) ? this.__byArray[this.by] : '';
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
        if(this.by === 'customer' || this.by === 'employee' || this.by === 'author' ){
            this.__allowed[this.by] = true;
            this.__allowed['paid'] = true;
            this.__lang[this.by] = this.by === 'customer' ? 'الزبون' : this.by === 'employee' ? 'البائع' : 'المستخدم';
            this.__lang['count'] = 'الفواتير';
            this.__sortby = this.by + '_id';
        }else{
            this.__lang['customer'] = 'الزبون';
            this.__lang['employee'] = 'المندوب';
            this.__lang['author'] = 'المستخدم';            
            // this.__lang['gift_code'] = 'كوبون التخفيض',
            this.__lang['number'] =  'رقم';
            this.__lang['date'] = 'التاريخ';
            this.__lang['paid_date'] = 'تاريخ الاستحقاق';

            this.__allowed['paid'] = false;
            this.__allowed['customer'] = false;
            this.__allowed['employee'] = false;
            this.__allowed['author'] = false;            
            // this.__allowed['gift_code'] = false,
            this.__allowed['number'] =  true;
            this.__allowed['date'] = true;
            this.__allowed['paid_date'] = false;
            this.__sortby = 'date';
        }

        this.__allowed['prices'] = true;
        this.__allowed['discounts'] = true;
        this.__allowed['taxes'] = true;
        this.__allowed['totals'] = true;

        this.__lang['prices'] = 'السعر';
        this.__lang['discounts'] = 'التخفيض';
        this.__lang['taxes'] = 'الضرائب';
        this.__lang['totals'] = 'الاجمالى';
        this.__lang['paid'] = 'المدفوع';

        this.__prepareLoopArray__();
        this.__getItems();
    }

    private __getItems():void{
        this.__checkDate__();
        let __URL__:string = this.__URL + this.by;
        if(this.by === 'all') __URL__ += '?sort=' + this.__order + '&sortby=' + this.__sortby + '&';
        if(this.by !== 'all') __URL__ += '?'
        __URL__ += 'from=' + this._lab.__toDateAPI__(this.from,true,true);
        __URL__ += '&to=' + this._lab.__toDateAPI__(new Date(this.to.getTime() + (3600 * 24 * 1000) - 1000),true,true);
        this._http.get(__URL__).subscribe(
            (items)=> {
                if(items.error){
                    return this._lab.__setErrors__(items.error);
                }
                this.__list = items.data;
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
                    case 'paid':
                    case 'totals':
                    case 'prices':
                    case 'costs':
                    case 'discounts':
                    case 'taxes':
                    case 'all_discount':
                        this.__list[i][__key] = new MyCurrencyPipe(this._global).transform(this.__list[i][__key].toString() , []);
                        break;
                    case 'date':
                    case 'paid_date':
                        this.__list[i][__key] = new DatePipe('medium').transform(this.__list[i][__key] , 'yyyy-MM-dd');
                        break;
                    case 'customer':
                    case 'employee':
                        if(!this.__list[i][__key]) this.__list[i][__key] = 'غير مذكور';
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