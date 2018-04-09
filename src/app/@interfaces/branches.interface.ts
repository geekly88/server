export interface Branches {

    id : number,
    parent_id : number,
    company_id : number,branch_id:number,
    author_id : number,


    name : string,
    number:number,
    is_main:Boolean,
    email : string,
    phone : string,
    mobile : string,

    country : string,
    city : string,
    state : string,
    address1 : string,
    address2 : string,
    postcode : string,

    img :string,

    createdAt : Date,
    updatedAt : Date,

};
