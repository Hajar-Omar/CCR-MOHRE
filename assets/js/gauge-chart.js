var gauge = function (container, configuration) {
    var that = {};
    var isLtr = $('body').attr('dir') == 'ltr';
    var config = {
        size: 200,
        clipWidth: 200,
        clipHeight: 110,
        ringInset: 20,
        ringWidth: 20,

        pointerWidth: 10,
        pointerTailLength: 5,
        pointerHeadLengthPercent: 0.8,

        minValue: 0,
        maxValue: 10,

        minAngle: !isLtr ? 90 : -90,
        maxAngle: !isLtr ? -90 : 90,

        transitionMs: 750,

        majorTicks: 5,
        labelFormat: d3.format(',g'),
        labelInset: 10,

        arcColorFn: d3.interpolateHsl(d3.rgb('#FF0000'), d3.rgb('#00FF00'), d3.rgb('#000000')),
        green: 1,
        amber: 1,
        red: 1
    };
    var range = undefined;
    var r = undefined;
    var pointerHeadLength = undefined;
    var value = 0;

    var svg = undefined;
    var arc = undefined;
    var scale = undefined;
    var ticks = undefined;
    var tickData = undefined;
    var pointer = undefined;

    var donut = d3.layout.pie();

    function deg2rad(deg) {
        return deg * Math.PI / 180;
    }

    function newAngle(d) {
        var ratio = scale(d);
        var newAngle = config.minAngle + (ratio * range);
        return newAngle;
    }

    function configure(configuration) {
        var prop = undefined;
        for (prop in configuration) {
            config[prop] = configuration[prop];
        }

        range = config.maxAngle - config.minAngle;
        r = config.size / 2;
        pointerHeadLength = Math.round(r * config.pointerHeadLengthPercent);

        // a linear scale that maps domain values to a percent from 0..1
        scale = d3.scale.linear()
			.range([0, 1])
			.domain([config.minValue, config.maxValue]);

        ticks = scale.ticks(config.majorTicks);
        tickData = d3.range(config.majorTicks).map(function () { return 1 / config.majorTicks; });

        arc = d3.svg.arc()
			.innerRadius(r - config.ringWidth - config.ringInset)
			.outerRadius(r - config.ringInset)
			.startAngle(function (d, i) {
			    var ratio = d * i;
			    return deg2rad(config.minAngle + (ratio * range));
			})
			.endAngle(function (d, i) {
			    var ratio = d * (i + 1);
			    return deg2rad(config.minAngle + (ratio * range));
			});
    }
    that.configure = configure;

    function centerTranslation() {
        return 'translate(' + r + ',' + r + ')';
    }

    function isRendered() {
        return (svg !== undefined);
    }
    that.isRendered = isRendered;
    var index = 0;
    function render(newValue) {
        index++;
        svg = d3.select(container)
			.append('svg:svg')
				.attr('class', 'gauge')
				.attr('width', config.clipWidth)
				.attr('height', config.clipHeight);

        var centerTx = centerTranslation();

        var arcs = svg.append('g')
				.attr('class', 'arc')
				.attr('transform', centerTx);

        arcs.selectAll('path')
				.data(tickData)
			.enter().append('path')
            .attr('class', 'gauge-class')
				.attr('class', function (d, i) {
				    //return config.arcColorFn(d * i);
				    var mj = config.majorTicks;

				    if (i <= config.green - 1) {
				        return 'gauge-class' + 0
				    }

				    else if (i - config.green <= config.amber - 1) {
				        return 'gauge-class' + 1
				    }

				    else if (i - config.amber - config.green <= config.red - 1) {
				        return 'gauge-class' + 2
				    }

				    //return 'gauge-class' + i
				})
				.attr('d', arc);

        var lg = svg.append('g')
				.attr('class', 'grad-label')
				.attr('transform', centerTx);
        lg.selectAll('text')
				.data(ticks)
			.enter().append('text')
				.attr('transform', function (d, i) {
				    var ratio = scale(d);
				    var newAngle = config.minAngle + (ratio * range);
				    if (i == 3) {
				        return 'rotate(' + newAngle + ') translate(-15,' + (config.labelInset - r) + ')';
				    }
				    else {
				        return 'rotate(' + newAngle + ') translate(0,' + (config.labelInset - r) + ')';
				    }

				})
				.text(config.labelFormat);


        var lineData = [[config.pointerWidth / 2, 0],
						[0, -pointerHeadLength],
						[-(config.pointerWidth / 2), 0],
						[0, config.pointerTailLength],
						[config.pointerWidth / 2, 0]];
        var pointerLine = d3.svg.line().interpolate('monotone');
        var pg = svg.append('g').data([lineData])
				.attr('class', 'pointer')
				.attr('transform', centerTx);

        pointer = pg.append('path')
			.attr('d', pointerLine/*function(d) { return pointerLine(d) +'Z';}*/)
			.attr('transform', 'rotate(' + config.minAngle + ')')
        .attr('stroke', '#ffffff')
        update(newValue === undefined ? 0 : newValue);
        svg.append('text').attr('class', 'tooltip--')
            .attr('x', '-7')
            .attr('y', '30')
            .attr('width', 100)
        .attr('transform', centerTx)
            .style({ "font": "14px 'arial'", "text-align": "center", "direction": (isLtr ? "ltr" : "rtl") })
        .attr('fill', '#888888')
            .attr('text-anchor', "middle")
        .text(parseFloat(newValue).toFixed(0) + (isLtr ? " Min" : " دقيقة"));

    }
    that.render = render;

    function update(newValue, newConfiguration) {

        if (newConfiguration !== undefined) {
            configure(newConfiguration);
        }
        var ratio = scale(newValue);
        var newAngle = config.minAngle + (ratio * range);


        if (newValue > config.maxValue) {
            newAngle = isLtr ? 90 : -90;
        }

        pointer.transition()
			.duration(config.transitionMs)
			.ease('elastic')
			.attr('transform', 'rotate(' + newAngle + ')');
        var tooltip = d3.select('.tooltip--');


        //tooltip.text(5 + " min");
    }
    that.update = update;

    configure(configuration);

    return that;
};

var twitterGauge = new gauge('#twitterGauge', {
    size: 300,
    clipWidth: 300,
    clipHeight: 300,
    ringWidth: 60,
    maxValue: 10,
    transitionMs: 4000,
});
twitterGauge.render();

var fbGauge = new gauge('#fbGauge', {
    size: 300,
    clipWidth: 300,
    clipHeight: 300,
    ringWidth: 60,
    maxValue: 10,
    transitionMs: 4000,
});
fbGauge.render();

//function updateReadings() {
//    // just pump in random data here...
//    twitterGauge.update(Math.random() * 10);
//    fbGauge.update(Math.random() * 10);
//}

// every few seconds update reading values
//updateReadings();
//setInterval(function () {
//    updateReadings();
//}, 5 * 1000);

function showTooltip(evt) {
    var tooltip = d3.select('.tooltip');
    tooltip.attr('x', evt.clientX - 8);
    tooltip.attr('y', evt.clientY - 5);
    tooltip.attr('visibility', 'visible');
}

function hideTooltip() {
    var tooltip = d3.select('.tooltip');
    tooltip.attr('visibility', 'hidden');
}