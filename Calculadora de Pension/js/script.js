var instance = {
  el: '#app',
  data: {
      accumulatedSalary: null,
      currentSalary: null,
      currentAge: null,
      gender: "M",
      desiredRetirementAge: null,
      extraPercentageSaved: null,
      showTab: false,
      formTab: true,
      messageErrors: false,
      validationCompleted: false,
      errorMessage: "",
      input: {
        accumulatedSalary: false,
        currentSalary: false,
        currentAge: false,
        desiredRetirementAge: false
      },
      totalResult: 0,
  },
  computed: {
    validateField: function (){
      let showErrors = true;
      let removeErrors = false;

      if(this.accumulatedSalary <= 0){
        this.resetInputValidations(removeErrors);
        this.input.accumulatedSalary = showErrors;
        return this.showMessageValidation("Debe digitar el monto acumulado.");
      }

      if(this.currentSalary <= 0){
        this.resetInputValidations(removeErrors);
        this.input.currentSalary = showErrors;
        return this.showMessageValidation("Debe digitar su salario actual.");
      }
      
      if(this.currentAge <= 0 || this.currentAge > 110){
        this.resetInputValidations(removeErrors);
        this.input.currentAge = showErrors;
        return this.showMessageValidation("Debe digitar su edad actual entre 18 y 110 años.");
      }
      if(this.currentAge < 18){
        this.resetInputValidations(removeErrors);
        this.input.currentAge = showErrors;
        return this.showMessageValidation("Su edad actual no puede ser menor de 18 años.");
      }

      if(this.desiredRetirementAge <= 0){
        this.resetInputValidations(removeErrors);
        this.input.desiredRetirementAge = showErrors;
        return this.showMessageValidation("Debe digitar su edad de retiro.");
      }
      if(this.desiredRetirementAge < 55){
        this.resetInputValidations(removeErrors);
        this.input.desiredRetirementAge = showErrors;
        return this.showMessageValidation("La edad de retiro no debe ser menor a 55 años.");
      }
      if(this.desiredRetirementAge > 110){
        this.resetInputValidations(removeErrors);
        this.input.desiredRetirementAge = showErrors;
        return this.showMessageValidation("La edad de retiro no debe ser mayor a 110 años.");
      }
      if(this.currentAge > this.desiredRetirementAge){
        this.resetInputValidations(removeErrors);
        this.input.currentAge = showErrors;
        this.input.desiredRetirementAge = showErrors;
        return this.showMessageValidation("Su edad actual no puede ser mayor que su edad de retiro.");
      }
      this.resetInputValidations(removeErrors);
    }
  },
  methods: {  
      calculatePension: function () {
        this.messageErrors = false;
        if(!this.messageErrors){
          this.messageErrors = true;
        }
      },
      showMessageValidation: function(message){
        return message;
      },
      cleanFields: function () {
        this.accumulatedSalary = null;
        this.currentSalary = null;
        this.currentAge = null;
        this.gender = "M";
        this.desiredRetirementAge = null;
        this.extraPercentageSaved = null;
      },
      showResultTab: function(){
        this.showTab = true;
        this.formTab = false;
      },
      showValidations: function (valid) {
        this.messageErrors = valid;
      },
      resetInputValidations: function (valid) {
        this.input.accumulatedSalary = valid;
        this.input.currentSalary = valid;
        this.input.currentAge = valid;
        this.input.desiredRetirementAge = valid;
      },
      isNumber: function () {
        let keyCode = event.keyCode;
        let allowedcharacters = keyCode < 48 || keyCode > 57;
        if (allowedcharacters)
          return event.preventDefault();
      },
      formatPrice: function (value) {
        let val = (value / 1).toFixed(2).replace(',', '.');
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      },
  }
};
var app = new Vue(instance);