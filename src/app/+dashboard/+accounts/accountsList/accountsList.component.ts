import { Component , OnInit , ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AutocompleteComponent ,
         AddNewComponent,
         ShowItemComponent
        } from './../../../@components';
import { GlobalProvider , LabProvider , RouterTransition } from './../../../@providers';
import { Accounts } from './../../../@interfaces';
import { HttpRequestService } from './../../../@services';


import { Uploader }      from 'angular2-http-file-upload';
import { MyUploadItem } from './../../myUploadItem';

declare let $:any;

@Component({
    selector : 'accounts-list',
    templateUrl : './accountsList.html',
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
export class AccountsListComponent implements OnInit{

    private _controller:string = 'accounts';
    private formObject:FormGroup;
    private errors:any;
    private _list:Accounts[];
    private _showItem:Accounts;
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
    constructor(
        private _global:GlobalProvider,
        private _http:HttpRequestService,
        private _lab:LabProvider,
        private _router:Router,
        private _uploaderService: Uploader
    ){ }
    ngOnInit():any{
        this._lab.__setGlobal__(this._global);
        this._lab.__setTopLink__({href:'accounts',text:' / الحسابات'},null);
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
                let __url = this._global.config['dashboard'] + '/accounts/details/'+ $event.item.id.toString();
                this._router.navigate([__url]);
                break;
            case 'SHOW':
                this._isShowItem = true;
                this._showItem = <Accounts>$event.item;
                this._lab.__setItemModal__(this._showItem,this._showItemFields);
                this._lab.__modal('#show-item-modal');
                break;
        }
    }

    onUploadImage(item:Accounts):void{
        let uploadFile = (<HTMLInputElement>window.document.getElementById('myFileInputField')).files[0];
        if(!uploadFile) return;
        let myUploadItem = new MyUploadItem(uploadFile);
        let token:string = this._global.getToken()['token'];
        myUploadItem.url = this._global.config['serverPath'] + this._controller + '/'+item.id+'/avatar?replace=true&token='+token;
        this._uploaderService.onSuccessUpload = (img, response, status, headers) => {
        };
        this._uploaderService.onErrorUpload = (img, response, status, headers) => {
            this._lab.__setAlerts__('warn' , 'حجم الصورة أقل من 10 ميجابايت ... <jpeg,png>');
        };
        this._uploaderService.onCompleteUpload = (img, response, status, headers) => {
            if(response.data && response.data){
                let __token:any = this._global.getToken();
                let __account:Accounts = __token['account'];
                let __self:AccountsListComponent = this;
                if(item.id === __account.id){
                    __account['img'] = response.data;
                    __token['account'] = __account;
                    this._global.setToken({data : __token } , null , false);
                }
                location.reload();
            }
        };
        this._uploaderService.onProgressUpload = (img, percentComplete) => {
        };
        this._uploaderService.upload(myUploadItem);
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
        this._global.navigatePanel('accounts/details');
    }

    OnChangeCurrentAccount($event):void{
        let __notAllowed:boolean = false;
        let __checked:boolean = $event.target.checked;
        let __id:number = parseInt($event.target.id.replace('changexhkbx_' , ''));
        if(isNaN(__id)) { return; }
        this._list.forEach((account) => {
            if(account.id === this._global.getToken()['company_id']){
                if(!__checked){
                    __notAllowed = true;
                    $('#' + $event.target.id).prop('checked' , true);
                    this._lab.__setAlerts__('warn' , 'هذا الحساب مفعل مسبقا');
                }
            }
        });
        if(__notAllowed) { 
            return; 
        }
        this._http.get(this._controller + '/change/' + __id).subscribe(
            (account) => {
                if(account.error !== null || !account.data){
                    this._lab.__setErrors__(account.error);
                    return;
                }
                
                
                this._lab.__setAlerts__('success' , 'لقد تم تغيير الحساب الحالى .. سيتم اعادة التحميل');
                setTimeout(() => {
                    this._global.clearToken();
                    if(account.data.roles){
                        this._global.setResource(account.data.roles , 'register');
                        this._global.setResource(account.data.roles , 'roles');
                        delete account.roles;
                    }
                    this._global.setToken(account , ['/dashboard'] , false);
                },2000);
            },(error) => {
                this._lab.__setAlerts__(error);
            },() => { }
        );
    }

    private __setObject():void {
       this._searchObjs = [
            { key : 'name' , value : 'الاسم' },
            { key : 'phone' , value : 'رقم الهاتف' },
            { key : 'country' , value : 'البلد' },
            { key : 'city' , value : 'المنطقة' },
            { key : 'state' , value : 'المدينة' },
        ];
        this._actionsObjs = {
            actions : []
        };
        this._showItemFields = {
            title : 'معلومات الحساب',
            name : 'الاسم',
            code : 'الكود',
            email : 'البريد الالكترونى',
            website : 'الموقع الالكترونى',
            facebook: 'فيس بوك',
            linkedin :'لينكدين',
            twitter : 'تويتر',
            phone : 'الهاتف',
            mobile : 'النقال',
            country : 'البلد',
            city : 'المدينة',
            state : 'الولاية',
            address1 : 'العنوان 1',
            address2 : 'العنوان 2',
            postcode : 'الرمز البريدى',
            createdAt : 'تاريخ الانشاء'
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
                    this._showItem = <Accounts>new Object();
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
                    // this._lab.__setErrors__(response.error);
                    this._lab.__setAlerts__('error' , 'فشل فى عملية الحذف');
                    return;
                }
                this._lab.__setAlerts__('success' , 'تمت عملية حذف الحساب');
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