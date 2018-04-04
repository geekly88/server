import { Component, OnInit, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { GlobalProvider , LabProvider } from './../@providers';

@Component({
    selector : 'addnew-item',
    outputs : ['onAddNewClick'],
    template : `<a class="addnew action_btn float_opp" (click)="onAdding()" *ngIf="__showIT__">
        <i>+</i>جديد
    </a>`
})
export class AddNewComponent implements OnInit{

    private __showIT__:boolean = false;
    public obj:any;
    public onAddNewClick:any = new EventEmitter();
    constructor(
        private _router:Router,
        private _lab:LabProvider
    ){};
    ngOnInit(){
        let url:string = this._router.url;
        let __urlArray:Array<string> = url.split('/');
        let __clearUrlArray:Array<string> = [];
        __urlArray.forEach((u,i) => {
            if(u && u !== '') __clearUrlArray.push(u);
        });
        if(__clearUrlArray.length <= 1) {
            this.__showIT__ = false;
        }else{
            url = __clearUrlArray[0] + '/' + __clearUrlArray[1] + '/details';
            this.__showIT__ = this._lab.__checkAuthPage(url);
        }
    }

    onAdding(){
        this.onAddNewClick.emit({
            addnew : true
        });
    }
}