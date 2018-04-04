import { Input , Component, OnInit/*, ChangeDetectorRef, AfterViewInit*/, OnChanges ,EventEmitter } from '@angular/core';
// import { GlobalProvider, LabProvider } from './../@providers';

declare let Chart:any;
declare let $:any;

@Component({
    selector: 'charts',
    inputs: ['data' , 'updown' , 'type' , 'isPrice' , 'title' , 'summationField' , 'outlet' , 'labelDate'],
    outputs: [],
    template: `
    <div class="col-md-12 no-p" height="150px">
        <div class="no-p col-md-12 chart_header">
            <h2 class="title">{{ title }}</h2>
            <h1 class="total" *ngIf="isPrice">{{ __total | myCurrency }}</h1>
            <h1 class="total" *ngIf="!isPrice">{{ __total }}</h1>
            <p class="updown">{{ updown }}</p>
            <div class="col-md-12 no-p outlet">
                <p>{{ outlet }}</p>
            </div>
        </div>
        <div class="no-p col-md-12 chart_body">
            <chart [type]="type" [data]="__chartDataObject" [options]="__options"></chart>
        </div>
    </div>
`
})
export class ChartsComponent implements OnInit {

    private __options:Object;
    private __total:number = 0;
    private __chartDataObject:Object;
    private __chartData:Array<number> = [];
    private __labels:Array<string>=[];

    public labelDate:string = 'date';
    public summationField:string;
    public isPrice:boolean = false;
    public data:Array<any>;
    public title:string = 'العنوان هنا';
    public updown:string = 'ارتفاع المبيعات';
    public outlet:string = 'المسجل الرئيسي';
    public type:string = 'line';
    constructor(){ }

    ngOnInit():void{
        let self:ChartsComponent = this;
        // window['me'] = self;
        $(document).ready(function(){
            setTimeout(function() {
                self.__doChart()
            }, 500);
        });
    }

    ngOnChanges(props:any):void{
        this.__doChart();
    }

    private __doChart():void{
        this.__initOptions__();
    }

    private __initOptions__():void{
        this.__labels = [];
        this.__total = 0;
        this.data.forEach((item) => {
            this.__labels.push(item[this.labelDate]);
            this.__chartData.push(item[this.summationField]);
            this.__total += item[this.summationField];
        });
        this.type = 'line';
        this.__chartDataObject = {
            labels: this.__labels,
            datasets: [
                {
                    label: this.title,
                    data: this.__chartData,
                }
            ]
        };
        this.__options = {
            responsive: true,
            maintainAspectRatio: true,
            showLines : true,
            spanGaps : true,
            defaultFontColor : 'green',
            defaultFontFamily : 'HELV2',
            defaultFontSize : 10,
            // title : {
            //     display : false, // stop title on top of the charts
            //     fontColor : 'red',
            //     fontSize : 15,
            //     fullWidth : true,
            //     position : 'top',
            //     padding : 10,
            //     text : 'Ahmed Was Here'
            // },
            layout : {
                padding : 0 // padding inside the chart
            },
            legend: {
                display: false,
                labels: {
                    fontColor: '#606F78'
                }
            },
            elements : {
                arc : {
                    backgroundColor : '#3FA2E3',
                    borderColor : 'rgba(0,0,0,0)',
                    borderWidth : 0
                },
                line : {
                    tension : 0.4,
                    backgroundColor : 'rgba(0,0,0,0)',
                    borderWidth : 0,
                    borderColor : '#3FA2E3',
                    borderCapStyle : 'square',//butt , round , square
                    borderJoinStyle : 'miter',//bevel , round , miter
                    capBezierPoints : true,
                    fill : true,
                    stepped : false
                },
                point : {
                    pointStyle : 'circle',
                    backgroundColor:'#FFFFFF',
                    borderColor : '#3FA2E3',
                    borderWidth : 0,
                    hoverBorderWidth : 2,
                    radius : 3,
                    hoverRadius : 5
                }
            },
            tooltip : { 
                backgroundColor : 'rgba(255,255,255,0.8)',
                titleFontFamily : 'HELV2',
                titleFontColor : '#3FA2E3',
                bodyFontFamily : 'HELV2',
                bodyFontColor : '#3FA2E3',
                xPadding : 10,
                yPadding : 10
            },
            scales: {
                xAxes: [{
                            gridLines: {
                                color: "#F2F6FA",
                            }
                        }],
                yAxes: [{
                            gridLines: {
                                color: "rgba(0, 0, 0, 0)",
                            }   
                        }]
                }
        };
    }
}
