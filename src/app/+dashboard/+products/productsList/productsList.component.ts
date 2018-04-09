import { Component , OnInit , ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AutocompleteComponent ,
         AddNewComponent,
         ShowItemComponent
        } from './../../../@components';
import { GlobalProvider , LabProvider , RouterTransition } from './../../../@providers';
import { MyCurrencyPipe } from './../../../@pipes';

import { Products , Branches } from './../../../@interfaces';
import { HttpRequestService } from './../../../@services';

import { Uploader }      from 'angular2-http-file-upload';
import { MyUploadItem } from './../../myUploadItem';
import { ProductsDetailsComponent } from './../productsDetails';

@Component({
    selector : 'products-list',
    templateUrl : './productsList.html',
    providers : [
        GlobalProvider,
        LabProvider,
        HttpRequestService,
        AutocompleteComponent,
        AddNewComponent,
        ShowItemComponent,
        ProductsDetailsComponent
    ],
    animations : [RouterTransition()],
    host : {'[@RouterTransition]': ''},
})
export class ProductsListComponent implements OnInit{

    private _controller:string = 'products';
    private formObject:FormGroup;
    private errors:any;
    private _list:Products[];
    private _showItem:Products;
    private __variaties:any = {};
    private _showItemFields:any = {};
    private _addNewObj:any;
    private __modal:string;
    private _searchObjs:any;
    private _topActionsObjs:any;
    private _actionsObjs:any;
    private __count:number = 0;
    private __pages:number = 0;
    private __activeType:string;
    private __order:string = 'id';
    private __sort:string = 'DESC';
    private __explain:boolean = false;
    private __hideLists:boolean = true;
    private __showBranches:boolean = false;
    private __branchesArray:Branches[];
    private __branchesNameFromID:any = {};

    public param:number;
    public editable:boolean = false;
    public editItem:Products;
    constructor(
        private _global:GlobalProvider,
        private _http:HttpRequestService,
        private _lab:LabProvider,
        private _router:Router,
        private _uploaderService: Uploader
    ){ }

