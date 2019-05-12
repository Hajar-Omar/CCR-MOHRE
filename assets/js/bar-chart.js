


var mainModule = angular.module("MainModule");
mainModule.directive('barChart', function ($timeout) {

    function barchartdraw(scope, el) {
        var data = scope.data[0].data;
        var labels = scope.data[0].labels;


        var data = [];
        var datapoints = scope.data[0];
        for (var j = 0; j < datapoints.length; j++) {

            data.push({
                //name: !scope.lay ? j + 1 + "-" + datapoints[j].name : datapoints[j].name,
                name: datapoints[j].name,
                votes: datapoints[j].served
            })

        }


        //if (d3.max(data.votes) < 5) {

        //    maxy = 5;
        //} else {
        //    maxy = d3.max(data.votes);

        //}
        var colors = ['#1695A3', '#ACF0F2'],
            width = $(el).parent().width(),
            height = $(el).parent().height() - 60,
            padding = 30,
            barWidth = 1,
            outerPadding = 0,
            barPadding = 0;


        var margin = {
            top: 40,
            bottom: 30,
            right: 10,
            left: 10
        };


        var dmax = 0;

        for (var dm = 0; dm < data.length; dm++) {
            if (parseInt(data[dm].votes) > dmax) {
                dmax = parseInt(data[dm].votes);
            }
        }



        var boxWidth = $(el).parent().width(),
            boxHeight = $(el).parent().height(),
            chartWidth = boxWidth - margin.right,
            chartHeight = boxHeight - margin.top - margin.bottom,
            voteMax = d3.max(data, function (d) { return d.votes; });
        var barWidth = (chartWidth - margin.left) / data.length;
        var columnWidth = (chartWidth - margin.left) / data.length >= 50 ? 50 : (chartWidth - margin.left) / data.length;
        var barTranslate = (chartWidth - margin.left) / data.length >= 50 ? ((chartWidth - margin.left) - (data.length * 50)) / (data.length + 1) : 0;
        var barSpacing = (width - margin.left - margin.right - barWidth * data.length) / data.length;

        var xScale = d3.scale.ordinal()
                  .domain(data.map(function (d) { return d.name; }))
                  .rangeRoundBands([0, chartWidth - margin.left], 0);

        var yScale = d3.scale.linear()
                  .domain([0, dmax * 1.1])
                  .range([chartHeight, 0]);

        var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom")
            .ticks(data.length);

        var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left")
            .ticks(data.length);
        var id = el[0].id;
        var svg = d3.select('#' + id).append('svg')
                    .attr('width', chartWidth)
                    .attr('height', boxHeight)
                    .append('g')
                    //.attr('transform', `translate(${margin.left}, ${margin.top})`);
        .attr('transform', "translate(" + margin.left + "," + margin.top + ")");



        svg.append('g')
          .selectAll('.bar')
          .data(data)
          .enter().append('rect')
        .classed('graybar', true)
        .attr('transform', function (d, i) {
            var translateXBy = (barWidth) * i;
            return 'translate(' + translateXBy + ', 0)';
        })
        .attr('width', barWidth)
        .attr('height', function (d) {
            return height - 5;
        });


        svg.append('g')
          .selectAll('.bar')
          .data(data)
          .enter().append('rect')
        .classed('back-graybar', true)
        .attr('x', function (d, i) {
            var translateXBy = barWidth > 50 ? ((barWidth) * i) + barWidth / 2 - 25 : (barWidth) * i + 1;
            return translateXBy;
        })
        .attr("width", barWidth > 50 ? 50 : barWidth - 2)
        .attr('height', function (d) {
            return height - 5;
        });

        svg.append('g')
           .selectAll('.bar')
           .data(data)
           .enter().append('rect')
           .attr("class", function (d, i) {
               return "bar-chart" + (i < 20 ? i : (i % 20))
           })
           .attr('stroke', 'black')
           //.attr("x", function (d) { return xScale(d.name) + 10; })
           //barWidth.attr("width", xScale.rangeBand())
            .attr('x', function (d, i) {
                var translateXBy = barWidth > 50 ? ((barWidth) * i) + barWidth / 2 - 25 : (barWidth) * i + 1;
                return translateXBy;
            })
            .attr("vote", function (d) { return d.votes; })
            .attr("width", barWidth > 50 ? 50 : barWidth - 2)
            .attr("y", height - 5)
            .attr("height", 0)

          .transition()
            .duration(1000)
            .delay(function (d, i) { return i * 250; })
            //.ease('elastic')
            .attr("y", function (d) { return yScale(d.votes) + 5; })
            .attr("height", function (d) { return chartHeight - yScale(d.votes); });

        //var headline = svg.append('text')
        //   .attr('id', "headline")
        //   .text('Who is your favorite Superhero?');
        //var headTag = d3.select('#headline');
        //var middle = boxWidth - 10;
        //headline.attr('x', (middle / 2) - margin.left)
        //headline.attr('y', -15)


        svg.append('g')
           .attr('class', 'x axis')
           //.attr('transform', `translate(0, ${chartHeight + 5})`)
            .attr('transform', "translate(0," + (parseInt(chartHeight) + 5) + ")")
            .style("font", "12px 'Raleway-SemiBold'")
           .call(xAxis)
        .selectAll("text")
    .attr("y", 0)
    .attr("x", 5)
    .attr("dy", ".35em")
    .attr("transform", "rotate(45)")
    .style({ "text-anchor": "start", "font-size": "9px" });

        // svg.append('g')
        //    .attr('class', 'y axis')
        //     .attr('transform', 'translate(0,0)')
        //     .style("font", "12px 'Raleway-SemiBold'")
        //    .call(yAxis);


        //.append('text')
        //.attr('transform', 'rotate(-90)')
        //.attr('y', 6)
        //.attr('dy', '8px')
        //.style("text-anchor", "end")
        //.text("Votes");

        svg.append('g')
          .selectAll('.bar')
          .data(data)
          .enter().append('text')
        .classed('text-graybar', true)
            .attr("transform", "rotate(-90)")
        .attr('x', (height - 50) * -1)
            //.attr("fill","#fff")
            .attr('text-anchor', "middle")
        .attr('y', function (d, i) {
            var translateXBy = ((barWidth) * i) + barWidth / 2;//barWidth > 50 ? ((barWidth) * i) + barWidth / 2 - 25 : (barWidth) * i + 10;
            return translateXBy + 5;
        })
        .text(function (d) { return d.votes; })
        .style({ "font": "12px arial" }).call(xAxis);

        setTimeout(function () {
            $(el[0]).closest('.chart-bar').addClass('on-charted');
        }, 0)



    }
    return {
        link: barchartdraw,
        restrict: 'EA',
        scope: {
            data: '=',
            lay: '=',
            col: '='
        }
    }
});

