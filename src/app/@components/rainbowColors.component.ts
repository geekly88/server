import { Component , OnInit } from '@angular/core';

@Component({
    selector : 'ranbow-colors',
    inputs : ['class' , 'smhidden' , 'xshidden'],
    template : `
    <div class="top_color {{ class }} float_exac no-p">
        <div class="col-xs-3 bg1 top_colors float_exac"></div>
        <div class="col-xs-1 bg2 top_colors float_exac"></div>
        <div class="col-xs-1 bg3 top_colors float_exac"></div>
        <div class="col-xs-1 bg4 top_colors float_exac"></div>
        <div class="col-xs-1 bg5 top_colors float_exac"></div>
        <div class="col-xs-1 bg6 top_colors float_exac"></div>
        <div class="col-xs-1 bg7 top_colors float_exac"></div>
        <div class="col-xs-1 bg8 top_colors float_exac"></div>
        <div class="col-xs-1 bg9 top_colors float_exac"></div>
        <div class="col-xs-1 bg10 top_colors float_exac"></div>
    </div>
`
})
export class RainbowColorsComponent implements OnInit{
    public class:string = 'col-md-3 col-sm-6 col-xs-6';
    public smhidden:boolean = false;
    public xshidden:boolean = false;

    ngOnInit():void{
        if(this.smhidden) this.class += ' hidden-sm-down';
        if(this.xshidden) this.class += ' hidden-xs-down';
    }
}