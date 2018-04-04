import { Component, OnChanges, OnInit, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { Products } from './../@interfaces';
import { GlobalProvider } from './../@providers';
import { HttpRequestService } from './../@services';

@Component({
    selector : 'pro-details',
    inputs : [
        'product'
    ],
    outputs : ['onAction'],
    template : `
<div class="col-md-12 no-p">
    <div class="col-md-12 no-p">
        <div class="col-md-12 product_details" *ngIf="__mainItem">  
            <div class="center">
                <p class="title">{{ __mainItem.name }}</p>
                <p class="shade" *ngIf="__mainItem.is_variaty">{{ __mainItem.sku }}</p>
                <a (click)="__showDesc = !__showDesc">مشاهدة الملاحظة</a>
                <p class="desc" *ngIf="__showDesc">
                    {{ __mainItem.description }}
                </p>
            </div>
            <div class="price-det col-md-12 col-xs-12 col-sm-12 no-p pro-details">
                <div class="col-md-12 col-xs-12 col-sm-12 no-p">
                    <p class="price">{{ __mainItem.price | myCurrency }}</p>
                </div>
                <div class="col-md-12 col-xs-12 col-sm-12 no-p" *ngIf="__mainItem.is_multi_price">
                    <div class="det-item">
                        <p class="above">سعر البيع</p>
                        <p class="bottom">{{ __mainItem.price | myCurrency }}</p>
                    </div>
                    <div class="det-item">
                        <p class="above">نصف الجملة</p>
                        <p class="bottom">{{ __mainItem.price2 | myCurrency }}</p>
                    </div>
                    <div class="det-item">
                        <p class="above">سعر الجملة</p>
                        <p class="bottom">{{ __mainItem.price3 | myCurrency }}</p>
                    </div>
                    <div class="det-item">
                        <p class="above">جملة الجملة</p>
                        <p class="bottom">{{ __mainItem.price4 | myCurrency }}</p>
                    </div>
                    <div class="det-item">
                        <p class="above">سعر اضافى</p>
                        <p class="bottom">{{ __mainItem.price5 | myCurrency }}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-12 no-p pro-details">
                <div class="det-item" *ngIf="__mainItem.supplier && __mainItem.supplier !== ''">
                    <p class="above">المورد</p>
                    <p class="bottom">{{ __mainItem.supplier }}</p>
                </div>
                <div class="det-item" *ngIf="__mainItem.brand && __mainItem.brand !== ''">
                    <p class="above">الماركة</p>
                    <p class="bottom">{{ __mainItem.brand }}</p>
                </div>
                <div class="det-item" *ngIf="__mainItem.type && __mainItem.type !== ''">
                    <p class="above">الوحدة</p>
                    <p class="bottom">{{ __mainItem.type }}</p>
                </div>
                <div class="det-item" *ngIf="__mainItem.collection && __mainItem.collection !== ''">
                    <p class="above">المجموعة</p>
                    <p class="bottom">{{ __mainItem.collection }}</p>
                </div>
            </div>
            <div class="col-md-12 above-table">
                <p *ngIf="__mainItem.is_variaty">تنوع المنتج</p>
                <p *ngIf="!__mainItem.is_variaty">معلومات المنتج</p>
            </div>
            <div class="col-md-12 no-p">
                <table class="table">
                    <thead>
                        <tr>
                            <td *ngIf="__mainItem.is_variaty && __mainItem.option_one && __mainItem.option_one !== ''">
                                {{ __mainItem.option_one }}
                            </td>
                            <td *ngIf="__mainItem.is_variaty && __mainItem.option_two && __mainItem.option_two !== ''">
                                {{ __mainItem.option_two }}
                            </td>
                            <td *ngIf="__mainItem.is_variaty && __mainItem.option_three && __mainItem.option_three !== ''">
                                {{ __mainItem.option_three }}
                            </td>
                            <td>الكود</td>
                            <td>الكمية</td>
                            <td>التكلفة</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr >
                            <td *ngIf="__mainItem.is_variaty && __mainItem.option_one && __mainItem.option_one !== ''">
                                {{ __mainItem.variaty[0] }}
                            </td>
                            <td *ngIf="__mainItem.is_variaty && __mainItem.option_two && __mainItem.option_two !== ''">
                                {{ __mainItem.variaty[1] }}
                            </td>
                            <td *ngIf="__mainItem.is_variaty && __mainItem.option_three && __mainItem.option_three !== ''">
                                {{ __mainItem.variaty[2] }}
                            </td>
                            <td>{{ __mainItem.sku }}</td>
                            <td *ngIf="__mainItem.is_trackable">{{ __mainItem.stock }}<span *ngIf="__mainItem.type">/{{ __mainItem.type }}</span></td>
                            <td *ngIf="!__mainItem.is_trackable">غير محدودة</td>
                            <td>{{ __mainItem.cost | myCurrency }}</td>
                        </tr>
                    </tbody>
                </table>
                <div class="col-md-12 col-xs-12 col-sm-12 " *ngIf="__mainItem.has_expire_date">
                    <p class="h2 center" *ngIf="!__isExpired">صلاحية الصنف حتى {{ __mainItem.expire_date | date:'dd/MM/yyyy' }}</p>
                    <p class="h2 center" *ngIf="__isExpired">الصنف منتهى الصلاحية</p>
                </div>
            </div>
        </div>
    </div>
</div>
    ` 
})
export class ProDetailsComponent implements OnInit,OnChanges{

    public onAction = new EventEmitter();
    public product:Products;
    private __showDesc:boolean = false;
    private __list:Array<Products> = [];
    private __mainItem:Products;
    private __isExpired:boolean;
    constructor(
        private _http:HttpRequestService,
        private _router:Router,
        private _global:GlobalProvider
    ){}

    ngOnChanges(props:any):void{
        if(props.product && props.product.currentValue){
            this.__mainItem = this.product;
            this.__isExpired = false;
            if(this.__mainItem.has_expire_date){
                if(this.__mainItem.expire_date <= new Date()){
                    this.__isExpired = !this.__isExpired;
                }else
                {
                    // let __time:number = new Date().getTime();
                    // let __exTime = this.__mainItem.expire_date.getTime();
                    // let __diffrence = ((__time - __exTime) * 1000) / ;
                    // if()
                }
            }
            // this.__checkVariaties__();
        }
    }

    ngOnInit():void{

    }

    // private __checkVariaties__():void{
    //     if(this.product.variaty && this.product.variaty.length !== 0 && this.product.main_id > 0){
    //         this._http.get('products/?limit=100&search=main_id&main_id='+this.product.main_id).subscribe(
    //             (items) => {
            
    //                 if(items.error !== null){
    //                     return this.onAction.emit({
    //                         action : 'CANCEL',
    //                         item : items.error
    //                     });
    //                 }
    //                 this.__list = items.data;
    //                 if(items.count <= 1){
    //                     this.__mainItem = this.product;
    //                 }else{
    //                     this.__list.forEach((__pro)=>{
    //                         if(__pro.is_main && __pro.main_id === __pro.id){
    //                             this.__mainItem = __pro;
    //                         }
    //                     });
    //                 }
    //             },(error)=>{
    //                 this.onAction.emit({
    //                     action : 'CANCEL',
    //                     item : error
    //                 });
    //             },() => {}
    //         );
    //     }else{
    //         this.__mainItem = this.product;
    //         this.__list = [this.__mainItem];
    //     }
    // }
}