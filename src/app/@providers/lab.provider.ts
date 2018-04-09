import { Injectable , ChangeDetectorRef, isDevMode } from '@angular/core';
import { FormGroup , FormControl } from '@angular/forms';
import { GlobalProvider } from './';
import { getLang } from '../../assets/json/lang';
import { MyCurrencyPipe } from './../@pipes';
import { DatePipe } from '@angular/common';

declare let $:any;
declare let __ENV:any;
// declare let htmlToCanvas:any;

@Injectable()
export class LabProvider{

    private _formObject:FormGroup;
    private _action_bar:any;
    private _form:any;
    private _global:GlobalProvider;
    private _lang:any = getLang();
    private _top = $('.top-msg');
    private __pagesColors:Object;
    private __url:Array<string>;
    private __urlStr:string;
    private __isCSV:boolean = true;
    private __isXLS:boolean = true;
    private __isXLSX:boolean = true;
    constructor(
    ){
        let __self:LabProvider = this;
        $(document).ready(function(){
            setTimeout(function() {
                __self.resize();
                __self.invoiceResize();
                __self.resizeHeight();
            }, 1000);
            $(window).resize(function(){
                __self.resize();
                __self.invoiceResize();
                __self.resizeHeight();
            });
        });
        this.__initDashboardColors__();
    }

    public jQuery(ele):any{
        return $(ele);
    }

    __simulateBarcode(__ele:any , __code:string){
        let numbers:Array<number> = [1,2,3,4,5,6,7,8,9,0];
        for(let i = 0; i < __code.length; i++){
            let __which:number = numbers.indexOf(parseInt(__code[i])) + 48;
            var press = $.Event("keyup");
            press.ctrlKey = false;
            press.which = __which;
            press.keyCode = __which;
            $(__ele).val($(__ele).val() + __code[i]);
            $(__ele).trigger(press);
        }
    }

    __setLogout__(_http):void{
        _http.put('history/' , { logout_at : new Date() , is_logout : true }).subscribe(
            (response) => {
                this._global.clearToken(['/login']);
            },(error) => {
                this.__setErrors__(error);
            },() => {}
        );
    }

    __setLogin__(_http , values:Object):void{
        _http.post('history/' , values).subscribe(
            (response) => {
            },(error) => {
                this.__setErrors__(error);
            },() => {}
        );
    }

    __initDashboardColors__():void{
        this.__pagesColors = {
            // purchases : '#E08646',
            // sales : '#8BC34A',
            // invoices : '#A48CCA',
            // paids : '#DA5C87',
            // expenses : '#DA5C87',
            // employees : '#8080C1',
            // suppliers : '#6a6a6a',
            // customers : '#8BC34A',
        };
    }

    public __initLists__():void{
        // let __self:LabProvider = this;
        $(document).ready(function(){
            //--------------------------------------------------------
            var __parentCheckbox = $('input.parentcheckbox.option-input.checkbox');
            __parentCheckbox.change(function(e){
                let __checkboxes = $('.table input.checkbox.option-input.list-item');
                if(__checkboxes.length === 0) return;
                for(let __ch:number = 0; __ch < __checkboxes.length; __ch++){
                    $(__checkboxes[__ch]).prop('checked' , this.checked);
                }
            });
            setTimeout(function(){
                $('.table input.list-item.option-input.checkbox').change(function(e){
                    if(__parentCheckbox.prop('checked'))
                        __parentCheckbox.prop('checked',this.checked);
                });
            }, 500);
            $('.table thead tr td').click(function(e){
                let __tds = $('.table thead tr td');
                for(let i = 0; i < __tds.length ; i++){
                    let __td = $(__tds[i]);
                    if(!__td.hasClass('active')) __td.removeClass('rotateit');
                }
                let self = $(this);
                if(self.hasClass('active')){
                    if(self.hasClass('rotateit')){
                        self.removeClass('rotateit');
                    }else{
                        self.addClass('rotateit');
                    }
                }
            });
        });
    }

    public __prepareDateTimePicker__(__mode:string = 'datetime',__ele:string = '#datetime'):void{

        // $.fn.datetimepicker.CONSTS = {
        //     I18N: {
        //         en: {
        //             SDN: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        //             MN: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        //             DN: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        //             CALENDAR: "Calendar",
        //             CLEAR: "Clear",
        //             TODAY: "Today",
        //             OK: "OK",
        //             CURRENT: "Now",
        //             TIME: "Time"
        //         }
        //     },
        // };
        // console.log(__mode , __ele);
        // $(__ele).datetimepicker({
        //     // baseCls: "perfect-datetimepicker",
        //     viewMode: 'YMDHM',
        //     // firstDayOfWeek: 0,
        //     date: new Date(), //initial date
        //     // language: 'en', //I18N
        //     //date update event
        //     onDateUpdate: null,
        //     //clear button click event
        //     // onClear: null,
        //     //ok button click event
        //     // onOk: null,
        //     //close button click event
        //     // onClose: null,
        //     //today button click event
        //     // onToday: null
        // });
    }

    public __tooltip(selector:string):void{
        $(document).ready(function(){
            $(selector).tooltip();
        });
    }

