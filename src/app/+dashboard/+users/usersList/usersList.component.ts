import { Component , OnInit , ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AutocompleteComponent ,
         AddNewComponent,
         ShowItemComponent
        } from './../../../@components';
import { GlobalProvider , LabProvider , RouterTransition } from './../../../@providers';
import { Users } from './../../../@interfaces';
import { HttpRequestService } from './../../../@services';

import { Uploader }      from 'angular2-http-file-upload';
import { MyUploadItem } from './../../myUploadItem';

@Component({
    selector : 'users-list',
    templateUrl : './usersList.html',
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
export class UsersListComponent implements OnInit{

    private _controller:string = 'users';
    private formObject:FormGroup;
    private errors:any;
    private _list:Array<Users>;
    private _showItem:Users;
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
        if(__url) this.__getItems(__url);
        else this.__OnChangeURL__();
        this._lab.__initLists__();
    }

    onAction($event):void{
        switch($event.action){
            case 'DELETE':
                this.__deleteItems($event.item.id);
                break;
            case 'EDIT':
                let __url = 'users/details/'+ $event.item.id.toString();
                this._global.navigatePanel(__url);
                break;
        }
    }

    onUploadImage(item:Users):void{
        let uploadFile = (<HTMLInputElement>window.document.getElementById('myFileInputField')).files[0];
        if(!uploadFile) return;
        let myUploadItem = new MyUploadItem(uploadFile);
        let token:string = this._global.getToken()['token'];
        myUploadItem.url = this._global.config['serverPath'] + this._controller +'/'+item.id+'/avatar?replace=true&token='+token;
        this._uploaderService.onSuccessUpload = (img, response, status, headers) => {
        };
        this._uploaderService.onErrorUpload = (img, response, status, headers) => {
            this._lab.__setAlerts__('warn' , 'حجم الصورة أقل من 10 ميجابايت ... <jpeg,png>');
        };
        this._uploaderService.onCompleteUpload = (img, response, status, headers) => {
            return this._lab.__onChangeAvatar__(this , item , response.data);
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
        __url += '&search=active&active='+ status;
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
        this._global.navigatePanel('users/details');
    }

    private __setObject():void {
       this._searchObjs = [
            { key : 'username' , value : 'اسم المستخدم' },
            { key : 'role' , value : 'الصلاحية' }
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
                    this._showItem = <Users>new Object();
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

    OnChangeActivity(user:Users , index:number):void{
        if(user.super){
            this._list[index].active = true;
            return this._lab.__setAlerts__('warn' , 'لايمكن ايقاف تفعيل خدمة مالك الحساب');
        }
        let active:boolean = !user.active;
        this._http.put(this._controller + '/'+ user.id , { active : active }).subscribe(
            (user) => {
                if(!user.error){
                    for(let i=0; i < this._list.length; i++){
                        if(this._list[i].id === user.id){
                            this._list[i].active = !active;
                            this._lab.__setErrors__(user.error);
                            break;
                        }
                    }
                }else{
                    if(user.data) return;
                    this._lab.__setAlerts__('error' , 'حدث خطأ ما الرجاء اعادة المحاولة');
                }
            },(error) => {
                for(let i=0; i < this._list.length; i++){
                    if(this._list[i].id === user.id){
                        this._list[i].active = !active;
                        this._lab.__setErrors__(error);
                        break;
                    }
                }
            },() => { }
        )
    }

    private __deleteItems(ids : string , multi:boolean = false):void{
        let __user:Users;
        if(!multi){
            for(let i= 0; i < this._list.length; i++){
                if(this._list[i].id.toString() === ids.toString()){
                    __user = this._list[i];
                    break;
                }
            }
        }
        if(!__user) return;
        if(__user.super){
            this._lab.__setAlerts__('error' , 'لايمكنك حذف بيانات مدير الحسابات');
            return;
        }
        if(__user.id === this._global.getToken()['id']){
            this._lab.__setAlerts__('error' , 'لايمكنك حذ هذا الحساب الا بعد تسجيل الخروج و الدخول بحساب أخر')
            return;
        }
        let __url = this._controller +'/'+ ids;
        this._http.delete(__url).subscribe(
            (response) => {
                if(response.error !== null){
                    this._lab.__setAlerts__('error' , 'فشل فى عملية الحذف');
                    return;
                }
                this._lab.__setAlerts__('success' , 'تمت عملية حذف المستخدم ');
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
