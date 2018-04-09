import { Component , OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterTransition , LabProvider , GlobalProvider } from './../../@providers';
import { HttpRequestService } from './../../@services';
import * as INF from './../../@interfaces';

declare let Chart:any;

@Component({
    selector : 'index',
    templateUrl : './index.html',
    animations : [RouterTransition()]
})
export class IndexComponent implements OnInit{


    // private __salesData:INF.Sales[] = [];
    // private __purchasesData:INF.Invoices[] = [];
    private __durationStr:string; //1 WEEEK
    private __durationStrArray:Object = {
        "DAY" : "يوم",
        "WEEK" : "7 أيام",
        "MONTH" : "30 يوم",
    };
    private __fromDate:Date;
    private __toDate:Date;

    private __topDataObject:Array<any> = [];
    private __topData:Object = {};
    private __salesDataLabels:Array<string> = [];
    private __purchasesDataLabels:Array<string> = [];
    private __salesDataObject:Object = {};
    private __purchasesDataObject:Object = {};
    private __customersDataObject:Array<Object> = [];
    private __suppliersDataObject:Array<Object> = [];
    private __employeesDataObject:Array<Object> = [];
    private __productsDataObject:Array<Object> = [];
    private __customersData:INF.Customers[] = [];
    private __employeesData:INF.Employees[] = [];
    private __suppliersData:INF.Suppliers[] = [];
    private __productsData:INF.Products[]  [];

    private __ChartsOptions:Object = {};
    private __doughnutChartsOptions:Object = {};
    private __doughnutColors:Array<string> = [];
    
    private __chartsType:string = 'line';

    private __expensesChartTest:boolean = false;
    private __paidsChartTest:boolean = false;
    private __purchasesChartTest:boolean = false;
    private __salesChartTest:boolean = false;
    // private __invoicesDataTest:boolean = false;
    private __salesDataTest:boolean = false;
    private __purchasesDataTest:boolean = false;
    private __customersDataTest:boolean = false;
    private __employeesDataTest:boolean = false;
    private __suppliersDataTest:boolean = false;
    private __productsDataTest:boolean = false;
    
    constructor(
        private _global:GlobalProvider,
        private _http:HttpRequestService,
        private _lab:LabProvider,
        private _router:Router
    ){}

    ngOnInit():void{
        this.__init__();
        this.OnRefreshAllChartsData(true);
    }

    private OnRefreshAllChartsData(refreshDoughnut:boolean = false):void{
        this.__prepareUrlAndProperty('sales' , 'by_high');
        this.__prepareUrlAndProperty('purchases' , 'by_high');
        this.__prepareUrlAndProperty('topData' , 'by_high');
        if(!refreshDoughnut) return;
        this.__prepareUrlAndProperty('customers' , 'by_high');
        this.__prepareUrlAndProperty('products' , 'by_high');
    }

    __init__():void{
        this.__initRangeDate__();
        this.__initTopDataOptions__();
        this.__initDoghnutsOptions__();
        this.__initChartsOptions__();
    }

    private __initRangeDate__(__duration:string = 'WEEK'):void{
        this.__durationStr = __duration;
        let __date:Date = new Date();
        let __todayTime:number = __date.getTime();
        let __day:number = (3600 * 24 * 1000);
        let __durationDays:number = 0;
        // add 6 || 29 days cus today is we will add 24 hours to __toDate variable
        switch (this.__durationStr) {
            case "WEEK":
                __durationDays = 6;
                break;
            case "MONTH":
                __durationDays = 29;
                break;
        }
        this.__fromDate = new Date((__todayTime - (__durationDays * __day)));
        this.__toDate = new Date((__todayTime + (3600 * 24 * 1000)));
        this.OnRefreshAllChartsData();
    }

    __initTopDataOptions__():void{
        this.__topData = {
            'sales' : { total  : 0 , paid : 0 },
            'purchases' : { total  : 0 , paid : 0 },
            'expenses' : { total  : 0 , paid : 0 },
            'paids' : { recive : 0 , paid : 0 }
        };
    }

