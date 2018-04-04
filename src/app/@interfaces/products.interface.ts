export interface Products{

    id : number,
    parent_id : number,
    company_id : number,
    author_id : number,

    createdAt : Date,
    updatedAt : Date,

    name : string;
    handler : string,
    sku : string,
    sku_int : number,
    stock : number,
    stock_order_point : number,
    stock_order_amount : number,
    till_to_reorder:number,
    limit_quantity : number,
    limit_sell_quantity : number,
    diffrence:number,
    description : string,
    type : string,
    type_id : number,
    collection : string,
    collection_id : number,
    brand : string,
    brand_id : number,
    variaty : Array<string>,
    variaties_arr : Array<Array<string>>,
    variaty_count:number,
    status:string,
    storage:string,
    storage_code:string,
    storage_id : number,

    option_one : string,
    option_two : string,
    option_three : string,
    option_one_value : string,
    option_two_value : string,
    option_three_value : string,

    tags : JSON,
    cost : number,
    price : number,
    price2 : number,
    price3 : number,
    price4 : number,
    price5 : number,
    tax : number,
    tax_id : number,

    is_multi_price : boolean,
    
    has_expire_date : boolean,
    expire_date : Date,

    supplier : string,
    supplier_code : number,
    supplier_id : number,
    
    is_product : boolean,
    is_active : boolean,
    is_trackable : boolean,
    is_variaty : boolean,
    is_main : boolean,
    main_id:number,
    allowed_variaties : string

}