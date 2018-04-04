import { Pipe , PipeTransform }  from '@angular/core';
import { GlobalProvider } from './../@providers';
import { DecimalPipe } from '@angular/common';

@Pipe({name : 'timer'})
export class MyTimerPipe implements PipeTransform{

    constructor(){}

    transform(value:string , args:string[]):any{
        let val:any = (!value || value === undefined) ? 0 : value;
        let __hoursFloat:number = (val / 3600);
        let __hours:number = (Math.floor(__hoursFloat));
        let __minutesFloat:number = ((val - (__hours * 3600)) / 60);
        let __minutes:number = (Math.floor(__minutesFloat));
        let __seconds:number = val - ((__hours * 3600) + (__minutes * 60));
        // -------- Print Timer On Screen -----------------------------------\\
        let valStr:string = '';
        if(__hours > 0){
            valStr += __hours   <= 9 ? '0' + __hours + ':' : __hours + ':';
        }
        valStr += __minutes <= 9 ? '0' + __minutes + ':' : __minutes + ':';
        valStr += __seconds <= 9 ? '0' + __seconds : __seconds;
        return valStr;
    }
}