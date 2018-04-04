import { Products } from './';
export interface Orders {

    id : number,
    parent_id : number,
    company_id : number,
    author_id : number,

    number : string,
    father_id : number,
    product:Products,
    product_name : string,
    product_id : number,
    product_handler : string,
    cost : number,
    tax : number,
    discount : number
    price : number,
    total : number,

    order_status : string,

    type : string,
    type_main_id : number,
    tags : string,
    brand : string,
    variaty : string;
    brand_id : number,
    quantity : number,
    multiplier : number,

    date : Date,

    note:string,
    
    createdAt : Date,
    updatedAt : Date,

};