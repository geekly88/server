import { Component, OnInit, OnChanges, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { GlobalProvider , LabProvider } from './../@providers';
import { BooksTree } from './../@interfaces';

@Component({
    selector : 'books-tree',
    outputs : ['onAction'],
    inputs : ['list' , 'component'],
    template :  `
    <div class="col-md-12 col-sm-12 col-xs-12 no-p books-tree">
                  
    <div class="above_booktree">
        <ul>
            <li class="name">الحساب</li>
            <li class="cred">دائن</li>
            <li class="deb">مدين</li>
            <li class="action"></li>
        </ul>
    </div>

    <div class="booksTreeView">
        <ul *ngIf="__showList" class="expanded depth_0 parent">
            <li *ngFor="let granpa of list; let i = index" class="code_{{ granpa.code }}" [ngClass]="{'brdred' : i === 0 , 'has_chldren' : granpa.children && granpa.children.length > 0}">
                
                <a class="name" (click)="onNameClick(granpa)" [ngClass]="{ 'plus' : granpa.focus , 'minus' : !granpa.focus }">
                    <p class=""><i class="float_exac" [ngClass]="{ 'ti-plus' : component && !granpa.focus , 'ti-minus' : !component || granpa.focus }"></i> {{ granpa.name_ar }} - {{ granpa.code }}</p>
                    <p class="deb has_deb" *ngIf="granpa.debitor">{{ granpa.debitor | myCurrency }}</p>
                    <p class="deb" *ngIf="!granpa.debitor">{{ 0 | myCurrency }}</p>
                    <p class="cred has_cred" *ngIf="granpa.creditor">{{ granpa.creditor | myCurrency }}</p>
                    <p class="cred" *ngIf="!granpa.creditor">{{ 0 | myCurrency }}</p>
                </a>


                <span *ngIf="component" width="24px" class="dropdown">
                <a class="action_btn float_exac filter" id="dropActionMenue" data-toggle="dropdown"><i class="ti-more"></i></a>
                    <ul class="list-actions dropdown-menu" role="menu" aria-labelledby="dropActionMenue" style="width: 45px; right: 0px; left: 0px;">
                        <li (click)="component.onAddNewClick({ addnew : 'true' , type : 'BKeep' , addEditData : { parent : granpa } })"><a class="add show_false"><i class="ti-pencil-alt"></i></a></li>
                        <!--<li (click)="component.onAddNewClick({ addnew : 'true' , type : 'BTree' , addEditData : { parent : granpa } })"><a class="report_ico"><i class="ti-plus"></i></a></li>-->
                    </ul>
        
                </span>



                
                <ul *ngIf="granpa.children && granpa.children.length > 0" class="depth_1 parent" [ngClass]="{ 'expanded' : granpa.focus , 'folded' : component && !granpa.focus }">
                    <li *ngFor="let father of granpa.children; let i = index" class="code_{{ father.code }}" [ngClass]="{'brdred' : i === 0 , 'has_chldren' : father.children && father.children.length > 0}">
                        
                        <a class="name" (click)="onNameClick(father)" [ngClass]="{ 'plus' : father.focus , 'minus' : !father.focus }">
                            <p class=""><i class="float_exac" [ngClass]="{ 'ti-file' : !father.children || father.children.length === 0 , 'ti-plus' : component && !father.focus && father.children && father.children.length > 0 , 'ti-minus' : !component || father.focus && father.children && father.children.length > 0 }"></i> {{ father.name_ar }} - {{ father.code }}</p>
                            <p class="deb has_deb" *ngIf="father.debitor">{{ father.debitor | myCurrency }}</p>
                            <p class="deb" *ngIf="!father.debitor">{{ 0 | myCurrency }}</p>
                            <p class="cred has_cred" *ngIf="father.creditor">{{ father.creditor | myCurrency }}</p>
                            <p class="cred" *ngIf="!father.creditor">{{ 0 | myCurrency }}</p>
                        </a>


                        <span *ngIf="component" width="24px" class="dropdown">
                        <a class="action_btn float_exac filter" id="dropActionMenue" data-toggle="dropdown"><i class="ti-more"></i></a>
                            <ul class="list-actions dropdown-menu" role="menu" aria-labelledby="dropActionMenue" style="width: 45px; right: 0px; left: 0px;">
                                <li (click)="component.onAddNewClick({ addnew : 'true' , type : 'BKeep' , addEditData : { parent : father } })"><a class="add show_false"><i class="ti-pencil-alt"></i></a></li>
                                <!--<li (click)="component.onAddNewClick({ addnew : 'true' , type : 'BTree' , addEditData : { parent : father } })"><a class="report_ico"><i class="ti-plus"></i></a></li>-->
                            </ul>
                
                        </span>


                        <ul *ngIf="father.children && father.children.length > 0" class="depth_2 parent" [ngClass]="{ 'expanded' : father.focus , 'folded' : component && !father.focus }">
                            <li *ngFor="let item of father.children; let i = index" class="code_{{ item.code }}" [ngClass]="{'brdred' : i === 0 , 'has_chldren' : item.children && item.children.length > 0}">
                                
                                <a class="name" (click)="onNameClick(item)" [ngClass]="{ 'plus' : item.focus , 'minus' : !item.focus }">
                                    <p class=""><i class="float_exac" [ngClass]="{ 'ti-file' : !item.children || item.children.length === 0 , 'ti-plus' : component && !item.focus && item.children && item.children.length > 0 , 'ti-minus' : !component || item.focus && item.children && item.children.length > 0 }"></i> {{ item.name_ar }} - {{ item.code }}</p>
                                    <p class="deb has_deb" *ngIf="item.debitor">{{ item.debitor | myCurrency }}</p>
                                    <p class="deb" *ngIf="!item.debitor">{{ 0 | myCurrency }}</p>
                                    <p class="cred has_cred" *ngIf="item.creditor">{{ item.creditor | myCurrency }}</p>
                                    <p class="cred" *ngIf="!item.creditor">{{ 0 | myCurrency }}</p>
                                </a>


                                <span *ngIf="component" width="24px" class="dropdown">
                                <a class="action_btn float_exac filter" id="dropActionMenue" data-toggle="dropdown"><i class="ti-more"></i></a>
                                    <ul class="list-actions dropdown-menu" role="menu" aria-labelledby="dropActionMenue" style="width: 45px; right: 0px; left: 0px;">
                                        <li (click)="component.onAddNewClick({ addnew : 'true' , type : 'BKeep' , addEditData : { parent : item } })"><a class="add show_false"><i class="ti-pencil-alt"></i></a></li>
                                        <!--<li (click)="component.onAddNewClick({ addnew : 'true' , type : 'BTree' , addEditData : { parent : item } })"><a class="report_ico"><i class="ti-plus"></i></a></li>-->
                                    </ul>
                        
                                </span>


                                <ul *ngIf="item.children && item.children.length > 0" class="depth_3 parent" [ngClass]="{ 'expanded' : item.focus , 'folded' : component && !item.focus }">
                                    <li *ngFor="let son of item.children; let i = index" class="code_{{ son.code }}" [ngClass]="{'brdred' : i === 0 , 'has_chldren' : son.children && son.children.length > 0}">
                                        
                                        <a class="name" (click)="onNameClick(son)" [ngClass]="{ 'plus' : son.focus , 'minus' : !son.focus }">
                                            <p class=""><i class="float_exac" [ngClass]="{ 'ti-file' : !son.children || son.children.length === 0 , 'ti-plus' : component && !son.focus && son.children && son.children.length > 0 , 'ti-minus' : !component || son.focus && son.children && son.children.length > 0 }"></i> {{ son.name_ar }} - {{ son.code }}</p>
                                            <p class="deb has_deb" *ngIf="son.debitor">{{ son.debitor | myCurrency }}</p>
                                            <p class="deb" *ngIf="!son.debitor">{{ 0 | myCurrency }}</p>
                                            <p class="cred has_cred" *ngIf="son.creditor">{{ son.creditor | myCurrency }}</p>
                                            <p class="cred" *ngIf="!son.creditor">{{ 0 | myCurrency }}</p>
                                        </a>


                                        <span *ngIf="component" width="24px" class="dropdown">
                                        <a class="action_btn float_exac filter" id="dropActionMenue" data-toggle="dropdown"><i class="ti-more"></i></a>
                                            <ul class="list-actions dropdown-menu" role="menu" aria-labelledby="dropActionMenue" style="width: 45px; right: 0px; left: 0px;">
                                                <li (click)="component.onAddNewClick({ addnew : 'true' , type : 'BKeep' , addEditData : { parent : son } })"><a class="add show_false"><i class="ti-pencil-alt"></i></a></li>
                                                <!--<li (click)="component.onAddNewClick({ addnew : 'true' , type : 'BTree' , addEditData : { parent : son } })"><a class="report_ico"><i class="ti-plus"></i></a></li>-->
                                            </ul>
                                
                                        </span>
                                    </li>
                                </ul>


                            </li>
                        </ul>
                    </li>
                </ul>
            </li>
        </ul>
    </div>
                        <!--div class="col-md-12 col-sm-12 col-xs-12 no-p booksTreeView"></div-->
</div>
    `
})
export class BookTreeComponent implements OnInit,OnChanges{

    // public items:Array<BooksTree> = [];
    public list:Array<BooksTree> = [];
    public component:any;
    public item:any = {};
    public onAction:any = new EventEmitter();

    private __showList:boolean = false;
    constructor(
        private _router:Router,
        private _global:GlobalProvider,
        private _lab:LabProvider
    ){};
    ngOnInit(){
        let __self:BookTreeComponent = this;
        // setTimeout(function(){
        // } , 1100);
    }

    ngOnChanges(props:any):void{
        this.__prepareItems();
    }

    OnAction(action:string,item:BooksTree){
        this.onAction.emit({
            item : item,
            action : action.toUpperCase()
        });
    }

    onNameClick(item:BooksTree):void{
        if(!item.children || item.children.length === 0) item.focus = false;
        else item.focus = !item.focus;
    }

    private __prepareItems():void{
        this._lab.__buildBooksTree__(this.list , (__tempList) => {
            this.list = Object['assign']([] , __tempList);
            this.__showList = this.list.length > 0;
            // this._lab.__setBooksTreeView__('.booksTreeView' , __tempList , this.component);
            if(this.component && this.component.hasOwnProperty('__hideLists'))
                this.component.__hideLists = false;
        });
    }
}