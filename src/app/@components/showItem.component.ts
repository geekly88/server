import { Component, EventEmitter, OnInit, OnChanges } from '@angular/core';

@Component({
    selector : 'show-item',
    inputs : ['showItemFields','showItem','isShowItem'],
    outputs : ['onShowItem'],
    template : `
<div class="fade modal" id="show-item-modal" tabondex="-1" role="dialog"
    aria-labelledby="myItemModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header __modalHead">
                <button class="close" data-dismiss="modal"><span></span></button>
            </div>
            <div class="modal-body __modalBody">
                
            </div>
            <div class="modal-footer">
                <button type="button" (click)="onClose()" class="btn btn_primary" data-dismiss="modal">اغلاق</button>
            </div>
        </div>
    </div>
</div>
`
})
export class ShowItemComponent implements OnInit,OnChanges{
    public onShowItem = new EventEmitter();
    public showItemFields:any;
    public showItem:any;
    public isShowItem:boolean = false;
    private __modalBody:any;
    private __modalHead:any;

    constructor(){}
    ngOnInit():void{ 
        this.isShowItem = false;
    }
    ngOnChanges(props: any):void {
        if(props.hasOwnProperty('isShowItem') && true === props.isShowItem.currentValue){
            this.onShowItem.emit({
                show:true
            });
        }else if(props.hasOwnProperty('showItemFields')){
            
        }
    }

    onClose():void{
        this.isShowItem = false;
    }
}