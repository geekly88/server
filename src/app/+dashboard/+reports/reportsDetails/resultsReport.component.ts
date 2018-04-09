import { Component, OnInit, OnChanges, AfterViewInit , EventEmitter } from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AutocompleteComponent } from './../../../@components';
import { GlobalProvider , LabProvider, RouterTransition } from './../../../@providers';
import { HttpRequestService } from './../../../@services';
import { MyCurrencyPipe } from './../../../@pipes';
import { DatePipe } from '@angular/common';

declare let $:any;

@Component({
    selector : 'results-report',
    templateUrl : './wins.html',
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
export class ResultsReportComponent implements OnInit,OnChanges{

    public by:string = '';
    public from:Date;
    public to:Date;
    public controls:FormGroup;
    public changable:number;
    
    private __reportTitle__:string = '';
    private __dateRangeStr__:string = '';
    private __createdAt__:Date = new Date();
    private __list:Array<any> = [];
    private __byArray:Object = {};
    private __data:Object = {};
    private __WINS__:number = 0;
    private __plus:number = 0;
    private __minus:number = 0;

    private __URL:string = 'reports/results/';
    private onAction = new EventEmitter();

    constructor(
        private _global:GlobalProvider,
        private _http:HttpRequestService,
        private _lab:LabProvider
    ){}

    ngOnInit():any{
        this.__prepareDateRange__();
        this.__byArray = {
            wins : 'تقارير أرباح حسابك مفصلة',
            salewins : 'تقارير أرباح المبيعات',
            allwins : 'تقارير أرباح المبيعات و المشتريات'
        };
        this._lab.__setReportsShortcuts(this , false);
    }

    ngOnChanges(props:any):void{
        this.__init__();
    }

    onActionReport($event):void{
        switch ($event.action) {
            case 'FILTER':
                this.from = $event.filter.start;
                this.to = $event.filter.end;
                this.__getItems();    
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
        let __day:number = (3600 * 24 * 6 * 1000);
        let __start:number = new Date().getTime();
            __start = (__start - __day);
        this.to = new Date((__start + __day - 1000));
        this.from = new Date(__start);
    }

    private __init__():void{
        this.__reportTitle__ = this.__byArray[this.by];
        this.__initData__();
        // switch (this.by) {
        //     case 'wins':
        //     case 'salewins':
        //     case 'allwins':
                this.__getItems();
        //         break;
        
        //     default:
        //         break;
        // }
    }

    private __getItems():void{
        this.__checkDate__();
        let __URL__:string = this.__URL + this.by;
        __URL__ += '?from=' + this._lab.__toDateAPI__(this.from,true,true);
        __URL__ += '&to=' + this._lab.__toDateAPI__(new Date(this.to.getTime() + (3600 * 24 * 1000) - 1000),true,true);
        this._http.get(__URL__).subscribe(
            (items)=> {
                if(items.error){
                    return this._lab.__setErrors__(items.error);
                }
                this.__list = items.data;
                this.__arrangeDate__();
            },(error)=>{
                this._lab.__setErrors__(error);
            },() => {}
        );
    }

    private __initData__():void{
        this.__data = {
            // 'INV' : { pospaid:0,negpaid:0,pos:0,neg:0,poscost:0,negcost:0 },
            'SEL' : { pospaid:0,negpaid:0,pos:0,neg:0,poscost:0,negcost:0 },
            'PURCHASE' : { pospaid:0,negpaid:0,pos:0,neg:0,poscost:0,negcost:0 },
            'EXP' : { pospaid:0,negpaid:0,pos:0,neg:0,poscost:0,negcost:0 },
            'PID' : { pospaid:0,negpaid:0,pos:0,neg:0,poscost:0,negcost:0 }
        };
    }

    private __arrangeDate__():void{
        this.__initData__();
        if(this.__list && this.__list.length){
            for(let i=0; i < this.__list.length; i++){
                let obj:Object = this.__list[i];
                let src:string = obj['src'];
                let __obj:Object = {};
                
                __obj['pospaid'] = !obj['pospaid'] ? 0 : obj['pospaid'];
                __obj['negpaid'] = !obj['negpaid'] ? 0 : obj['negpaid'];
                __obj['pos'] = !obj['pos'] ? 0 : obj['pos'];
                __obj['neg'] = !obj['neg'] ? 0 : obj['neg'];
                __obj['poscost'] = !obj['poscost'] ? 0 : obj['poscost'];
                __obj['negcost'] = !obj['negcost'] ? 0 : obj['negcost'];
                
                this.__data[src] = __obj;
            }
            this.__getWins__();
        }
    }

    private __getWins__():void{
        this.__WINS__ = 0;
        this.__minus = 0;
        this.__plus = 0;
        //======== SALES ========================\\
        this.__plus  += this.__data['SEL']['pospaid'];
        if(this.by !== 'allwins') // cost in allwins will be from purchases invoices only
            this.__plus  += this.__data['SEL']['negcost'];
        
        this.__minus += this.__data['SEL']['negpaid'];
        if(this.by !== 'allwins')
            this.__minus += this.__data['SEL']['poscost'];
        //======== INVOICES =====================\\
        // this.__plus  += this.__data['INV']['pospaid'];
        // if(this.by !== 'allwins')
        //    this.__plus  += this.__data['INV']['negcost'];
        
        // this.__minus += this.__data['INV']['negpaid'];
        // if(this.by !== 'allwins')
        //     this.__minus += this.__data['INV']['poscost'];
        // ====== PAIDS && EXPENSES =============\\  
        if(this.by !== 'salewins'){      
            this.__plus  += this.__data['PID']['pospaid'];
            
            this.__minus += this.__data['PID']['negpaid'];
            this.__data['EXP']['negpaid'] = Math.abs(this.__data['EXP']['negpaid']);
            this.__minus += this.__data['EXP']['negpaid'];
        }
        // ====== PURCHASES ==========================\\        
        if(this.by === 'allwins'){      
            this.__plus  += this.__data['PURCHASE']['negpaid'];
            this.__plus  += this.__data['PURCHASE']['poscost'];

            this.__minus += this.__data['PURCHASE']['pospaid'];
            this.__minus += this.__data['PURCHASE']['negcost'];
        }
        this.__WINS__ = (this.__plus - this.__minus);
    }
}