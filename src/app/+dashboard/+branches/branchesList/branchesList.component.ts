import { Component , OnInit , ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AutocompleteComponent ,
         AddNewComponent,
         ShowItemComponent
        } from './../../../@components';
import { GlobalProvider , LabProvider , RouterTransition } from './../../../@providers';
import { Branches } from './../../../@interfaces';
import { HttpRequestService } from './../../../@services';


import { Uploader }      from 'angular2-http-file-upload';
import { MyUploadItem } from './../../myUploadItem';

@Component({
    selector : 'branches-list',
    templateUrl : './branchesList.html',
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
export class BranchesListComponent implements OnInit{

    private _controller:string = 'branches';
    private formObject:FormGroup;
    private errors:any;
    private _list:Branches[];
    private __currentBranches:Branches[];
    private _showItem:Branches;
    private _showItemFields:any;
    private _addNewObj:any;
    private _isShowItem:boolean;
    private _searchObjs:any;
    private _topActionsObjs:any;
    private _actionsObjs:any;
    private _filtersObjs:any;
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
                let __url = this._global.config['dashboard'] + '/branches/details/'+ $event.item.id.toString();
                this._router.navigate([__url]);
                break;
            case 'SHOW':
                this._isShowItem = true;
                this._showItem = <Branches>$event.item;
                this._lab.__setItemModal__(this._showItem,this._showItemFields);
                this._lab.__modal('#show-item-modal');
                break;
            case 'SYNC':
                this.__OnChangeCurrentBranch__($event.item.id);
        }
    }

    __getSyncBranches():any{
        this.__currentBranches = <Array<Branches>>this._global.getResource('branches');
        if(!this.__currentBranches) {
            this._lab.__setAlerts__('warn' , 'تم تحويلك الى صفحة تسجيل الدخول لوجود خطأ');
            this._lab.__setLogout__(this._http);
            return false;
        };
        return true;
    }

    onUploadImage(item:Branches):void{
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
                if(!this.__getSyncBranches()) return;
                for(let i:number = 0; i < this.__currentBranches.length; i++){
                    if(this.__currentBranches[i].id === item.id){
                        this.__currentBranches[i].img = response.data instanceof Array ? response.data[0] : response.data;
                        this._global.setResource(this.__currentBranches , 'branches');
                        break;
                    }
                }
                return this._lab.__onChangeAvatar__(this , item , response.data);
                // location.reload();
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
        this._global.navigatePanel('branches/details');
    }

    OnChangeCurrentBranch($event):void{
        let __notAllowed:boolean = false;
        let __checked:boolean = $event.target.checked;
        let __id:number = parseInt($event.target.id.replace('changexhkbx_' , ''));
        if(isNaN(__id)) { return; }
        // this._list.forEach((branch) => {
        //     if(branch.id === this._global.getToken()['company_id']){
        //         if(!__checked){
        //             __notAllowed = true;
        //             $('#' + $event.target.id).prop('checked' , true);
        //             this._lab.__setAlerts__('warn' , 'هذا الحساب مفعل مسبقا');
        //         }
        //     }
        // });
        // if(__notAllowed) {
        //     return;
        // }

        this.__OnChangeCurrentBranch__(__id);
    }

    __OnChangeCurrentBranch__(__id:any):void{
        this._http.get(this._controller + '/change/' + __id).subscribe(
            (response) => {
                if(response.error !== null || !response.data){
                    this._lab.__setErrors__(response.error);
                    return;
                }
                let __user:any = this._global.getToken();
                let roles:any = this._global.getResource('roles');
                let booksTree:any = this._global.getResource('booksTree');
                let register:any = response.data.register;
                let branches:any = response.data.branches;

                this._lab.__setAlerts__('success' , 'لقد تم تغيير الفرع الحالى .. سيتم اعادة التحميل');
                let __self:BranchesListComponent = this;
                setTimeout(() => {
                    __self._global.clearToken();
                    if(roles) __self._global.setResource(roles , 'roles');
                    if(register) __self._global.setResource(register , 'register');
                    if(branches) __self._global.setResource(branches , 'branches');
                    if(booksTree) __self._global.setResource(booksTree , 'booksTree');
                    delete __user.roles;
                    delete __user.register;
                    delete __user.branches;
                    __user.token = response.data.token;
                    __self._global.setToken({data : __user } , ['/dashboard'] , false);
                },2000);
            },(error) => {
                this._lab.__setAlerts__(error);
            },() => { }
        );
    }

    __isItTheCurrentBranch(id:number):boolean{
        if(!this.__getSyncBranches()) return;
        for(let i:number = 0; i < this.__currentBranches.length; i++){
            if(this.__currentBranches[i].id.toString() === id.toString()) return true;
        }
        return false;
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

        this._filtersObjs = {
            actions : [
                {
                    title : 'مزامنة الفروع المحددة',
                    __class : 'sync',
                    img : 'direction-alt'
                }
            ],
            exclusive : { delete : true }
        }

        this._showItemFields = {
            title : 'معلومات الحساب',
            name : 'الاسم',
            number : 'المعرف',
            email : 'البريد الالكترونى',
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
                    this._showItem = <Branches>new Object();
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

    private __deleteItems(id : any):void{
        if(id instanceof Array) return this._lab.__setAlerts__('error' , 'الرجاء اختيار فرع واحد فى كل مرة');
        let __id:number = parseInt(id);
        if(isNaN(id)) return this._lab.__setAlerts__('error' , 'حدث خطا فى اختيارك للفرع المراد حذفه');
        for(let i:number = 0; i < this._list.length; i++){
            if(this._list[i].id === id){
                if(this._list[i].is_main === true){
                    return this._lab.__setAlerts__('warn' , 'لايمكنك حذف الفرع الرئيسى للحساب');
                }
                break;
            }
        }

        let __url = this._controller +'/'+ id;
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
                // After Delete Items(s)
                this.__getItems();
            }
        );
    }
}
