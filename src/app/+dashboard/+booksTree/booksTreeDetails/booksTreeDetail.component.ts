import { Component, EventEmitter , OnInit , OnChanges , AfterViewInit } from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AutocompleteComponent } from './../../../@components';
import { GlobalProvider , LabProvider, RouterTransition } from './../../../@providers';
import { BooksTree } from './../../../@interfaces';
import { HttpRequestService } from './../../../@services';

declare let $:any;

@Component({
    selector : 'booksTree-details',
    templateUrl : './booksTreeDetails.html',
    providers : [
        GlobalProvider, 
        LabProvider, 
        HttpRequestService,
        AutocompleteComponent,
    ],
    animations : [RouterTransition('Form')],
    host : {'[@RouterTransition]': ''},
    inputs : ['isDynamic' , 'editable' , 'param' , 'editItem' , 'addEditData'],
    outputs : ['onAction']
})
export class BooksTreeDetailsComponent implements OnInit,AfterViewInit,OnChanges{
    
    public onAction = new EventEmitter();
    public isDynamic:boolean;
    public editable:boolean;
    public param:string;
    public addEditData:any;
    public editItem:BooksTree;
    private item:BooksTree;
    private submitted:boolean;
    private formObject:FormGroup;
    private errors:any;
    private __oldCode:string;
    // private __obj:any;
    private _page:string = 'booksTree/';
    private __code_start:string = "";
    private __booksTreeArray:Array<BooksTree> = [];
    constructor(
        private _router : Router,
        private _route : ActivatedRoute, 
        private _fb:FormBuilder,
        private _global:GlobalProvider,
        private _http:HttpRequestService,
        private _lab:LabProvider
        ){}

    ngAfterViewInit() {
        this._lab.__initForm__(this.formObject,this._global);
    }

    ngOnChanges(props:any):void{
        if(props.editItem && props.editItem.currentValue && ((props.editable && props.editable.currentValue === true) || this.editable)){
            this.item = this.editItem;
            for(let key in this.item){
                if(this.item[key] !== null && this.item[key] !== undefined && this.formObject.value.hasOwnProperty(key)){
                    this.formObject.controls[key].setValue(this.item[key]);
                }
            }
            this.__oldCode = this.item.code;
        }else if(((props.editable && props.editable.currentValue === false) || !this.editable) 
         || (props.param && props.param.currentValue === null)){
             this.__initFormsObject__();
        }
    }

    ngOnInit():any{
        this.__initFormsObject__();
        this.__init__();
    }

    OnSubmitForm(values:BooksTree,valid:boolean):void{
        this.submitted = true;
        if(false === valid) {
            this._lab.__setAlerts__('error' , 'الرجاء التأكد من الملاحظات الجانبية لكل حقل و تجنب الاخطاء لاتمام العملية');
            return;   
        }
        if(!values.father_code){
            this._lab.__setAlerts__('warn' , 'الرجاء اختيار الحساب الرئيسى');
            return;
        }
        if(!values.code){
            this._lab.__setAlerts__('warn' , 'الرجاء كتابة ملحق الكود للحساب');
            return;
        }
        let obj:any;
        this.formObject.controls['sequence'].setValue(parseInt(values.code))
        values.sequence = this.formObject.value.sequence;
        values.code = values.father_code + values.code;
        if(true === this.editable){
            obj = this._http.put(this._page + this.param, values);
        }else{
            obj = this._http.post(this._page, values);
        }
        this._lab.__setAlerts__();
        obj.subscribe(
            (item) => 
            {
                if(item.error !== null) { 
                    this._lab.__setErrors__(item.error);
                    return;
                }
                if(true === this.editable){
                    this.item = item.data;
                    for(let key in this.item){
                        if(this.item[key] !== null && this.item[key] !== undefined && this.formObject.value.hasOwnProperty(key)){
                            this.formObject.controls[key].setValue(this.item[key]);
                        }
                    }
                    this.onAction.emit({
                        action : 'EDIT',
                        code : this.__oldCode,
                        item : this.item
                    });
                    for(let i=0; i < this.__booksTreeArray.length; i++){
                        if(this.item.id === this.__booksTreeArray[i].id){
                            this.__booksTreeArray[i] = item.data;
                            break;
                        }
                    }
                }else{
                    this.onAction.emit({
                        action : 'ADD',
                        item : item.data
                    });
                    this.__booksTreeArray.push(item.data);
                    this.__initFormsObject__();
                }
                this.submitted = false;
                this._lab.__setAlerts__('success','تمت عملية حفظ البيانات بنجاح');
            },
            (error) => {
                this.formObject.controls['id'].setValue(2114+  Math.floor(10000 * Math.random()));
                this.onAction.emit({
                    action : 'ADD',
                    item : this.formObject.value
                }); 
                this._lab.__setErrors__(error);
            },
            ()=> {
            }
        );
    }

