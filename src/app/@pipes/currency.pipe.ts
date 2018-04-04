import { Pipe , PipeTransform }  from '@angular/core';
import { GlobalProvider } from './../@providers';
import { DecimalPipe } from '@angular/common';

@Pipe({name : 'myCurrency'})
export class MyCurrencyPipe implements PipeTransform{

    constructor(
        public _global:GlobalProvider
    ){}

    transform(value:string , args:string[]):any{
        let settings:any = this._global.getToken()['settings'];
        let currency = settings['currency'] || '$';
        if(typeof(value) === 'string' && value.indexOf(currency) >= 0) return value;
        let val:any = (!value || value === undefined) ? 0 : value;
        let __args:string = settings['fraction_degree'] ? settings['fraction_degree'].toString() : '2';
        __args = '1.'+__args + '-'+__args;       
        let price = new DecimalPipe('number').transform(value , __args);
        price = price === 'null' ? '0' : price;
        if(settings['currency_position'] && settings['currency_position'] === 'before')
            return currency + ' ' + price;
        return price + ' ' + currency; 
    }
}