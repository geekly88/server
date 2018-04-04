import { Products } from './';
export interface Settings {

    id : number,
    parent_id : number,
    company_id : number,
    author_id : number,

    is_registered : boolean,
    sell_terms:string,

    createdAt : Date,
    updatedAt : Date,

};