import { Component, OnInit, OnChanges, EventEmitter, ElementRef } from '@angular/core';
import { GlobalProvider , LabProvider } from './../@providers';
import { HttpRequestService } from './../@services';

@Component({
    selector : 'select-cmp',
    inputs : [
        'addnew',
        'name',
        'options',
        'url',
        'searchField',
        'optionItems',
        'optionString',
        'isLocal',
        'defaultValueId'
    ],
    outputs : ['onSelectItem','onAddSelectItem'],
    template : `
    <select class="form-control selectcmp" id="{{ name }}" (change)="onChangeSelect(selectElemRef)" #selectElemRef>
        <option value="{{ selected }}"></option>
        <option value="PLUS">{{ addnew }}</option>
        <option *ngFor="let option of newOptionItems" value="{{ option.__value }}">
            {{ option.__value }}</option>
    </select>
`

// <div class="select-front" id="dropDownMenuSelect" data-toggle="dropdown">
//             {{ selected }}
//             <span class="arrow">«</span>
//         </div>
//         <div class="dropdown-menu select-items" role="menu" aria-labelledby="dropDownMenuSelect"  style="max-height:400px; overflow-x:hidden; overflow-y:auto">
//             <input class="select-search" (keyup)="onSearch($event)" />
//             <ul>
//                 <li (click)="onAddSelect()">
//                     <a >+ {{ addnew }}</a>
//                 </li>
//                 <li *ngFor="let option of newOptionItems" (click)="onSelect(option)">
//                     <a >{{ option.__value }}</a>
//                 </li>
//             </ul>
//         </div>
})
export class SelectComponent implements OnInit,OnChanges{

    private __search:string = '';
    public url:string;
    public name:string;
    public addnew:string;
    public selected:string = 'EMPTY';
    public options:any;
    public searchField:string;
    public optionItems:any;
    public defaultValueId:number;
    public newOptionItems:Array<{__value:string , index:number}> = 
    new Array<{__value:string , index:number}>();
    public optionString:string;
    public isLocal:boolean = true;

    public onSelectItem = new EventEmitter();
    public onAddSelectItem = new EventEmitter();
    constructor(
        private _global:GlobalProvider,
        private _http:HttpRequestService,
        private _lab:LabProvider,
        private _ele:ElementRef
        ){};

    ngOnInit():void{
        this._refresh();
        if(!this.defaultValueId) this.selected = null;
        if(!this.addnew) this.addnew = 'أضف جديد';
    }
    
    ngOnChanges(props: any):void {
        if(props.defaultValueId && props.defaultValueId.currentValue !== null){
            if(typeof(props.defaultValueId.currentValue) === 'string'){
                this.selected = props.defaultValueId.currentValue;
                this.__search = '';
                this.defaultValueId = null;
            }else{
                this.__setNewOptions__();
                this.selected = this.newOptionItems[0].__value;
            }
        }
        if(props.options && !!props.options.currentValue){
            this.options = props.options.currentValue;
            this.__setNewOptions__();
        }
    }

    onChangeSelect(elem:any):void{
        // this._ele.nativeElement.select('select#'+this.name);
        window['elem'] = elem;
        if(elem.value === 'EMPTY') return;
        if(elem.value === 'PLUS'){
            elem.value = 'EMPTY';
            this.onAddSelect();
        }
        for(let i=0; i < this.newOptionItems.length; i++){
            if(this.newOptionItems[i].__value === elem.value){
                this.onSelect(this.newOptionItems[i]);
                break;
            }
        }
    }

    onSelect(option:any):void{
        this.selected = option.__value;
        this.onSelectItem.emit({
            name : this.name,
            item : this.options[option.index]
        });
        this.__search = '';
    }

    onAddSelect():void{
        this.onAddSelectItem.emit({
            name : this.name,
            item : null
        })
    }

    onSearch($event:any){
        this.__onSearch__($event.target.value);
    }

    private __onSearch__(search:string){
        this.__search = search;
        this.__setNewOptions__();
    }

    private __getOptions__(){
        if(!this.url){
            return this.__setNewOptions__();
        }
        if(!this.isLocal)
            this._http.setLocal(this.isLocal);
        this._http.get(this.url).subscribe(
            (options) => {
                if(!options.error)
                    return this.options = options.data;
                this._lab.__setErrors__(options.error);
            },
            (error)=>{
                this._lab.__setErrors__(error);
            },
            ()=>{}
        );
    }

    private __setNewOptions__(){
        if(this.options){
            this.newOptionItems = new Array<{__value:string , index:number}>();
            for(let o:number = 0 ; o < this.options.length; o++){
                if(this.defaultValueId && this.options[o]['id'] !== this.defaultValueId) return;
                let __field:string = this.options[o][this.searchField].toString();
                let __value:string = this.optionString;
                let __option:any = { __value : __value , index : o };
                for(let c:number = 0 ; c < this.optionItems.length; c++)
                    __option.__value = __option.__value.replace('#' + c , this.options[o][this.optionItems[c]]);
                if(__option.__value.indexOf(this.__search) < 0) continue;
                this.newOptionItems.push(__option);
            }
        }
        this.defaultValueId = null;
        
    }

    public _refresh(){
        this.__getOptions__();
    }
}