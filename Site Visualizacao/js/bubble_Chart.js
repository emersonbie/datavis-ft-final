
      // Bubble Chart
      var bubbleChart = dc.bubbleChart('#bubbleChart_Client1');


      d3.json("Data_Analysis_Client1.json", function(error, data) {


        //criando um crossfilter
        var facts = crossfilter(data);

         //Dimensão para o bubble
        var bubbleDim = facts.dimension(function(d){
            return [d.Qnt_TC_Release, d.Qnt_Bugs, d.Qnt_Bugs_Client, d.Release, d.Project];
        });


        //Retorna valores das variáveis
        var bubbleGroup = bubbleDim.group().reduceCount();


        //Bubble chart
        bubbleChart
        .width(1200)
        .height(400)
        .margins({top: 10, right: 50, bottom: 30, left: 60})
        .dimension(bubbleDim)
        .group(bubbleGroup)
        .keyAccessor(function (p) {
            return p.key[0];
        })
        .valueAccessor(function (p) {
           return p.key[1];
        })
        .radiusValueAccessor(function (p) {
           return (Math.floor((p.key[2] / 2)) + 1);
        })
        .x(d3.scale.linear().domain([0, 1700]))
        .y(d3.scale.linear().domain([0, 70]))
        .r(d3.scale.linear().domain([0, 100]))
        .minRadiusWithLabel(1000)
        .yAxisPadding(100)
        .xAxisPadding(200)
        .maxBubbleRelativeSize(0.07)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .renderLabel(true)
        .renderTitle(true)
        .yAxisLabel("Quantidade de Bugs")
        .xAxisLabel("Quantidade de Casos de Teste")
        .title(function (p) {
              return "TC por release: " + p.key[0] + "\n"
              + "Bugs de desenvolvimento: " + p.key[1] + "\n"
              + "Bugs do Cliente: " + p.key[2] + "\n"
              + "Release: " + p.key[3] + "\n"
              + "Projeto: " + p.key[4];
           });


        dc.renderAll();

  });
