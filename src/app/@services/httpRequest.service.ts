import { Injectable , OnInit } from '@angular/core';
import { Http , Headers } from '@angular/http';
import { GlobalProvider , LabProvider } from './../@providers';
import 'rxjs/add/operator/map';

@Injectable()
export class HttpRequestService{
    private _local:boolean;
    private _authorize:boolean;
    private _URL:string;
    constructor(
        private _http: Http,
        private _global:GlobalProvider,
        private _lab:LabProvider    
    ){
        this.setLocal(true);
        this.setAuthorize(true);
        this._URL = this._global.config['serverPath'];
    }
    ngOnInit():any { }

    get(url:string , options:Object = null){
        this.__saveLastGetRequest__(url);
        return this._http.get(this.__parseUrl(url) , options).
        map((response) => {
            return response.json();
        });
    };

    post(url:string , body:Object , headers:Headers = null){
        return this._http.post(this.__parseUrl(url),body,headers).
        map((response) => {
            return response.json()
        });
    };

    put(url:string , body:Object , headers:Headers = null){
        return this._http.put(this.__parseUrl(url),body,headers).
        map((response) => {
            return response.json()
        });
    };

    delete(url:string, options:Object = null){
        return this._http.delete(this.__parseUrl(url), options).
        map((response) => {
            return response.json()
        });
    };

    public setLocal(local:boolean):void{
        this._local = local;
    }

    public getLocal():boolean{
        return this._local;
    }

    public setAuthorize(auth:boolean):void{
        this._authorize = auth;
    }

    public getAuthorize():boolean{
        return this._authorize;
    }

    private __saveLastGetRequest__(__URL:string):void{
        
        let __modal:any = this._lab.jQuery('#show-download-modal');
        __modal.data('lstget' , __URL);
    }

    private __getToken():string{
        let token:any = this._global.getToken();
        if(token !== null && token.hasOwnProperty('token')){
            return token.token;
        }
        return '';
    }

    private __parseUrl(_url:string):string{
        let token = this.__getToken();
        if(this.getLocal()) { _url = this._URL + _url; }
        if(token === '') return _url;
        if(_url.indexOf('?') < 1)
            _url += '?';
        _url += '&token=' + this.__getToken();
        return _url;    
    }
}