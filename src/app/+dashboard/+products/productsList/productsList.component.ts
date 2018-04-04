import { Component , OnInit , ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AutocompleteComponent ,
         AddNewComponent,
         ShowItemComponent
        } from './../../../@components';
import { GlobalProvider , LabProvider , RouterTransition } from './../../../@providers';
import { MyCurrencyPipe } from './../../../@pipes';

import { Products } from './../../../@interfaces';
import { HttpRequestService } from './../../../@services';

import { Uploader }      from 'angular2-http-file-upload';
import { MyUploadItem } from './../../myUploadItem'; 
import { ProductsDetailsComponent } from './../productsDetails';

declare var $:any;

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
                // this.param = $event.item.id;
                // this.editable = ($event.item && $event.item.id > 0);
                // this.editItem = $event.item;
                // this.__modal = 'products';
                // this._lab.__modal('#show-pro-details-model');
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
        // this.editable = false;
        // this.param = null;
        // this.editItem = null;
        // this.__modal = 'products';
        // this._lab.__modal('#show-pro-details-model');
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
            if(response && response.data){
                location.reload();
                // let __imageSrc:string = this._global.config['serverPath'] + 'images/products/' + response.data[0];
                // this._lab.jQuery('img#img_' + item.id).attr('src' , __imageSrc);
            }
            // complete callback, called regardless of success or failure
        };
        this._uploaderService.onProgressUpload = (img, percentComplete) => {
        };
        this._uploaderService.upload(myUploadItem);
    }
    // onShowItem($event):void{
    //     console.log($event);
    // }

    // onShowVariaties(item:Products):void{
    //     let index:string = item.id.toString();
    //     if(!this.__variaties[index]){
    //         this._http.get('products?search=main_id&main_id=' + index).subscribe(
    //             (items) => {
    //                 if(items && items.error === null && items.data && items.count > 0){
    //                     this.__variaties[index] = items.data;
    //                     this.__showVariaties__(index);
    //                 }else{
    //                     return this._global.navigatePanel('products/details/'+index);
    //                 }
    //             }
    //         );
    //     }else{
    //         this.__showVariaties__(index)
    //     }
    // }

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
        this._global.navigatePanel('buys/details/?q=refill&amount='+__amount+'&id='+item.id);
    }

    // private __showVariaties__(index:string):void{
    //     $('tr.__variaty').remove();
    //     for(let i =0; i < this.__variaties[index].length; i++){
    //         let __self:ProductsListComponent = this;
    //         let __pro:Products = this.__variaties[index][i];
    //         let __price:string = new MyCurrencyPipe(this._global).transform(__pro.price.toString() , []);
    //         let __proId:string = __pro.id.toString();
    //         let __url:string = this._global.config['panelPath'] + 'products/details/' + __proId;
    //         let __qtyspan:any = $('<span>').append(__pro.stock); 
    //         if(__pro.limit_quantity >= __pro.stock) __qtyspan.addClass('error');

    //         let __colspan:string = ($('.__product_'+index+' td').length - 4).toString();
    //         let __link:any = $('<a class="pro_var col-md-12">').append(__pro.name);
    //         let __smallShadesStr:string = '(' + __pro.sku + ' ) ' + __pro.variaty.join('/');
    //         let __smallShade:any = $('<span class="small-shade">').append(__smallShadesStr);


    //         let __tr:any = $('<tr class="__variaty __variaty'+ index + '">');
    //         let __tdCheckbox = $('<td style="border-right:1px solid #0979D9">');
    //         let __tdLong:any = $('<td colspan="'+__colspan+'">').append(__link).append(__smallShade);
    //         let __tdPrice:any = $('<td>').append(__price);
    //         let __tdQuantity:any = $('<td>').append(__qtyspan);
    //         let __tdActiveAndActions = $('<td colspan="2">');

    //         __tr.append(__tdCheckbox).append(__tdLong).append(__tdQuantity)
    //             .append(__tdPrice).append(__tdActiveAndActions);
    //         $('tr.__product_' + index).after(__tr);
    //         __link.click(function(e){
    //             __self._global.navigatePanel('products/details/'+__proId);                
    //         });
    //     }
    // }

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
                $('tr.__variaty').remove();
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