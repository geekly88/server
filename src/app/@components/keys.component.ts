import { Component,/* OnInit,*/ChangeDetectorRef, AfterViewInit, OnChanges , EventEmitter } from '@angular/core';
import { GlobalProvider , LabProvider } from './../@providers';

declare var $:any;

@Component({
    selector : 'keys-cmp',
    inputs : ['value','placeholder','dataRules','name','classes','id' ,'max'],
    outputs : ['onChangeKey'],
    template : `
    <input name="{{ name }}" id="{{ id }}" [formControl]="value"
    type="text" class="{{ classes }} {{ name }} keys" placeholder="{{ placeholder }}" [ngClass]="{'errors': __validatorControl()}"/>
`
})
export class KeysComponent implements AfterViewInit,OnChanges{

    public keyInput:string = '';
    private __keyArray:any = [];
    public value:any;
    public name:string;
    public placeholder:string;
    public dataRules:string;
    public classes:string;
    public id:string;
    public max:number = Infinity;
    private __valid:boolean = true;
    private __lastValue:string;
    public onChangeKey = new EventEmitter();
    constructor(
        private _global:GlobalProvider,
        private _lab:LabProvider
        ){};

    ngAfterViewInit():void {
        let self = this;
        let __class = $('input.keys.' + self.name);
        __class.on('change focus keyup',function($event){
            self.__setKeys__($event);
        });
        __class.val(this.value.value.toString());
        setTimeout(() => { 
            __class.change();    
        },1000);
    }

    ngOnChanges(props:any):void{ }
    
    onChange():void{
        this.onChangeKey.emit({
            name : this.name,
            item : this.__keyArray
        });
    }

    private __setKeys__($event = null):void{
        if(this.value.value === this.__lastValue) return;
        try{
            this.__keyArray = this.value.value.split(',');
        }catch(e){ return; }
        if(this.__keyArray.length === 0) return;
        // remove any key to start new one
        $('.keys_content.'+this.name).remove();
        let __div_content:any = $('<div class="keys_content '+ this.name +'">');
        let __self:KeysComponent = this;
        let length:number = 0;
        let valArray:Array<string> = [];
        for(let i:number = 0; i < this.__keyArray.length; i++){
            
            if(this.__keyArray[i] === '') continue;
            valArray.push(this.__keyArray[i]);
            let __key:any = $('<div class="key_item key_item'+i.toString()+'">');
            let __text = this._global.stripTags(this.__keyArray[i]);
            let __key_string:any = $('<span class="key">').append(__text);
            let __key_close:any = $('<span class="close" data-index="'+i.toString()+'">').append('x');
            __key.append(__key_string);
            __key.append(__key_close);
            __key_close.click(function(e){
                if(!__self || !__self.value || !__self.value.value || typeof __self.value.value !== 'string') return __key.remove();
                __self.value.setValue(__self.value.value.replace(__text , ''));
                __key.remove();
                __self.__setKeys__();
            });
            __div_content.append(__key);
        }
        this.__lastValue = valArray.join(',');
        let __value:string = this.value.value;
        try{
            if(__value.lastIndexOf(',') === (__value.length - 1) && __value.length > 1){
                this.value.setValue(this.__lastValue + ',');
            }else{
                this.value.setValue(this.__lastValue);
            }
        }catch(e){};
        this.__keyArray = valArray;
        if(__self.__keyArray.length > this.max){
            __self.value.setErrors({'length' : 'too much keys'});
            this.__valid = false;
            this._lab.__setAlerts__('warn' , 'الحد المسموح به لاضافة الكلمات فى هذا الحقل هو ' + this.max.toString() + ' كلمات');
        }else{
            this.__valid = true;
        }
        if($event && $event.target){
            let __parent = $($event.target).parent();
            $('.keys_content'+this.name).remove();
            __parent.append(__div_content);
        }
        this.onChange();
    }

    __validatorControl():boolean{
        return !this.__valid;
    }
}