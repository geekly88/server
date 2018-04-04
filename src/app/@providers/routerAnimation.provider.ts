import {trigger, state, animate, style, transition} from '@angular/core';

export function RouterTransition(type:string=null) {
    type = type || 'List';
    return slideToLeft(type);
}


function slideToLeft(type:string) {
    let trans:string = type === 'Form' ? 'translateX' : 'translateY';
    return trigger('RouterTransition', [
        state('void', style({ position: 'relative', width: '100%' , float : 'right' })),
        state('*', style({ position: 'relative', width: '100%' , float : 'right' })),
        transition(':enter', [  // before 2.1: transition('void => *', [
            style({ transform: trans + '(-100%)' , position : 'fixed' , width: '100%'}),
            animate('0.2s ease-in-out', style({ transform: trans + '(0%)', position : 'fixed', width: '100%' }))
        ]),
        transition(':leave', [  // before 2.1: transition('* => void', [
            style({ transform: trans + '(0%)' }),
            animate('0s ease-in-out', style({ transform: trans + '(100%)' }))
        ])
    ]);
}