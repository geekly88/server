import { Component, EventEmitter , OnInit , OnChanges , AfterViewInit } from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AutocompleteComponent } from './../../../@components';
import { GlobalProvider , LabProvider, RouterTransition } from './../../../@providers';
import { Types } from './../../../@interfaces';
import { HttpRequestService } from './../../../@services';

declare let $:any;

@Component({
    selector : 'types-details',
    templateUrl : './typesDetails.html',
    providers : [
        GlobalProvider, 
        LabProvider, 
        HttpRequestService,
        AutocompleteComponent,
    ],
    animations : [RouterTransition('Form')],
    host : {'[@RouterTransition]': ''},
    inputs : ['isDynamic' , 'editable' , 'param' , 'editItem'],
    outputs : ['onAction']
})
export class TypesDetailsComponent implements OnInit,AfterViewInit,OnChanges{
    
    public onAction = new EventEmitter();
    public isDynamic:boolean;
    public editable:boolean;
    public param:string;
    public editItem:Types;
    private item:Types;
    private submitted:boolean;
    private formObject:FormGroup;
    private __main_id:number= 0;
    private _page:string = 'types/';
    private __typesArray:Array<Types> = [];
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
            this.__main_id = this.formObject.value.hasOwnProperty('father_id')?this.formObject.value.father_id : 0;
         }else if(((props.editable && props.editable.currentValue === false) || !this.editable) 
         || (props.param && props.param.currentValue === null)){
             this.__initFormsObject__();
         }
    }

    ngOnInit():any{
        this.__initFormsObject__();
        this.__init__();
        window['me'] = this;
    }

    OnSubmitForm(values:Types,valid:boolean):void{
        this.submitted = true;
        if(false === valid) {
            this._lab.__setAlerts__('error' , 'الرجاء التأكد من الملاحظات الجانبية لكل حقل و تجنب الاخطاء لاتمام العملية');
            return;   
        }
        
        let obj:any;
        if(true === this.editable){
            let __url:string = this._page + this.param;
            this.formObject.controls['index'].setValue(this.formObject.value['ids_chain'].length);
            obj = this._http.put(__url, values);
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
                        item : this.item
                    });
                    for(let i=0; i < this.__typesArray.length; i++){
                        if(this.item.id === this.__typesArray[i].id){
                            this.__typesArray[i] = item.data;
                            break;
                        }
                    }
                }else{
                    this.onAction.emit({
                        action : 'ADD',
                        item : item.data
                    });
                    this.__typesArray.push(item.data);
                    this.__initFormsObject__();
                }
                this.submitted = false;
                this._lab.__setAlerts__('success','تمت عملية حفظ البيانات بنجاح');
            },
            (error) => { 
                this._lab.__setErrors__(error);
            },
            ()=> {
            }
        );
    }

    public validateControl(name:string):boolean{
        return (!this.formObject.controls[name].valid && (!this.formObject.controls[name].pristine || this.submitted));
    }

    public onSelectItem($event:any):void{
        if(!$event || !$event.target || $event.target.name !== 'father_id') return;
        for(let i=0; i < this.__typesArray.length; i++){
            if(this.__typesArray[i].id.toString() === $event.target.value.toString()){
                this.formObject.controls['father_id']['setValue'](this.__typesArray[i].id);
                this.formObject.controls['father']['setValue'](this.__typesArray[i].name);
                this.formObject.controls['ids_chain'].setValue(this.__typesArray[i].ids_chain);
                this.formObject.controls['main_id'].setValue(this.__typesArray[i].main_id);
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
        this.__getTypes__();
    }

    private __initFormsObject__():void{
        let nameRegex:RegExp = this._global.config["nameRegex"];
        let intRegex:RegExp = this._global.config["intRegex"];
        let floatRegex:RegExp = this._global.config["floatRegex"];
        this.formObject = this._fb.group({
            id                 : [ 0 , Validators.pattern(intRegex)],
            name               : ['' , [ Validators.required , Validators.pattern(nameRegex)]],
            father             : ['' , Validators.pattern(nameRegex)],
            father_id          : [ 0 , Validators.pattern(intRegex)],
            main_id            : [ 0 , Validators.pattern(intRegex)],
            degree             : [ 1 , Validators.pattern(intRegex)], // child will have 2 ...3
            child_quantity     : [ 1 , Validators.pattern(floatRegex)],
            ids_chain          : [ [] ],
            index              : [ 0 ],
        });
    }

    private __getTypes__():void{
        this._http.get('types').subscribe(
            (items) => {
                if(!items.error && items.data){
                    this.__typesArray = items.data;
                }else{
                    this.__typesArray = [];
                }
            },(error) => {
                this.__typesArray = [];
            }
        );
    }

    private __initShortCut__():any{
        this._lab.__setShortCuts__(this);
    }
}