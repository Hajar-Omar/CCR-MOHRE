
var mainModule = angular.module("MainModule");

mainModule.directive('lineChart', function () {
    function applink($scope, el) {
        // D3.js code for drawing a Donut chart - Start

        //console.log('inside link chart');

        var data = [], data2 = [];

        var el = el[0];

        var datapoints1 = $scope.data[0].servedPerhour.data;
        var datapoints2 = $scope.data[0].enteredPerHour.data;
        var axisesColor = $('html').hasClass('dark-theme') ? "#655e56" : $scope.lay;
        var lineColor = $scope.col;
        var textColor = $('html').hasClass('dark-theme') ? "#958164" : $scope.tex;
        for (var j = 0; j < datapoints1.length; j++) {

            data.push({
                label: datapoints1[j].time,
                y: datapoints1[j].count
            });

        }

        for (var j = 0; j < datapoints2.length; j++) {

            data2.push({
                label: datapoints2[j].time,
                y: datapoints2[j].count
            });

        }

        var LineMarkersChart = new CanvasJS.Chart(el, {
            animationEnabled: true,
            animationDuration: 2500,
            backgroundColor: "transparent",
            axisX: {
                lineColor: axisesColor,
                tickColor: axisesColor,
                labelFontColor: textColor,
                titleFontColor: textColor,
                interval: 1,
                labelAngle: 45
            },
            axisY: {
                lineColor: axisesColor,
                tickColor: "white",
                labelFontColor: textColor,
                titleFontColor: textColor,
                gridColor: axisesColor,
                crosshair: {
                    enabled: true
                }
            },
            data: [{
                type: "line",
                color: lineColor,
                //dataPoints: 
                dataPoints: data
            }, {
                type: "line",
                color: "#6f59d9",
                //dataPoints: 
                dataPoints: data2
            }]

        });
        LineMarkersChart.render();
        $(el[0]).closest('.chart-line').addClass('on-charted');







    }
    return {
        link: applink,
        restrict: 'EA',
        scope: {
            data: '=',
            lay: '=',
            col: '=',
            tex: '='
        }
    }
});