    private deniedFields:Array<string> = [];
    public __initForm__(form:FormGroup , global:GlobalProvider):void{
        var _self = this;
        this.__setGlobal__(global);
        $('[data-toggle="tooltip"]').tooltip();
        this.__clearAlerts__();
        this._formObject = form;
        this._form = $('.form');
        $('.form input.form-control.autofocus').focus();
        $('input.form-control').attr('autocomplete' , 'off');
        $('input.form-control,select-container').on('focus change',function(e){
            if($(this).hasClass('no-popover')) return;
            $('.form').find('.popoverroles').remove();
            var self = $(this);
            if(!self.hasClass('keys') && !self.hasClass('select-container')){
                var parents  = self.parent().parent();
            }else{
                var parents = self.parent().parent().parent();
            }
            var fieldset = parents.parent().parent();
            var field_name = self.attr('placeholder');
            if(!field_name || _self.deniedFields.indexOf(field_name) >= 0) return;

            var rule = self.attr('data-rules') || null;
            if(rule === 'noroles') return;
            var rules = !rule ? ["لايوجد شروط مسبقة لتعبئة الحقل"] : rule.split(',');
            rule = "";
            rules.forEach(function(ele:string) {
                var replacer;
                if(ele.indexOf('min') === 0){
                    replacer = new String(_self._lang['errors']['min']).replace("#1#" , field_name);
                    var min = parseInt(ele.replace('min',''));
                    rule += '<p class="rule">' + new String(replacer).replace("#2#" , min.toString()) + '</p>';
                }else if(ele.indexOf('max') === 0){
                    replacer = new String(_self._lang['errors']['max']).replace("#1#" , field_name);
                    var min = parseInt(ele.replace('max',''));
                    rule += '<p class="rule">' + new String(replacer).replace('#2#',min.toString()) + '</p>';
                }else{
                    replacer = new String(_self._lang['errors'][ele]).replace("#1#" , field_name);
                    if(!replacer || replacer.toString() === 'undefined'){
                        replacer = new String(_self._lang['errors'][ele]);
                    }
                    if(!replacer || replacer.toString() === 'undefined'){
                        replacer = "يرجى تعبئة الحقل";
                    }
                    rule += '<p class="rule">' + replacer + '</p>';
                }
            }, this);
            self.after('<div class="popoverroles"></div>');
            // delete $('input.form-control').parent().find('p.rule').remove();
            // self.parent().append(rule);
            let __closeRules:any = $('<i class="ti-close">');
            let __popover:any = $('.popoverroles');
            let __firstRule:any = $("<p class='rule first'>" + field_name + "</p>");
            __firstRule.append(__closeRules);
            __closeRules.click(function(e){
                if(_self.deniedFields.indexOf(field_name) < 0) _self.deniedFields.push(field_name);
                $('.form').find('.popoverroles').remove();
            });
            __popover.append(__firstRule);
            __popover.append(rule);
        });
        $('.form input.form-control.autofocus').focus();
        //--------------------------------------------------------
    }

    public prepareDiscountPopover():void{
        let __elem:any = $('.item-discount .prices-title a');
        __elem.unbind('click');
        __elem.bind('click' ,function(e){
            e.preventDefault();
            let __popoverBox:any = $('.item-discount .prices-title .popover');
            let __display:string = __popoverBox.is(':visible') ? 'none' : 'block';
            __popoverBox.css({
                top : '-160px',
                left : '0px',
                display : __display
            });
        });
        __elem.click();
    }

    public __toPDF__(__class:string , component:any = null){
        this.OnPrintReport(component);
    }

    public __setAlerts__(type='warn' , message:string = null):void{
        this.__clearAlerts__();
        this._top = $('.top-msg');
        if(type === 'connfail' || type === 'error' || type === 'unauth'){
            var type:string ='error' ,
                msge:string= message || 'الرجاء اعادة المحاولة عند التأكد من سلامة اتصالك';
        }else if(type === 'success'){
            var type:string = type,
                msge:string = message;
        }else{
            var type:string = 'warn',
                msge:string = message || 'الرجاء الانتظار حتى انتهاء عملية التحميل';
        }

        var span = $('<span class="close"><i class="ti-close"></i></span>');

        var msg = $('<div class="msg">').addClass(type).append(span).append(msge).slideDown(300);

        this._top.append(msg);
        span.click(function(e){
            msg.fadeOut(500).remove('')
        });
        msg.fadeIn(200).delay(5000).fadeOut(500);
        if(type === 'warn' || type === 'unauth') {
            $('div.circle-loader').show();
        }else{
            $('.div.circle-loader').hide();
        }
    }

    public __clearAlerts__():void{
        this._top.html('');
    }

    public __setErrors__(errors:any):void{
        this.__clearAlerts__();
        if(!errors || !errors.status || errors.status === 0){
            this.__setAlerts__('connfail');
            return;
        }
        if(errors.status === 401){
            this.__setAlerts__('unauth' , 'لاتملك التصريح لاجراء هذه العملية...سيتم تحويلك لصفحة الدخول');
            setTimeout(()=>{
                this._global.clearToken(['/login']);
            },5000);
            return ;
        }
        this.__setAlerts__('error' , 'حدث خطأ ... يرجى التأكد من الطلب');
        let __errorsObj:any = {};
        try {
            __errorsObj = errors.json();
            __errorsObj = __errorsObj.error;
        } catch (error) {
            return;
        }
        if(__errorsObj.hasOwnProperty('raw') && __errorsObj.raw.hasOwnProperty('error')
        && __errorsObj.raw.error){
            __errorsObj = __errorsObj.raw.error;
            try{ __errorsObj = JSON.parse(JSON.stringify(__errorsObj)); }catch(e){ return;}
        }
        for(let ele in __errorsObj){
            let _ele = __errorsObj[ele];
            let errsString = '';
            let _error = $('input[name="' + ele + '"].form-control').parent()
            _error = _error.find('div.errors');
            _error.find('p.error').remove();
            if(_ele.length > 0){
                for(let index in _ele){
                    let _rule = _ele[index];
                    switch(_rule.rule){
                        case 'unique' :
                            errsString += '<p class="error">( '+_rule.value+' ) موجود مسبقا </p>';
                        break;
                        case 'email':
                            errsString += '<p class="error">( '+_rule.value+' ) ليس ببريد الكترونى فعال</p>'
                        break;

                        case 'required':
                            errsString += '<p class="error">يجب تعبئة الحقل ببيانات حسب الشروط</p>'
                        break;
                        case 'notfound':
                            errsString += '<p class="error">'+_rule.value+' الذى طلبت غير متوفر حاليا</p>';
                        break;
                        default:
                            errsString += '<p class="error">الرجاء التأكد من بيانات الحقل</p>';
                        break;
                    }
                }
                _error.append(errsString);
            }
        }
    }

    public OnPrintReport(component):void{
        this.__OnReportActions__({action:"PRINT"} , component);
    }

    public onShowPrintDialog(component):void{
        if(component.hasOwnProperty('__pagesCount') && component.__pagesCount <= 0)
            return this.__setAlerts__('warn' , 'عذرا ... لايوجد بيانات لطباعتها');
        component.__modal = 'print';
        component._lab.__modal('#show-report-print-modal');
    }



