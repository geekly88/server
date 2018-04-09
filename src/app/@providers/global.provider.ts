import { Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getLang } from '../../assets/json/lang';
import { LabProvider } from './';

@Injectable()
export class GlobalProvider{

    public History:Array<string> = [];
    public config:Object;
    public lang:Object = getLang();
    public token:Object;
    public days:Array<string> = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    public months:Array<string> = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    constructor(
        private _router:Router,
        private _lab:LabProvider
    ){
        let __appPort:string = '3000';
        let __serverPort:string = '1337';
        this.config = {
            appPort    : __appPort,
            serverPort : __serverPort,
            basePath   : window.location.protocol + '//' + window.location.host + '/#/',
            panelPath  : window.location.protocol + '//' + window.location.host + '/#/dashboard/',
            serverPath : window.location.protocol + '//' + window.location.host.replace(__appPort , __serverPort) + '/',
            dashboard  : '/dashboard',
            report_perpage : 20,
            sales_report_perpage : 10,
            purchases_report_perpage : 15,
            alphanumdashed : /^[a-zA-Z0-9-_]+$/,
            nameRegex  : /^[a-zA-Z-_#\s\u0621-\u064A0-9ﻻ ]{2,50}$/,
            shortNameRegex  : /^[a-zA-Z-_\s\u0621-\u064A0-9ﻻ ]{1,50}$/,
            tagsRegex  : null,
            noteRegex  : /^[a-zA-Z\u0621-\u064A0-9ﻻ\n ]{2,150}$/,
            intRegex   : /^\d*\.?\d+$/,
            priceRegex : /^(-+)?\d{0,8}(\.\d{1,})?$/,
            floatRegex : /^(-+)?\d{0,}(\.\d{1,})?$/,
            emailRegex : /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            urlRegex   : /^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/,
            phoneRegex : /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,8}$/im,
            postRegex  : /^\d{5}(?:[-\s]\d{4})?$/,
            dateRegex  : null,
            socialRegex : /^(https?:\/\/){0,1}(www\.){0,1}(facebook|twitter|linkedin|plus.google)\.com/,
            startPrefix : '',
            endPrefix : '',
            bookCodes : [
                'purchases',
                'storage',
                'cash',
                'customers',
                'suppliers',
                'bad_debt',
                'products_accum',
                'sales',
                'income_taxes',
                'sales_returns',
                'sales_discounts',
                'sales_gifts',
                'sales_services_exp',
                'sales_loyalty',
                'purchaseOrders_taxes',
                'purchaseOrders_returns',
                'purchaseOrders_discounts',
                'beginning_inventory',
                'inventory_costs',
                'banks'
          ],
          payment_ways : {
              CASH : 'كاش',
              REGISTER : 'المسجل أو الكاشير الحالى',
              BANK : 'بتحويل بنكى',
              CREDIT : 'بواسطة بطاقة الائتمان',
              CHEQUE : 'بواسطة شيك'
          },
          gift_types : {
              discount_percent : 'تخفيض بنسبة مئوية',
              discount_money : 'تخفيض مالى',
              money: 'مبلغ مالى',
              points : 'نقاط'
          }
        }
    };

    ngOnInit():void{
        this.lang = getLang(this.getToken()['settings']['language']);
    };

    trans(key:string):any{
        if(this.lang.hasOwnProperty(key))
            return this.lang[key];
        return null;
    };

    getConfig():Object{
        var config = this.config;
        return config;
    };

    setConfigValue(key:string, value:any){
        this.config[key] = value;
    };

    getConfigValue(key:string){
        return this.config.hasOwnProperty(key) ? this.config[key] : null;
    };

    setToken(key:any,route:any[]=null,clear:boolean=true):void{
        if(clear) { this.clearToken();}
        localStorage.setItem('TokenKey', this.config['startPrefix']
        + JSON.stringify(key.data)
        + this.config['endPrefix']
        );
        this.token = key.data;
        if(route){
            this._router.navigate(route);
        }
    };

    getToken():Object{
        if(this.token && this.token.hasOwnProperty('settings')) return this.token;
        let token = localStorage.getItem('TokenKey');
        if(token){
            try {
                this.token = token;
                return JSON.parse(token);
            } catch (error) {
                this.token = null;
                return null;
            }
        }
        return null;
    };

    clearToken(route:any[] = null){
        localStorage.clear();
        if(route){
            this._router.navigate(route);
        }
    };

    setResource(resource:any , key:string):void{
        localStorage.setItem(key, this.config['startPrefix']
        + JSON.stringify(resource)
        + this.config['endPrefix']
        );
    };

    getResource(resource:string):Object{
        let __resource = localStorage.getItem(resource);
        if(__resource){
            try {
                return JSON.parse(__resource);
            } catch (error) {
                return null;
            }
        }
        return null;
    };

    removeResource(resource:string):void{
        localStorage.removeItem(resource);
    };

    parseQueryParams(page:any = null , __hadAndSign:boolean = false){
        let queryParams:any = this._router.routerState.root.queryParams['value'];
        if(page === null)
            if(queryParams.hasOwnProperty['page'])
                page = queryParams.page;
            else
                page = 1;
        let url = __hadAndSign  ? '&' : '?';
        url += 'page=' + page.toString();
        for(let param in queryParams){
            if(param != 'page')
                url += '&' + param + '=' + queryParams[param];
        };
        return url;
    }

    randomString(length:number = 8, chars:string = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
        let result:string = '';
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }

    public stripTags(text:string):string{
        return text;
    }

    public navigatePanel(__url:string , currenctPage:string = "" , currentQuery:string = ""):void{
        if(currenctPage && currentQuery) this.setCurrentPageQuery(currenctPage , currentQuery);
        // let __prev:any = this._lab.jQuery('.prev-page');
        // if(__prev) __prev.attr('data-page',this._router.url);
        this._router.navigate(['dashboard/' + __url]);
        this._lab.__removeStickModal__();
    }

    public navigate(__url:string):void{
        this._router.navigate([__url]);
    }

    public setCurrentPageQuery(currenctPage:string , currentQuery:string):void{
        this._lab.jQuery('.page-info').attr('data-'+currenctPage , currentQuery);
    }

    public getPastPageQuery(_page):string{
        let __ele:any = this._lab.jQuery('.page-info');
        if(!__ele) return "";
        return <string>__ele.attr('data-'+_page);
    }
};
