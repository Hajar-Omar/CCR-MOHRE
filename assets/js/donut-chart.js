


var mainModule = angular.module("MainModule");
mainModule.directive('donutChart', function () {
    function link($scope, el) {
        // D3.js code for drawing a Donut chart - Start

        //console.log('inside donut link');


        var data = [$scope.data[1], $scope.data[0]];
        var color = d3.scale.category10();
        var el = el[0];
        var width = el.clientWidth;
        var height = el.clientHeight || el.offsetHeight;
        var min = Math.min(width, height);
        var pie = d3.layout.pie().sort(null);

        //var arc = d3.svg.arc()
        //  .innerRadius(min / 2 * 0.7)
        //  .outerRadius(min / 2 * 0.9);

        var arc = d3.svg.arc()
          .innerRadius(min / 2 * 0.7)
          .outerRadius(min / 2 * 0.9);


        var arcHover = d3.svg.arc()
           .innerRadius((min / 2 * 0.7))
           .outerRadius((min / 2 * 0.9));

        var svg = d3.select(el).append('svg').attr({
            width: width,
            height: height
        });
        var g = svg.append('g').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

        g.selectAll('path')
          .data(pie(data))
          .enter().append('path')
          .attr('d', arc)
          .attr('class', function (d, i) {
              return (data[i] > 0 ? 'donut-stroke' : '') + ' donut-path donut-class' + i
          });
        //  .on('mouseover', function () {
        //    var _thisPath = this;
        //    //parentNode = _thisPath.parentNode;

        //    //if (_thisPath !== activeSegment) {

        //    activeSegment = _thisPath;

        //    //const dataTexts = d3.selectAll('.data-text')
        //    //.classed('data-text--show', false);

        //    //const paths = d3.selectAll('.donut-path ')
        //    //.transition()
        //    //.duration(250)
        //    //.attr('d', arc);

        //    d3.select(_thisPath)
        //      .transition()
        //      .duration(250)
        //      .attr('stroke-width', "5");


        //    // }


        //}).on('mouseout', function () {
        //    var _thisPath = this;
        //    //parentNode = _thisPath.parentNode;

        //    //if (_thisPath !== activeSegment) {

        //    activeSegment = _thisPath;

        //    //const dataTexts = d3.selectAll('.data-text')
        //    //.classed('data-text--show', false);

        //    //const paths = d3.selectAll('.donut-path ')
        //    //.transition()
        //    //.duration(250)
        //    //.attr('d', arc);

        //    d3.select(_thisPath)
        //      .transition()
        //      .duration(250)
        //      .attr('stroke-width', "0");
        //});

        g.append('text')
        .attr('fill', "#48535b")
        .classed('legend-text', true)
            .style("font", "22px")
        .text(function (d) {
            return parseInt(data[1]);//+ parseInt(data[1]);
        }).attr("transform", function (d) {
            return 'translate(-6 , 5)';
        });
        // End of D3.js code
        $(el).closest('.chart-donut').addClass('on-charted');
    }

    var pieData = [
    { name: 'Running', value: 40, color: '#18FFFF' },
    { name: 'Paused', value: 26, color: '#0288D1' }];
    //bakeDonut(pieData);

    function bakeDonut($scope, el) {
        console.log($scope.data);
        //for (var i = 0; i < $scope.data.length; i++) {
        //    debugger;
        //}
        pieData = [{ name: $scope.data[0], value: $scope.data[1] }];
        let activeSegment;
        const data = pieData;//.sort((a, b) => b['value'] - a['value']);
        //var width = el.clientWidth;
        //var height = el.clientHeight;
        var viewWidth = el[0].clientWidth,
        viewHeight = el[0].clientHeight,
        svgWidth = viewHeight,
        svgHeight = viewHeight,
        thickness = 20,
        //colorArray = data.map(k => k.color),
        el = el[0],// d3.select('body'),
        radius = Math.min(svgWidth, svgHeight) / 2,
        color = d3.scale.ordinal();
        // .range(colorArray);

        const max = d3.max(data, (maxData) => maxData.value);

        const svg = d3.select(el).append('svg')
        .attr('viewBox', "0 0 " + (viewWidth + thickness) + " " + (viewHeight + thickness))
        .attr('class', 'pie')
        .attr('width', viewWidth)
        .attr('height', svgHeight);

        const g = svg.append('g')
        .attr('transform', 'translate(' + (svgWidth / 2) + (thickness / 2) + ',' + (svgHeight / 2) + (thickness / 2) + ')');

        const arc = d3.svg.arc()
        .innerRadius(radius - thickness)
        .outerRadius(radius);

        const arcHover = d3.svg.arc()
        .innerRadius(radius - (thickness + 5))
        .outerRadius(radius + 8);

        const pie = d3.layout.pie()
        .value(function (pieData) { return pieData.value; })
        .sort(null);


        const path = g.selectAll('path')
        //.attr('class', 'data-path')
            .attr('class', function (d, i) {
                return 'data-path donut-path donut-class' + i
            })
        .data(pie(data))
        .enter()
        .append('g')
        .attr('class', 'data-group')
        .each(function (pathData, i) {
            const group = d3.select(this)

            group.append('text')
              .text(pathData.data.value)
              .attr('class', 'data-text data-text__value')
              .attr('text-anchor', 'middle')
              .attr('dy', '1rem')

            group.append('text')
              .text(pathData.data.name)
              .attr('class', 'data-text data-text__name')
              .attr('text-anchor', 'middle')
              .attr('dy', '3.5rem')

            // Set default active segment
            if (pathData.value === max) {
                const textVal = d3.select(this).select('.data-text__value')
                .classed('data-text--show', true);

                const textName = d3.select(this).select('.data-text__name')
                .classed('data-text--show', true);
            }

        })
        .append('path')
        .attr('d', arc)
        .attr('fill', (fillData, i) => color(fillData.data.name))
        .attr('class', function (d, i) {
            return 'data-path donut-path donut-class' + i
        })
        .on('mouseover', function () {
            const _thisPath = this,
                  parentNode = _thisPath.parentNode;

            if (_thisPath !== activeSegment) {

                activeSegment = _thisPath;

                const dataTexts = d3.selectAll('.data-text')
                .classed('data-text--show', false);

                const paths = d3.selectAll('.data-path')
                .transition()
                .duration(250)
                .attr('d', arc);

                d3.select(_thisPath)
                  .transition()
                  .duration(250)
                  .attr('d', arcHover);

                const thisDataValue = d3.select(parentNode).select('.data-text__value')
                .classed('data-text--show', true);
                const thisDataText = d3.select(parentNode).select('.data-text__name')
                .classed('data-text--show', true);
            }


        })
        .each(function (v, i) {
            if (v.value === max) {
                const maxArc = d3.select(this)
                .attr('d', arcHover);
                activeSegment = this;
            }
            this._current = i;
        });

        const legendRectSize = 15;
        const legendSpacing = 10;

        const legend = svg.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function (legendData, i) {
            const itemHeight = legendRectSize + legendSpacing;
            const offset = legendRectSize * color.domain().length;
            const horz = svgWidth + 80;
            const vert = (i * itemHeight) + legendRectSize + (svgHeight - offset) / 2;
            return 'translate(' + horz + ',' + vert + ')';
        });

        legend.append('circle')
          .attr('r', legendRectSize / 2)
          .style('fill', color);

        legend.append('text')
          .attr('x', legendRectSize + legendSpacing)
          .attr('y', legendRectSize - legendSpacing)
          .attr('class', 'legend-text')
          .text((legendData) => legendData);


        $(el).closest('.chart-donut').addClass('on-charted');
    }


    return {
        link: link,
        restrict: 'EA',
        scope: {
            data: '=',
            pie: '='
        }
    }
});

