import { Component , OnInit , ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GlobalProvider , LabProvider , RouterTransition } from './../../../@providers';
import { BookKepping , BooksTree } from './../../../@interfaces';
import { HttpRequestService } from './../../../@services';

@Component({
    selector : 'bookKepping-list',
    templateUrl : './bookKeppingList.html',
    providers : [
        GlobalProvider, 
        LabProvider, 
        HttpRequestService
    ],
    animations : [RouterTransition()],
    host : {'[@RouterTransition]': ''},
})
export class BookKeppingListComponent implements OnInit{

    private _controller:string = 'bookKepping';
    private formObject:FormGroup;
    private errors:any;
    private _list:BookKepping[];
    private _showItem:BookKepping;
    private _showItemFields:any;
    private _addNewObj:any;
    private _isShowItem:boolean;
    private _searchObjs:any;
    private _topActionsObjs:any;
    private _actionsObjs:any;
    private __count:number = 0;
    private __pages:number = 0;
    private __order:string = 'createdAt';
    private __sort:string = 'DESC';
    private __explain:boolean = false;
    private __hideLists:boolean = true;
    private __booksTree:Array<BooksTree> = [];
    private __booksTreeByCode:any = {};

    public param:number;
    public editable:boolean = false;
    public editItem:BookKepping;
    constructor(
        private _global:GlobalProvider,
        private _http:HttpRequestService,
        private _lab:LabProvider,
        private _router:Router
    ){ }
    ngOnInit():any{
        this._lab.__setGlobal__(this._global);
        this._isShowItem = false;
        this.__setObject();
        let __url:string;
        let __prev:any = this._lab.jQuery('.prev-page');
        if(__prev){
            let __prevPage:string = __prev.attr('data-page');
            if(__prevPage){
                __prevPage = __prevPage.replace(this._global.config['dashboard']+'/' , '');
                if(__prevPage.indexOf(this._controller) === 0){
                    let __pastQuery = this._global.getPastPageQuery(this._controller);
                    if(__pastQuery){
                        __url = __pastQuery;
                    }
                }
            }
        }
        this.__getItems(__url);
        this._lab.__initLists__();
    }

    onAction($event):void{
        switch($event.action){
            case 'DELETE':
                this.__deleteItems($event.item.id);                
                break;
            case 'EDIT':
                this.param = $event.item.id;
                this.editable = ($event.item && $event.item.id > 0);
                this.editItem = $event.item;
                this._lab.__modal('#show-details-model');
                break;
            case 'SHOW':
                this._isShowItem = true;
                this._showItem = <BookKepping>$event.item;
                this._lab.__setItemModal__(this._showItem,this._showItemFields);
                this._lab.__modal('#show-item-modal');
                break;
        }
    }

    __OnChangeURL__():void{
        let __first:boolean = false;
        let __orderUrl:string = '';
        if(this.__order) __orderUrl = '&sortby=' + this.__order + '&sort=' + this.__sort;
        let __url = this._controller + '/?limit=' + this._global.getToken()['settings']['perpage'] + __orderUrl;
        this.__getItems(__url);
    }

    OnOrderBy(order:string = null):void{
        if(this.__order === order)
            this.__sort = this.__sort === 'ASC' ? 'DESC' : 'ASC';
        else
            this.__order = order;
        this.__OnChangeURL__();
    }

    onPageChanging($event):void{
        let __queryParams:any = this._router.routerState.root.queryParams['value'];
        if(!__queryParams || !__queryParams['sort']){
            $event.queryParams += '&sortby=' + this.__order + '&sort=' + this.__sort; 
        }
        this.__getItems(this._controller +'/'+ $event.queryParams);
    }

    onTopActionClick($event):void{
        this._lab.__onTopActionClick__($event , this);
    }

    onRefresh($event):void{
        this.__getItems();
    }

    onAddNewClick($event):void{
        this.editable = false;
        this.param = null;
        this.editItem = null;
        this._lab.__modal('#show-details-model');
        // this._global.navigatePanel('bookKepping/details');
    }

    OnDetailsAction($event):void{
        this._lab.__onDetailsAction__($event , this);
    }

    private __prepareCodesArray():void{
        if(this.__booksTree && this.__booksTree.length > 0){
            this.__booksTreeByCode = {};
            this.__booksTree.forEach((book , index) => {
                this.__booksTreeByCode[book.code] = book.name_ar;
            });
        }
    }

    private __setObject():void{
        let __booksTree:Array<BooksTree> = this._global.getResource('booksTree') as Array<BooksTree>;
        if(__booksTree) {
            this.__booksTree = __booksTree;
            this.__prepareCodesArray();
        }else{
            this._http.get('bookstree?sort=ASC&sortby=code').subscribe(
                (items) => {
                    if(items && items.data) {
                        this.__booksTree = items.data as Array<BooksTree>;
                        this._global.setResource(this.__booksTree , 'booksTree');
                        this.__prepareCodesArray();
                    }
                }
            );
        }

        this._searchObjs = [
            { key : 'name_ar' , value : 'البيان' },
            { key : 'from_account' , value : 'الحساب الدائن' },
            { key : 'from_code' , value : 'كود الحساب الدائن' },
            { key : 'to_account' , value : 'الحساب المدين' },
            { key : 'to_code' , value : 'كود الحساب المدين' },
            { key : 'page' , value : 'الصفحة' },
        ];
        this._actionsObjs = {
            actions : [],
            exclusive : { show : true }
        };
    }

    private __getItems(__url:string = null) {
        if(!__url) __url = this._controller + '/' + this._global.parseQueryParams() +'&limit=' + this._global.getToken()['settings']['perpage'];
        this._global.setCurrentPageQuery(this._controller , __url);
        this._http.get(__url).subscribe(
            (list)=>{
                if(list.error !== null){
                    this.errors = list.error;
                    this.__count = 0;
                    this.__pages = list.pages ? list.pages : 0;
                    this._lab.__setErrors__(this.errors);
                    return;
                }
                this._list = list.data;
                this.__count = list.count ? list.count : 0;
                this.__pages = list.pages ? list.pages : 0;
                if(this.__count >= 1){
                    this._showItem = this._list[0];
                    this.__hideLists = false;
                }else{
                    this._showItem = <BookKepping>new Object();
                    this.__hideLists = true;
                }
            },
            (error) => { 
                this.errors = error;
                this.__count = 0;
                this.__pages = 0;
                this._list = null;
                this._lab.__setErrors__(error);
            },
            ()=> {
                // After Complete Fetching Data From Server
            }
        );
    }

    private __deleteItems(ids : string):void{
        let __url = this._controller +'/'+ ids;
        this._http.delete(__url).subscribe(
            (response) => {
                if(response.error !== null){
                    this._lab.__setAlerts__('error' , 'فشل فى عملية الحذف');
                    return;
                }
                this._lab.__setAlerts__('success' , 'تمت عملية حذف ');
            },
            (error) => {
                this._lab.__setErrors__(error);
            },
            () => {
                this.__getItems();
                // After Delete Items(s)
            }
        );
    }
}