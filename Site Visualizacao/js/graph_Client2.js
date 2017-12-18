// Chart TC por projeto
var barChartTC_Projeto_Client2 = dc.barChart('#chartTC_Projeto_Client2');

// Chart Bugs por projeto
var barChartBugs_Projeto_Client2 = dc.barChart('#chartBugs_Projeto_Client2');

// Gráfico de barras com DRE por projeto
var dreProjectChart_Client2 = dc.barChart('#chartDRE_Project_Client2');

// Gráfico para quantidade de casos de teste por release
var barChartTC_Release_Client2 = dc.barChart('#chartTC_Release_Client2');

// Gráfico para quantidade de casos de teste por release
var barChartBugs_Release_Client2 = dc.barChart('#chartBugs_Release_Client2');

// Gráfico de barras com DRE por release
var dreReleaseChart_Client2 = dc.barChart('#chartDRE_Release_Client2');

// Gráfico de horas estimadas x reais por release
var compositeHorasReleaseChart_Client2 = dc.compositeChart('#chartHoras_Release_Client2');

// Gráfico de Casos de teste x Bugs
var scatterChart_Client2 = dc.scatterPlot('#scatterChart_Client2');

// Gráfico de linha para quantidade de casos de teste x bugs por release
//var tcBugReleaseChart = dc.compositeChart('#chartTC_Bug_Release');

//Mapear bugs total por projetos
var totalBugs = d3.map();
var releaseByProject = d3.map();

//MApear quantidade de casos de teste por projeto
var totalTCs = d3.map();