    public showFromPageXToPageY(component,from:number , to:number):void{
        if(from < 1 || from > to || from > component.__pagesCount) from = 1;
        if(to  > component.__pagesCount || from > to) to = component.__pagesCount;
        let __editShown:boolean = false;
        component.__pagesShown.forEach((focus , index) => {
            if(!__editShown && focus === true){
                __editShown = focus;
                component.__lasShownPage = index;
            }
            component.__pagesShown[index] = index >= (from - 1) && index < to;
        });
        component.__currentPage = from;
        if(!__editShown) component.__lasShownPage = 0;
        component.__printFormObject.controls['to'].setValue(component.__pagesCount);
    }

    public showLastShownPage(component):void{
        component.__pagesShown.forEach((focus , index) => {
            component.__pagesShown[index] = index === component.__lasShownPage;
        })
    }

    public changePage(component,page:number):void{
        if(page <= 0 || page > component.__pagesCount) return;
        component.__currentPage = page;
        component.__showFromPageXToPageY(page , page);
    }

    public __OnReportActions__($event:any , component:any):void{
        switch ($event.action) {
            case 'PRINT':
                this.__setStyle__('.dash-footer' , {bottom : '0px'});
                if(!$event.hasOwnProperty('noDialog') || !$event.noDialog)
                {
                    this.jQuery(window).bind('focus' , function(e){
                        component.showLastShownPage();
                        component.__showFromPageXToPageY(component.__lasShownPage + 1 , component.__lasShownPage + 1);
                        if(component.hasOwnProperty('__isPrint')) component.__isPrint = false;
                        component._lab.jQuery(window).unbind('focus');
                    });
                }
                print();
                break;
            default:
                break;
        }
    }

    public __toDateAPI__(date:Date , mysql:boolean = false , noHMS:boolean = false):string{
        if(!date) return new Date().toLocaleString();
        if(!mysql) return date.toLocaleString();
        let year:string, month:string, day:string , hour:string , minute:string , second:string;
        year = String(date.getFullYear());
        month = String(date.getMonth() + 1);
        day = String(date.getDate());
        if (day.length === 1) {
            day = "0" + day;
        }
        if (month.length === 1) {
            month = "0" + month;
        }
        //================================================
        if(noHMS) return year + "-" + month + "-" + day + " 00:00:00";
        //================================================
        hour = String(date.getHours());
        minute = String(date.getMinutes());
        second = String(date.getSeconds());
        if(hour.length === 1){
            hour = "0" + hour;
        }
        if(minute.length === 1){
            minute = "0" + minute;
        }
        if(second.length === 1){
            second = "0" + second;
        }
        return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
    }

    public __beepAddingProduct__():void{
        let audio:HTMLAudioElement = new Audio(this._global.config['serverPath'] + 'assets/audio/beep.mp3');
        audio.volume = 0.4;
        audio.play();
        // alert('Beep');
    }

    public __getSelectedItemsIds__():string[]{
        let __checkboxes = $('table input.checkbox.option-input.list-item');
        if(__checkboxes.lenght === 0) return new Array();
        let __ids:string[] = new Array();
        for(var i=0; i < __checkboxes.length ; i++){
            let __item:any = $(__checkboxes[i]);
            if(__item.prop('checked')){
                __ids.push(__item.attr('class').split(' ')[0]);
            }
        }
        return __ids;
    }

    public __modal(__id:string,options:any = {}){
        $(__id).modal(options);
    }

    public __removeStickModal__(elem:string = '.modal-backdrop.fade'):void{
        $(elem).remove('');
    }

    public __popover(elem:string , options:any):void{
        let __elem = $(elem);
        $(elem).popover(options);
    }

    public __setItemModal__(__item:any , __attributes:any):void{
        let _head = $('.__modalHead');
        let _body = $('.__modalBody');
        let _title = '<div class="col-md-12 field_title no-p"><p>'+ __attributes.title +'</p></div>';
        _head.html(_title);
        _body.html('');
        for(let field in __attributes){
            let indexOf = field.indexOf('_and_');
            if(indexOf >= 2){
                let _fields = field.split('_and_')
                if(_fields.length !== 2) continue;
                _body.append(this.__setItemDivision__(_fields[0],__item,__attributes));
                _body.append(this.__setItemDivision__(_fields[1],__item,__attributes));
            }else
                _body.append(this.__setItemDivision__(field,__item,__attributes));
        }
    }

    private __setItemDivision__(field,__item:any,__attributes):string{
        if(!__item.hasOwnProperty(field) || !__item[field] || __item[field] == '')
            if(!__item.hasOwnProperty(field) || !__attributes.__required || !__attributes.__required[field])
                return '';

        let __property:string = __item[field] ? __item[field].toString() : '';
        if(__attributes.__pipes && __attributes.__pipes[field]){
            switch (__attributes.__pipes[field]) {
                case 'currency':
                    if(!__item[field] || typeof(__item[field]) === 'number') __item[field] = '0';
                    else __property = __item[field].toString();
                    // if(this._global)
                        // __property = new MyCurrencyPipe(this._global).transform(__property , []);
                    break;
                case 'date':
                    if(!__item[field]) __property = 'N/A';
                    else __property = new DatePipe('medium').transform(__property , 'yyyy-MM-dd');
                    break;

                default:
                    if(!__item[field] && typeof(__item[field]) === 'number') __item[field] = '0';
                    else if(!__item[field] && typeof(__item[field]) === 'string') __item[field] = 'N/A';
                    else __property = __item[field].toString();
                    // alert(__attributes.__pipes[field] + 'pipe is not supperted..!!');
                    break;
            }
        }
        let _div = '<div class="col-md-12 item_field"><div class="col-md-3 field_name">';
        _div += __attributes[field] + '</div><div class="col-md-9 field_data">' +__property;
        _div += '<div></div>';
        return _div
    }

    public __setTopLink__(_first:any,_second:any=null):void{
    }

    public __setGlobal__(_global:GlobalProvider){
        if(!this._global)
            this._global = _global;
    }
    public onSideBarclicked():void{
        let __sidebar:any = $('.second-wrapper');
        let __display:string = __sidebar.is(':visible') ? 'none' : 'block';
        __sidebar.css({ display: __display});
        // this.resize();
    }