    ngOnInit():any{
        this.__activeType = 'ACTIVE';
        this._lab.__setGlobal__(this._global);
        this.__modal = '';
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
                        __url = __pastQuery.replace('&search=is_main&is_main=true' , '');
                    }
                }
            }
        }
        this.__prepareBranchesNames__();
        if(__url) this.__getItems(__url);
        else this.OnChangeActiveType('ALL');
        this._lab.__initLists__();
        this._lab.__setListShortCuts__(this);
    }

    onAction($event):void{
        switch($event.action){
            case 'DELETE':
                this.__deleteItems($event.item.id);
                break;
            case 'EDIT':
                this._global.navigatePanel('products/details/' + $event.item.id , 'products' , "" );
                break;
            case 'SHOW':
                this.__modal = 'show';
                this._showItem = <Products>$event.item;
                this._lab.__modal('#show-pro-details-modal');
                break;
            case 'CANCEL':
                this.__modal = '';
                break;
        }
    }


    OnChangeActiveType(status:string):void{
        if(this.__activeType === status) return;
        this.__OnChangeActiveType__(status);
    }

    __OnChangeActiveType__(status:string):void{
        let __first:boolean = false;
        if(this.__activeType === '' && this.__hideLists) __first = true;
        this.__activeType = status;
        let __orderUrl:string = '';
        if(this.__order) __orderUrl = '&sortby=' + this.__order + '&sort=' + this.__sort;
        let __url = this._controller + '/?limit=' + this._global.getToken()['settings']['perpage'] + __orderUrl;
        if(this.__activeType === 'ACTIVE'){
            status = 'true';
        }else if(this.__activeType === 'NOT'){
            status = 'false';
        }else if(this.__activeType === 'ALL'){
            status = '&contains=true';
        }else {
            return this.__getItems(__url,true , __first);
        }
        __url += '&search=is_active&is_active='+ status;
        this.__getItems(__url , true , __first);
    }

    OnOrderBy(order:string = null):void{
        if(this.__order === order)
            this.__sort = this.__sort === 'ASC' ? 'DESC' : 'ASC';
        else
            this.__order = order;
        this.__OnChangeActiveType__(this.__activeType);
    }

    onPageChanging($event):void{
        let __queryParams:any = this._router.routerState.root.queryParams['value'];
        if(!__queryParams || !__queryParams['sort']){
            $event.queryParams += '&sortby=' + this.__order + '&sort=' + this.__sort;
        }
        this.__getItems(this._controller +'/'+ $event.queryParams , true);
    }

    onTopActionClick($event):void{
        this._lab.__onTopActionClick__($event , this);
    }

    onRefresh($event):void{
        this.__getItems();
    }

    OnDetailsAction($event):void{
        this._lab.__onDetailsAction__($event , this);
    }

    onAddNewClick($event):void{
        this._global.navigatePanel('products/details');
    }

    onChangeItemsSearch(search:string='', value:string='' , contains:boolean = false):void{
        let __url:string = this._controller + '/?page=1&search='+search+'&'+search+'='+value;
        __url += '&limit='+this._global.getToken()['settings']['perpage'];
        __url = contains ? __url + '&contains=true' : __url;
        this.__getItems(__url , true , true);
    }

    onUploadImage(item:Products , id:string):void{
        let uploadFile = (<HTMLInputElement>window.document.getElementById('myFileInputField_' + item.id)).files[0];
        if(!uploadFile) return;
        let myUploadItem = new MyUploadItem(uploadFile);
        let token:string = this._global.getToken()['token'];
        myUploadItem.url = this._global.config['serverPath'] + 'products/'+item.id+'/imgs?replace=true&token='+token;
        // myUploadItem.formData = { FormDataKey: 'Form Data Value' };  // (optional) form data can be sent with file
        this._uploaderService.onSuccessUpload = (img, response, status, headers) => {
             // success callback
        };
        this._uploaderService.onErrorUpload = (img, response, status, headers) => {
             // error callback
             this._lab.__setAlerts__('warn' , 'حجم الصورة أقل من 10 ميجابايت ... <jpeg,png>');
        };
        this._uploaderService.onCompleteUpload = (img, response, status, headers) => {
            return this._lab.__onChangeAvatar__(this , item , response.data);
        };
        this._uploaderService.onProgressUpload = (img, percentComplete) => {
        };
        this._uploaderService.upload(myUploadItem);
    }

    OnChangeActivity(item:Products):void{
        let is_active:boolean = !item.is_active;
        this._http.put(this._controller + '/'+ item.id , { is_active : is_active }).subscribe(
            (item) => {
                if(!item.error){
                    for(let i=0; i < this._list.length; i++){
                        if(this._list[i].id === item.id){
                            this._list[i].is_active = !is_active;
                            this._lab.__setErrors__(item.error);
                            break;
                        }
                    }
                }else{
                    if(item.data) return;
                    this._lab.__setAlerts__('error' , 'حدث خطأ ما الرجاء اعادة المحاولة');
                }
            },(error) => {
                for(let i=0; i < this._list.length; i++){
                    if(this._list[i].id === item.id){
                        this._list[i].is_active = !is_active;
                        this._lab.__setErrors__(error);
                        break;
                    }
                }
            },() => { }
        )
    }

    OnReOrderProduct(item:Products):void{
        if(!item) return;

        let __amount:number = item.stock < 0 ? item.stock_order_amount + Math.abs(item.stock) : item.stock_order_amount - item.stock;
        // let __amount = item.stock_order_amount > 0 ? item.stock_order_amount : 0;
        // if((item.stock - item.stock_order_point) <= 0){
        //     __amount = ((-1 * (item.stock - item.stock_order_point)) + item.stock_order_amount);
        // }
        if(__amount === 0){
            return this._lab.__setAlerts__('warn' , 'لايمكنك اعادة التعبئة بطريقة مباشرة ... الرجاء التأكد من بيانات اعادة التعبئة للصنف');
        }
        this._global.navigatePanel('purchases/details/?q=refill&amount='+__amount+'&id='+item.id);
    }

    private __prepareBranchesNames__():void{
        this.__branchesArray = <Array<Branches>>this._global.getResource('branches');
        if(!this.__branchesArray || !(this.__branchesArray instanceof Array) || this.__branchesArray.length === 0){
            this._lab.__setAlerts__('warn' , 'تم اعدتك لصفحة تسجيل الدخول لوجود خطأ');
            return this._lab.__setLogout__(this._http);
        }else{
            if(this.__branchesArray.length === 1) return;
            for(let i:number = 0; i < this.__branchesArray.length; i++){
                this.__branchesNameFromID[this.__branchesArray[i].id.toString()] = this.__branchesArray[i].name;
            }
            this.__showBranches = true;
        }
    }

    private __setObject():void {
       this._searchObjs = [
            { key : 'name' , value : 'الاسم' },
            { key : 'sku' , value : 'الكود أو الباركود' },
            { key : 'collection' , value : 'المجموعة' },
            { key : 'tags' , value : 'الكلمات' },
            { key : 'brand' , value : 'الماركة' },
        ];
        this._actionsObjs = {
            actions : []
        };
        this._showItemFields = {
            name : 'الاسم'
        }
    }

    private __getItems(__url:string = null , change:boolean = false , __first:boolean = false) {
        if(!__url && !change) {
            __url = this._controller + '/' + this._global.parseQueryParams() +'&limit=' + this._global.getToken()['settings']['perpage'];
        }
        __url += '&search=is_main&is_main=true';
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
                    this._showItem = <Products>new Object();
                    if(__first && this.__hideLists) this.__hideLists = true;
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
                // this._lab.jQuery('tr.__variaty').remove();
                this._lab.__setAlerts__('success' , 'تمت عملية الحذف بنجاح ');
                this.__getItems();
            },
            (error) => {
                this._lab.__setErrors__(error);
            },
            () => { }
        );
    }
}
