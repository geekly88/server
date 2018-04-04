import { Injectable, OnInit } from '@angular/core';
import { GlobalProvider } from './../@providers';

@Injectable()
export class AuthService implements OnInit{
    constructor(private _global: GlobalProvider){}
    ngOnInit():any{
        
    }

    isLoggedIn(data:any):boolean{
        let Token:any = this._global.getToken();
        return (Token && Token.settings && Token.account && Token.register);
    }
}