    __prepareUrlAndProperty(model:string = null,plus:string = null):void{
        let __property:string = '__' + model + 'Data';
        let __url:string = model + '';
        let __sort:string = 'DESC';
        let __cb:Function;
        switch (model) {
            case 'sales':
            // case 'invoices':
            case 'purchases':
                __url = 'reports/charts/' + model + '?from=';
                __url += this._lab.__toDateAPI__(this.__fromDate , true , true);
                __url += '&to=' + this._lab.__toDateAPI__(this.__toDate , true , true);
                __cb = (items) => {
                    this.__prepareChartsData(items , __property);
                };
                break;
            case 'customers':
            // case 'suppliers':
            // case 'employees':
            case 'products':
                let __sortBy:string = 'sales_count';
                // if(model === 'suppliers') __sortBy = 'purchases_count';
                __sort = plus && plus === 'by_low' ? 'ASC' : 'DESC';
                __url += '?limit=5&sortBy='+ __sortBy +'&sort=' + __sort;
                __cb = (items) => {
                    if((items && items instanceof Array && items.length > 0) && (model === 'customers' || model === 'products')){
                        let __items:Array<any> = [];
                        items.forEach((item , index) => {
                            if(item.sales_count === 0) return;
                            __items.push(item);
                        });
                        items = Object['assign']([] , __items);
                    }
                    let __property:string = '__' + model + 'Data';
                    this.__initDoughnutDatas__(__property , __sortBy , 'name');
                };
                break;
            case 'topData':
                __url = 'reports/results/allwins?from=';
                __url += this._lab.__toDateAPI__(this.__fromDate , true, true);
                __url += '&to=' + this._lab.__toDateAPI__(this.__toDate , true, true);
                __cb = (items) => {
                    this.__topDataObject = items;
                    this.__prepareTopActivity__();
                }
                break;
            default:
                return;
        }
        this.__getDate(__url , __property , __cb);
    }
    __getDate(__url:string, __property:string , cb:Function):void{
        if(!__url || !__property) return;
        this._http.get(__url).subscribe(
            (items) => {
                if(items.error || !items.data){
                    this._lab.__setErrors__(items.error)
                }
                this[__property] = items.data;
                if(cb) return cb(items.data,__property);
            },(error) => {
                if(cb) cb([],__property);
                this._lab.__setErrors__(error);
            }, () => {}
        );
    }

    __prepareTopActivity__():void{
        if(!this.__topDataObject || this.__topDataObject.length === 0){
            return ;//this.__setTopPies__((1 === 1));
        }
        let __objs:Object = {};
        for(let i=0; i < this.__topDataObject.length; i++){
            let obj:Object = this.__topDataObject[i];
            let src:string = obj['src'];
            let __obj:Object = {};
            
            __obj['pospaid'] = !obj['pospaid'] ? 0 : obj['pospaid'];
            __obj['negpaid'] = !obj['negpaid'] ? 0 : obj['negpaid'];
            __obj['pos']     = !obj['pos']     ? 0 : obj['pos'];
            __obj['neg']     = !obj['neg']     ? 0 : obj['neg'];
            __obj['poscost'] = !obj['poscost'] ? 0 : obj['poscost'];
            __obj['negcost'] = !obj['negcost'] ? 0 : obj['negcost'];
            
            __objs[src] = __obj;
        }
        let __total:number = 0;
        let __paid:number = 0;
        //======== SALES ========================\\
        __total  += Number(__objs['SEL']['pos']);
        __total  += Number(__objs['SEL']['neg']);
        
        __paid += Number(__objs['SEL']['negpaid']);
        __paid += Number(__objs['SEL']['pospaid']);
        //======== INVOICES =====================\\
        // __total  += Number(__objs['INV']['pos']);
        // __total  += Number(__objs['INV']['neg']);
        // __total  += __objs['INV']['negcost'];
        
        // __paid += Number(__objs['INV']['negpaid']);
        // __paid += Number(__objs['INV']['pospaid']);
        // __paid += __objs['INV']['poscost'];

        this.__topData['sales']['total'] = __total;
        this.__topData['sales']['paid'] = __paid;
        // ====== PAIDS =========================\\  
        __total = 0 ; __paid = 0;
        __total  += Number(__objs['PID']['pospaid']);
        __paid += Number(__objs['PID']['negpaid']);
        this.__topData['paids']['recive'] = __total;
        this.__topData['paids']['paid']   = __paid;

        // ====== EXPENSES ======================\\        
        __paid = Number(__objs['EXP']['negpaid']);
        this.__topData['expenses']['total'] = __paid;

        // ====== PURCHASES ==========================\\        
        __total = 0 ; __paid = 0;
        __total  += Number(__objs['PURCHASE']['pos']);
        __total  += Number(__objs['PURCHASE']['neg']);

        __paid += Number(__objs['PURCHASE']['pospaid']);
        __paid += Number(__objs['PURCHASE']['negpaid']);
        this.__topData['purchases']['total'] = __total;
        this.__topData['purchases']['paid'] = __paid;
    }
    
