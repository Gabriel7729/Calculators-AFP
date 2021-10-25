var instance = {
  el: '#app',
  data: {
      accumulatedSalary: null,
      currentSalary: null,
      currentAge: null,
      gender: "M",
      desiredRetirementAge: null,
      extraPercentageSaved: null,
      tab: {
        calculate: true,
        results: false,
        importantInformation: false
      },
      messageErrors: false,
      result: {
        constitutiveAmountRetirementDate: null,
        constitutiveAmountDateOfRetirementVoluntaryContributions: null,
        lastSalary: null,
        monthlyPensionAmount: null,
        monthlyPensionAmountVoluntaryContributions: null,
        replacementRate: null,
        replacementRateVoluntaryContributions: null
      },
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
      this.messageErrors = true;

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
      this.messageErrors = false;
      this.resetInputValidations(removeErrors);
      if(!this.messageErrors) return false;
      return true;
    }
  },
  methods: {  
      calculatePension: function (validation) {
        if (!validation){
          this.showResultsOfPensionCalculator(1200);
        }
      },
      reCalculate: function () {
        this.tab.calculate = true;
        this.tab.results = false;
        this.cleanFields();
      },
      showMessageValidation: function(message){
        return message;
      },
      showResultsOfPensionCalculator: function(apiResult) {
        this.result.constitutiveAmountRetirementDate = apiResult;
        this.result.constitutiveAmountDateOfRetirementVoluntaryContributions = apiResult;
        this.result.lastSalary = apiResult;
        this.result.monthlyPensionAmount = apiResult;
        this.result.monthlyPensionAmountVoluntaryContributions = apiResult;
        this.result.replacementRate = apiResult;
        this.result.replacementRateVoluntaryContributions = apiResult;
        this.showTabResults();
      },
      showTabResults: function () {
        this.tab.calculate = false;
        this.tab.results = true;
      },
      cleanFields: function () {
        this.accumulatedSalary = null;
        this.currentSalary = null;
        this.currentAge = null;
        this.gender = "M";
        this.desiredRetirementAge = null;
        this.extraPercentageSaved = null;
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