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
      inputErrorValidation: false,
      pension: {
          resultContributionAccount: 0,
      },
      totalResult: 0,
  },
  computed: {
    validateField: function (){
      let showErrors = true;

      if(!this.accumulatedSalary || this.accumulatedSalary <= 0){
        return this.showMessageValidation("Debe digitar el monto acumulado.", showErrors);
      }

      if(!this.currentSalary || this.currentSalary <= 0){
        return this.showMessageValidation("Debe digitar su salario actual.", showErrors);
      }
      
      if(!this.currentAge || this.currentAge <= 0 || this.currentAge > 110){
        return this.showMessageValidation("Debe digitar su edad actual entre 18 y 110 años.", showErrors);
      }
      if(this.currentAge < 18){
        return this.showMessageValidation("Su edad actual no puede ser menor de 18 años.", showErrors);
      }

      if(!this.desiredRetirementAge || this.desiredRetirementAge <= 0){
        return this.showMessageValidation("Debe digitar su edad de retiro.", showErrors);
      }
      if(this.desiredRetirementAge < 55){
        return this.showMessageValidation("La edad de retiro no debe ser menor a 55 años.", showErrors);
      }
      if(this.desiredRetirementAge > 110){
        return this.showMessageValidation("La edad de retiro no debe ser mayor a 110 años.", showErrors);
      }
      if(this.currentAge > this.desiredRetirementAge){
        return this.showMessageValidation("Su edad actual no puede ser mayor que su edad de retiro.", showErrors);
      }
      showErrors = false;
      return this.showMessageValidation("", showErrors);
    }
  },
  methods: {  
      calculatePension: function () {
        if (!this.validationCompleted) {
          this.messageErrors = true;
        }
        console.log(this.validationCompleted);
      },
      showMessageValidation: function(message, validation){
        this.messageErrors = validation;
        this.inputErrorValidation = validation;
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