d3.json("Data_Analysis_Client2.json", function(error, data) {

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

  //console.log(releaseByProject);
  function remove_empty_bins(source_group) {
    return {
        all:function () {
            return source_group.all().filter(function(d) {
                return d.value != 0;
            });
        }
    };
  }

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

  //Dimensão para o scatter
  var scatterDim = facts.dimension(function(d){
        return [d.Qnt_TC_Release, d.Qnt_Bugs];
  });


  //Retorna qnt de casos de teste por release
  var tcByReleaseGroup = releaseDim.group().reduceSum(function(d){
    return d.Qnt_TC_Release;
  });

  //Retorna a soma de bugs por release
  var bugsByReleaseGroup = releaseDim.group().reduceSum(function(d){
        return d.Qnt_Bugs;
  });

  //Retorna DRE por release
  var dreByReleaseGroup = releaseDim.group().reduceSum(function(d){
    return (d.Qnt_Bugs/(d.Qnt_Bugs + d.Qnt_Bugs_Client));
  });

  //Retorna horas estimadas release
  var horasEstimadaReleaseGroup = dateDim.group().reduceSum(function(d){
    return d.Tempo_Estimado;
  });

  //Retorna horas reais release
  var horasReaisReleaseGroup = dateDim.group().reduceSum(function(d){
    return d.Tempo_Real;
  });

  var nonEmptyBarTC_Release = remove_empty_bins(tcByReleaseGroup);
  //var nonEmptyHoras_Est = remove_empty_bins(horasEstimadaReleaseGroup);
  //var nonEmptyHoras_Reais = remove_empty_bins(horasReaisReleaseGroup);

  //Retorna a quantidade de TCs por projeto
  var tcByProjeto = projectDim.group().reduceSum(function(d){
        console.log(totalTCs.get(d.Project));
        if(totalTCs.has(d.Project))
          return 0;
        else{
          totalTCs.set(d.Project, d.Project);
          return d.Qnt_TC_SW;
        }
  });

  //Retorna a soma de bugs por projeto
  var bugsByProjeto = projectDim.group().reduceSum(function(d){
        return d.Qnt_Bugs;
  });

  //Retorna DRE por projeto
  var dreByProjectGroup = projectDim.group().reduceSum(function(d){
     return (d.Qnt_Bugs/totalBugs.get(d.Project) * 100);
  });

  //Retorna quantidade de bugs por cliente
  var bugsClientScatter = scatterDim.group().reduceSum(function(d){
     return d.Qnt_Bugs_Client;
  });



  //Retorna qnt de casos de teste por data da release
  //var tcByDateReleaseGroup = dateDim.group().reduceSum(function(d){
  //  return d.Qnt_TC_Release;
  //});

  //Retorna qnt de bugs de dev por data da release
  //var bugsByDateReleaseGroup = dateDim.group().reduceSum(function(d){
  //  return d.Qnt_Bugs;
  //});

//<-- Gráficos -->

//<-- Gráficos Projetos -->
  //Gráfico de barras com Bugs por projeto
  barChartTC_Projeto_Client2
  .width(600).height(300)
  .margins({top: 10, right: 10, bottom: 50, left: 50})
  .dimension(projectDim)
  .x(d3.scale.ordinal())
  .xUnits(dc.units.ordinal)
  .barPadding(0.2)
  .group(tcByProjeto)
  .yAxisLabel("Qnt de casos de teste")
  .xAxisLabel("Projetos")
  .elasticY(true)
  .elasticX(true)
  .controlsUseVisibility(true)
  .on("filtered", function(chart,filter){
       console.log(releaseByProject.get(filter));
       updateRelease(chart,filter);
     });

  //Gráfico de barras com Bugs por projeto
  barChartBugs_Projeto_Client2
    .width(600).height(300)
    .margins({top: 10, right: 10, bottom: 50, left: 50})
    .dimension(projectDim)
    .x(d3.scale.ordinal())
    .xUnits(dc.units.ordinal)
    .barPadding(0.2)
    .group(bugsByProjeto)
    .yAxisLabel("Qnt Bugs")
    .xAxisLabel("Projetos")
    .elasticX(true)
    .on("filtered", function(chart,filter){
         console.log(releaseByProject.get(filter));
         updateRelease(chart,filter);
          });

  //Gráfico de barras com DRE (Qnt de bugs encontrados pelo time de testes/ bugs total)
  dreProjectChart_Client2
    .width(600).height(300)
    .margins({top: 10, right: 10, bottom: 50, left: 50})
    .dimension(projectDim)
    .x(d3.scale.ordinal())
    .xUnits(dc.units.ordinal)
    .barPadding(0.2)
    .group(dreByProjectGroup)
    .yAxisLabel("DRE")
    .xAxisLabel("Projetos")
    .on("filtered", function(chart,filter){
         console.log(releaseByProject.get(filter));
         updateRelease(chart,filter);
    });

    //Scatter
    scatterChart_Client2
    .width(600).height(300)
    .margins({top: 10, right: 10, bottom: 50, left: 50})
    .dimension(releaseDim)
    .x(d3.scale.linear().domain([0,800]))
    .brushOn(false)
    .symbolSize(8)
    .clipPadding(10)
    .yAxisLabel("Quantidade de Bugs")
    .xAxisLabel("Quantidade de Casos de Teste")   
    .dimension(scatterDim)
    .group(bugsClientScatter)

//<-- Gráficos Releases -->

  //Gráfico de barras com Casos de teste por Release
  barChartTC_Release_Client2
    .width(600).height(300)
    .margins({top: 10, right: 10, bottom: 50, left: 50})
    .dimension(releaseDim)
    .x(d3.scale.ordinal())
    .xUnits(dc.units.ordinal)
    .barPadding(0.2)
    .group(tcByReleaseGroup)
    .yAxisLabel("Qnt Casos de Testes")
    .xAxisLabel("Releases")
    .elasticX(true)

  //Gráfico de barras com Casos de teste por Release
  barChartBugs_Release_Client2
    .width(600).height(300)
    .margins({top: 10, right: 10, bottom: 50, left: 50})
    .dimension(releaseDim)
    .x(d3.scale.ordinal())
    .xUnits(dc.units.ordinal)
    .barPadding(0.2)
    .group(bugsByReleaseGroup)
    .yAxisLabel("Quantidade de Bugs")
    .xAxisLabel("Releases")
    .elasticX(true)

  //Gráfico de barras com DRE (Qnt de bugs encontrados pelo time de testes/ bugs total)
  dreReleaseChart_Client2
    .width(600).height(300)
    .margins({top: 10, right: 10, bottom: 50, left: 50})
    .dimension(releaseDim)
    .x(d3.scale.ordinal())
    .xUnits(dc.units.ordinal)
    .barPadding(0.2)
    .group(dreByReleaseGroup)
    .yAxisLabel("DRE")
    .xAxisLabel("Releases")

  // Composite chart com a horas estimadas X reais
  compositeHorasReleaseChart_Client2
    .width(700)
    .height(300)
    .margins({top: 50, right: 50, bottom: 25, left: 40})
    .dimension(dateDim)
    .x(d3.time.scale().domain([new Date(2017, 1, 01), new Date(2017, 12, 31)]))
    .xUnits(d3.time.days)
    .renderHorizontalGridLines(true)
    .legend(dc.legend().x(550).y(1).itemHeight(13).gap(5))
    .brushOn(false)
    .compose([
    dc.lineChart(compositeHorasReleaseChart_Client2)
    .group(horasEstimadaReleaseGroup, 'Horas Estimadas')
    .ordinalColors(['steelblue']),
    dc.lineChart(compositeHorasReleaseChart_Client2)
    .group(horasReaisReleaseGroup, 'Horas Reais')
    .ordinalColors(['darkorange'])]);

  function updateRelease(chart,filter){
    releaseDim = facts.dimension(function(d){
      //var array=releaseByProject.get(filter);
      //array.push(filter);
      //releaseByProject.set(d.Project,array);
      var cont = 0;
      //d.Release = "";
      console.log("Old Release: " + d.Release);
      for(var i=0; i< releaseByProject.get(filter).length; i++) {
        d.Release[i] += releaseByProject.get(filter)[i];
      }
      console.log("New Release: " + d.Release);
      console.log("releaseByProject: "+releaseByProject.get(filter)[0]);
      console.log("index: " +releaseByProject.get(filter).indexOf(d.Release));
      console.log("size: " +releaseByProject.get(filter).length);
      console.log((releaseByProject.get(filter).indexOf(d.Release)>-1) ? d.Release : null);
      //if(releaseByProject.get(filter).indexOf(d.Release)<releaseByProject.get(filter).length) {
        console.log("release: " + d.Release);
        //if(cont <= d.releaseByProject.get(filter).length)
          //return d.releaseByProject.get(filter)[cont++];
          return d.Release;
      //}
      //return (releaseByProject.get(filter).indexOf(d.Release)>-1) ? d.Release : null;
    });

    tcByReleaseGroup = releaseDim.group().reduceSum(function(d){
      return d.Qnt_TC_Release;
    });

    bugsByReleaseGroup = releaseDim.group().reduceSum(function(d){
      return d.Qnt_Bugs;
    });

    dreByReleaseGroup = releaseDim.group().reduceSum(function(d){
      return (d.Qnt_Bugs/(d.Qnt_Bugs + d.Qnt_Bugs_Client));
    });

    var nonEmptyBugs_Release = remove_empty_bins(bugsByReleaseGroup);
    var nonEmptyDRE_Release = remove_empty_bins(dreByReleaseGroup);

    console.log("teste:" + releaseByProject.get(filter));

    barChartTC_Release_Client2
      .width(600).height(300)
      .margins({top: 10, right: 10, bottom: 50, left: 50})
      .dimension(releaseDim)
      .x(d3.scale.ordinal().domain(["",releaseByProject.get(filter)]))
      .xUnits(dc.units.ordinal)
      .barPadding(0.2)
      .group(nonEmptyBarTC_Release)
      .yAxisLabel("Qnt Casos de Testes")
      .xAxisLabel("Releases")
      .elasticX(true);

      //Gráfico de barras com Casos de teste por Release
      barChartBugs_Release_Client2
        .width(600).height(300)
        .margins({top: 10, right: 10, bottom: 50, left: 50})
        .dimension(releaseDim)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .barPadding(0.2)
        .group(nonEmptyBugs_Release)
        .yAxisLabel("Quantidade de Bugs")
        .xAxisLabel("Releases")
        .elasticX(true);

      //Gráfico de barras com DRE (Qnt de bugs encontrados pelo time de testes/ bugs total)
      dreReleaseChart_Client2
        .width(600).height(300)
        .margins({top: 10, right: 10, bottom: 50, left: 50})
        .dimension(releaseDim)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .barPadding(0.2)
        .group(nonEmptyDRE_Release)
        .yAxisLabel("DRE")
        .xAxisLabel("Releases");


        dc.renderAll();
  }

  dc.renderAll();

});
