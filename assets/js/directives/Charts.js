//solid Gauge chart
angular.module('MainModule').directive('solidGauge', function () {


    return {
      restrict: 'E',
      scope: {
        id: '@',
        color:'@',
        name:'@',
        y:'@'
       // data: '='
      },
      link: function (scope, element) {
        //scope.gaugeOptions.chart.renderTo = element[0];
        // var pieChatVals = [];
        // for (var index = 0; index < scope.data.length; index++) {
        //   pieChatVals.push({
        //     name: scope.data[index].label,
        //     y: scope.data[index].value,
        //     color: "#ffdddd"
        //   });
        // }
        // scope.$watch('y','fill',true,function(){

        // })
        //  if (!scope.y) {
        //     return;
        // }

        Highcharts.chart(scope.id, {
      
            chart: {
                type: 'solidgauge',
                height: '100%'
            },
            // title: {
            //     text: y + '%',
            //     style: {
            //         fontSize: '12px'
            //     }
            title: {
                text: '',
                style: {
                    fontSize: '0'
                }
            },
            tooltip: {
                valueSuffix: '%'
            },
            // tooltip: {
            //     borderWidth: 0,
            //     backgroundColor: 'none',
            //     shadow: false,
            //     style: {
            //         fontSize: '16px'
            //     },
            //     pointFormat: '{series.name}<br><span style="font-size:2em; color: {point.color}; font-weight: bold">{point.y}%</span>',
            //     positioner: function (labelWidth) {
            //         return {
            //             x: (this.chart.chartWidth - labelWidth) / 2,
            //             y: (this.chart.plotHeight / 2) + 15
            //         };
            //     }
            // },

            pane: {
                startAngle: 0,
                endAngle: 360,
                background: [{ // Track for Move
                    outerRadius: '112%',
                    innerRadius: '88%',
                    backgroundColor: Highcharts.Color(Highcharts.getOptions().colors[0])
                        .setOpacity(0.3)
                        .get(),
                    borderWidth: 0
                }]
            },

            yAxis: {
                min: 0,
                max: 100,
                lineWidth: 0,
                tickPositions: []
            },

            plotOptions: {
                solidgauge: {
                    dataLabels: {
                        enabled: false
                    }
                    // dataLabels: {
                    //     borderWidth :0 ,
                    //     style: {
                    //         fontSize: "14px"
                    //     },
                    //     formatter: function () {
                    //         // display only if larger than 1
                    //         // return this.y > 1 ? '<b>' + this.point.name + ':</b> ' + this.y + '%' ;
                    //         return '<span class="HCLbl">' + this.point.y + '%</span>' ;
                    //     },
                    //     y: -43,
                    //     zIndex: 999
                    // }
                }
            },

            series: [{
                name: scope.name,
                data: [{
                    color: scope.color,
                    radius: '112%',
                    innerRadius: '88%',
                    y: Number(scope.y)
                }]
            }]
        })

      }
    };
  });