    public validateControl(name:string , parent:string = null):boolean{
        let __parent:any;
        if(parent)
            __parent = this.formObject.controls[parent];
        else
            __parent = this.formObject;
        return (!__parent.controls[name].valid && (!__parent.controls[name].pristine || this.submitted));
    }

    public onSelectItem($event:any):void{
        if(!$event || !$event.target || !$event.target.name || $event.target.name !== 'father_code') return;
        for(let i=0; i < this.__booksTreeArray.length; i++){
            if(this.__booksTreeArray[i].code === $event.target.value){
                this.formObject.controls['depth']['setValue'](this.__booksTreeArray[i].depth + 1);
                this.formObject.controls['father']['setValue'](this.__booksTreeArray[i].name_ar);
                this.formObject.controls['father_code']['setValue'](this.__booksTreeArray[i].code);

                this.formObject.controls['root']['setValue'](this.__booksTreeArray[i].root);
                this.formObject.controls['root_code']['setValue'](this.__booksTreeArray[i].root_code);
                this.__code_start = this.__booksTreeArray[i].code;
                break;
            }
        }
    }

    public onAddSelectItem($event:any):void{
       return;
    }

    private __init__():void{
        this._lab.__setGlobal__(this._global);
        this.__initShortCut__();
        this.__getBooksTree__();
    }

    private __initFormsObject__():void{
        let nameRegex:RegExp = this._global.config["nameRegex"];
        let intRegex:RegExp = this._global.config["intRegex"];
        let floatRegex:RegExp = this._global.config["floatRegex"];
        let noteRegex:RegExp = this._global.config["noteRegex"];
        this.formObject = this._fb.group({
            id                 : [ 0 ],
            name               : ['' , [ Validators.required , Validators.pattern(nameRegex)]],
            name_ar            : ['' , [ Validators.pattern(nameRegex)]],
            code               : ['1' , Validators.pattern(intRegex)],
            sequence           : [ 1 ],
            status             : ['' , Validators.pattern(nameRegex)],
            root               : ['' , Validators.pattern(nameRegex)],
            root_code          : ['1' , Validators.pattern(intRegex)],
            father             : ['' , Validators.pattern(nameRegex)],
            father_code        : ['1', Validators.pattern(intRegex)],
            depth              : [ 1 , Validators.pattern(intRegex)],
            profit             : [ 0 , Validators.pattern(floatRegex)],
            debt               : [ 0 , Validators.pattern(floatRegex)],
            description        : [ '', Validators.pattern(noteRegex)],
        });
        this.__oldCode = null;
        if(this.addEditData && this.addEditData.parent){
            let __parent:BooksTree = <BooksTree>this.addEditData.parent;
            this.formObject.controls['father_code'].setValue(__parent.id);
            this.formObject.controls['father'].setValue(__parent.name);
            if(__parent.depth > 0){
                this.formObject.controls['root_code'].setValue(__parent.root_code);
                this.formObject.controls['root'].setValue(__parent.root);
            }else{
                this.formObject.controls['root_code'].setValue(__parent.code);
                this.formObject.controls['root'].setValue(__parent.name);
            }
        }
        if(this.addEditData && typeof(this.addEditData.sequence) === 'number'){
            this.formObject.controls['sequence'].setValue(this.addEditData.sequence);
            this.formObject.controls['code'].setValue(this.addEditData.sequence.toString());
        }else{
        }
    }

    private __getBooksTree__():void{
        this._lab.__getBooksTree__(this , '__booksTreeArray' , () => {
            if(this.__booksTreeArray.length === 0 || (this.param || this.editable)) return;
            this.formObject.controls['root'].setValue(this.__booksTreeArray[0].root);
            this.formObject.controls['root_code'].setValue(this.__booksTreeArray[0].root_code);
            this.formObject.controls['father'].setValue(this.__booksTreeArray[0].father);
            this.formObject.controls['father_code'].setValue(this.__booksTreeArray[0].father_code);
            this.formObject.controls['depth'].setValue(this.__booksTreeArray[0].depth + 1);
            this.__code_start = this.__booksTreeArray[0].code;
        });
    }

    private __initShortCut__():any{
        this._lab.__setShortCuts__(this);
    }
}