    public getHeight(){
        return $(window).height();
    }

    public setUrl(url:Array<string>):void{
        this.__url = url;
        this.__urlStr = this.__url.join('/');
    }
    public resize(__url:Array<string> = [], changenav:boolean = false):void{
        if(changenav && !__url || __url.length === 0){
        let __basepath:string = window.location.protocol + '//' + window.location.host + '/#/';
        let __urlStr:string = window.self.location.href.replace(__basepath , '');
            // __urlStr = __urlStr.replace('http://' , '');
            // __urlStr = __urlStr.replace('https://' , '');
            let __urlArr:Array<string> = __urlStr.split('/');
            __url = [];
            __urlArr.forEach((str) => {
                if(str && str !== "") __url.push(str);
            });
            if(__url.length === 0) return;
            this.setUrl(__url);
        }else if(!this.__url) return;
        let __page:string = this.__url[1] ? this.__url[1] : '';
        if((__page === 'sales' || __page === 'invoices' || __page === 'purchases') && (this.__url.length >= 3 && this.__url[2].indexOf('details') === 0)){
                this.__setStyle__('.dashboardPages .content' , {
                    'width' : '100%',
                    'padding' : '70px 0px 0px 0px'
                });
                this.__setStyle__('.main_sidebar-wrapper , .second-wrapper' , {
                    'display' : 'none'
                });
                // this.__setStyle__('.navbar' , {
                //     display : 'none',
                // });
        }else{
            let __width:string = $('.content').width() <= 740 ? '100%' : 'calc(100% - 220px)';
            this.__setStyle__('.dashboardPages .content' , {
                // 'width' : __width,
                // 'padding' : '40px 20px 0px 20px'
            });
            this.__setStyle__('.main_sidebar-wrapper' , {
                'display' : 'block'
            });
            // this.__setStyle__('.navbar' , {
            //     'display' : 'block',
            // });
            this.resizeHeight();
            if(changenav){
                this.__changeNavBgs(__page);
            }
        }
        if(changenav){
            this.__changeNavBgs(__page);
        }
    }

    private __changeNavBgs(__page:string):void{
        // let __bg:string;
        // if(!this.__pagesColors.hasOwnProperty(__page)){
            // this.__setStyle__('.navbar' , {
                // display : 'block' // ,
                // background : 'white'
            // });
                // this.__setStyle__('.navbar a,.navbar a.navbar-brand',{'color' : '#606F78'});
        // }else{
        //     this.__setStyle__('.navbar' , {
        //         display : 'block',
        //         background : this.__pagesColors[__page]
        //     });
        //     // this.__setStyle__('.navbar a,.navbar a.navbar-brand',{'color' : 'white'});
        // }
    }

    public resizeHeight():void{
        let height:number = (this.getHeight() - 0);
        // if(height < 650){
        //     height = 650;
        // }
        let height_str:string = height + 'px';
        $('.content').css({ 'min-height' : height_str });
        $('.sub_sidebar').css({'height' : $('.content').height()});
    }

    public invoiceResize(str:string = null):void{
        let __getHeight = this.getHeight();
        let height:number = (__getHeight - 279);
        let height_str:string = (height).toString() + 'px';
        $('.orders_wrapper').css({
            'height' : height
        });
        let max_height_str:string = (__getHeight - 180) + 'px';
        $('.products_list').css({
            'height' : max_height_str
        });
    }

    public OnShowAndHideFooter(__show:boolean):void{
        let __footer:any = $('.dash-footer');
        if(__show){
            this.__setStyle__('.dash-footer' , {bottom : '0px'});
        }else{
            this.__setStyle__('.dash-footer' , {bottom : '-50px'});
        }
    }

    public __setStyle__(elem , style):void{
        if(Object.keys(style).length === 0){
            window['j'] = this.jQuery(elem);
            window['s'] = document.querySelectorAll(elem);
            try{
                this.jQuery(elem).attr('style' , '');
            }catch(e){
                try{
                    document.querySelectorAll(elem)[0].setAttribute('style' , '');
                }catch(e){ }
            }
        }else{
            $(elem).css(style);
        }
    }

    public __onTopActionClick__($event:any , component:any):void{
        if(!$event.clicked) return;
        switch($event.action){
            case 'DELETE':
                let __ids:string[] = this.__getSelectedItemsIds__();
                if(!__ids || __ids.length === 0) return;
                component.__deleteItems(__ids.join(','));
                break;
            case 'REFRESH':
                component.onRefresh({refresh : true});
                break;
            case 'EXPORTLIST':
            case 'EXPORT':
                this.__modal('#show-download-modal');
                let __modal:any = $('#show-download-modal');
                if(!__modal){
                    return;
                }
                let __parse:string = $event.action === 'EXPORTLIST' ? '1' : '0';
                let __query:string = '';
                __modal.data('ctrl' , component._controller);
                __modal.data('parse' , __parse);
                break;
            case 'SYNC':
                let __idss:string[] = this.__getSelectedItemsIds__();
                if(!__idss || __idss.length === 0) return this.__setAlerts__('warn' , 'الرجاء تحديد العناصر المطلوبة لعملية المزامنة');
                component.__OnChangeCurrentBranch__(__idss.join(','));
        }
    }

    public __onDetailsAction__($event:any , component:any){
        if(!$event.action) return;
        switch($event.action){
            case 'ADD':
                component.onRefresh({ refresh : true });
                break;
            case 'EDIT':
                let __temp:Array<any> = [];
                component._list.forEach((item , index) => {
                    if(item.id === $event.item.id){
                        item = $event.item;
                    }
                    __temp.push(item);
                });
                component._list = __temp;
                break;
            case 'CANCEL':
                break;
        }
    }

    public __showOrHideElem__(eleRef:string , __class:string="fadeIn"):void{
        let __elem:any = $(eleRef);
        let __display:string = __elem.is(':visible') ? 'none' : 'block';
        __elem.css({
            display : __display
        }).addClass(__class);
    }

