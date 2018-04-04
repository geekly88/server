import { Component , OnInit , ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AutocompleteComponent ,
         AddNewComponent,
         ShowItemComponent
        } from './../../../@components';
import { GlobalProvider , LabProvider , RouterTransition } from './../../../@providers';
import { Buys , Banks } from './../../../@interfaces';
import { HttpRequestService } from './../../../@services';

@Component({
    selector : 'buys-list',
    templateUrl : './buysList.html',
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
export class BuysListComponent implements OnInit{

    private _controller:string = 'buys';
    private formObject:FormGroup;
    private errors:any;
    private _list:Buys[];
    private _showItem:Buys;
    private _showItemFields:any;
    private _addNewObj:any;
    private _isShowItem:boolean;
    private _searchObjs:Array<any>;
    private _filtersObjs:any;
    private _actionsObjs:any;
    private __count:number = 0;
    private __pages:number = 0;
    private __status:string;
    private __order:string = 'id';
    private __sort:string = 'DESC';
    private __explain:boolean = false;
    private __hideLists:boolean = true;
    // Payment Properties ============
    private __banksArray:Array<Banks> = [];
    private __chosenBankID:number;
    private __paymentItem:Buys;
    private __paid_arr_backup:Array<Object> = [];
    private __payAmount:any;
    private __showPaymentList:boolean = true;
    private __showBanksArray:boolean = false;
    private _modal:string = 'payment';

    constructor(
        private _global:GlobalProvider,
        private _http:HttpRequestService,
        private _lab:LabProvider,
        private _router:Router
    ){ }

    ngOnInit():any{
        this._lab.__setGlobal__(this._global);
        this._isShowItem = false;
        this.__setObject();
        let __url:string;
        let __prev:any = this._lab.jQuery('.prev-page');
        if(__prev){
            let __prevPage:string = __prev.attr('data-page');
            if(__prevPage){
                __prevPage = __prevPage.replace(this._global.config['dashboard']+'/' , '');
                if(__prevPage.indexOf(this._controller) === 0){
                    let __pastQuery = this._global.getPastPageQuery(this._controller);
                    if(__pastQuery){
                        __url = __pastQuery;
                    }
                }
            }
        }
        if(__url)this.__getItems(__url);
        else this.OnChangeStatus('ALL');
        this._lab.__initLists__();
    }

    onAction($event):void{
        switch($event.action){
            case 'DELETE':
                this.__deleteItems($event.item.id);
                break;
            case 'EDIT':
                let __url = 'buys/details/'+ $event.item.id.toString();
                this._global.navigatePanel(__url);
                break;
            case 'SHOW':
                this._global.navigatePanel(this._controller + '/shows/' + $event.item.id);
                break;
            case 'PAYMENT':
                this.__showBanksArray = false;
                this.__showPaymentList = true;
                this.__paymentItem = $event.item;
                this.__payAmount = this.__paymentItem.totals - this.__paymentItem.paid;
                this.__paid_arr_backup = this.__paymentItem.payments;
                this.__showModalDetails__("payment");
        }
    }

    OnChangeStatus(status:string):void{
        if(this.__status === status) return;
        this.__OnChangeStatus__(status);
    }

    __OnChangeStatus__(status:string):void{
        let __first:boolean = false;
        if(this.__status === '' && this.__hideLists) __first = true;
        this.__status = status;
        let __orderUrl:string = '';
        if(this.__order) __orderUrl = '&sortby=' + this.__order + '&sort=' + this.__sort;
        let __url = this._controller + '/?limit=' + this._global.getToken()['settings']['perpage'] + __orderUrl;
        if(this.__status === 'COMPLETED'){
            status = 'completed';
        }else if(this.__status === 'RETURNED'){
            status = 'returned';
        }else if(this.__status === 'PARKED'){
            status = 'parked';
        }else if(this.__status === 'DRAFTED'){
            status = 'drafted';
        }else if(this.__status === 'ALL'){
            status = '&contains=true';
        }else {
            return this.__getItems(__url,true , __first);
        }
        __url += '&search=status&status='+ status;
        this.__getItems(__url , true , __first);
    }

    OnOrderBy(order:string = null):void{
        if(this.__order === order)
            this.__sort = this.__sort === 'ASC' ? 'DESC' : 'ASC';
        else
            this.__order = order;
        this.__OnChangeStatus__(this.__status)
    }

    onPageChanging($event):void{
        let __queryParams:any = this._router.routerState.root.queryParams['value'];
        if(!__queryParams || !__queryParams['sort']){
            $event.queryParams += '&sortby=' + this.__order + '&sort=' + this.__sort;
        }
        this.__getItems(this._controller +'/'+ $event.queryParams , true);
    }

    onTopActionClick($event):void{
        this._lab.__onTopActionClick__($event , this);
    }

    onRefresh($event):void{
        this.__getItems();
    }

    onAddNewClick($event):void{
        this._global.navigatePanel('buys/details');
    }

    private __setObject():void {
        this._searchObjs = [
            { key : 'number' , value : 'رقم الفاتورة' },
            { key : 'customer' , value : 'اسم الزبون' },
            { key : 'employee' , value : 'اسم المندوب' },
            { key : 'count' , value : 'عدد الطلبات' },
        ];
        this._actionsObjs = {
            actions : [
                { icon : 'money' , tooltip : 'عملية الدفع' , __class : 'payment' }
            ]
        };
    }

    private __getItems(__url:string = null , change:boolean = false , __first:boolean = false) {
        if(!__url && !change) __url = this._controller + '/' + this._global.parseQueryParams() +'&limit=' + this._global.getToken()['settings']['perpage'];
        this._global.setCurrentPageQuery(this._controller , __url);
        this._http.get(__url).subscribe(
            (list)=>{
                if(list.error !== null){
                    this.errors = list.error;
                    this._list = [];
                    this.__count = 0;
                    this.__pages = list.pages ? list.pages : 0;
                    this._lab.__setErrors__(this.errors);
                    return;
                }
                this._list = list.data;
                this.__count = list.count ? list.count : 0;
                this.__pages = list.pages ? list.pages : 0;
                if(this.__count >= 1){
                    this._showItem = this._list[0];
                    this.__hideLists = false;
                }else{
                    this._showItem = <Buys>new Object();
                    if(__first && this.__hideLists) this.__hideLists = true;
                }
            },
            (error) => {
                this.errors = error;
                this.__count = 0;
                this.__pages = 0;
                this._list = [];
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
                if(!(response.data instanceof Array))
                    this._lab.__setAlerts__('success' , 'تمت عملية حذف الفاتورة ' + response.data.number);
                else
                    this._lab.__setAlerts__('success' , 'تمت عملية حذف الفواتير المحددة');
            },
            (error) => {
                this._lab.__setErrors__(error);
            },
            () => {
                this.__getItems();
                // After Delete Items(s)
            }
        );
    }

    /**
    * ====================================== START PAYMENT METHODS && HELPRS ================================
    **/
    __getBanks__():void{
        this._http.get('banks/?page=1&limit=1000000').subscribe(
            (response) => {
                if(response.error !== null || !response.data) return;
                    this.__banksArray = response.data;
            },(error) => {
            }
        );
    }

    __showModalDetails__(modal:string = 'sells' , __opt = {}){
        this._modal = modal;
        this._lab.__modal('#show-sell-details-modal', __opt);
    }

    onCompletePaymentUpdate(type:string):void{
        if(type === 'CHOOSEBANK'){
            this.__showBanksArray = true;
            if(!this.__banksArray || this.__banksArray.length === 0) this.__getBanks__();
            return;
        }else{
            this.__showBanksArray = false;
        }

        this.__payAmountMethod__(type);
        let __values:Object = {
            payments : this.__paymentItem.payments,
            paid     : this.__paymentItem.paid
        };

        if(type !== "COMPLETE" || (__values['payments'].length === 0 && this.__paid_arr_backup.length === 0)) return;
        this._http.put(this._controller + '/updatePayments/' + this.__paymentItem.id , __values).subscribe(
            (items) => {
                if(items.error !== null && (!items.data || items.data.length === 0)){
                    let __paid_arr:Array<any> = [ ];
                    this._lab.__setErrors__(items.error);
                    this.__resetPayment();
                    return;
                }
                this._lab.__setAlerts__('success' , 'لقد تم تعديل الدفع للطلب رقم  #' + this.__paymentItem.number);
            },
            (error) => {
                this._lab.__setAlerts__('error' , 'حدث خطأ ... الرجاء اعادة عملية الدفع');
                this.__paymentItem.payments = this.__paid_arr_backup;
                this.__resetPayment();
            },() => {
            }
        );
    }

    __payAmountMethod__(type:string = ''):boolean{
        //=================== PAYMENT ===============================\\
        //=================== PAYMENT ===============================\\
        //=================== PAYMENT ===============================\\
        //=================== PAYMENT ===============================\\
        if(type === 'COMPLETE') return true;
        let __paid_arr:Array<any> = [ ];
        let __paid:number = 0;
        let __total:number = this.__paymentItem.totals;
        if(type === '') return true;

        this.__paymentItem.payments.forEach((payment,index) => {
            __paid_arr.push(payment);
            __paid += parseFloat(payment.paid);
        });

        let __payAmount:number = parseFloat(this.__payAmount);

        if(isNaN(__payAmount)){
            this._lab.__setAlerts__('warn' , 'لم يتم اضافة أى مبلغ مالى لحفظ عملية الدفع');
            return false;
        }

        if(__payAmount > (__total - this.__paymentItem.paid)){
            this._lab.__setAlerts__('warn' , 'لايمكن دفع أكثر من المبلغ المطلوب');
            return false;
        }


        if(__paid < 0 ){
            this._lab.__setAlerts__('warn' , 'لايمكن ارجاع أكثر من المبلغ المستلم من قبل الزبون');
            return false;
        }

        if(this.__payAmount !== 0){
            let __paid_item:Object ={
                from : 'Buys',
                by   : type,
                paid : __payAmount,
                debt : (__total - (__payAmount + this.__paymentItem.paid)),
                date : Date.now()
            };

            if(type === 'BANK'){
                if(!this.__chosenBankID){
                    this._lab.__setAlerts__('error' , 'يجب اختيار المصرف المستلم للمبلغ');
                    return false;
                }
                this.__chosenBankID = parseInt(this.__chosenBankID.toString());
                for(let i=0; i < this.__banksArray.length; i++){
                    if(this.__banksArray[i].id !== this.__chosenBankID) continue;
                    __paid_item['bank'] = this.__banksArray[i].name;
                    __paid_item['account_number'] = this.__banksArray[i].number;
                }
                this._lab.jQuery('#show-sell-details-modal button.close').click();
            }
            __paid_arr.push(__paid_item);
            this.__paymentItem.payments= __paid_arr;
            this.__paymentItem.paid= (__paid + __payAmount);
            this.__payAmount = this.__paymentItem.totals - this.__paymentItem.paid;

            if(__paid_item['debt'] !== 0)
                this._lab.__setAlerts__('success' , 'تم اضافة المبلغ ' + __payAmount + ' لعمليات الدفع');
        }
        return this.__payAmount === 0;
    }

    __resetPayment():void{
        let __paid:number = 0;
        this.__paid_arr_backup.forEach((payment , index) => {
            __paid += payment['paid'];
        });
        this.__paymentItem.paid = __paid;
        this.__paymentItem.payments = this.__paid_arr_backup;
        this.__payAmount = this.__paymentItem.totals - __paid;
    }

    OnRemovePayment(__index:number):void{
        let __paymenstTemp:Array<any> = [];
        let __paid = this.__paymentItem.paid;
        this.__paymentItem.payments.forEach((__payment , index) => {
            if(index === __index){
                __paid -= __payment.paid;
                return;
            }
            __paymenstTemp.push(__payment);
        });
        this.__paymentItem.payments = __paymenstTemp;
        this.__paymentItem.paid = __paid;
        this.__payAmount = this.__paymentItem.totals - __paid;
    }
    /**
    * ====================================== END PAYMENT METHODS && HELPRS ================================
    **/
}