    __prepareChartsData(items:Array<Object> , __property:string, __labelDate:string = 'date'):void{
        let __labels:Array<string> = [];
        let __data1:Array<number> = [];
        let __data2:Array<number> = [];
        let __data3:Array<number> = [];
        let __lb:Array<string> = [];
        let __test:boolean = false;
        if(items && items.length){
            if(items.length === 1 && items[0]['total'] === 0){
                __test = true;
            }else{
                for(let i=0; i < items.length; i++){
                    __labels.push(items[i][__labelDate]);
                    __data1.push(items[i]['total']);
                    __data2.push(items[i]['paid']);
                    __data3.push((items[i]['total'] - items[i]['paid']));
                }
                __lb = ["الاجمالى", "المدفوع", "المتبقى"];
            }
        }else{
            __test = true;
        };
        if(__test){
            this[__property + 'Test'] = true;
            __lb = ["--" , "--" , "--"];
            __data1 = [120,55,66,43,55,123];
            __data2 = [88,45,26,43,52,70];
            __data3 = [32,10,40,0,3,53];
            __labels = ['--' , '--' , '--' , '--' , '--'];
        }
        
        let __type:string = __property === '__purchasesData' ? 'line' : 'bar';
        let config:Object = {
            type: __type,
            data: {
                labels: __labels,
                datasets: [{
                    label: __lb[0],
                    fill: false,
                    backgroundColor: '#0073CE', // blue
                    borderColor: '#0073CE',
                    borderWidth : 1,
                    pointRadius: 3,
                    data: __data1
                }, {
                    label: __lb[1],
                    fill: false,
                    backgroundColor: '#00C55A', // green
                    borderColor: '#00C55A',
                    borderWidth : 1,
                    pointRadius: 3,
                    // borderDash: [5, 5],
                    data: __data2
                }, {
                    label: __lb[2],
                    fill: false,
                    backgroundColor: '#F39B18',// orange
                    borderColor: '#F39B18',
                    borderWidth : 1,
                    pointRadius: 3,
                    data: __data3,
                }]
            },
            options: this.__ChartsOptions
        };

        let canvas:any = document.getElementById(__property);
        if(!canvas) return;
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if(window.hasOwnProperty(__property) && window[__property].hasOwnProperty('update')){
            window[__property].update(config);
        }else
            window[__property] = new Chart(ctx, config);
    }

    __initDoughnutDatas__(__property:string , __field:string , __label:string = 'name'):void{
        this.__doughnutColors = ['#0073CE' , '#00C55A' , '#A924E4' , '#F39B18' , '#35EA7F'];
        let __labels:Array<string> = [];
        let __data:Array<number> = [];
        let __test:boolean = false;
        if(this[__property] && this[__property].length){
            if(this[__property].length === 1 && this[__property][__field] === 0){
                __test = true;
            }else{
                for(let i=0; i < this[__property].length; i++){
                    let __isNumber:boolean = !isNaN(this[__property][i][__field]);
                    if(__isNumber && this[__property][i][__field] > 0){
                        __data.push(this[__property][i][__field]);
                        __labels.push(this[__property][i][__label]);
                    }
                }
                __test = __data.length === 0;
            }
        }else{
            __test = true;    
        }
        if(__test){
            __data = [3,1 , 2 , 3 , 1];
            __labels = ['--' , '--' , '--' , '--' , '--'];
            this[__property + 'Test'] = true;
        }

        this.__initDoghnutsOptions__();
        let config:Object = {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: __data,
                    backgroundColor: this.__doughnutColors,
                    // label: 'Dataset 1'
                }],
                labels: __labels
            },
            options: this.__doughnutChartsOptions
        };

        let ctx:any = document.getElementById(__property);
        if(!ctx) return;
        ctx = ctx.getContext("2d");
        if(window.hasOwnProperty(__property) && window[__property].hasOwnProperty('update')){
            window[__property].update(config);
        }else
            window[__property] = new Chart(ctx, config);
    }

    __initDoghnutsOptions__(__disLegend:boolean = false , __percent:number = 75):void{
        this.__doughnutChartsOptions = {
            responsive: true,
            cutoutPercentage : __percent,
            segmentShowStroke: false,
            legend: {
                position: 'bottom',
                display : __disLegend
            },
            title: {
                display: false,
                // text: 'Doughnut Chart Test'
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        };
    }

    __initChartsOptions__():void{
        this.__ChartsOptions =  {
            responsive: true,
            maintainAspectRatio: true,
            showLines : true,
            spanGaps : false,
            defaultFontColor : 'green',
            defaultFontFamily : 'SKY',
            defaultFontSize : 10,
            scaleFontColor: 'red',
            scaleBorderWidth : 3,
            scaleBorderColoe : 'red',
            title:{
                display:false,
                // text:'Line Chart With Ahmed'
            },
            tooltips : { 
                backgroundColor : 'rgba(255,255,255,0.8)',
                titleFontFamily : 'HELV2',
                titleFontColor : '#48A098',
                bodyFontFamily : 'HELV2',
                bodyFontColor : '#48A098',
                xPadding : 10,
                yPadding : 10,
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            legend: {
                display: false,
            },
            scales: {
                xAxes: [{
                        drawBorder: false, // bottom dark line
                    ticks: {
                        drawBorder: false, // bottom dark line
                        fontColor: "#A6B1B7", // this here
                        fontFamily : 'SKY'
                    },
                    gridLines: {
                        // display : false,
                        color: "rgba(238, 239, 247, 0.33)", // "#F2F6FA",
                    }
                }],
                yAxes: [{
                        drawBorder: false, // bottom dark line
                    ticks: {
                        drawBorder: false, // bottom dark line
                        fontColor: "#A6B1B7", // this here
                        fontFamily : 'SKY'
                    },
                    gridLines: {
                        // display : false,
                        color: "rgba(238, 239, 247, 0.33)",
                    }   
                }]
            }
        };
    }
}