    public ExportIt(__type:string,_http:any):void{
        if(this['__is' + __type] === false){
            return this.__setAlerts__('warn' , 'تحميل الملف قد يستغرق بضع ثوانى');
        }
        let __modal:any = $('#show-download-modal');
        let __page:string = __modal.data('ctrl');
        if(!__page) return;

        let __isParseQuery:string = __modal.data('parse');
        let __URL:string = 'download/' + __page + '/' + __type.toLowerCase();
        if(__isParseQuery && __isParseQuery === '1'){
            let __url:string = __modal.data('lstget');
            if(!__url) return;
            let __urlArr:Array<string> = __url.split('?');
            if(__urlArr.length === 2) __URL += '?' + __urlArr[1];
        }
        let __msnger:any = $('div.dwnldmsg');
        let __msg:any = __msnger.find('p');
        __msg.text('تحميل الملف قد يستغرق بضع ثوانى');
        __msnger.fadeIn(200);
        this['__is' + __type] = false;
        _http.get(__URL).subscribe(
            (response) => {
                try {
                    this['__is' + __type] = true;
                    if(response.data instanceof Array){
                        __msg.text('تم تحميل الملف/ات : '+ response.data.join(' , '));
                    }else{
                        __msg.text('تم تحميل الملف للمسار : "' + response.data + '"');
                    }
                    __msnger.show();
                    if(__ENV.isElectron){
                        alert("ELECTRON");
                    }
                    $('div.dwnldmsg span.close').click(function(e){
                        __msnger.fadeOut(500);
                    })
                    // __msnger.show().delay(10000).fadeOut(500);
                } catch (error) {
                    __msg.text('حدث خطأ فى تكوين الملف');
                }
            },(error) => {
                __msg.text('حدث خطأ فى تكوين الملف');
                __msnger.show().delay(5000).fadeOut(500);
            }, () => { }
        );
    }


    public __checkAuthPage(url:string):boolean{
        if(!url) return false;
        this.__removeStickModal__();
        let user:any = this._global.getToken();
        let roles:any = this._global.getResource('roles');
        if(!user || !roles){
            this._global.clearToken(['/login']);
            return false;
        }
        let __urlArr:Array<string> = url.split('/');
        let __url:string[] = [];
        __urlArr.forEach((str) => {
            if(str && str !== "") __url.push(str);
        });
        if(__url.length === 0 || __url[0] !== 'dashboard'){
            // this._router.navigate(['login']);
            return true;
        }
        let __role = user.role;
        if(!__role){
            this._global.navigate('login');
            return false;
        }
        let __roles:any = roles[__role];
        if(!__roles){
            this._global.navigate('/login');
            return false;
        }
        let __branches:any[] = <any[]>this._global.getResource('branches');
        if(!__branches || !__branches.length){
            this._global.navigatePanel('login');
            return false;
        }

        if(user.super) return true;
        let __page:string = !__url[1] ? null : __url[1].toLocaleLowerCase();
        if(!__page) return false;
        switch (__page) {
            case 'timer':
                return true;
            case 'types':
            case 'options':
            case 'tags':
            case 'collections':
            case 'brands':
            case 'gifts':
                return (__roles.hasOwnProperty('products') && true === __roles['products']['all']);
            case 'bookstree':
            case 'bookkepping':
                return (__roles.hasOwnProperty('accountants') && true === __roles['accountants']['all']);
            case 'reports':
            case 'settings':
                return (__roles.hasOwnProperty(__page) && true === __roles[__page]['all']);
            case 'index':
                return (__roles.hasOwnProperty('dashboard') && true === __roles['dashboard']['all']);
            case 'users':
                if(__url.length === 3 && __url[2] === 'roles'){
                    return (__roles.hasOwnProperty('users') && true === __roles['users']['premessions']);
                }
            case 'registers':
            case 'registershistory':
                return (__roles.hasOwnProperty('sales') && true === __roles['sales']['create']);
            default:
                try {
                    if(!(__roles.hasOwnProperty(__page))) return false;
                    if(__url.length === 2){
                        return (__roles.hasOwnProperty(__page) && (__roles[__page]['find'] || __roles[__page]['all']));
                    }else if(__url.length >= 3){
                        if(__url[2] === 'details'){
                            if(__url.length === 4 && this._global.config['intRegex'].test(__url[3].toString())){
                                return (__roles[__page]['update']);
                            }else{
                                return (__roles[__page]['create']);
                            }
                        }else if(__url[2] === 'show' && (__page === 'sale' || __page === 'purchases')){
                            return (__roles.hasOwnProperty(__page) && (true === __roles[__page]['update']));
                        }else if(__url[2] === 'destroy'){
                                return (__roles[__page]['destroy']);
                        }else return false; //false
                    }else return false; //false
                } catch (error) {
                    return false;
                }
        }
    }

    public __notHavingPremmAlert():void{
        this.__setAlerts__('warn' , 'عذرا ... غير مصرح لك بدخول هذه الصفحة من قبل الادارة');
    }

    private __deniedShortCutting:Array<string> = [
        'taxes' , 'types' , 'brands' , 'collections' ,
        'paids' , 'expenses' , 'storages' , 'banks',
        'gifts' , 'trash' , 'accounts' , 'registers' , 'timer'
    ];
    public __setShortCuts__(__component:any , __resetForm:boolean = true):void{

        if(__component.hasOwnProperty('_page')
        && this.__deniedShortCutting.indexOf(__component._page.replace('/' , '')) >= 0){
            return;
        }
        var body:any = document.querySelector('body');
        body.onkeydown = null;
        $(document).on('keydown' , null);
        body.onkeydown = function (e) {
            // remove errors from errors class
            let _error:any = $('div.errors p.error');
            if(_error) _error.remove();
                            // CTRL
            let CTRL:number = 17, A:number = 65, V:number = 86, C:number = 67, X:number = 88;
            if ((e.ctrlKey && (e.keyCode !== A && e.keyCode !== V && e.keyCode !== C && e.keyCode !== X))
            || (e.keyCode === 8 && document.activeElement['type'] !== 'text'
            && document.activeElement['type'] !== 'textarea')) {
                e.preventDefault();
            }
            ///-----------------------------------------------------------
            // CTRL + Q Close Form
            if(e.ctrlKey && e.keyCode == 81) {
                __component._lab.__setAlerts__('warn' , 'سيتم تحويلك لصفحة عرض القوائم بناءا على طلبك');
                setTimeout(function() {
                    __component._global.navigatePanel(__component._page)
                }, 1000);
            }
            // CTRL + R Reset Form
            if(e.ctrlKey && e.keyCode == 82 && __resetForm){
                if(__component.hasOwnProperty('__initForms__'))__component['__initForms__']();
                else __component['__initFormsObject__']();
            }
            // CTRL + S Save Form
            if(e.ctrlKey && e.keyCode == 83) {
                if(__component.hasOwnProperty('formObject')){
                    return __component.OnSubmitForm(__component.formObject.value , __component.formObject.valid);
                }
                __component.OnSubmitForm();
            }
            // press F5 to refresh hole page
            if(e.keyCode === 116){
                location.reload();
            }
            // press Home Button
            if(e.keyCode === 36 && e.ctrlKey && document.activeElement['type'] !== 'text' && document.activeElement['type'] !== 'textarea'){
                __component._lab.__setAlerts__('warn' , 'سيتم تحويلك للصفحة الرئيسية بناءا على طلبك');
                setTimeout(function() {
                    __component._global.navigatePanel('/index');
                }, 1000);
            }
            // press BackSpace Button
            if(e.ctrlKey && e.keyCode === 8 && history.length > 1){
                __component._global.History.pop();
                if(history.length > 1) history.back();
            }
            return true;
        }
    }

