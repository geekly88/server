import { Pipe , PipeTransform }  from '@angular/core';
import { GlobalProvider } from './../@providers';
import { DecimalPipe } from '@angular/common';

@Pipe({name : 'paymentType'})
export class MyPaymentTypesPipe implements PipeTransform{

    private __types:Object = {
        'CHEQUE' : 'شيك',
        'CASH' : 'كاش',
        'CREDIT' : 'بطافة ائتمانية'
    };
    constructor(
    ){}

    transform(value:string , args:string[]):any{
        let val:any = (!value || value === undefined) ? '' : value.toString();
        if(this.__types.hasOwnProperty(val)) return this.__types[val];
        return val;
    }
}