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
    selector : 'contacts-report',
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
export class ContactsReportComponent implements OnInit,OnChanges{

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
    private __URL:string = 'reports/contacts/';
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
            suppliers : 'تقارير معلومات الموردين',
            customers : 'تقارير معلومات الزبائن',
            employees : 'تقارير معلومات الموظفين',
            users : 'تقارير معلومات المستخدمين'
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
            case 'customers':
            case 'employees':
            case 'suppliers':
                this.__allowed['name'] = true;
                this.__allowed['phone'] = true;
                this.__allowed['fax'] = false;
                this.__allowed['mobile'] = false;
                this.__allowed['email'] = true;
                this.__allowed['country'] = false;
                this.__allowed['city'] = false;
                this.__allowed['town'] = false;
                this.__allowed['address1'] = false;
                this.__allowed['address1'] = false;
                this.__allowed['paid'] = false;
                this.__allowed['total'] = false;

                if(this.by === 'suppliers') this.__allowed['paid'] = true;
                if(this.by === 'suppliers') this.__allowed['total'] = true;

                if(this.by === 'employees') this.__allowed['purchases_paid'] = false;
                if(this.by === 'employees') this.__allowed['purchases_total'] = false;
                if(this.by === 'employees' || this.by === 'customers') this.__allowed['invoices_paid'] = true;
                if(this.by === 'employees' || this.by === 'customers') this.__allowed['invoices_total'] = true;

                this.__lang['name'] = this.by === 'customers' ? 'الزبون' : this.by === 'employees' ? 'الموظف' : 'المورد';
                this.__lang['phone'] = 'الهاتف';
                this.__lang['fax'] = 'فاكس';
                this.__lang['mobile'] = 'النقال';
                this.__lang['email'] = 'البريد الالكترونى';
                this.__lang['country'] = 'البلد';
                this.__lang['city'] = 'المدينة';
                this.__lang['town'] = 'المنطقة';
                this.__lang['address1'] = 'العنوان1';
                this.__lang['address1'] = 'العنوان2';
                this.__lang['paid'] = 'مدفوع المبيعات';
                this.__lang['total'] = 'مديونية المبيعات';

                if(this.by === 'suppliers') this.__lang['paid'] = 'مدفوع المشتريات';
                if(this.by === 'suppliers') this.__lang['total'] = 'اجمالى المشتريات';

                if(this.by === 'employees') this.__lang['purchases_paid'] = 'مدفوع المشتريات';
                if(this.by === 'employees') this.__lang['purchases_total'] = 'مديونية المشتريات';
                if(this.by === 'employees' || this.by === 'customers') this.__lang['invoices_paid'] = 'مدفوع فواتير البيع';
                if(this.by === 'employees' || this.by === 'customers') this.__lang['invoices_total'] = 'اجمالى فواتير البيع';

                this.__order = 'ASC';
                this.__sortby = 'id';
                break;
            default:
                this.__allowed['username'] = true;
                this.__allowed['role'] = true;
                this.__allowed['createdAt'] = true;
                this.__lang['username'] = 'اسم المستخدم';
                this.__lang['role'] = 'التصريح';
                this.__lang['createdAt'] = 'تاريخ الاضافة';
                break;
        }
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
                    case 'total':
                    case 'invoices_paid':
                    case 'invoices_total':
                    case 'purchases_total':
                    case 'purchases_total':
                        this.__list[i][__key] = new MyCurrencyPipe(this._global).transform(this.__list[i][__key].toString() , []);
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

    private OnPrint():void{
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