    public __setListShortCuts__(__component:any):void{
        if(__component.isDynamic) {
            return;
        }

        let __self:LabProvider = this;
        let body:any = document.querySelector('body');
        body.onkeydown = null;
        $(document).on('keydown' , null);
        body.onkeydown = function (e) {
            // remove errors from errors class
            let _error:any = $('div.errors p.error');
            if(_error) _error.remove();
            let CTRL:number = 17, A:number = 65, V:number = 86, C:number = 67, X:number = 88;
            if ((e.ctrlKey && (e.keyCode !== A && e.keyCode !== V && e.keyCode !== C && e.keyCode !== X))
            || (e.keyCode === 8 && document.activeElement['type'] !== 'text'
            && document.activeElement['type'] !== 'textarea')) {
                e.preventDefault();
            }
            ///-----------------------------------------------------------

            // CTRL + Left Arrow Reset Form
            if(e.keyCode == 37){
                __component.onClick(__component._currentPage - 1);
            }

            // CTRL + UP Arrow Reset Form
            // if(e.ctrlKey && e.keyCode == 38){
            //     // back one page
            //     __component.__show = true;
            //     __self.OnShowAndHideFooter(true);
            // }

            // CTRL + RIGHT Arrow Reset Form
            if(e.keyCode == 39){
                __component.onClick(__component._currentPage + 1);
            }
            // CTRL + DOWN Arrow Reset Form
            // if(e.ctrlKey && e.keyCode == 40){
            //     // go forward on page
            //     __component.__show = false;
            //     __self.OnShowAndHideFooter(false);
            // }

            // ALT + D to DELETE selected
            if(e.ctrlKey && e.keyCode == 68) {
                __component.onActionClick('delete');
            }
            // CTRL + E To Export
            if(e.ctrlKey && e.keyCode == 69) {
                let __btn:any = document.querySelector('.above_table li.opp');
                if(__btn) __btn.click();
            }
            // CTRL + N To Add New One
            if(e.ctrlKey && e.keyCode == 78) {
                let __btn:any = document.querySelector('a.addnew.action_btn');
                if(__btn) __btn.click();
            }
            // CTRL + R Refresh
            if(e.ctrlKey && e.keyCode == 82) {
                __component.onActionClick('refresh');
            }
            // press F5 to refresh hole page
            if(e.keyCode === 116){
                location.reload();
            }
            // press Home Button
            if(e.keyCode === 36 && e.ctrlKey && document.activeElement['type'] !== 'text' && document.activeElement['type'] !== 'textarea'){
                __component._lab.__setAlerts__('warn' , 'سيتم تحويلك للصفحة الرئيسية بناءا على طلبك');
                setTimeout(function() {
                    __component._global.navigatePanel('/index');
                }, 1000);
            }
            // press BackSpace Button
            if(e.ctrlKey && e.keyCode === 8 && history.length > 1){
                __component._global.History.pop();
                if(history.length > 1) history.back();
            }
            return true;
        }
    }

    public __setOrdersShortCuts__(__component:any , __from:string = "Sale"):void{
        if(__component.isDynamic) {
            return;
        }
        let __self:LabProvider = this;
        let body:any = document.querySelector('body');
        body.onkeydown = null;
        $(document).on('keydown' , null);
        body.onkeydown = function (e) {
            // remove errors from errors class
            let _error:any = $('div.errors p.error');
            if(_error) _error.remove();
            let CTRL:number = 17, A:number = 65, V:number = 86, C:number = 67, X:number = 88;
            if ((e.ctrlKey && (e.keyCode !== A && e.keyCode !== V && e.keyCode !== C && e.keyCode !== X))
            || (e.keyCode === 8 && document.activeElement['type'] !== 'text'
            && document.activeElement['type'] !== 'textarea')) {
                e.preventDefault();
            }
            ///-----------------------------------------------------------

            // CTRL + Left Arrow Reset Form
            if(e.keyCode == 37){
                __component.prevPage();
            }
            // CTRL + RIGHT Arrow Reset Form
            if(e.keyCode == 39){
                __component.nextPage();
            }
            // CTRL + L to Show Sidebar list
            if(e.ctrlKey && e.which === 76){
                __component.onSideBarClick();
            }
            // CTRL + M To Show Money Paid
            if(e.ctrlKey && e.keyCode == 77) {
                __component.__showModalDetails__('paymentsDetails');
            }
            // CTRL + N To Show Park Note
            if(e.ctrlKey && e.keyCode == 78) {
                __component.__showModalDetails__('parkMsg');
            }
            // CTRL + O Show Invoice Or Order Details
            if(e.ctrlKey && e.keyCode == 79) {
                __component.__showModalDetails__();
            }
            // CTRL + P Go To Pay
            if(e.ctrlKey && e.keyCode == 80) {
                __component.OnPayClick()
            }
            // CTRL + R Reset Details
            if(e.ctrlKey && e.keyCode == 82) {
                __component.__clearProperties__();
                if(!__component._editable && !__component.__isParkEdit) __component.__createNewDetails__();
            }
            // CTRL + S Shipping Details
            if(e.ctrlKey && e.keyCode == 83) {
                __component.__showModalDetails__('shipping');
            }
            // CTRL + U Users Details
            if(e.ctrlKey && e.keyCode == 85) {
                __component.__showModalDetails__('customerandemployees');
            }
            // CTRL + B Back To Ordes
            if(e.ctrlKey && e.keyCode == 66) {
                __component.onBackToOrdering();
            }
            // CTRL + D Show Discount popover
            if(e.ctrlKey && e.keyCode == 68) {
                let __btn:any = __self.jQuery('.item-discount .prices-title p a');

                if(__btn) __btn.click();
            }
            // ALT + F to DELETE selected
            if(e.ctrlKey && e.keyCode == 70) {
                __component.onRemoveAllOrders();
            }
            // press BackSpace Button
            if(e.keyCode === 116){
                location.reload();
            }
            // press Home Button
            if(e.keyCode === 36 && e.ctrlKey && document.activeElement['type'] !== 'text' && document.activeElement['type'] !== 'textarea'){
                __component._lab.__setAlerts__('warn' , 'سيتم تحويلك للصفحة الرئيسية بناءا على طلبك');
                setTimeout(function() {
                    __component._global.navigatePanel('/index');
                }, 1000);
            }
            // press BackSpace Button
            if(e.ctrlKey && e.keyCode === 8 && history.length > 1){
                __component._global.History.pop();
                history.back();
            }
            return true;
        }
    }



