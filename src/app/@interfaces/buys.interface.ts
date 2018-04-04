import { Purches } from './purches.interface';

export interface Buys{

    id : number,
    parent_id : number,
    company_id : number,
    author_id : number,

    is_droped_debt : Boolean,

    number : number,
    notebook_number : number,
    status : string,
    park_completed:boolean,
    count : number,
    supplier: string,
    supplier_id : number,
    employee : string,
    employee_id : number,
    date : Date,
    paid_date : Date,

    gift : Object,
    points : JSON,

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

    purches : Purches[],

    createdAt : Date,
    updatedAt : Date,

};