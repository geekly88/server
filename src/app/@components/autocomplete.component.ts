import { Component , OnInit , AfterViewInit , OnChanges , EventEmitter , Input , Output } from '@angular/core';
import { HttpRequestService } from './../@services';
import { FormControl } from '@angular/forms';

declare var $;

@Component({
    selector : 'autocomplete',
    inputs : [
        'field',
        'template',
        'control',
        'search',
        'searchFields',
        'url',
        'isLocal',
        'class',
        'appendTosearch',
        'dataToSearchFrom'
    ],
    outputs : ['onsetvalue'],
    template : `
        <div class="col-md-12 autocomplete-cmp {{class}}" *ngIf="!hide && (!_items || _items.length === 0)">
            <p class="loading" (click)="OnClickMe(null)">لايوجد نتائج للبحث<span class="float_opp">اخفاء</span></p>
        </div>
        <div class="col-md-12 autocomplete-cmp {{class}}" *ngIf="!hide && (_items && _items.length > 0)">
            <p *ngFor='let item of _items' (click)="OnClickMe(item)"><a [innerHTML]="item['template']"></a></p>
        </div>
    `
})
export class AutocompleteComponent implements OnInit,OnChanges,AfterViewInit{

    public onsetvalue = new EventEmitter();
    public field       :any;
    public template    :string;
    public searchFields:any;
    public control     :FormControl;
    public search      :any;
    public appendTosearch : Array<string> = [];
    public dataToSearchFrom:Array<any> = [];

    public url      :string;
    public isLocal  :boolean = false;
    public hide     :boolean = true;
    public class    :string = ''
    
    private __clicked:boolean;
    private __clickedSearch:string;
    private __url:string;
    private _items  :any;

    constructor(private _http:HttpRequestService){}

    ngOnInit():void{ 
        if(typeof(this.field) === 'string') this.field = [this.field];
    }

    ngAfterViewInit():void{
        this.__clearData__();
    }
    
    ngOnChanges(props: any):void {
        if(!props.hasOwnProperty('search') || !props.search.hasOwnProperty('currentValue') || !props.search.currentValue) return;
        if(props.search.currentValue.length === 0){
            this.__clearData__();
            return;
        }
        if(props.search.currentValue === this.__clickedSearch){
            this.__clicked = !this.__clicked;
            this.__clickedSearch = null;
            return;
        }
        if((props.search.previousValue) && (props.search.currentValue === props.search.previousValue))
            return;

        

        if(!this.isLocal && this.url){
            if(this.url.indexOf('search=') >= 0){
                let __searchArray = this.url.split('search=');
                if(__searchArray.length > 1){
                    let __secondArray = __searchArray[1].split('-');

                }
            }
            let i:number = 0;
            let __search = '&search=';
            let __url:string = '';
            if(this.searchFields){
                while(i < this.searchFields.length){
                    __url += '&' + this.searchFields[i] + '=' + this.search;
                    __search += (i === (this.searchFields.length - 1)) ? this.searchFields[i]: this.searchFields[i] + '-' ;
                    i++;
                }
                if(this.appendTosearch && this.appendTosearch.length === 2){
                    __search += __search ? '-' + this.appendTosearch[0] : this.appendTosearch[0];
                    __url    += '&' + this.appendTosearch[1];
                }
                if(this.url.indexOf('?') >= 0)
                    this.__url = this.url + __search + __url;
                else
                    this.__url = this.url + '?' + __search + __url;
            }
        }else{
            if((props.dataToSearchFrom && props.dataToSearchFrom.currentValue)){
                // console.log(props.dataToSearchFrom);
                this.__getData__();
            }
        }
        this.hide = false;
        this.__getData__();
        this.__showAndHide__();
    }

    OnClickMe(item:any = null):void{
        if(!item){
            this.__clearData__();
            return;
        }
        if(item.template) delete item.template;
        if(item){
            this.__clicked = true;
            this.__clickedSearch = item[this.searchFields[0]];
            this.onsetvalue.emit({
                item : item,
                class : this.class
            });
        }
        this.__clearData__();
    }

    private __getData__():void{
        if(this.isLocal){
            if(!this.dataToSearchFrom){
                return;
            }
            let items:Array<any> = [];
            for(let i:number=0; i < this.dataToSearchFrom.length; i++) {
                for(let j:number=0; j < this.field.length ; j++){
                    if(this.dataToSearchFrom[i].hasOwnProperty(this.field[j])){
                        let reg:RegExp = new RegExp(this.search);
                        if(reg.test(this.dataToSearchFrom[i][this.field[j]])){
                            items.push(this.dataToSearchFrom[i]);
                            break;
                        }
                    }
                }
                if(items.length === 6) break;
            }
            this._items = [];
            this.__prepareTemplateToPrint(items);
            return;
        }

        this._http.get(this.__url + '&page=1&limit=6').subscribe(
            (items) => 
            {
                if(items.errors){
                    this.__setErrors__(items.errors);
                    return;
                }
                if(items.count === 1){
                    for(let i:number=0; i < this.field.length ; i++){
                        if(items.data[0][this.field[i]] 
                        && items.data[0][this.field[i]].toString() === this.search.toString()
                        ){
                            this.OnClickMe(items.data[0]);
                            return;
                        }
                    }
                }
                this._items = [];
                if(items.data && items.count > 0){
                    this.__prepareTemplateToPrint(items.data);
                }
            },
            (response) => { this.__setErrors__(response); },
            () => {}
        );
    }

    private __prepareTemplateToPrint(items:Array<any>):void{
        items.forEach((__item , index)=>{
            let __template = this.template;
            for(let i:number=0; i < this.field.length ; i++){
                __template = __template.replace('#' + this.field[i] , __item[this.field[i]]);
            }
            __item['template'] = __template;
            this._items.push(__item);
        });
    }

    private __setErrors__(errors:any):void{
    }
    private __clearData__():void{
        this.search = '';
        this._items = [];
        this.hide = true;
        if(!this.searchFields) this.searchFields = [];
    }

    private __showAndHide__():void{
        let __input = $('input[name="' + this.class + '"]');
        let self = this;
        __input.on('focusout',function(e){
            setTimeout(function(){
                self.hide = true;
            },300);
        });
    }
}