    public __setReportsShortcuts(__component:any , has_pages : boolean = true):void{
        let body:any = document.querySelector('body');
        body.onkeydown = null;
        $(document).on('keydown' , null);
        body.onkeydown = function (e) {
            ///-----------------------------------------------------------
            // press BackSpace Button
            if(e.ctrlKey && e.keyCode === 8 && history.length > 1){
                __component.onActionReport({ action : 'GOBACK' });
            }
            if(!has_pages) return;
            // CTRL + Left Arrow Reset Form
            if(e.keyCode == 37){
                __component.changePage(__component.__currentPage - 1);
            }
            // CTRL + RIGHT Arrow Reset Form
            if(e.keyCode == 39){
                __component.changePage(__component.__currentPage + 1);
            }
        };
    }

    public __onChangeAvatar__(__component , item , response):void{

        for(let i:number = 0; i < __component._list.length; i++){
            if(__component._list[i].id === item.id){
                __component._list[i].img = response instanceof Array ? response[0] : response;
                break;
            }
        }
        if(__component.hasOwnProperty('__getItems')){
            let __url:string = __component._global.getPastPageQuery(__component._controller);
            __component.__getItems(__url);
        }else{
            let __list:Array<any> = Object['assign']([] , __component._list);
            __component._list = [];
            __component._list = __list;
        }
    }

    /**
     *  ------------------- BOOKSTREE ----------------------
     */
    // private __bookCodesArray:any;
    // public __setBooksTreeView__(ele:string , books:Array<any> , __component:any):void{
    //     let __root:any = this.jQuery(ele);
    //     __root.html('');
    //     this.__bookCodesArray = {};
    //     let __tree:any = this.__deepBooksTree__(books , __component , false);
    //     if(__tree) {
    //         __root.append(__tree);
    //         this.__expandChildren(books);
    //     }
    // }

    // private __deepBooksTree__(books:Array<any> , __component, expanded:boolean = false):any{
    //     if(books.length === 0) return '';
    //     let __foldExpand:string = expanded || books[0].depth === 0 ? 'expanded' : 'folded';
    //     let ul:any = this.jQuery('<ul class="parent ' + __foldExpand + ' depth_'+ books[0].depth +'" />');
    //     books.forEach(book => {
    //         this.__addLiToUlParent(book , ul , __component);
    //     });
    //     return ul;
    // }

    // private __addLiToUlParent(book:any , ul:any , __component:any):void{
    //     if(this.__bookCodesArray[book.code]) return;
    //     this.__bookCodesArray[book.code] = true;
    //     let __ulWidth:number = 2; // addbook , report ,
    //     let __liWidth:number = 38;
    //     let has_children:boolean = (book.children && book.children.length > 0);
    //     let li:any = this.jQuery('<li class="code_'+ book.code +'" />');
    //     let name:any;
    //     let __plusminus:string = book.focus ? 'plus' : 'minus';
    //     let __plusminusicon:string = book.focus ? 'ti-minus' : 'ti-plus';
    //     if(has_children) name = this.jQuery('<a class="name '+__plusminus+'"><p><i class="'+__plusminusicon+' float_exac"></i> '+book.name_ar+'</p></a>');
    //     else name = this.jQuery('<a class="name minus"><p><i class="ti-control-stop no_brdr float_exac"></i> '+book.name_ar+'</p></a>');

    //     if(book.is_cred_deb){
    //         let currency:string = this._global.getToken()['settings']['currency'];
    //         let cred:number = book.creditor=== null ? 0 : book.creditor;
    //         let deb:number  = book.debitor === null ? 0 : book.debitor ;
    //         name.append('<p class="deb">'+deb+' '+currency+'</p><p class="cred">'+cred+' '+currency+'</p>');
    //     }

    //     let dropdownStr = `<span width="24px"
    // class="dropdown"><a class="action_btn float_exac filter" id="dropActionMenue" data-toggle="dropdown">
    // <i class="ti-more"></i></a>`;
    //     let dropdownUL:any = this.jQuery('<ul class="list-actions dropdown-menu" role="menu" aria-labelledby="dropActionMenue">');
    //     let dropdown:any = this.jQuery(dropdownStr);
    //     // let report:any = this.jQuery('<li><a class="report_ico"><i class="ti-eye"></i></a></li>');
    //     let addBook:any = this.jQuery('<li><a class="add show_' + ((book.depth > 1).toString()) + '"><i class="ti-pencil-alt"></i></a></li>');

