import { Products , BooksTree } from './';
export interface Suppliers{

    id : number,
    parent_id : number,
    company_id : number,
    author_id : number,

    active : boolean,
    name : string,
    code : number,
    company_name:string,
    paid : number,
    total : number,
    buys_count : number,
    email : string,
    phone : string,
    mobile : string,
    fax:string,
    phoneType:string,

    country : string,
    state:string,
    city : string,
    address1 : string,
    address2 : string,
    postcode : string,
    location : JSON,

    is_same_address:boolean,
    country2 : string,
    state2:string,
    city2 : string,
    address12 : string,
    address22 : string,
    postcode2 : string,

    img : string,
    website : string,

    custom_field1 :string,
    custom_field2 :string,
    custom_field3 :string,
    custom_field4 :string,

    book : BooksTree,

    description : string,
    products : Products[],
    createdAt : Date,
    updatedAt : Date,

};