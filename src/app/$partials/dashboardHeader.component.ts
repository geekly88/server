import { Component ,OnInit , AfterViewInit} from '@angular/core';
import { FormGroup , FormBuilder , Validators } from '@angular/forms';
import { LabProvider, GlobalProvider } from '../@providers';
import { HttpRequestService } from '../@services';
import { Timer } from '../@interfaces';
import { MyTimerPipe } from '../@pipes';

declare let ipcRenderer:any;

@Component({
    selector : 'dashboard-header',
    templateUrl : './dashboardHeader.html'
})
export class DashboardHeaderComponent implements OnInit,AfterViewInit {
    private __timer:number = 0;
    private __status:string = 'STOP';
    private __timersList:Array<Timer> = [];
    private __timerItem:any = null;
    private __interval:any;
    private __showTimersList:boolean;
    private __showPauseBtn:boolean;
    private __task:string = '';
    private __taskNote:string = '';
    private __newTask:boolean;
    private __styleFormObject:FormGroup;
    constructor(
        private _lab:LabProvider,
        private _global:GlobalProvider,
        private _http:HttpRequestService,
        private _fb:FormBuilder
    ){};
    ngOnInit():any{
        this.__initStyleForm();
        this.__getTimersList();
    };
    ngAfterViewInit():any{
        let __self:DashboardHeaderComponent = this;
        this._lab.jQuery('.app-close').on('click' , function(e){
            __self._lab.__setLogout__(__self._http);
            if(ipcRenderer) ipcRenderer.send('close' , {});
        });
        this._lab.jQuery('.app-max').on('click' , function(e){
            if(ipcRenderer) ipcRenderer.send('maximize' , {});
        });
        this._lab.jQuery('.app-min').on('click' , function(e){
            if(ipcRenderer) ipcRenderer.send('minimize' , {});
        });
        this._lab.jQuery('.app-full').on('click' , function(e){
            if(ipcRenderer) ipcRenderer.send('fullscreen' , {});
        });
    };

    OnShowSidebar():void{
        this._lab.__showOrHideElem__('.second-wrapper', 'zoomInRight');
    }

    OnExport(__type:string="CSV"):void{
        this._lab.ExportIt(__type,this._http);
    }
    
    onTimerClicked(__event:string):void{
        this.__status = __event;
        switch (__event) {
            case 'PLAY':
                let __self:DashboardHeaderComponent = this;
                this.__showPauseBtn = true;
                this.__interval = setInterval(this.__playTimer.bind(__self) , 1000);
                break;
            case 'PAUSE':
                this.__showPauseBtn = false;
                clearInterval(this.__interval);
                break;
            case 'STOP':
                let __timer = this.__timer;
                this.__timerItem = { time : __timer };
                if(this.__timer < 10) return this._lab.__setAlerts__('warn' , 'لايمكن اضافة مهمة ذات توقيت أقل من 10 ثوانى');
                this.__showPauseBtn = false;
                this._lab.__modal('#show-timer-model');
                clearInterval(this.__interval);
                break;
            case 'MENU':
                this.__showTimersList = !this.__showTimersList;
                break;
        }
    }

    OnTimerAddedAction($event):void{
        if($event.action !== 'ADD') return;
        this.__timersList.push($event.item);
        this.__timer = 0;
    }

    OnShowAllTasks():void{
        this.__showTimersList = false;
        this._global.navigatePanel('timer');
    }

    __getTimersList():void{
        this._http.get('timer?search=author_id&author_id='+this._global.getToken()['id']).subscribe(
            (response) => {
                if(response && response.data && response.data.length > 0){
                    this.__timersList = (<Array<Timer>>response.data);
                }
            },(error) => {
                this._lab.__setAlerts__('error' , 'لم يتم جلب المهام ... الرجاء التأكد من الاتصال لديك');
            }
        );
    }

    __playTimer():void{
        this.__timer++;
    }

    private __initStyleForm():void{
        let intRegex:RegExp = this._global.config['intRegex'] as RegExp;
        let nameRegex:RegExp = this._global.config['nameRegex'] as RegExp;
        let __size:number = 12;
        let __family:string =  '';
        let __fontResource:any = this._global.getResource('font');
        if(__fontResource){
            __size = __fontResource.size && isNaN(__fontResource.size) ? __fontResource.size : 12;
            __family = __fontResource.fontfamily ? __fontResource.fontfamily : '';
            this.OnSubmitStyleForm(__fontResource , true);
        }

        this.__styleFormObject = this._fb.group({
            fontsize : [ __size , Validators.pattern(intRegex) ],
            fontfamily : [ __family , Validators.pattern(nameRegex)]
        });
    }

    OnSubmitStyleForm(values:any , valid:boolean){
        if(!valid) return this._lab.__setAlerts__('error' , '');
        let __dash:any = this._lab.jQuery('.dashboardPages');
        if(!isNaN(values['fontsize']) && values['fontsize'] < 17){
            __dash.css({
                'font-size' : values.fontsize + 'px',
            });
        }
        if(values.fontfamily && values.fontfamily !== ''){
            __dash.css({
                'font-family' : values.fontfamily
            });
        }

        this._global.setResource(values , 'font');
    }

    onShowNoteEvent(item:Timer):void{
        let __elem:any = this._lab.jQuery('.timer-menu .contents ul>li>span.note.note_'+item.id);
        let __display:string = __elem.is(':visible') ? 'none' : 'block';
        if(__display === 'block'){
            this._lab.jQuery('.timer-menu .contents ul>li>span.note').hide();
        }
        __elem.css({
            display : __display
        });
    }

    OnNavigateLinks(link:string):void{
        if(this._lab.__checkAuthPage('dashboard/' + link)){
            return this._global.navigatePanel(link);
        }
        this._lab.__notHavingPremmAlert();
    }
}