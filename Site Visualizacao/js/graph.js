
      // Chart quantidade de releases por projeto
      var barChartReleases_Projeto = dc.barChart('#chartReleases_Projeto');

      // Chart Bugs por release de um determinado projeto
      var barChartBugs_Projeto = dc.barChart('#chartBugs_Projeto');
      // Gráfico para quantidade de casos de teste por release
      var barChartTC_Projeto = dc.barChart('#chartTC_Release');
      // Gráfico de linha para quantidade de casos de teste x bugs por release
      var tcBugReleaseChart = dc.compositeChart('#chartTC_Bug_Release');

      // Gráfico de barras com DRE por projeto
      var dreProjectChart = dc.barChart('#chartDRE_Project');

      // Gráfico de barras com DRE por release
      var dreReleaseChart = dc.barChart('#chartDRE_Release');

      // Gráfico de horas estimadas x reais por release
      var compositeHorasReleaseChart = dc.compositeChart('#chartHoras_Release');

      //Mapear bugs total por projetos
      var totalBugs = d3.map();
      var releaseByProject = d3.map();

      d3.json("Data_Analysis.json", function(error, data) {

        var dtgFormat = d3.time.format("%d/%m/%Y");

        data.forEach(function(d) {
              //Date
              d.Release_Date = dtgFormat.parse(d.Release_Date);
              //Bugs Sum
              if(totalBugs.has(d.Project)){
                totalBugs.set(d.Project, totalBugs.get(d.Project) + d.Qnt_Bugs + d.Qnt_Bugs_Client);
              }else{
                totalBugs.set(d.Project, d.Qnt_Bugs + d.Qnt_Bugs_Client);
              }
              //Release by Project
              if(releaseByProject.has(d.Project)){
                var array=releaseByProject.get(d.Project);
                array.push(d.Release);
                releaseByProject.set(d.Project,array);
              }else{
                releaseByProject.set(d.Project,[d.Release]);
              }

        });

        console.log(releaseByProject);
        //criando um crossfilter
        var facts = crossfilter(data);

        //Dimensão para projetos
        var projectDim = facts.dimension(function(d){
              return d.Project;
        });

        //Dimensão para Release
        var releaseDim = facts.dimension(function(d){
              return d.Release;
        });

        //Dimensão para Data da Release
        var dateDim = facts.dimension(function(d){
              return d.Release_Date;
        });

        //Retorna soma de releases por projeto
        var releaseByProjectGroup = projectDim.group().reduceSum(function(d){
          return d.Release;
        });

        //Retorna a soma de bugs por projeto
        var bugsByProjeto = projectDim.group().reduceSum(function(d){
              return d.Qnt_Bugs;
        });

        //Retorna DRE por projeto
        var dreByProjectGroup = projectDim.group().reduceSum(function(d){
          // console.log(d.Qnt_Bugs + "x" + totalBugs.get(d.Project));
          // console.log();
           return (d.Qnt_Bugs/totalBugs.get(d.Project) * 100);
        });

        //Retorna DRE por release - funcionando
        var dreByReleaseGroup = releaseDim.group().reduceSum(function(d){
          return (d.Qnt_Bugs/(d.Qnt_Bugs + d.Qnt_Bugs_Client));
        });

        //Retorna qnt de bugs de dev por data da release
        var bugsByDateReleaseGroup = dateDim.group().reduceSum(function(d){
          return d.Qnt_Bugs;
        });

        //Retorna qnt de casos de teste por data da release
        var tcByDateReleaseGroup = dateDim.group().reduceSum(function(d){
          return d.Qnt_TC_Release;
        });

        //Retorna qnt de bugs por release
        var bugsByReleaseGroup = releaseDim.group().reduceSum(function(d){
          return d.Qnt_Bugs;
        });

        //Retorna qnt de casos de teste por release
        var tcByReleaseGroup = releaseDim.group().reduceSum(function(d){
          return d.Qnt_TC_Release;
        });

        //Retorna horas estimadas release
        var horasEstimadaReleaseGroup = dateDim.group().reduceSum(function(d){
          return d.Tempo_Estimado;
        });

        //Retorna horas reais release
        var horasReaisReleaseGroup = dateDim.group().reduceSum(function(d){
          return d.Tempo_Real;
        });

        //Gráfico quantidade de releases por projeto
        barChartReleases_Projeto
          .width(900).height(300)
          .margins({top: 10, right: 10, bottom: 50, left: 50})
          .dimension(projectDim)
          .x(d3.scale.ordinal())
          .xUnits(dc.units.ordinal)
          .barPadding(0.2)
          .group(releaseByProjectGroup)
          .yAxisLabel("Qnt Releases")
          .xAxisLabel("Projetos")


        //Gráfico de barras com Bugs por projeto
        barChartBugs_Projeto
          .width(900).height(300)
          .margins({top: 10, right: 10, bottom: 50, left: 50})
          .dimension(projectDim)
          .x(d3.scale.ordinal())
          .xUnits(dc.units.ordinal)
          .barPadding(0.2)
          .group(bugsByProjeto)
          .yAxisLabel("Qnt Bugs")
          .xAxisLabel("Projetos")
          .elasticY(true)
          .elasticX(true)
          .on("filtered", function(chart,filter){
               console.log(releaseByProject.get(filter));
              // barChartTC_Projeto
              //   .x(d3.scale.ordinal().domain(releaseByProject.get(filter)))
              //   .render();
              releaseDim = facts.dimension(function(d){
                return (releaseByProject.get(filter).indexOf(d.Release)>-1) ? d.Release : null;
              });
              tcByReleaseGroup = releaseDim.group().reduceSum(function(d){
                return d.Qnt_TC_Release;
              });
              barChartTC_Projeto
                .width(500).height(300)
                .margins({top: 10, right: 10, bottom: 50, left: 50})
                .dimension(releaseDim)
                .x(d3.scale.ordinal())
                .xUnits(dc.units.ordinal)
                .barPadding(0.2)
                .group(tcByReleaseGroup)
                .yAxisLabel("Qnt Casos de Testes")
                .xAxisLabel("Releases")
                .elasticX(true)
                .render();
            });



        //Gráfico de barras com Casos de teste por Release
        barChartTC_Projeto
          .width(2000).height(300)
          .margins({top: 10, right: 10, bottom: 50, left: 50})
          .dimension(releaseDim)
          .x(d3.scale.ordinal())
          .xUnits(dc.units.ordinal)
          .barPadding(0.2)
          .group(tcByReleaseGroup)
          .yAxisLabel("Qnt Casos de Testes")
          .xAxisLabel("Releases")
          .elasticX(true)


/*          .on("filtered", function(chart,filter){
              console.log(JSON.stringify(filter));
          });
*/

        // Composite chart com a linha de TC x Bugs por release de todos os projetos
      tcBugReleaseChart
           .width(1200)
           .height(400)
           .margins({top: 50, right: 50, bottom: 25, left: 40})
           .dimension(dateDim)
           .x(d3.time.scale().domain([new Date(2017, 1, 01), new Date(2017, 12, 31)]))
           .xUnits(d3.time.days)
           .renderHorizontalGridLines(true)
           .legend(dc.legend().x(1000).y(5).itemHeight(13).gap(5))
           .brushOn(false)
           .compose([
              dc.lineChart(tcBugReleaseChart)
                        .group(bugsByDateReleaseGroup, 'Bugs')
                        .ordinalColors(['steelblue']),
              dc.lineChart(tcBugReleaseChart)
                        .group(tcByDateReleaseGroup, 'Casos de Teste')
                        .ordinalColors(['darkorange'])]);

        //Gráfico de barras com DRE (Qnt de bugs encontrados pelo time de testes/ bugs total)
        dreProjectChart
          .width(1200).height(400)
          .margins({top: 10, right: 10, bottom: 50, left: 50})
          .dimension(projectDim)
          .x(d3.scale.ordinal())
          .xUnits(dc.units.ordinal)
          .barPadding(0.2)
          .group(dreByProjectGroup)
          .yAxisLabel("DRE")
          .xAxisLabel("Projetos")

          //Gráfico de barras com DRE (Qnt de bugs encontrados pelo time de testes/ bugs total)
          dreReleaseChart
            .width(1200).height(400)
            .margins({top: 10, right: 10, bottom: 50, left: 50})
            .dimension(releaseDim)
            .x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .barPadding(0.2)
            .group(dreByReleaseGroup)
            .yAxisLabel("DRE")
            .xAxisLabel("Releases")

        // Composite chart com a horas estimadas X reais
        compositeHorasReleaseChart
             .width(1200)
             .height(400)
             .margins({top: 50, right: 50, bottom: 25, left: 40})
             .dimension(dateDim)
             .x(d3.time.scale().domain([new Date(2017, 1, 01), new Date(2017, 12, 31)]))
             .xUnits(d3.time.days)
             .renderHorizontalGridLines(true)
             .legend(dc.legend().x(1000).y(5).itemHeight(13).gap(5))
             .brushOn(false)
             .compose([
             dc.lineChart(compositeHorasReleaseChart)
               .group(horasEstimadaReleaseGroup, 'Horas Estimadas')
               .ordinalColors(['steelblue']),
            dc.lineChart(compositeHorasReleaseChart)
               .group(horasReaisReleaseGroup, 'Horas Reais')
               .ordinalColors(['darkorange'])]);


          //Gráfico de Horas estimadas por release
/*            horasEstimadasReleaseChart
            .width(1200).height(400)
            .margins({top: 10, right: 10, bottom: 50, left: 50})
            .dimension(releaseDim)
            .x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .barPadding(0.2)
            .group(horasEstimadaReleaseGroup)
            .yAxisLabel("Horas")
            .xAxisLabel("Release")

          //Gráfico de Horas estimadas por release
          horasReaisReleaseChart
            .width(1200).height(400)
            .margins({top: 10, right: 10, bottom: 50, left: 50})
            .dimension(releaseDim)
            .x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .barPadding(0.2)
            .group(horasReaisReleaseGroup)
            .yAxisLabel("Horas")
            .xAxisLabel("Release")
*/



        dc.renderAll();

  });
