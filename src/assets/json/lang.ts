import { AR } from './lang_ar';
import { EN } from './lang_en';
export const getLang = function(lang:string='ar'){
    if(lang === 'en'){
        return EN;
    }
    return AR
};