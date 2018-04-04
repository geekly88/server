import { Component, EventEmitter, OnInit, OnChanges, ElementRef } from '@angular/core';
import { FormBuilder , FormGroup , FormControl } from '@angular/forms';
import { DaterangepickerConfig } from 'ng2-daterangepicker';

@Component({
    selector : 'report-filter',
    inputs : [ 'lang' , 'allowed' , 'daterange' , 'pages' ],
    outputs : ['onAction'],
    template : `
<div class="col-md-12 no-p">
    <div class="col-md-12 no-p report-filter">
        <form class="form">
            <fieldset class="filters">
                <span class="dropdown table_filter">
                    <a class="table_filter_a" id="tablFilterDropdown" data-toggle="dropdown">فلترة الجدول</a>
                    <ul *ngIf="lang && allowed" class="table_filter_list box dropdown-menu" role="menu" aria-labelledby="tablFilterDropdown">
                        <li *ngFor="let __key__ of __loopArray">
                            {{ lang[__key__] }}
                            <input type="checkbox" [(ngModel)]="allowed[__key__]" class="option-input checkbox" [ngModelOptions]="{standalone: true}"/>
                        </li>
                    </ul>
                </span>
                <span class="filter_icon last" (click)="onPrintClick()">
                    <li><i class="ti-printer"></i></li>
                </span>
            </fieldset>
        </form>
        <form class="form" [formGroup]="__formObject" (ngSubmit)="onSubmit()" novalidate>
            <fieldset class="range">
                <div>
                    <span class="filter_icon first" ><li (click)="onBackClick()">رجوع</li></span>
                    <span class="filter_icon" [ngClass]="{'active' : __filterDate__ === 'MONTH'}"><li (click)="__filterDate__ = 'MONTH'">30 يوم</li></span>
                    <span class="filter_icon" [ngClass]="{'active' : __filterDate__ === 'WEEK'}"><li (click)="__filterDate__ = 'WEEK'">7 أيام</li></span>
                    <span class="filter_icon" [ngClass]="{'active' : __filterDate__ === 'DAY'}"><li (click)="__filterDate__ = 'DAY'">يوم</li></span>
                    <div class="form-group">
                        <div>
                            <input class="form-control" type="text" name="daterangeInput" daterangepicker 
                                   [options]="options" (selected)="selectedDate($event)"/>
                        </div>
                    </div>
                </div>
                <div>
                    <button type="submit" class="btn btn-primary">اظهار النتائج</button>
                </div>
            </fieldset>
        </form>
    </div>
</div>`
})
export class ReportFilterComponent implements OnInit,OnChanges{

    private __formObject:FormGroup;
    private __loopArray:Array<string> = [];
    private __filterDate__:string = 'WEEK';

    public daterange: any;
    public pages:number = 0;
    public lang:Object;
    public allowed:Object;
    public onAction = new EventEmitter();
    constructor(
        private daterangepickerOptions: DaterangepickerConfig,
        private _fb:FormBuilder
    ) {
        this.daterangepickerOptions.settings = {
            locale: { format: 'DD/MM/YYYY' },
            alwaysShowCalendars: false
        };
    }

    ngOnChanges(props:any):void{
        this.__prepareLoopArray__();
    }

    ngOnInit():void{
        this.__initFormObject__();
        this.__prepareLoopArray__();
        if(!this.daterange) this.daterange = {};
    }

    onBackClick():void{
        this.onAction.emit({
            action : 'GOBACK'
        });
    }

    onSubmit():void{
        let __start:number = new Date().getTime();
        let __day:number = (3600 * 24 * 1000);
        this.__formObject.controls['end'].setValue(new Date());

        if(this.__filterDate__ === 'DAY'){
            this.__formObject.controls['start'].setValue(new Date(__start));
        }else if(this.__filterDate__ === 'WEEK'){
            __start -= (__day * 6);
            this.__formObject.controls['start'].setValue(new Date(__start));
        }else if(this.__filterDate__ === 'MONTH'){
            __start -= (__day * 29);
            this.__formObject.controls['start'].setValue(new Date(__start));
        }else{
            this.__formObject.controls['start'].setValue(this.daterange.start._d);
            this.__formObject.controls['end'].setValue(this.daterange.end._d);
        }


        this.onAction.emit({
            action : 'FILTER',
            allowed : this.allowed,
            filter : {
                start : this.__formObject.value.start,
                end : this.__formObject.value.end
            }
        });
        return;
    }

    onPrintClick():void{
        this.onAction.emit({
            action : 'PRINTDIALOG',
            startPage : 1,
            endPage : this.pages
        });
    }

    onExportClick():void{
        this.onAction.emit({
            action : 'EXPORT'
        });
    }

    private selectedDate(value: any) {
        this.daterange.start = value.start;
        this.daterange.end = value.end;
        this.__filterDate__ = 'RANGE';
    }

    __prepareLoopArray__():void{
        let __loopArray:Array<string> = [];
        if(!this.allowed || !this.lang) return;
        for(let __key in this.allowed){
            // let __control:FormControl = new FormControl(this.allowed[__key]);
            // this.__formObject.setControl(__key , __control);
            __loopArray.push(__key);
        }
        this.__loopArray = __loopArray;
        this.onAction.emit({
            action : 'ALLOWED',
            filter : this.allowed
        });
    }

    __initFormObject__():void{
        this.__formObject = this._fb.group({
            start  : [],
            end : [],
        });
    }
}