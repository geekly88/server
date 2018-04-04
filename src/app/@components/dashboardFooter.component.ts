import { Component, OnInit, EventEmitter, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';

import { GlobalProvider, LabProvider } from './../@providers';

@Component({
    selector : 'dashboard-footer',
    inputs : [
        'pageUrl',
        'count',
        'pages',
        'isLocal',
        'obj',
        'filterObj',
        'searchObj',
        'controller',
        'includeOnly'
    ],
    outputs : ['pageChanging' , 'onAction'],
    template : `
    <div class="col-md-12 no-p dash-footer">
        <div class="col-md-12 col-sm-12 col-xs-12 no-p top-rainbow">
            <ranbow-colors [class]="'col-md-3 col-sm-6 col-xs-12'"></ranbow-colors>
            <ranbow-colors [class]="'col-md-3 col-sm-6 col-xs-12'" [xshidden]="true"></ranbow-colors>
            <ranbow-colors [class]="'col-md-3 col-sm-6 col-xs-12'" [smhidden]="true"></ranbow-colors>
            <ranbow-colors [class]="'col-md-3 col-sm-6 col-xs-12'" [smhidden]="true"></ranbow-colors>
        </div>
        <ul class="top-icon-ul">
            <li class="top-icon" (click)="OnShowAndHideFooter()"><a><i class="ti-settings"></i></a></li>
        </ul>
        <div class="search-box">
            <form [formGroup]="formObject" (ngSubmit)="OnSubmitForm(formObject.value)" novalidate
                class="form col-md-12 no-p">
                <fieldset>
                    <div class="col-md-12 col-xs-12 col-sm-12 form_paraphraph">
                        <p class="title head">تصفية نتائج البحث</p>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group col-md-12 no-p">
                            <label class="col-md-12 col-sm-12 col-xs-12 col-form-label no-p">من تاريخ</label>
                            <div class="col-md-12 col-sm-12 col-xs-12 no-p">
                                <input data-rules="date" ng2-datetime-picker name="date" [(ngModel)]="__fromDate"
                                            [formControl]="formObject.controls['from']" [close-on-select]="false" 
                                            type="text" class="form-control no-popover" placeholder="من تاريخ" readonly/>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group col-md-12 no-p">
                            <label class="col-md-12 col-sm-12 col-xs-12 col-form-label no-p">الى تاريخ</label>
                            <div class="col-md-12 col-sm-12 col-xs-12 no-p">
                                <input data-rules="date" ng2-datetime-picker name="date" [(ngModel)]="__toDate"
                                            [formControl]="formObject.controls['to']" [close-on-select]="false" 
                                            type="text" class="form-control no-popover" placeholder="الى تاريخ" readonly/>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6" *ngFor="let item of searchObj">
                        <div class="form-group col-md-12 no-p">
                            <label class="col-md-12 col-sm-12 col-xs-12 col-form-label no-p">{{ item.value }}</label>
                            <div class="col-md-12 col-sm-12 col-xs-12 no-p">
                                <input [formControl]="formObject.controls[item.key]" name="{{ item.value }}" 
                                type="text" class="form-control autofocus no-popover" placeholder="{{ item.value }}" />
                            </div>
                        </div>
                    </div>
                    <div class="col-md-12 no-p">
                        <button type="submit" class="btn btn-primary">اظهار النتائج</button>
                    </div>
                </fieldset>
            </form>
        </div>
        <div class="exac"  *ngIf="!includeOnly || includeOnly['pagination']">
            <p>صفحة <span class="pill">{{ _currentPage }}</span> من <span class="pill">{{ pages }}</span>
        </div>
        <div class="midd">
            <ul *ngIf="!includeOnly || (includeOnly['search'] || includeOnly['pagination'])">
                <li class="filter-icon" (click)="OnSearchClick()" *ngIf="!includeOnly || includeOnly['search']"><a><i class="ti-filter"></i></a></li>
                <li (click)="onClick(1)" *ngIf="!includeOnly || includeOnly['pagination']"><a><i class="ti-angle-double-right"></i></a></li>
                <li (click)="onClick(_currentPage + 1)" *ngIf="!includeOnly || includeOnly['pagination']"><a><i class="ti-angle-right"></i></a></li>
                <i class="ti-search" (click)="onClick(__page)" *ngIf="!includeOnly || includeOnly['pagination']"></i>
                <input class="form-control no-popover" [(ngModel)]="__page" *ngIf="!includeOnly || includeOnly['pagination']"/>
                <li (click)="onClick(_currentPage - 1)" *ngIf="!includeOnly || includeOnly['pagination']"><a><i class="ti-angle-left"></i></a></li>
                <li (click)="onClick(pages)" *ngIf="!includeOnly || includeOnly['pagination']"><a><i class="ti-angle-double-left"></i></a></li>
            </ul>
        </div>
        <div class="opps">
            <ul class="col-md-12 no-p">
                <li *ngFor="let action of __actions" (click)="onActionClick(action.__class)">
                    <a><i class="ti-{{ action.img }}"></i></a>
                </li>
            </ul>
        </div>
    </div>`
})
export class DashboardFooterComponent implements OnInit,AfterViewInit{

    // private localUrl:string;
    // public isLocal:boolean = true;
    public __pagesArray:number[] = new Array();
    public pageUrl:string;
    public count:number;
    public pages:number;
    public obj:any;
    public filterObj:any;
    public searchObj:Array<any> = [];
    private formObject: FormGroup;
    private __actions : Array<Object> = [];
    private __show:boolean = false;
    private __searchShow:boolean = false;
    public _currentPage:number;
    public pageChanging = new EventEmitter();
    public onAction = new EventEmitter();

    public includeOnly:Object;

    private __fromDate:Date;
    private __toDate:Date;

    constructor(
        private _router:Router,
        private _global:GlobalProvider,
        private _lab:LabProvider
    ){}

    ngOnInit():void{
        let __queryParams =  this._router.routerState.root.queryParams['value'];
        let __page = __queryParams['page'] ? parseInt(__queryParams['page']) : 1;
        if(__page > this.pages || __page <= 0) __page = 1;
        this._currentPage = __page;
        this.__initSearchObjects__();
        this.__initFilterObjects__();
        this.OnShowAndHideFooter();
        this.OnSearchClick();
    }

    ngAfterViewInit():void{
        this._lab.__setListShortCuts__(this);
    }

    onClick(__newPage:number = null):void{
        if(!__newPage) return;
        if(__newPage === this._currentPage || __newPage < 1 || __newPage > this.pages) return;
        let __queryParams = this.getPageUrl(__newPage)  +'&limit=' + this._global.getToken()['settings']['perpage'];
        // this._global.navigatePanel(this.pageUrl + __queryParams);
        this._currentPage = __newPage;
        this.pageChanging.emit({
            changed : true,
            url : this.pageUrl,
            page : this._currentPage,
            queryParams : __queryParams
        });
    }

    onActionClick(action:string): void {
        if(action.toLowerCase() === 'delete'){
            if(!confirm("هل تريد الاستمرار فى عملية الحذف")) return;
        }
        this.onAction.emit({
            clicked : true,
            action : action.toUpperCase()
        });
    }

    getPageUrl(page:number):string{
        if(page > this.pages) return;
        // http://localhost:1337/suppliers?page=1&limit=10&sortBy=createdAt&sort=DESC&search=name-code&like=true&code=&name=fdsf sdf
        return this._global.parseQueryParams(page);
    }

    OnShowAndHideFooter():void{
        this.__searchShow = !this.__show ? this.__show :  this.__searchShow;
        this._lab.OnShowAndHideFooter(this.__show);
        this.__show = !this.__show;
    }

    OnSearchClick():void{
        if(this.__searchShow){
            this._lab.__showOrHideElem__('.search-box' , 'bounceInUp');
        }else{
            this._lab.__showOrHideElem__('.search-box' , 'bounceInDown');
        }
        this.__searchShow = !this.__searchShow;
    }

    OnSubmitForm(values:any):void{
        let __searchUrl:string;
        let __search:Array<string> = [];
        
        let __queryParams:any = this._router.routerState.root.queryParams['value'];
        let __page:number = this._currentPage === 0 ? 1 : this._currentPage;
        
        __searchUrl = '?page='+ __page + '&limit=' + this._global.getToken()['settings']['perpage'];

        if(__queryParams && __queryParams['sort']) __searchUrl += '&sort=' + __queryParams['sort'];
        if(__queryParams && __queryParams['sortBy']) __searchUrl += '&sortBy=' + __queryParams['sortBy'];

        let __tempValues:Array<any> = [];
        if(this.searchObj){
            this.searchObj.forEach((item,index)=> {
                if(!values[item.key]) return;
                __search.push(item.key);
                __tempValues.push({ key : item.key , value : values[item.key] });
                __searchUrl += '&'+item.key+'='+values[item.key];
            });
        }

        __searchUrl += '&search=' + __search.join('-');
        
        if(this.__fromDate && this.__toDate){
            __searchUrl += '-from-to&to=';
            __searchUrl += this._lab.__toDateAPI__(new Date(this.__toDate.getTime() + ((3600 * 24 * 1000) - 1000)),true,true);
            __searchUrl += '&from='+this._lab.__toDateAPI__(this.__fromDate,true,true);
        }

        this.pageChanging.emit({
            changed : true,
            url : this.pageUrl,
            page : this._currentPage,
            queryParams : __searchUrl,
            values : __tempValues
        });
    }

    __initFilterObjects__():void{
        let url:string = this._router.url;
        let __urlArray:Array<string> = url.split('/');
        let __clearUrlArray:Array<string> = [];
        __urlArray.forEach((u,i) => {
            if(u && u !== '') __clearUrlArray.push(u);
        });
        if(__clearUrlArray.length > 1) {
            url = __clearUrlArray[0] + '/' + __clearUrlArray[1] + '/destroy/1';
            if(this._lab.__checkAuthPage(url)){
                if(!this.filterObj || !this.filterObj.hasOwnProperty('exclusive') || !this.filterObj.exclusive.delete){
                    this.__actions.push({
                        title : 'حذف المحدد من القائمة',
                        __class : 'delete',
                        img : 'trash'
                    });
                }
            }
        }
        if(!this.filterObj || !this.filterObj.hasOwnProperty('exclusive') || !this.filterObj.exclusive.export){
            this.__actions.push({
                title : 'تصدير جميع البيانات',
                __class : 'export',
                img : 'download'
            });
        }
        this.__actions.push({
            title : 'تحديث القائمة',
            __class : 'refresh',
            img : 'reload'
        });
        if(this.filterObj && this.filterObj.actions && this.filterObj.actions instanceof Array) 
            this.__actions.concat(this.filterObj.actions);
    }

    __initSearchObjects__():void{
        this.formObject = new FormGroup({
            from : new FormControl(),
            to   : new FormControl(),
        });
        if(!this.searchObj || this.searchObj.length === 0) return;
        this.searchObj.forEach((item , index) => {
            let __control:FormControl = new FormControl('' , []);
            this.formObject.addControl(item.key , __control);
        });
    }
}