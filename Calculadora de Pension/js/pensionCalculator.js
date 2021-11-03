var instanceCalculator = {
  el: '#calculator',
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
        TasaIntReal: 0.05000,
        SalMinCoti: 11826.0000,
        PMT: 0.01000,
        PctApoCCI: 0.08000,
        NumPagosMensPension: 13,
      }
  },
  methods: {  
      getUserProvidedVariables: function () {
        let userProvidedParams = {
          CciAcumulado: (this.accumulatedCCI * 1000),
          SalarioActual: (this.currentSalary * 1000),
          EdadActual: this.currentAge,
          Genero: this.gender,
          EdadRetiro: this.desiredRetirementAge,
          PorcentajeMesRetiro: (this.extraPercentageSaved / 100)
        };
        return userProvidedParams;
      },
      getCalculatedVars: function () {
        var VFMontoCCIp, VPApoCCI, VFApoCCI, VFSumApoCCI, VPApoVol, VFApoVol, VFSumApoVol, UltSal;

        //
        VFSumApoCCI = 0;
        VFSumApoVol = 0;
        UltSal = 0;

        var userVars = this.getUserProvidedVariables();

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
      var VFMontoCCI, VFMontoCCIApoVol, UltSalAfil, MontoPension, MontoPensionVol, TasaReemplazo, TasaReemplazoVol;

      var calculatedVars = this.getCalculatedVars();

      var userVars = this.getUserProvidedVariables();

      // Se determina el Monto Constitutivo a la Fecha de Retiro 
      VFMontoCCI = calculatedVars.VFMontoCCIp + calculatedVars.VFSumApoCCI;

      //Se determina el Monto Constitutivo a la Fecha de Retiro con Aportes Voluntarios
      VFMontoCCIApoVol = VFMontoCCI + calculatedVars.VFSumApoVol;

      UltSalAfil = calculatedVars.UltSal;

      MontoPension = this.calculatePension(userVars.Genero, this.fixedVariables.TasaIntReal, userVars.EdadActual, userVars.EdadRetiro, VFMontoCCI);

      MontoPensionVol = this.calculatePension(userVars.Genero, this.fixedVariables.TasaIntReal, userVars.EdadActual, userVars.EdadRetiro, VFMontoCCIApoVol);

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
  calculatePension: function (genero, tasaIntReal, edadActual, edadRetiro, vfMontoCCI) {
    var _local6 = 100000 /* 0x0186A0 */;
    var _local9 = 0;
    var _local4 = 0;
    var _local10 = 0;
    var _local11 = 0;
    var _local15 = 0;
    var _local13 = [];
    var _local7 = [];
    var _local12 = [];

    var _local1;
    _local1 = 15;
    while (_local1 <= 110) {
        var _local5;

        var factorDictionary = genero == "M" ? maleFactors : femaleFactors;

        _local5 = factorDictionary[_local1];

        _local9 = _local5 * (_local6 / 1000);
        _local7[_local1] = _local6 * Math.pow(1 + tasaIntReal, _local1 * -1);
        _local13[_local1] = _local6;
        _local6 = _local6 - _local9;
        _local1++;
    }
    var _local3;
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
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  },
}
};
var calculator = new Vue(instanceCalculator);