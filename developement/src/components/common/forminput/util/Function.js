import {
    validateNumber,
    validatePhone,
    validateAmount,
    validateBirthday,
    validateBankAccount,
    validateOrganization,
    validatePersonalId,
    validateEmail,
    validateURL,
    validateCountryCode
} from './ValueValidation';

const _isValid = (value, {rule}) => {
    let option = {
        'phone'       : validatePhone,
        'number'      : validateNumber,      // allow begin with 0
        'amount'      : validateAmount,      // not allow beging with 0
        'birthday'    : validateBirthday,    // eq. 080982
        'bank-account': validateBankAccount,
        'person-id'   : validatePersonalId,
        'url'         : validateURL,
        'email'       : validateEmail,
        'country-code': validateCountryCode, // eq. +47 | +46
        'organization': validateOrganization,
    };

    return option[rule] ? option[rule](value) : true;
};

export const generateReduxFormValidation = (template) => {
    return (values) => {
        let errors = template.content.reduce((prev, cnt) => {
            if ( ! cnt ) { return prev; }
              
            (cnt instanceof Array ? cnt : [cnt]).forEach((data) => {
                let { id, name, type, validation } = data;
                if (!id || !name || !type || !(validation instanceof Array)) { return prev; }

                let isBox = type.match(/(checkbox|file|image)/i) ? true : false;
                let value = isBox ? values[name] : (values[name] || '').trim();
                let i = 0, loop = validation.length;
                for (i = 0; i < loop; i++) {
                    if (validation[i].ignore) { continue; }

                    let error = '';
                    if (validation[i].rule === 'required') {
                        if (!value) {
                            error = validation[i].message || 'Required error';
                        }
                    } else if (validation[i].rule) {
                        if (value && ! _isValid(value, validation[i])) {
                            error = validation[i].message || 'Invalid error';
                        }
                    } else if (validation[i].regex) {
                        if (value && value.match(validation[i].regex)) {
                            error = validation[i].message || 'Regex error';
                        }
                    }
                    
                    if (error) { prev[name] = error; i = loop; }
                }
            });
            return prev;
        }, {});

        return errors;
    };
}