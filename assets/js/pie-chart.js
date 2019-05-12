


var mainModule = angular.module("MainModule");
mainModule.directive('pieChart', function ($timeout) {
    function golink(scope, el) {
        // D3.js code for drawing a Donut chart - Start


        //console.log('inside pie link');


        var data = scope.data;
        var color = d3.scale.category10();
        var el = el[0];
        var width = el.clientWidth;
        var height = el.clientHeight || el.offsetHeight;
        var min = Math.min(width, height);
        var pie = d3.layout.pie().sort(null);
        
        var arc = d3.svg.arc()
          //.innerRadius(min / 2 * 0.7)
          .outerRadius(min / 2 * 0.9);
        var svg = d3.select(el).append('svg').attr({
            width: width,
            height: height
        });
        var g = svg.append('g').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

        g.selectAll('path')
          .data(pie(data))
          .enter().append('path')
          .attr('d', arc)
            .attr('stroke', '2')
            .attr('stroke-width', '2')
          .attr('class', function (d, i) {
              return 'pie-class' + i
          });

        //g.append('text')
        //.attr('fill', "#48535b")
        //.classed('legend-text', true)
        //    .style("font", "22px 'Raleway-SemiBold'")
        //.text(function (d) {
        //    return parseInt(data[0]) + parseInt(data[1]);
        //}).attr("transform", function (d) {
        //    return 'translate(-6 , 5)';
        //});
        // End of D3.js code
        $(el).closest('.chart-donut').addClass('on-charted');
    }
    return {
        link: golink,
        restrict: 'EA',
        scope: {
            data: '=',
            lay: '=',
            col: '='
        }
    }
});

