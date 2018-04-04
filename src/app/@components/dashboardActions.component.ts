import { Component ,OnInit ,OnChanges ,EventEmitter, AfterViewInit } from '@angular/core';
import { LabProvider , GlobalProvider } from './../@providers';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

declare let $:any;

@Component({
    selector : 'dashboard-actions',
    template : `<span width="24px"
    class="dropdown"><a class="action_btn float_exac filter" id="dropActionMenue" data-toggle="dropdown">
    <i class="ti-more"></i></a>
    <ul class="list-actions dropdown-menu" role="menu" aria-labelledby="dropActionMenue">
        <li *ngFor="let action of __actions" class="{{ action.__class }}_{{ item.id }}" (click)="onActionClick(action.__class)">
            <a class="list-action-item {{ action.__class }}" data-toggle="tooltip" 
               tooltipPlacement="top" tooltip="{{ action.tooltip }}">
               <i class="ti-{{ action.icon }}"></i>
            </a>
        </li>
    </ul>
</span>
`,
    inputs : ['obj', 'item'],
    outputs : ['onAction']
})
export class DashboardActionsComponent implements OnInit/*,OnChanges*/ {
    public obj:any = {};
    public item:any;
    private __actions:Array<Object> = [];
    private __width:string = '122px';
    private __dir:string = 'right';
    public onAction = new EventEmitter();
    
    constructor(
        private _lab:LabProvider,
        private _global:GlobalProvider,
        private _router:Router
    ){
        let __self:DashboardActionsComponent = this;
        setTimeout(() => {
            __self._lab.__tooltip('.wrap-tooltip');
        },1000);
    };

    ngOnInit():any{
        let editurl:string,desturl:string;
        let url:string = this._router.url;
        let __urlArray:Array<string> = url.split('/');
        let __clearUrlArray:Array<string> = [];
        __urlArray.forEach((u,i) => {
            if(u && u !== '') __clearUrlArray.push(u);
        });
        if(__clearUrlArray.length > 1) {
            editurl = __clearUrlArray[0] + '/' + __clearUrlArray[1] + '/details/1';
            desturl = __clearUrlArray[0] + '/' + __clearUrlArray[1] + '/destroy/1';
        }
        this.__dir = this._global.getToken()['settings']['language'] === 'ar' ? 'right' : 'left';
        if(this._lab.__checkAuthPage(editurl)){
            if(!this.obj || !this.obj.hasOwnProperty('exclusive') || !this.obj.exclusive.edit){
                this.__actions.push({
                    tooltip : 'تعديل',
                    __class : 'edit',
                    icon : 'settings'
                });
            }
        }
        if(!this.obj || !this.obj.hasOwnProperty('exclusive') || !this.obj.exclusive.show){
            this.__actions.push({
                tooltip : 'عرض البيانات',
                __class : 'show',
                icon : 'eye'
            });
        }
        if(this._lab.__checkAuthPage(desturl)){
            if(!this.obj || !this.obj.hasOwnProperty('exclusive') || !this.obj.exclusive.delete){
                this.__actions.push({
                    tooltip : 'حذف البيانات',
                    __class : 'delete',
                    icon : 'trash'
                });
            }
        }
        if(this.obj && this.obj.actions && this.obj.actions instanceof Array){
            for( let i=0; i < this.obj.actions.length; i++){
                this.__actions.push(this.obj.actions[i]);
            }
        }
        let __wid:number = (this.__actions.length * 40);
        this.__width = (__wid + 10).toString() + 'px';
        let __style = { width : this.__width};
        __style[this.__dir] = '-' + ((this.__actions.length * 40) - 18).toString() + 'px';
        this._lab.__setStyle__('.list-actions' , __style);
    };
    
    onActionClick(action):void{
        if(action === 'delete'){
            if(!confirm("هل تريد الاستمرار فى عملية الحذف")) return;
        }
        this.onAction.emit({
            item   : this.item,
            action : action.toUpperCase()
        });
    }

    private __createInfoModal():void{
        let __modal = $('#show-info-modal .info_content');
        __modal.html('');
        
        let __value:string;
        let __div:string = '<div class="col-md-12 item_field">';
        //--------------------------------------------------------------------------------------
        __value = new DatePipe('medium').transform(this.item['createdAt'] , 'yyyy-mm-dd H:mm');
        __div += '<div class="col-md-3 field_name">تاريخ الانشاء</div>';
        __div += '<div class="col-md-9 field_data">'+ __value +'</div>';
        //--------------------------------------------------------------------------------------
        __value = new DatePipe('medium').transform(this.item['updatedAt'] , 'yyyy-mm-dd H:mm');
        __div += '<div class="col-md-3 field_name">أخر تعديل</div>';
        __div += '<div class="col-md-9 field_data">'+ __value +'</div>';
        //--------------------------------------------------------------------------------------
        // __div += '<div class="col-md-3 field_name">تاريخ الانشاء</div>';
        // __div += '<div class="col-md-9 field_data">'+ this.item['author'] +'</div>';
        //--------------------------------------------------------------------------------------
        // let __infoArr = {
        //     createdAt : 'تاريخ الانشاء',
        //     updatedAt : 'اخر تعديل',
        //     author : 'المستخدم'
        // };
        // for(let i in __infoArr){
        //     __div += '<div class="col-md-3 field_name">' + __infoArr[i] + '</div>';
        //     __div += '<div class="col-md-9 field_data">' + this.item[i] + '</div>';
        // }
        __div += '<div>';
        __modal.html(__div);
        this._lab.__modal('#show-info-modal');
    }
 }