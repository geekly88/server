import { Component , OnInit , ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AutocompleteComponent ,
         AddNewComponent,
         ShowItemComponent
        } from './../../../@components';
import { GlobalProvider , LabProvider , RouterTransition } from './../../../@providers';
import { Paids } from './../../../@interfaces';
import { HttpRequestService } from './../../../@services';

@Component({
    selector : 'paids-list',
    templateUrl : './paidsList.html',
    providers : [
        GlobalProvider, 
        LabProvider, 
        HttpRequestService,
        AutocompleteComponent,
        AddNewComponent,
        ShowItemComponent,
    ],
    animations : [RouterTransition()],
    host : {'[@RouterTransition]': ''},
})
export class PaidsListComponent implements OnInit{

    private _controller:string = 'paids';
    private formObject:FormGroup;
    private errors:any;
    private _list:Paids[];
    private _showItem:Paids;
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


    public param:number;
    public editable:boolean = false;
    public editItem:Paids;
    constructor(
        private _global:GlobalProvider,
        private _http:HttpRequestService,
        private _lab:LabProvider,
        private _router:Router
    ){ }
    ngOnInit():any{
        this._lab.__setGlobal__(this._global);
        this._lab.__setTopLink__({href:'paids',text:' / الدفع و القبض'},null);
        this._isShowItem = false;
        this.__setObject();
        this.__getItems();
        this._lab.__initLists__();
    }

    OnDetailsAction($event):void{
        this._lab.__onDetailsAction__($event , this);
    }

    onAction($event):void{
        switch($event.action){
            case 'DELETE':
                this.__deleteItems($event.item.id);                
                break;
            case 'EDIT':
                // let __url = this._global.config['dashboard'] + '/paids/details/'+ $event.item.id.toString();
                // this._router.navigate([__url]);
                case 'EDIT':
                this.param = $event.item.id;
                this.editable = ($event.item && $event.item.id > 0);
                this.editItem = $event.item;
                this._lab.__modal('#show-details-model');
                break;
            case 'SHOW':
                this._isShowItem = true;
                this._showItem = <Paids>$event.item;
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
        __url += '&search=is_active&is_active='+ status;
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
        // this._router.navigate([this._global.config['dashboard'] + '/paids/details']);
    }

    private __setObject():void {
       this._searchObjs = [
            { key : 'username' , value : 'اسم المستخدم' }
        ];
        this._actionsObjs = {
            actions : []
        };
        this._showItemFields = {
            title : 'معلومات الدفع و القبض',
            title2 : 'العنوان',
            number : 'رقم الصرف',
            amount : 'المبلغ المصروف',
            tax : 'الضريبة',
            category : 'التصنيف',
            to : 'موجه الى',
            referrence : 'المرجع #',
            payment_way : 'طريقة الدفع',
            paid_data : 'تاريخ الدفع',
            createdAt : 'تاريخ الانشاء',
            updatedAt : 'أخر تعديل',
            __pipes : {
                paid_data : 'date',
                createdAt : 'date',
                updatedAt : 'date',
            },
            __required : {
                paid_data : true,
                createdAt : true,
                updatedAt : true,
            }
        };
    }

    private __getItems(__url:string = null) {
        if(!__url) __url = this._controller + '/' + this._global.parseQueryParams() +'&limit=' + this._global.getToken()['settings']['perpage'];
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
                    this._showItem = <Paids>new Object();
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
                this._lab.__setAlerts__('success' , 'تمت عملية الحذف');
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