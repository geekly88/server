import { SellOrders } from './sellOrders.interface';

export interface Sells{

    id : number,
    parent_id : number,
    company_id : number,
    author_id : number,

    is_sell:boolean,
    is_droped_debt : Boolean,

    register : string,
    register_id : number,
    register_closure : number,

    number : number,
    order_number : number,
    notebook_number:number,
    status:string,
    count : number,
    customer: string,
    customer_id : number,
    employee : string,
    employee_id : number,
    date : Date,
    paid_date : Date,

    gift_code : string,
    gift_id : number,
    gift_discount : number,

    costs : number,
    prices : number,
    taxes : number,
    all_discount : number,
    discounts : number,
    shipping_cost : number,
    totals : number,
    paid : number,
    payments : Array<any>,

    description:string,
    parked_msg : string,
    park_completed:boolean,
    orders : SellOrders[],

    createdAt : Date,
    updatedAt : Date,

};