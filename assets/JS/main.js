// const $ = document.querySelector.bind(document);
// const $$ = document.querySelectorAll.bind(document)

// Validator Object
function Validator(options) {

  function getParent(element, selector) {
    return element.closest(selector);
  }
    
  // Validate if has error => return true
  function validate(inputElement, rule) {
    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
    var errorMessage;

    // Take out the selector rules
    var rules = selectorRules[rule.selector];

    // Loop for the rule and check if has error
    for (var i = 0; i < rules.length; ++i) {
        switch(inputElement.type) {
          case 'radio':
          case 'checkbox':
            errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'));
            break;
          default:
            errorMessage = rules[i](inputElement.value);
        }
        // errorMessage = rules[i](inputElement.value);
        if (errorMessage) break;
    }

    if (errorMessage) {
        errorElement.innerText = errorMessage;
        getParent(inputElement, options.formGroupSelector).classList.add('invalid');
    } else {
        errorElement.innerText = "";
        getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
    }

    return !errorMessage;
  }
  
  function inputHasContent(inputElement) {
      var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
      errorElement.innerText = '';
      getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
  }
  
  // Take the element whose form is needed to validate
  var formElement = document.querySelector(options.form);
  var selectorRules = {};
  if (formElement) {
    formElement.onsubmit = function(e) {
        e.preventDefault();

        var isFormValid = true;
        options.rules.forEach(function(rule) {
            var inputElement = formElement.querySelector(rule.selector);
            var isValid = validate(inputElement, rule);
            if (!isValid) {
                isFormValid = false;
            }
        });

        if (isFormValid) {
            // Submit with JS
            if (typeof options.onSubmit === 'function') {
              var validInputs = formElement.querySelectorAll('[name]');
              var formValues = Array.from(validInputs).reduce(function(values, input) {
                switch(input.type) {
                  case 'radio':
                    values[input.name] = formElement.querySelector('input[name="' + input.name + '"]');
                    break;
                  case 'checkbox':
                    if (!input.matches(':checked')) {
                      if (!Array.isArray(values[input.name])) {
                        values[input.name] = '';
                      }
                      return values;
                    } else {
                      values[input.name] = [];
                    }
                    values[input.name].push(input.value);
                    break;
                  case 'file':
                    values[input.name] = input.files;
                    break;  
                  default:
                    values[input.name] = input.value;
                }
                return values;
              }, {});
              options.onSubmit(formValues);
            }
            // Submit with HTML
            else {
              formElement.submit();
          }
        }
      }  
    
      options.rules.forEach(function(rule) {
      // Save rules for inputs
          
        // When a specific input applies so many rules,
        // the last rule will be applied and
        // the rest above will be overwritten
        // it will causes a bug
      if (Array.isArray(selectorRules[rule.selector])) {
          // check if selectorRules properties are arrays, 
          // push the duplicated property into that property array
          selectorRules[rule.selector].push(rule.test);
      } else {
          // check if selectorRules properties are undefined
          // bring the properties into arrays and put it into selectorRules
          selectorRules[rule.selector] = [rule.test];
      }
      var inputElements = formElement.querySelectorAll(rule.selector);
      Array.from(inputElements).forEach(function(inputElement) {
        if (inputElement) {
            //When blurring out of the element
            inputElement.onblur = function() {
              // access to value: inputElement.value
              // access to test func: rule.test()
              validate(inputElement, rule);
            }
  
            //When typing in the input
            inputElement.oninput = function() {
              inputHasContent(inputElement);
            }
        }
      });
    });
  }
}

// Defines the rules
// Rules are
// 1. When error occurs => Return error message
// 2. When valid => Return nothing (undefined)
Validator.isRequired = function (selector, message) {
	return {
		selector: selector,
		test: function (value) {
			var result;
      // If users type in the input
			if (typeof value === 'string') result = value.trim() ? undefined : message || 'Vui lòng nhập trường này';
			// Case typeof value is null so that trim() will be crashed
      else result = value ? undefined : message || 'Vui lòng nhập trường này';
			return result;
		},
	};
};

Validator.isEmail = function(selector, msg) {
  return {
      selector: selector,
      test: function(value) {
          var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
          return regex.test(value) ? undefined : msg || 'Vui lòng nhập email';
      }
  }
}

Validator.minLength = function(selector, min, msg) {
  return {
      selector: selector,
      test: function(value) {
          return value.length >= min ? undefined : msg || `Mật khẩu tối thiểu phải từ ${min} ký tự`;
      }
  }
}

Validator.isConfirmed = function(selector, getConfirmedValue, msg) {
  return {
      selector: selector,
      test: function(value) {
          return value === getConfirmedValue() ? undefined : msg || 'Giá trị nhập vào không chính xác'
      }
  }
}