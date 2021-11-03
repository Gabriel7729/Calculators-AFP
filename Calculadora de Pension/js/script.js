var instance = {
  el: '#app',
  data: {
      accumulatedCCI: null,
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
        accumulatedCCI: false,
        currentSalary: false,
        currentAge: false,
        desiredRetirementAge: false
      },
      totalResult: 0,
      factor: 0,
      fixedVariables: {
        TasaIntReal: 8.5,
        SalMinCoti: 0,
        PMT: 3.5,
        PctApoCCI: 3.5,
        NumPagosMensPension: 3.5,
      },
      maleFactors: [],
      femaleFactors: [],
  },
  computed: {
    validateField: function (){
      let showErrors = true;
      let removeErrors = false;
      this.messageErrors = true;

      if(this.accumulatedCCI <= 0){
        this.resetInputValidations(removeErrors);
        this.input.accumulatedCCI = showErrors;
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
        // let afpFundsCalc = this.getOutputVariables(); 
        if (!validation){
          alert("Debe ingresar todos los campos requeridos.");
          this.getOutputVariables();
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
      showResultsOfPensionCalculator: function(VFMontoCCI, VFMontoCCIApoVol, UltSalAfil, MontoPension, MontoPensionVol, TasaReemplazo, TasaReemplazoVol) {
        this.result.constitutiveAmountRetirementDate = (this.addCommas(this.formatNumber(VFMontoCCI)));
        this.result.constitutiveAmountDateOfRetirementVoluntaryContributions = (this.addCommas(this.formatNumber(VFMontoCCIApoVol)));
        this.result.lastSalary = (this.addCommas(this.formatNumber(UltSalAfil)));
        this.result.monthlyPensionAmount = (this.addCommas(this.formatNumber(MontoPension)));
        this.result.monthlyPensionAmountVoluntaryContributions = (this.addCommas(this.formatNumber(MontoPensionVol)));
        this.result.replacementRate = (this.formatNumber(TasaReemplazo * 100) + '%');
        this.result.replacementRateVoluntaryContributions = (this.formatNumber(TasaReemplazoVol * 100) + '%');

        this.showTabResults();
      },
      showTabResults: function () {
        this.tab.calculate = false;
        this.tab.results = true;
      },
      cleanFields: function () {
        this.accumulatedCCI = null;
        this.currentSalary = null;
        this.currentAge = null;
        this.gender = "M";
        this.desiredRetirementAge = null;
        this.extraPercentageSaved = null;
      },
      resetInputValidations: function (valid) {
        this.input.accumulatedCCI = valid;
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
      getUserProvidedVariables: function () {
        let userProvidedParams = {
          CciAcumulado: parseFloat((this.accumulatedCCI).toString().replace(/\,/g, "")),
          SalarioActual: parseFloat((this.currentSalary).toString().replace(/\,/g, "")),
          EdadActual: parseInt(this.currentAge),
          Genero: this.gender,
          EdadRetiro: parseInt(this.desiredRetirementAge),
          PorcentajeMesRetiro: (this.extraPercentageSaved / 100)
        };
        return userProvidedParams;
      },
      getCalculatedVars: function () {
        let VFMontoCCIp, VPApoCCI, VFApoCCI, VFSumApoCCI, VPApoVol, VFApoVol, VFSumApoVol, UltSal;

        //
        VFSumApoCCI = 0;
        VFSumApoVol = 0;
        UltSal = 0;

        let userVars = this.getUserProvidedVariables();

        // Se calcula el valor futuro del saldo actual de la CCI
        VFMontoCCIp = userVars.CciAcumulado * (Math.pow((Math.pow((1 + this.fixedVariables.TasaIntReal), (1 / 12))), ((userVars.EdadRetiro - userVars.EdadActual) * 12)));

        if (userVars.EdadActual < userVars.EdadRetiro) {
            // Se calcula el salario cotizable en cada año
            for (var i = userVars.EdadActual; i <= (userVars.EdadRetiro - 1); i++) {
                var SalMaxCot, SalAfiliado;

                // Se calcula el salario máximo cotizable en cada año
                //SalMaxCot = (20 * fixedVariables.SalMinCoti) * ((1 +  fixedVariables.PMT) ^ (i - userVars.EdadActual));
                SalMaxCot = (20 * this.fixedVariables.SalMinCoti) * Math.pow(1 + this.fixedVariables.PMT, i - userVars.EdadActual);

                // Se calcula el salario cotizable en cada año
                //SalAfiliado = userVars.SalarioActual * ((1 + fixedVariables.PMT) ^ (i - userVars.EdadActual));
                SalAfiliado = userVars.SalarioActual * Math.pow(1 + this.fixedVariables.PMT, i - userVars.EdadActual);

                // Para los 12 meses del año proyecto el aporte de cada año.
                for (var j = 0; j <= 11; j++) {
                    VPApoCCI = this.getVPApoCCI(SalAfiliado, SalMaxCot);

                    // Se calcula el valor futuro del aporte (presente) a la fecha de retiro
                    //VFApoCCI = VPApoCCI * (((1 + this.fixedVariables.TasaIntReal) ^ (1 / 12)) ^ (((userVars.EdadRetiro - i) * 12) - j));
                    VFApoCCI = VPApoCCI * (Math.pow((Math.pow((1 + this.fixedVariables.TasaIntReal), (1 / 12))), (((userVars.EdadRetiro - i) * 12) - j)));

                    // Acumula el valor futuro del aporte (presente)
                    VFSumApoCCI += VFApoCCI;

                    // Calcula el valor presente del aporte voluntario
                    VPApoVol = SalAfiliado * userVars.PorcentajeMesRetiro;

                    // Calcula el valor futuro del aporte voluntario (presente) a la fecha de retiro.
                    // VFApoVol = VPApoVol * (((1 + fixedVariables.TasaIntReal) ^ (1/12)) ^ (((userVars.EdadRetiro - i) * 12) - j));
                    VFApoVol = VPApoVol * (Math.pow((Math.pow((1 + this.fixedVariables.TasaIntReal), (1 / 12))), (((userVars.EdadRetiro - i) * 12) - j)));

                    // Acumula el valor futuro del aporte voluntario (presente)
                    VFSumApoVol += VFApoVol;
                }
                //console.log((1 + fixedVariables.PMT) ^ (i - userVars.EdadActual));

                UltSal = SalAfiliado;
            }

            //console.log(i);
        } else {
            UltSal = userVars.SalarioActual;
        }

        return { VFMontoCCIp: VFMontoCCIp, UltSal: UltSal, VFSumApoCCI: VFSumApoCCI, VFSumApoVol: VFSumApoVol };
    },

    formatNumber: function(number) {
      return Math.round(number * 100) / 100;
    },

    getOutputVariables: function () {
      let VFMontoCCI, VFMontoCCIApoVol, UltSalAfil, MontoPension, MontoPensionVol, TasaReemplazo, TasaReemplazoVol;
      
      let calculatedVars = this.getCalculatedVars();

      let userVars = this.getUserProvidedVariables();

      // Se determina el Monto Constitutivo a la Fecha de Retiro 
      VFMontoCCI = calculatedVars.VFMontoCCIp + calculatedVars.VFSumApoCCI;

      //Se determina el Monto Constitutivo a la Fecha de Retiro con Aportes Voluntarios
      VFMontoCCIApoVol = VFMontoCCI + calculatedVars.VFSumApoVol;

      UltSalAfil = calculatedVars.UltSal;

      MontoPension = this.calculatePensionValues(userVars.Genero, this.fixedVariables.TasaIntReal, userVars.EdadActual, userVars.EdadRetiro, VFMontoCCI);

      MontoPensionVol = this.calculatePensionValues(userVars.Genero, this.fixedVariables.TasaIntReal, userVars.EdadActual, userVars.EdadRetiro, VFMontoCCIApoVol);

      TasaReemplazo = (MontoPension * this.fixedVariables.NumPagosMensPension) / (UltSalAfil * 12);

      TasaReemplazoVol = (MontoPensionVol * this.fixedVariables.NumPagosMensPension) / (UltSalAfil * 12);

      this.showResultsOfPensionCalculator(VFMontoCCI, VFMontoCCIApoVol, UltSalAfil, MontoPension, MontoPensionVol, TasaReemplazo, TasaReemplazoVol);
      // $('#VFMontoCCI').text(this.addCommas(this.formatNumber(VFMontoCCI)));
      // $('#VFMontoCCIVol').text(this.addCommas(this.formatNumber(VFMontoCCIApoVol)));
      // $('#UltiSalAfil').text(this.addCommas(this.formatNumber(UltSalAfil)));
      // $('#MontoPension').text(this.addCommas(this.formatNumber(MontoPension)));
      // $('#MontoPensionVol').text(this.addCommas(this.formatNumber(MontoPensionVol)));
      // $('#TasaReemplazo').text(this.formatNumber(TasaReemplazo*100));
      // $('#TasaReemplazoVol').text(this.formatNumber(TasaReemplazoVol*100));

      return {
          VFMontoCCI: VFMontoCCI,
          VFMontoCCIVol: VFMontoCCIApoVol,
          UltiSalAfil: UltSalAfil,
          MontoPension: MontoPension,
          MontoPensionVol: MontoPensionVol,
          TasaReemplazo: TasaReemplazo,
          TasaReemplazoVol: TasaReemplazoVol
      };
  },
  getVPApoCCI: function (salAfiliado, salMaxCot) {
    if (salAfiliado < salMaxCot) {
        return salAfiliado * this.fixedVariables.PctApoCCI;
    } else {
        return salMaxCot * this.fixedVariables.PctApoCCI;
    }
  },
  calculatePensionValues: function (genero, tasaIntReal, edadActual, edadRetiro, monto) {
    let maleFactors = [];
    let femaleFactors = [];

    maleFactors[100] = 299.212000
    maleFactors[101] = 323.481300
    maleFactors[102] = 349.227400
    maleFactors[103] = 376.439400
    maleFactors[104] = 405.083100
    maleFactors[105] = 435.097100
    maleFactors[106] = 466.388500
    maleFactors[107] = 498.829800
    maleFactors[108] = 532.255200
    maleFactors[109] = 566.458400
    maleFactors[110] = 1000.000000
    maleFactors[15] = 0.596300
    maleFactors[16] = 0.721900
    maleFactors[17] = 0.861100
    maleFactors[18] = 1.001400
    maleFactors[19] = 1.120300
    maleFactors[20] = 1.214200
    maleFactors[21] = 1.295100
    maleFactors[22] = 1.375900
    maleFactors[23] = 1.453600
    maleFactors[24] = 1.522900
    maleFactors[25] = 1.580700
    maleFactors[26] = 1.627100
    maleFactors[27] = 1.661800
    maleFactors[28] = 1.687800
    maleFactors[29] = 1.709600
    maleFactors[30] = 1.732300
    maleFactors[31] = 1.760900
    maleFactors[32] = 1.798800
    maleFactors[33] = 1.849600
    maleFactors[34] = 1.914700
    maleFactors[35] = 1.991000
    maleFactors[36] = 2.071200
    maleFactors[37] = 2.149100
    maleFactors[38] = 2.223000
    maleFactors[39] = 2.294900
    maleFactors[40] = 2.372300
    maleFactors[41] = 2.466400
    maleFactors[42] = 2.588000
    maleFactors[43] = 2.743700
    maleFactors[44] = 2.933000
    maleFactors[45] = 3.151700
    maleFactors[46] = 3.394100
    maleFactors[47] = 3.655600
    maleFactors[48] = 3.935900
    maleFactors[49] = 4.238900
    maleFactors[50] = 4.571100
    maleFactors[51] = 4.939900
    maleFactors[52] = 5.351100
    maleFactors[53] = 5.807600
    maleFactors[54] = 6.309800
    maleFactors[55] = 6.857800
    maleFactors[56] = 7.452700
    maleFactors[57] = 8.096900
    maleFactors[58] = 8.794000
    maleFactors[59] = 9.549000
    maleFactors[60] = 10.369300
    maleFactors[61] = 11.265300
    maleFactors[62] = 12.247900
    maleFactors[63] = 13.328400
    maleFactors[64] = 14.517800
    maleFactors[65] = 15.827100
    maleFactors[66] = 17.267600
    maleFactors[67] = 18.850000
    maleFactors[68] = 20.583500
    maleFactors[69] = 22.475100
    maleFactors[70] = 24.529600
    maleFactors[71] = 26.750400
    maleFactors[72] = 29.139400
    maleFactors[73] = 31.697500
    maleFactors[74] = 34.424300
    maleFactors[75] = 37.317900
    maleFactors[76] = 40.375600
    maleFactors[77] = 43.593200
    maleFactors[78] = 46.965700
    maleFactors[79] = 50.487400
    maleFactors[80] = 54.152600
    maleFactors[81] = 59.152400
    maleFactors[82] = 64.610000
    maleFactors[83] = 70.565000
    maleFactors[84] = 77.060100
    maleFactors[85] = 84.140900
    maleFactors[86] = 91.856000
    maleFactors[87] = 100.257000
    maleFactors[88] = 109.398500
    maleFactors[89] = 119.337800
    maleFactors[90] = 130.135000
    maleFactors[91] = 141.852200
    maleFactors[92] = 154.553600
    maleFactors[93] = 168.304400
    maleFactors[94] = 183.170500
    maleFactors[95] = 199.216900
    maleFactors[96] = 216.507000
    maleFactors[97] = 235.100700
    maleFactors[98] = 255.052800
    maleFactors[99] = 276.410800
    femaleFactors[100] = 279.294900
    femaleFactors[101] = 309.486500
    femaleFactors[102] = 342.279400
    femaleFactors[103] = 377.699900
    femaleFactors[104] = 415.713700
    femaleFactors[105] = 456.208700
    femaleFactors[106] = 498.979100
    femaleFactors[107] = 543.709000
    femaleFactors[108] = 589.959000
    femaleFactors[109] = 637.158100
    femaleFactors[110] = 1000.000000
    femaleFactors[15] = 0.360000
    femaleFactors[16] = 0.394900
    femaleFactors[17] = 0.423900
    femaleFactors[18] = 0.443600
    femaleFactors[19] = 0.450600
    femaleFactors[20] = 0.452900
    femaleFactors[21] = 0.394400
    femaleFactors[22] = 0.360100
    femaleFactors[23] = 0.349500
    femaleFactors[24] = 0.361800
    femaleFactors[25] = 0.394200
    femaleFactors[26] = 0.440600
    femaleFactors[27] = 0.493600
    femaleFactors[28] = 0.546800
    femaleFactors[29] = 0.597000
    femaleFactors[30] = 0.644000
    femaleFactors[31] = 0.689000
    femaleFactors[32] = 0.733000
    femaleFactors[33] = 0.777000
    femaleFactors[34] = 0.823100
    femaleFactors[35] = 0.873900
    femaleFactors[36] = 0.930900
    femaleFactors[37] = 0.994400
    femaleFactors[38] = 1.064500
    femaleFactors[39] = 1.141600
    femaleFactors[40] = 1.226200
    femaleFactors[41] = 1.319900
    femaleFactors[42] = 1.424400
    femaleFactors[43] = 1.541300
    femaleFactors[44] = 1.671300
    femaleFactors[45] = 1.814300
    femaleFactors[46] = 1.969400
    femaleFactors[47] = 2.135900
    femaleFactors[48] = 2.314200
    femaleFactors[49] = 2.505700
    femaleFactors[50] = 2.711100
    femaleFactors[51] = 2.931300
    femaleFactors[52] = 3.167200
    femaleFactors[53] = 3.420300
    femaleFactors[54] = 3.691600
    femaleFactors[55] = 3.982700
    femaleFactors[56] = 4.294200
    femaleFactors[57] = 4.626300
    femaleFactors[58] = 4.978900
    femaleFactors[59] = 5.352200
    femaleFactors[60] = 5.747300
    femaleFactors[61] = 6.166500
    femaleFactors[62] = 6.613700
    femaleFactors[63] = 7.094400
    femaleFactors[64] = 7.615500
    femaleFactors[65] = 8.184800
    femaleFactors[66] = 8.810300
    femaleFactors[67] = 9.500400
    femaleFactors[68] = 10.263600
    femaleFactors[69] = 11.108600
    femaleFactors[70] = 12.043900
    femaleFactors[71] = 13.077600
    femaleFactors[72] = 14.217400
    femaleFactors[73] = 15.470300
    femaleFactors[74] = 16.842700
    femaleFactors[75] = 18.340400
    femaleFactors[76] = 20.406900
    femaleFactors[77] = 22.716700
    femaleFactors[78] = 25.299200
    femaleFactors[79] = 28.187500
    femaleFactors[80] = 31.418300
    femaleFactors[81] = 35.033000
    femaleFactors[82] = 39.077600
    femaleFactors[83] = 43.603800
    femaleFactors[84] = 48.668800
    femaleFactors[85] = 54.336600
    femaleFactors[86] = 60.677800
    femaleFactors[87] = 67.771000
    femaleFactors[88] = 75.702700
    femaleFactors[89] = 84.567900
    femaleFactors[90] = 94.470700
    femaleFactors[91] = 105.524300
    femaleFactors[92] = 117.851200
    femaleFactors[93] = 131.582800
    femaleFactors[94] = 146.858600
    femaleFactors[95] = 163.825100
    femaleFactors[96] = 182.633600
    femaleFactors[97] = 203.437700
    femaleFactors[98] = 226.388900
    femaleFactors[99] = 251.631300
    let _local6 = 100000 /* 0x0186A0 */;
    let _local9 = 0;
    let _local4 = 0;
    let _local10 = 0;
    let _local11 = 0;
    let _local15 = 0;
    let _local13 = [];
    let _local7 = [];
    let _local12 = [];

    let _local1;
    _local1 = 15;
    while (_local1 <= 110) {
      let _local5;

      let factorDictionary = genero == "M" ? maleFactors : femaleFactors;

        _local5 = factorDictionary[_local1];

        _local9 = _local5 * (_local6 / 1000);
        _local7[_local1] = _local6 * Math.pow(1 + tasaIntReal, _local1 * -1);
        _local13[_local1] = _local6;
        _local6 = _local6 - _local9;
        _local1++;
    }
    let _local3;
    _local1 = 15;
    while (_local1 <= 110) {
        _local4 = 0;
        _local3 = _local1;
        while (_local3 <= 110) {
            _local4 = _local4 + _local7[_local3];
            _local3++;
        }
        _local10 = _local4 / _local7[_local1];
        _local11 = _local10 - 0.461538461538462;
        _local12[_local1] = _local11;
        _local1++;
    }
    return ((monto / _local12[edadRetiro]) / 13);
  },

  addCommas: function (nStr){
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    let rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  },
}
};
var app = new Vue(instance);