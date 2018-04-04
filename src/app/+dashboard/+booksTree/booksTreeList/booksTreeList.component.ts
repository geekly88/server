import { Component , OnInit , ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AutocompleteComponent ,
         AddNewComponent,
         ShowItemComponent
        } from './../../../@components';
import { GlobalProvider , LabProvider , RouterTransition } from './../../../@providers';
import { BooksTree } from './../../../@interfaces';
import { HttpRequestService } from './../../../@services';

@Component({
    selector : 'booksTree-list',
    templateUrl : './booksTreeList.html',
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
export class BooksTreeListComponent implements OnInit{

    private _controller:string = 'booksTree';
    private formObject:FormGroup;
    private _list:BooksTree[];
    private _addNewObj:any;
    private _searchObjs:any;
    private _filtersObjs:any;
    private _topActionsObjs:any;
    // private _actionsObjs:any;
    private __order:string = 'father_id';
    private __sort:string = 'ASC';
    private __explain:boolean = false;
    private __hideLists:boolean = true;
    private __addEditData:any;
    private __component:BooksTreeListComponent = this;
    private __childrenIDS:Array<number> = [];
    private __addType:string;
    private __reportData:Array<BooksTree> = [];

    public param:number;
    public editable:boolean = false;
    public editItem:BooksTree;
    private codes:any;
    private __reportChangable:number = 0;
    private __reportCode:string = '';
    constructor(
        private _global:GlobalProvider,
        private _http:HttpRequestService,
        private _lab:LabProvider,
        private _router:Router
    ){ }
    ngOnInit():any{
        this.__setObject();
        this._lab.__setGlobal__(this._global);
        this.__getItems();
    }

    onAction($event):void{
        if(!$event.item) return;
        switch($event.action){
            case 'DELETE':
                let __url:string = $event.item.id+'?father_id='+$event.item.father_id;
                __url += '&root_id='+$event.item.root_id+'&depth='+$event.item.depth;
                if($event.item.children && $event.item.children.length > 0){
                    this.__getChildrensIds($event.item.children);
                    let __self:BooksTreeListComponent = this;
                    setTimeout(() => {
                        __self.__deleteItems(__url + '&children=' + JSON.stringify(this.__childrenIDS));
                    } , 500);
                }
                else this.__deleteItems(__url);
                break;

            // case 'REPORT':
            //     // this.__reportChangable = (this.__reportChangable + 1);
            //     if(!$event.item.is_cred_deb){
            //         this.__getCreditorANDDebitorFromCode__($event);
            //     }
            //     this.__reportData = $event.item;
            //     this.__addType = 'Report';
            //     this._lab.__modal('#show-details-model');
            //     break;

            case 'RESULT':
                if(!$event.item.code) return;
                this.__getCreditorANDDebitorFromCode__($event);
                break;
        }
    }

    onPageChanging($event):void{
        // if(!$event.values || $event.values.length <= 0 || !this._list || this._list.length <= 0) return;
        // let __200:boolean = this.__checkReportCode__(this._list , $event.values);
        // if(__200){

        // }
        this.__getCreditorANDDebitorFromCode__($event);
    }
    
    private __checkReportCode__(list:Array<BooksTree> , values:any):boolean{
        let __200:boolean = false;
        for(let j:number = 0; j < list.length; j++){
            for(let i:number = 0; i < values.length; i++){
                let __key:string = values[i]['key'];
                if(list[j][__key] === values[i]['value']){
                    __200 = true;
                }else{
                    __200 = false;
                    break;
                }
            }
            if(__200){
                this.onAction({ action : 'RESULT' , item : list[j]});
                break;
            }else{
                if(list[j].children && list[j].children.length > 0){
                    __200 = this.__checkReportCode__(list[j].children,values);
                    if(__200) break;
                }
            }
        }
        return __200;
        // let __queryParams:any = this._router.routerState.root.queryParams['value'];
        // if(!__queryParams || !__queryParams['sort']){
        //     $event.queryParams += '&sortby=' + this.__order + '&sort=' + this.__sort; 
        // }
    }

    onTopActionClick($event):void{
        // this._lab.__onTopActionClick__($event , this);
        if(!$event.clicked) return;
        switch($event.action){
            case 'REFRESH':
                this.__getItems(null , true);
                break;
            case 'EXPORTLIST':
            case 'EXPORT':
                this._lab.__modal('#show-download-modal');
                let __modal:any = this._lab.jQuery('#show-download-modal');
                if(!__modal){
                    return;
                }
                let __parse:string = $event.action === 'EXPORTLIST' ? '1' : '0';
                let __query:string = '';
                __modal.data('ctrl' , this._controller);
                __modal.data('parse' , __parse);
                break;
        }
    }

    private __setObject():void {
       this._searchObjs = [
            // { key : 'name_ar' , value : 'الاسم بالعربية' },
            // { key : 'name' , value : 'الاسم باللاتينى' },
            // { key : 'code' , value : 'كود الحساب' },
        ];
        this._filtersObjs = {
            exclusive : { delete : true }
        };
    }

    private __getCreditorANDDebitorFromCode__($event):void{
        // let __URL:string = $event === 'all' ? 'reports/booktree/all' : 'reports/booktree/' + $event.item.code;
        let __URL:string = 'reports/booktree/all';
        if($event.queryParams && typeof $event.queryParams === 'string'){
            __URL += $event.queryParams;
        }
        this._http.get(__URL).subscribe(
            (response) => {
                // if(!response.data || !response.data.creditor || !response.data.debitor) return;
                // this.codes = response.data;
                // let __arr:Array<BooksTree> = $event === 'all' ? this.__getTop4__() : [$event.item];
                let __arr:Array<BooksTree> = this.__getTop4__();
                this.__setCodeCreditorANDebitor(__arr , response.data);
                this._list = Object['assign']([] , __arr);
            },(error) => {
                this._lab.__setErrors__(error);
            },() => { }
        )
    }

    private __setCodeCreditorANDebitor(items:Array<BooksTree>,__codes:any):void{
        if(items.length === 0) {
            return;
        }
        items.forEach((item) => {
            item.is_cred_deb = true;
            item.creditor = 0;
            item.debitor  = 0;
            var reg:RegExp = new RegExp('^' + item.code);
            for(let code in __codes.creditor){
                if(reg.test(code)) {
                    item.creditor += __codes.creditor[code];
                }
            }
            for(let code in __codes.debitor){
                if(reg.test(code)) {
                    item.debitor += __codes.debitor[code];
                }
            }
            if(item.children && item.children.length > 0) this.__setCodeCreditorANDebitor(item.children , __codes);
        });
    }

    private __getChildrensIds(childrens:Array<BooksTree>):void{
        childrens.forEach((book) => {
            this.__childrenIDS.push(book.id);
            if(book.children && book.children.length > 0){
                this.__getChildrensIds(book.children);
            }
        });
    }

    private __getTop4__():Array<BooksTree>{
        let __arr:Array<BooksTree> = [];
        let __codes:any = {};
        if(!this._list || this._list.length <= 0) return __arr;
        for(let i:number = 0; i < this._list.length; i++){
            if(this._list[i].depth === 0 && this._list[i].code.length === 1){
                if(!__codes[this._list[i].code]){
                    __codes[this._list[i].code] = true;
                    __arr.push(this._list[i]);
                }else delete this._list[i];
            }
        }
        return __arr;
    }

    onAddNewClick($event):void{
        this.__addType = $event.type || 'BTree';
        this.editable = false;
        this.param = null;
        this.editItem = null;
        this.__addEditData = $event.addEditData;
        this._lab.__modal('#show-details-model');
    }

    OnDetailsAction($event):void{
        if(!$event || !$event.item) return;
        switch($event.action){
            case 'ADD':
            case 'EDIT':
                
                break;
        }
    }

    private __getItems(__url:string = null , __refresh:boolean = false) {
        // if(!__refresh){
        //     let __booksTreeResource:any = this._global.getResource('booksTree') as any;
        //     if(__booksTreeResource && __booksTreeResource.length > 0){
        //         this._list = <Array<BooksTree>>__booksTreeResource;
        //         this.__hideLists = false;
        //         this._list = __booksTreeResource;
        //         this.__getCreditorANDDebitorFromCode__('all');
        //         return ;
        //     }
        // }
        if(!__url) __url = this._controller + '/' + this._global.parseQueryParams(); // + this._global.getToken()['settings']['perpage'];
        this._http.get(__url).subscribe(
            (list)=>{
                if(list.error !== null){
                    this._lab.__setErrors__(list.error);
                    return;
                }
                this._lab.__getBooksTree__(this , "_list" , () => {
                    if(this._list && this._list.length >= 100){
                        this._global.setResource(this._list , 'booksTree');
                        this.__hideLists = false;
                        this.__getCreditorANDDebitorFromCode__('all');
                    }else{
                        this.__generateNewTree__();
                        this.__hideLists = true;
                    }
                });
                
            },
            (error) => { 
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
                this._lab.__setAlerts__('success' , 'تمت عملية حذف بنجاح');
            },
            (error) => {
                this._lab.__setErrors__(error);
            },
            () => {
                this.__getItems(null , true);
                // After Delete Items(s)
            }
        );
    }

    private __generateNewTree__():void{
        this._http.get('super/initbookstree').subscribe(
            (response)=>{
                if(response.error){
                    this._lab.__setErrors__(response.error);
                    return;
                }
                if(response.data && response.data.length >= 1){
                    this._list = response.data;
                    this._global.setResource(this._list , 'booksTree');
                    this.__hideLists = false;
                    this.__getCreditorANDDebitorFromCode__('all');
                }else{
                    this._list = [];
                    this.__hideLists = true;
                }
            },
            (error) => { 
                this._list = [];
                this._lab.__setErrors__(error);
            },
            ()=> {
                // After Complete Fetching Data From Server
            }
        )
    }
}