    //     addBook.click(function(e){
    //         e.preventDefault();
    //         __component.onAddNewClick({ addnew : 'true' , type : 'BKeep' , addEditData : { parent : book } });
    //     });
    //     if(book.new){
    //         let remove:any = this.jQuery('<li><a class="remove"><i class="ti-trash"></i></a></li>');
    //         remove.click(function(e){
    //             e.preventDefault();
    //             __component.onAction({ action : 'DELETE' , item : book });
    //         });
    //         dropdownUL.append(remove);
    //         __ulWidth++;
    //     }
    //     // report.click(function(e){
    //     //     e.preventDefault();
    //     //     __component.onAction({ action : 'RESULT' , item : book });
    //     // });

    //     dropdownUL.append(addBook);
    //     // dropdownUL.append(report);
    //     if(book.depth < 3){
    //         let addnew:any = this.jQuery('<li><a class="report_ico"><i class="ti-plus"></i></a></li>');
    //         addnew.click(function(e){
    //             e.preventDefault();
    //             __component.onAddNewClick({ addnew : 'true' , type : 'BTree' , addEditData : { parent : book } });
    //         });
    //         dropdownUL.append(addnew);
    //         __ulWidth++;
    //     }

    //     dropdown.append(dropdownUL);
    //     dropdownUL.css({
    //         width : (((__ulWidth * __liWidth) + 10)),
    //         right : -78,
    //         left : -78
    //     });// n_li * ul + 8px padding
    //     li.append(name);
    //     li.append(dropdown);
    //     ul.append(li);

    //     let __childrenUL:any;
    //     if(has_children){
    //         li.addClass('has_children');
    //         __childrenUL = this.__deepBooksTree__(<Array<any>>book.children , __component , book.focus);
    //     }

    //     if(__childrenUL)
    //         ul.append(__childrenUL);
    // }

    // private __expandChildren(books:Array<any>):void{
    //     if(!books) return;
    //     for(let index in this.__bookCodesArray){
    //         let __code:string = 'li.code_' + index + ' > a.name';
    //         let __name:any = this.jQuery(__code);
    //         __name.unbind('click');
    //         __name.click(function(e){
    //             e.preventDefault();
    //             let ul:any = $('li.code_' + index).next();
    //             if(!ul || !ul.hasClass || !ul.hasClass('parent')) return;

    //             let self:any = $(this);
    //             if(ul.hasClass('expanded')){
    //                 ul.removeClass('expanded').addClass('folded');
    //                 self.removeClass('plus').addClass('minus').find('p > i').addClass('ti-plus').removeClass('ti-minus');
    //             }
    //             else{
    //                 ul.removeClass('folded').addClass('expanded');
    //                 self.removeClass('minus').addClass('plus').find('p > i').addClass('ti-minus').removeClass('ti-plus');
    //             }
    //         });
    //     }
    // }

    // public __addANDEditBooksChild($event:any , __component:any):void{
    //     if(!$event || !$event.item) return;
    //     if($event.action === 'EDIT'){
    //         let __code = $event.code;
    //         let oldLi = $('li.code_'+__code);
    //         oldLi.remove();
    //     }
    //     let __parent:any = $('li.code_' + $event.item.father_id).next();
    //     if(!__parent || !__parent.hasClass || !__parent.hasClass('parent')) return;
    //     this.__addLiToUlParent($event.item , __parent , __component);
    // }

    public __adjustBooksCodes__(setting:any = null){
        // let settings:any = setting || this._global.getToken()['settings'];
        // let books:Array<string> = this._global.config['bookCodes'];
        // let __obj:Object = {};
        // books.forEach((book) => {
        //     for(let key in settings){
        //         if(key === book + '_code') __obj[book] = settings[key];
        //     }
        // });
        // this._global.setResource(__obj , 'bookCodes');
    }

    public __getBooksTree__(__component:any , field:string , cb:Function):void{
        let __booksTreeArray:any = __component._global.getResource('booksTree');
        if(__booksTreeArray && __booksTreeArray){
            __component[field] = __booksTreeArray;
            cb();
            return;
        }
        __component._http.get('booksTree?sortby=code&sort=DESC').subscribe(
            (items) => {
                if(items.data && items.data.length > 0){
                    __component[field] = items.data;
                    __component._global.setResource(__booksTreeArray , 'booksTree');
                    cb();
                }else{
                    __component._http.get('super/initbookstree').subscribe(
                        (response)=>{
                            if(response.error){
                                __component._lab.__setErrors__(response.error);
                                return;
                            }
                            if(response.data && response.data.length >= 1){
                                __component[field] = response.data;
                                __component._global.setResource(__component[field] , 'booksTree');
                                cb();
                            }else{
                                __component[field] = [];
                                cb();
                            }
                        },
                        (error) => {
                            __component[field] = [];
                            __component._lab.__setErrors__(error);
                        },
                        ()=> {
                            // After Complete Fetching Data From Server
                        }
                    )
                }
            },(error) => {
                __component[field] = [];
            }
        );
    }

    public __buildBooksTree__(list , cb):void{
        if(!list) {
            if(!this._global) return;
            list = <Array<any>>this._global.getResource('booksTree');
            if(!list) return;
        }
        for(let i = 0; i < list.length ; i++){
            list[i].focus = false;
            if(list[i].depth === 3) continue;
            if(!list[i].children) list[i].children = [];
            list[i]['focus'] = list[i].depth === 0;
            for(let j = 0; j < list.length ; j++){
                if(i === j) continue;
                let __parentStartCode:string = list[j].code.substr(0,(list[j].depth));
                if(__parentStartCode === list[i].code) list[i].children.push(list[j]);
            }
        }

        var __tempList:Array<any> = [];
        for(var i=0; i < list.length; i++){
            if(list[i].depth === 0){
                __tempList.push(list[i]);
            }
        }
        cb(__tempList);
    }

    public getCurrentJournal(__component:any , cb:Function = null):void{
        let __date:Date = new Date();
        let __journal:any = this._global.getResource('journal');
        if(__journal && __journal.date && __journal.date.toDateString() === __date.toDateString()){
            __component._journal = __journal;
            if(cb) cb(true);
        }

        __component._http.get('journals/currenct').subscribe(
            (response) => {
                if(response.item && !response.error){
                    __component._journal = response.item;
                    __component._global.setResource(response.item , 'journal');
                    if(cb) cb(false);
                }
            },(error) => {
                if(cb) cb(true);
            }
        );
    }
}
