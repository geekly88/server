import { Registers }from './'; 
export interface RegistersHistory {

    id : number,
    parent_id : number,
    company_id : number,branch_id:number,
    author_id : number,


    register : string,
    register_id : number,
    sales : number,
    costs : number,
    prices : number,
    discounts : number,
    taxes : number,
    totals : number,
    paids : number,

    register_paid : number,
    register_recive:number,
    expenses : number,

    employees : Array<Object>,

    case : string

    closure : number,

    counted : number,
    expected : number,

    cash_counted : number,
    cash_expected : number,

    credit_card_counted : number,
    credit_card_expected : number,

    cheque_counted : number,
    cheque_expected : number,
    
    open_amount : number,
    register_info : Registers,

    openedAt : Date,
    closedAt : Date,

    createdAt : Date,
    updatedAt : Date,
};