import { Pipe , PipeTransform }  from '@angular/core';
import { GlobalProvider } from './../@providers';
import { DecimalPipe } from '@angular/common';

@Pipe({name : 'src'})
export class ReportSrc implements PipeTransform{

    constructor(
        public _global:GlobalProvider
    ){}

    transform(value:string , args:string[]):any{
        if(!value) return '';
        let __val:string = value.toString();
        let __returner:string = '';
        switch(__val){
            case 'INV':
                __returner = 'فاتورة مبيعات';
                break;
            case 'ORD':
                __returner = 'بيع فورى';
                break;
            case 'PUR':
                __returner = 'فاتورة شرء';
                break;
            case 'COMP':
                __returner = '';
                break;
            case 'RET':
                __returner = '#اعادة';
                break;
            default :
                __returner= 'UNKNOWN';
                break;
        }
        return __returner;
    }
}