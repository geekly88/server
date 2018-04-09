import { Component /*, Injector , ChangeDetectorRef */, OnInit , AfterViewInit } from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GlobalProvider , LabProvider, RouterTransition } from './../../../@providers';
import { Branches } from './../../../@interfaces';
import { HttpRequestService } from './../../../@services';

declare let $:any;
let time = new Date();

@Component({
    selector : 'branches-details',
    templateUrl : './branchesDetails.html',
    providers : [
        GlobalProvider,
        LabProvider,
        HttpRequestService,
    ],
    animations : [RouterTransition('Form')],
    host : {'[@RouterTransition]': ''},
    inputs : ['isDynamic']
})
export class BranchesDetailsComponent implements OnInit,AfterViewInit{

    public isDynamic:boolean;
    private _editable:boolean;
    private submitted:boolean;
    private formObject:FormGroup;
    private item:any;
    private errors:any;
    private _page:string = 'branches/';
    private __param:string;
    private __currentBranches:Branches[];
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

    ngOnInit():any{
        this.__initFormsObject__();
        this.__init__();
    }

    OnSubmitForm(values:any,valid:boolean):void{
        this.submitted = true;
        if(false === valid) {
            this._lab.__setAlerts__('error' , 'الرجاء التأكد من الملاحظات الجانبية لكل حقل و تجنب الاخطاء لاتمام العملية');
            return;
        }
        this.errors = null;
        let obj:any;
        if(true === this._editable){
            obj = this._http.put(this._page + this.__param, values);
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
                if(true === this._editable){
                    this.item = item.data;
                    for(let key in this.item){
                        if(this.item[key] !== null && this.item[key] !== undefined && this.formObject.value.hasOwnProperty(key)){
                            this.formObject.controls[key].setValue(this.item[key]);
                        }
                    }

                    if(!this.__getSyncBranches()) return;
                    for(let i:number = 0; i < this.__currentBranches.length; i++){
                        if(this.__currentBranches[i].id === this.item.id){
                            this.__currentBranches[i] = this.item;
                            return this._global.setResource(this.__currentBranches , 'branches');
                        }
                    }
                }else{
                    this.__initFormsObject__();
                    this.submitted = false;
                }
                this._lab.__setAlerts__('success','تمت عملية حفظ البيانات بنجاح');
            },
            (error) => {
                this.errors = error
                this._lab.__setErrors__(error);
            },
            ()=> {
            }
        );
    }

    __getSyncBranches():any{
        this.__currentBranches = <Array<Branches>>this._global.getResource('branches');
        if(!this.__currentBranches) {
            this._lab.__setAlerts__('warn' , 'تم تحويلك الى صفحة تسجيل الدخول لوجود خطأ');
            this._lab.__setLogout__(this._http);
            return false;
        };
        return true;
    }

    public validateControl(name:string , error:boolean=false):boolean{
        return (!this.formObject.controls[name].valid && (!this.formObject.controls[name].pristine || this.submitted));
    }

    __init__():void{
        this.__getRouterParamsData__();
        this.__initShortCut__();
    }

    __initFormsObject__():void{
        let nameRegex:RegExp = this._global.config["nameRegex"];
        let noteRegex:RegExp = this._global.config["noteRegex"];
        let emailRegex:RegExp = this._global.config["emailRegex"];
        let socialRegex:RegExp = this._global.config["socialRegex"];
        let intRegex:RegExp = this._global.config["intRegex"];
        let priceRegex:RegExp = this._global.config["priceRegex"];
        let phoneRegex:RegExp = this._global.config["phoneRegex"];
        let postRegex:RegExp = this._global.config["postRegex"];
        let siteRegex:RegExp = this._global.config["siteRegex"];
        this.formObject = this._fb.group({
            name        : ['' , [Validators.required, Validators.pattern(nameRegex)]],
            number      : [ 1 , Validators.pattern(intRegex)],
            email       : ['' , Validators.pattern(emailRegex)],
            phone       : ['' , Validators.pattern(phoneRegex)],
            mobile      : ['' , Validators.pattern(phoneRegex)],
            status      : [''],
            is_main     : [false],
            // img         : [''],

            address1    : ['' , Validators.pattern(nameRegex)],
            address2    : ['' , Validators.pattern(nameRegex)],
            state       : ['' , Validators.pattern(nameRegex)],
            city        : ['' , Validators.pattern(nameRegex)],
            country     : ['' , Validators.pattern(nameRegex)],
            postcode    : ['' , Validators.pattern(postRegex)],


            createdAt   : [  , Validators.nullValidator ],
            updatedAt   : [  , Validators.nullValidator ],

            description : ['' , Validators.pattern(noteRegex)]
        });
        this.__getNewCode__();
    }

    __getRouterParamsData__():void{
        this._lab.__setGlobal__(this._global);
        if(!this.isDynamic && this._route.params['value'] && this._route.params['value']['id'] &&
            this._global.config['intRegex'].test(this._route.params['value']['id']) ){
            this.__param = this._route.params['value']['id'];
            this._http.get(this._page + this.__param).subscribe(
                (item) => {
                    if(item.error !== null) {
                        this._router.navigate([this._global.config['dashboard'] + '/branches']);
                        return;
                    }
                    this.item = item.data;
                    for(let key in this.item){
                        if(this.item[key] !== null && this.item[key] !== undefined && this.formObject.value.hasOwnProperty(key)){
                            this.formObject.controls[key].setValue(this.item[key]);
                        }
                    }
                    this._editable = true;
                },
                (response) => {
                    this._global.navigatePanel(this._page);
                },
                () => {}
            );
        }else{
            this.__getNewCode__();
        }
    }

    __getNewCode__():void{
        this._http.get(this._page + 'next').subscribe(
            (item) => {
                if(item.data && item.data.number){
                    this.formObject.controls['number'].setValue(item.data.number);
                }
            },(error) => {
            }
        );
    }

    __initShortCut__():any{
        this._lab.__setShortCuts__(this);
    }

}
