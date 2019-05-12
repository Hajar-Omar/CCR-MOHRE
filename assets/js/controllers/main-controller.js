/*!
 * fastshell
 * Fiercely quick and opinionated front-ends
 * https://HosseinKarami.github.io/fastshell
 * @author Hossein Karami
 * @version 1.0.5
 * Copyright 2018. MIT licensed.
 */
/// <reference path="../vendor/angular.min.js" />
/// <reference path="../plugins/highcharts.js" />



//(function () {
var countdownInterval;
var mainModule = angular.module('MainModule');
var loadController = 0;
var intervalDuration = 300000;



var MainController = function (scope, http, api, timeout, interval, $q, $filter, $compile, $rootScope) {

    // //close opened side menu
    // $('header .nav-icon.float-l.toggle-open').removeClass('open');
    // $('header .left-menu').removeClass('open');
    // alert()




    //if (loadController === 0) {

    var httpRequestCanceller;

    function cancelRequestOnBroadcastEvent() {

        if (httpRequestCanceller) {
            // Time out the in-process $http request, abandoning its callback listener.
            httpRequestCanceller.resolve();
        }
    }


    // loadController++;

    scope.error = null;
    scope.loading = null;
    scope.noData = null;
    scope.model = {
        selectedDepartment: null,
        selectedEmirate: null,
        selectedBranch: null,
        selectedCounter: null
    };


    //DONE: remove scope.filter = {}

    scope.graphSettings = [];

    //DONE: REMOVE scope.selectDepartment = departmentsList;


    //DONE: remove updateSelected method

    //scope.$watch(function () {

    //});


    //load all emirates on-load
    var loadGraphSettings = function () {

        api.getGraphSettings().then(function (data) {
            timeout(function () {
                scope.$apply(function () {
                    scope.graphSettings = {
                        waiting: data[0],
                        transac: data[1]
                    };
                });
            }, 0);
        }, function () {
            scope.error = "Graph Settings Error";
        });
    };

    //DONE: REMOVE load depratment method
    //DONE: REMOVE loadEmirates method
    //DONE: REMOVE loadBranches method




    //get counters per branch
    scope.loadCounters = function (branchID, e) {

        scope.loadingCounters = true;
        scope.counters = null;
        scope.filter.counter = null;
        var elem = $(e.target.closest('.filter-item'));
        $('.filter-panel.branches .filter-item').removeClass('active');
        $(elem).addClass('active');
        timeout(function () {
            api.getCounters(branchID).then(function (data) {
                timeout(function () {
                    scope.$apply(function () {
                        scope.counters = {
                            data: data,
                            mesage: "Select from Emirates and Branches to Display Counters",
                            error: "Counters Error Found!",
                            empty: "No Counters Found in This Branch!"
                        };
                        //scope.loadingCounters = null;

                    });
                });
            }, function () {
                scope.error = "error";
            });
        }, 400);

    };

    //get Waiting Time
    scope.loadWaitingTime = function (e, m, b) {
        console.log("dep        " + scope.filter.department);

        var elem = null;
        if (e) {
            elem = $(e.target.closest('.pile'));
            $(elem).addClass('chart-loading').find('.chart-gauge').removeClass('on-charted');
        }
        var await = null;
        scope.waitingTime = null;
        if (m) {
            if (b) {
                await = function () {
                    return api.getWaitingTime(m, b);
                };
            }
            else {
                await = function () {
                    return api.getWaitingTime(m);
                };
            }
        }
        else {
            if (scope.filter.emirate) {

                if (scope.filter.emirate && scope.filter.branch) {
                    await = function () {
                        return api.getWaitingTime(scope.filter.emirate.branchPrefix, scope.filter.branch.id);
                    };
                }
                else {
                    await = function () {
                        return api.getWaitingTime(scope.filter.emirate.branchPrefix);
                    };
                }

            }

            else {
                await = function () {
                    return api.getWaitingTime();
                };

            }
        }


        await().then(function (data) {
            timeout(function () {
                scope.$apply(function () {
                    scope.waitingTime = null;
                    scope.waitingTime = {
                        data: data.avgWattingTime,
                        status: data.statusWtt,
                        error: data == null || data.error ? true : false,
                        empty: data == 0 ? true : false
                    };
                    drawGauge('power-gauge-waiting', scope.waitingTime.data, scope.graphSettings.waiting);
                    drawGauge('power-gauge-waiting2', scope.waitingTime.data, scope.graphSettings.waiting);
                    $('.chart-avgWait').parents('.pile').removeClass('chart-loading');

                });
            });
        });

    };

    //get Transaction Time
    scope.loadTransactionTime = function (e, m, b) {
        var elem = null;
        scope.transactionTime = null;
        if (e) {
            elem = $(e.target.closest('.pile'));
            $(elem).addClass('chart-loading').find('.chart-gauge').removeClass('on-charted');
        }
        else {
            //$('.pile').addClass('chart-loading').find('.chart-gauge').removeClass('on-charted')
        }
        var await = null;
        if (m) {
            if (b) {
                await = function () {
                    return api.getTransactionTime(m, b);
                };
            }
            else {
                await = function () {
                    return api.getTransactionTime(m);
                };
            }

        }
        else {
            if (scope.filter.emirate) {

                if (scope.filter.emirate && scope.filter.branch) {
                    await = function () {
                        return api.getTransactionTime(scope.filter.emirate.branchPrefix, scope.filter.branch.id);
                    };
                }
                else {
                    await = function () {
                        return api.getTransactionTime(scope.filter.emirate.branchPrefix);
                    };
                }

            }

            else {
                await = function () {
                    return api.getTransactionTime()
                }

            }
        }


        await().then(function (data) {
            timeout(function () {
                scope.$apply(function () {
                    scope.transactionTime = null;

                    scope.transactionTime = {
                        data: data.avgTransactionTime,
                        status: data.statusTrt,
                        error: data == null || data.error ? true : false,
                        empty: data == 0 ? true : false
                    };
                    drawGauge('power-gauge-transaction', scope.transactionTime.data, scope.graphSettings.transac);
                    drawGauge('power-gauge-transaction2', scope.transactionTime.data, scope.graphSettings.transac);
                    $(elem).removeClass('chart-loading');
                    $('.chart-trans').parents('.pile').removeClass('chart-loading');
                });
            });
        });

    }

    //get counter Status
    scope.loadCounterStatus = function (e, m, b) {


        var elem = null;
        scope.counterStatus = null, scope.donutCharts = null;
        if (e) {
            elem = $(e.target.closest('.pile'));
            $(elem).addClass('chart-loading').find('.chart-donut').removeClass('on-charted');
        }
        else {
            //$('.pile').addClass('chart-loading').find('.chart-donut').removeClass('on-charted')
        }

        var status = null;
        if (m) {
            if (b) {
                status = function () {
                    return api.getCounterStatus(m, b);
                }
            }
            else {
                status = function () {
                    return api.getCounterStatus(m);
                }
            }
        }
        else {
            if (scope.filter.emirate) {

                if (scope.filter.emirate && scope.filter.branch) {
                    status = function () {
                        return api.getCounterStatus(scope.filter.emirate.branchPrefix, scope.filter.branch.id);
                    }
                }
                else {
                    status = function () {
                        return api.getCounterStatus(scope.filter.emirate.branchPrefix);
                    }
                }

            }

            else {
                status = function () {
                    return api.getCounterStatus()
                }

            }
        }


        status().then(function (data) {
            timeout(function () {
                scope.$apply(function () {
                    scope.counterStatus = null, scope.donutCharts = null;
                    scope.counterStatus = {
                        data: data,
                        error: data == null || data.error ? true : false,
                        empty: data.noofOpenCounter == 0 && data.noOfClosedCounter == 0 ? true : false
                    };
                    //scope.charts = [scope.counterStatus.data.noofOpenCounter, scope.counterStatus.data.noOfClosedCounter];
                    scope.donutCharts = {
                        data: [[scope.counterStatus.data.noofOpenCounter, scope.counterStatus.data.noOfClosedCounter]],
                        open: scope.counterStatus.data.noofOpenCounter,
                        closed: scope.counterStatus.data.noOfClosedCounter

                    };
                    $(elem).removeClass('chart-loading').find('.chart-donut').addClass('on-charted');
                    $('.chart-donut').parents('.pile').removeClass('chart-loading');

                });
            });
        });

    }

    //get customer Status
    scope.loadCustomerStatus = function (e, m, b) {


        var elem = null;
        scope.customerStatus = null, scope.pieCharts = null;
        if (e) {
            elem = $(e.target.closest('.pile'));
            $(elem).addClass('chart-loading').find('.chart-pie').removeClass('on-charted');
        }
        else {
            //$('.pile').addClass('chart-loading').find('.chart-pie').removeClass('on-charted')
        }

        var status = null;
        if (m) {
            if (b) {
                status = function () {
                    return api.getCustomerStatus(m, b);
                }
            }
            else {
                status = function () {
                    return api.getCustomerStatus(m);
                }
            }
        }
        else {
            if (scope.filter.emirate) {

                if (scope.filter.emirate && scope.filter.branch) {
                    status = function () {
                        return api.getCustomerStatus(scope.filter.emirate.branchPrefix, scope.filter.branch.id);
                    }
                }
                else {
                    status = function () {
                        return api.getCustomerStatus(scope.filter.emirate.branchPrefix);
                    }
                }

            }

            else {
                status = function () {
                    return api.getCustomerStatus()
                }

            }
        }


        status().then(function (data) {
            timeout(function () {
                scope.$apply(function () {
                    scope.customerStatus = null, scope.pieCharts = null;
                    scope.customerStatus = {
                        data: data,
                        error: data == null || data.error ? true : false,
                        empty: data.served == 0 && data.waiting == 0 && data.noShow == 0 ? true : false
                    };
                    //scope.charts = [scope.counterStatus.data.noofOpenCounter, scope.counterStatus.data.noOfClosedCounter];

                    scope.pieCharts = {
                        data: [[scope.customerStatus.data.served, scope.customerStatus.data.waiting, scope.customerStatus.data.noShow]],
                        total: scope.customerStatus.data.served,
                        waiting: scope.customerStatus.data.waiting,
                        noShow: scope.customerStatus.data.noShow
                    };
                    $(elem).removeClass('chart-loading').find('.chart-pie').addClass('on-charted');
                    $('.chart-pie').parents('.pile').removeClass('chart-loading');
                });
            });
        });

    }

    //get served-per-hour
    //scope.ServedPeriod = { en: ['month', 'week', 'day'], ar: ['شهر', 'اسبوع', 'يوم'] };
    scope.ServedPeriod = [{ en: 'month', ar: 'شهر' }, { en: 'week', ar: 'اسبوع' }, { en: 'day', ar: 'يوم' }];
    scope.lineCartConfig = {
        duration: "day"
    }
    scope.lineConfig = {
        lay: "#d9d9d9",
        col: "#8ec2a7",
        tex: "#4e535a"
    }
    scope.loadTransactionsPerHour = function (e, m, b) {


        var elem = null;
        scope.lineCharts = null, scope.lineChartsTable = [];
        if (e) {
            elem = $(e.target.closest('.pile'));
            $(elem).addClass('chart-loading').find('.chart-line').removeClass('on-charted');
        }
        else {
            //$('.pile').addClass('chart-loading').find('.chart-line').removeClass('on-charted')
        }

        var served = null;
        if (m) {
            if (b) {
                served = function () {
                    return api.getTransactionsPerHour(scope.lineCartConfig.duration, m, b);
                }
            }
            else {
                served = function () {
                    return api.getTransactionsPerHour(scope.lineCartConfig.duration, m);
                }
            }
        }
        else {
            if (scope.filter.emirate) {

                if (scope.filter.emirate && scope.filter.branch) {
                    served = function () {
                        return api.getTransactionsPerHour(scope.lineCartConfig.duration, scope.filter.emirate.branchPrefix, scope.filter.branch.id);
                    }
                }
                else {
                    served = function () {
                        return api.getTransactionsPerHour(scope.lineCartConfig.duration, scope.filter.emirate.branchPrefix);
                    }
                }

            }

            else {
                served = function () {
                    return api.getTransactionsPerHour(scope.lineCartConfig.duration);
                }

            }
        }

        served().then(function (data) {
            timeout(function () {
                scope.$apply(function () {
                    scope.lineCharts = null, scope.lineChartsTable = [];

                    var sLength = 0;

                    scope.lineChartsTable = [data.enteredPerHour, data.servedPerhour, data.noShowPerhour];
                    scope.lineCharts = {
                        data: [[data]],
                        error: data == null || data.error ? true : false,
                        empty: null
                    };
                    $('.chart-line').addClass('on-charted');
                    $('.chart-line').parents('.pile').removeClass('chart-loading');

                });
            });
        });

    }


    scope.loadTransactionsPerHourDetails = function (e, m, b) {

        scope.ch_data = false;
        scope.id_appear = false;
        var elem = null;
        scope.lineChartsDetails = null, scope.TransPerHourTable = [];
        if (e) {
            elem = $(e.target.closest('.pile'));
            $(elem).addClass('chart-loading').find('.chart-line').removeClass('on-charted');
        }
        else {
            //$('.pile').addClass('chart-loading').find('.chart-line').removeClass('on-charted')
        }

        var served = null;
        if (m) {
            scope.id_appear = true;
            if (b) {
                scope.ch_data = true;
                served = function () {
                    return api.getTransactionsPerHourDetails(scope.lineCartConfig.duration, m, b);
                }
            }
            else {
                served = function () {
                    return api.getTransactionsPerHourDetails(scope.lineCartConfig.duration, m);
                }
            }
        }
        else {
            if (scope.filter.emirate) {


                if (scope.filter.emirate && scope.filter.branch) {
                    scope.ch_data = true;
                    served = function () {

                        return api.getTransactionsPerHourDetails(scope.lineCartConfig.duration, scope.filter.emirate.branchPrefix, scope.filter.branch.id);
                    }

                }
                else {
                    served = function () {
                        return api.getTransactionsPerHourDetails(scope.lineCartConfig.duration, scope.filter.emirate.branchPrefix);
                    }
                }

            }

            else {
                served = function () {
                    return api.getTransactionsPerHourDetails(scope.lineCartConfig.duration);
                }

            }
        }
        served().then(function (data) {
            timeout(function () {
                scope.$apply(function () {
                    scope.lineChartsDetails = [], scope.TransPerHourTable = null;
                    scope.lineChartsDetails = {
                        data: data
                    };
                    scope.TransPerHourTable = {
                        data: data,
                        error: data == null || data.error ? true : false,
                        empty: data.length == 0 ? true : false
                    };

                    html = scope.TransPerHourTable.data;


                    el = document.getElementById('myID');
                    el.innerHTML = "";
                    angular.element(el).append($compile(html)(scope))

                    //$('.chart-dept').addClass('on-charted');
                    // $('.chart-dept').parents('.pile').removeClass('chart-loading');
                });
            });
        }).then(function () {
            timeout(function () {
                scope.$apply(function () {


                    $('.popup-scroll .summary-scroll-details').slimScroll({
                        position: $('body').attr('dir') == 'rtl' ? 'left' : 'right',
                        height: '100%',
                        railVisible: false,
                        alwaysVisible: false,// Use a fixed height for the scroll bar
                        useFixedHeight: true,
                        fixedHeight: '50px'
                    }).bind('slimscrolling', function (e, pos) {
                    })

                })
            });

        });

    }
    //get served per branch
    scope.BranchPeriod = ['month', 'week', 'day'];
    scope.barChartConfig = {
        duration: "day"
    }
    scope.loadServedPerBranch = function (e, m, b) {


        var elem = null;
        scope.barSCharts = null, scope.servedCharts = null;
        if (e) {
            elem = $(e.target.closest('.pile'));
            $(elem).addClass('chart-loading').find('.chart-bar').removeClass('on-charted');
        }
        else {
            //$('.pile').addClass('chart-loading').find('.chart-bar').removeClass('on-charted')
        }

        var served = null;
        if (m) {

            if (b) {
                served = function () {
                    return api.getServedPerBranch(scope.barChartConfig.duration, m, b);
                }
            }
            else {
                served = function () {
                    return api.getServedPerBranch(scope.barChartConfig.duration, m);
                }
            }
        }
        else {
            if (scope.filter.emirate) {

                scope.servdPerPlaceEN = servdPerPlaces[0].en[1];
                scope.servdPerPlaceAR = servdPerPlaces[1].ar[1];

                if (scope.filter.emirate && scope.filter.branch) {

                    scope.servdPerPlaceEN = servdPerPlaces[0].en[2];
                    scope.servdPerPlaceAR = servdPerPlaces[1].ar[2];

                    served = function () {
                        return api.getServedPerBranch(scope.barChartConfig.duration, scope.filter.emirate.branchPrefix, scope.filter.branch.id);
                    }
                }
                else {
                    served = function () {
                        return api.getServedPerBranch(scope.barChartConfig.duration, scope.filter.emirate.branchPrefix);
                    }
                }

            }

            else {
                served = function () {
                    return api.getServedPerBranch(scope.barChartConfig.duration);
                }

            }

        }

        served().then(function (data) {
            timeout(function () {
                scope.$apply(function () {
                    scope.barSCharts = null, scope.servedCharts = null;
                    //scope.charts = [scope.counterStatus.data.noofOpenCounter, scope.counterStatus.data.noOfClosedCounter];
                    //debugger;

                    scope.barSCharts = {
                        data: data,
                        error: data == null || data.error ? true : false,
                        empty: data.length == 0 ? true : false
                    };
                    scope.servedCharts = [[scope.barSCharts.data]];

                    $('.chart-bar').addClass('on-charted');
                    $('.chart-bar').parents('.pile').removeClass('chart-loading');
                });
            });
        });

    }

    //get served per department
    scope.DepartmentPeriod = [{ en: 'month', ar: 'شهر' }, { en: 'week', ar: 'اسبوع' }, { en: 'day', ar: 'يوم' }];
    scope.barChartDConfig = {
        duration: "day"
    }
    scope.loadServedPerDepartment = function (e, m, b) {


        scope.servedDeptCharts = null, scope.barCharts = null;
        var elem = null;
        if (e) {
            elem = $(e.target.closest('.pile'));
            $(elem).addClass('chart-loading').find('.chart-dept').removeClass('on-charted');
        }
        else {
            //$('.pile').addClass('chart-loading').find('.chart-dept').removeClass('on-charted')
        }

        var served = null;
        if (m) {
            if (b) {
                served = function () {
                    return api.getServedPerDepartment(scope.barChartDConfig.duration, m, b);
                }
            }
            else {
                served = function () {
                    return api.getServedPerDepartment(scope.barChartDConfig.duration, m);
                }
            }
        }
        else {
            if (scope.filter.emirate) {

                if (scope.filter.emirate && scope.filter.branch) {
                    served = function () {
                        return api.getServedPerDepartment(scope.barChartDConfig.duration, scope.filter.emirate.branchPrefix, scope.filter.branch.id);
                    }

                    if (scope.filter.emirate && scope.filter.branch && scope.filter.counter) {

                        served = function () {
                            return api.getServedPerDepartment(scope.barChartDConfig.duration, scope.filter.emirate.branchPrefix, scope.filter.branch.id, scope.filter.counter.id);
                        }
                    }
                }
                else {
                    served = function () {
                        return api.getServedPerDepartment(scope.barChartDConfig.duration, scope.filter.emirate.branchPrefix);
                    }
                }

            }

            else {
                served = function () {
                    return api.getServedPerDepartment(scope.barChartDConfig.duration);
                }

            }
        }

        served().then(function (data) {
            timeout(function () {
                scope.$apply(function () {
                    scope.servedDeptCharts = null, scope.barCharts = null;
                    scope.barCharts = {
                        data: data
                    };


                    scope.servedDeptCharts = {
                        data: [[scope.barCharts.data]],
                        error: scope.barCharts.data == null || scope.barCharts.data.error ? true : false,
                        empty: scope.barCharts.data.length == 0 ? true : false
                    };

                    $('.chart-dept').addClass('on-charted');
                    $('.chart-dept').parents('.pile').removeClass('chart-loading');
                });
            });
        });

    }

    scope.barChartDDetailsConfig = {
        duration: "day"
    }
    scope.loadServedPerDepartmentDetails = function (e, m, b) {


        scope.servedDeptDetails = [], scope.barDetails = null;
        scope.ch_title = null;
        var elem = null;
        if (e) {
            elem = $(e.target.closest('.pile'));
            $(elem).addClass('chart-loading').find('.chart-dept').removeClass('on-charted');
        }
        else {
            //$('.pile').addClass('chart-loading').find('.chart-dept').removeClass('on-charted')
        }
        var served = null;
        if (m) {
            scope.ch_title = true;
            if (b) {
                served = function () {
                    return api.getServedPerDepartmentDetails(scope.barChartDConfig.duration, m, b);
                }
            }
            else {
                served = function () {
                    return api.getServedPerDepartmentDetails(scope.barChartDConfig.duration, m);
                }
            }
        }
        else {
            if (scope.filter.emirate) {
                scope.Ctitle = {
                    en: "branch",
                    ar: "فرع"
                };
                if (scope.filter.emirate && scope.filter.branch) {
                    scope.Ctitle = {
                        en: "Counter",
                        ar: "منفذ الخدمة"
                    };
                    served = function () {
                        return api.getServedPerDepartmentDetails(scope.barChartDConfig.duration, scope.filter.emirate.branchPrefix, scope.filter.branch.id);
                    }

                }
                else {
                    served = function () {
                        return api.getServedPerDepartmentDetails(scope.barChartDConfig.duration, scope.filter.emirate.branchPrefix);
                    }
                }

            }

            else {
                served = function () {
                    return api.getServedPerDepartmentDetails(scope.barChartDConfig.duration);
                }

            }
        }
        served().then(function (data) {
            var el = document.getElementById('myID2');
            el.innerHTML = "";
            timeout(function () {
                scope.$apply(function () {
                    scope.servedDeptDetails = [], scope.barDetails = null;
                    scope.barDetails = {
                        data: data
                    };


                    scope.servedDeptDetails = {
                        data: scope.barDetails.data,
                        error: scope.barDetails.data == null || scope.barDetails.data.error ? true : false,
                        empty: scope.barDetails.data.length == 0 ? true : false
                    };

                    html = scope.servedDeptDetails.data;




                    angular.element(el).append($compile(html)(scope))




                    $('.chart-dept').addClass('on-charted');
                    $('.chart-dept').parents('.pile').removeClass('chart-loading');
                });
            }, 0);
        });

    }


    //get branch summary
    scope.loadBranchSummary = function (e, m, b) {

        scope.cou_d = false;
        scope.Btitle = false;
        scope.barSummaryData = [];
        scope.barSummary = null;
        var elem = null;
        if (e) {
            elem = $(e.target.closest('.pile'));
            $(elem).addClass('chart-loading').find('.chart-summary').removeClass('on-charted');
        }
        else {
            //$('.pile').addClass('chart-loading').find('.chart-summary').removeClass('on-charted')
        }

        var served = null;
        scope.Btitle = {
            en: "branch",
            ar: "فرع"
        };
        if (m) {
            if (b) {
                scope.Btitle = {
                    en: "Counter",
                    ar: "منفذ الخدمة"
                };
                scope.cou_d = true;
                served = function () {
                    return api.getBranchSummary(m, b, 'counter');
                }
            }
            else {
                served = function () {
                    return api.getBranchSummary(m);
                }
            }
        }
        else {
            scope.Btitle = {
                en: "branch",
                ar: "فرع"
            };
            if (scope.filter.emirate) {

                if (scope.filter.emirate && scope.filter.branch) {
                    scope.Btitle = {
                        en: "Counter",
                        ar: "منفذ الخدمة"
                    };
                    scope.cou_d = true;
                    served = function () {
                        return api.getBranchSummary(scope.filter.emirate.branchPrefix, scope.filter.branch.id, "counter");
                    }
                }
                else {
                    served = function () {
                        return api.getBranchSummary(scope.filter.emirate.branchPrefix);
                    }
                }

            }

            else {
                served = function () {
                    return api.getBranchSummary()
                }

            }
        }
        served().then(function (data) {
            scope.barSummary = null;
            timeout(function () {
                scope.$apply(function () {

                    scope.barSummaryData = [];
                    scope.barSummary = null;
                    scope.barSummary = {
                        data: data,
                        error: data == null || data.error ? true : false,
                        empty: data.length == 0 ? true : false
                    };

                    if (!scope.barSummary.data.length) {
                        scope.barSummaryData.push({
                            "emiratePrefix": scope.barSummary.data.emiratePrefix,
                            "branchId": scope.barSummary.data.branchId,
                            "name": scope.barSummary.data.branchName ? scope.barSummary.data.branchName : scope.barSummary.data.name,
                            "counter": scope.barSummary.data.name,
                            "served": scope.barSummary.data.served,
                            "waitting": scope.barSummary.data.waitting,
                            "avgwtt": parseInt(scope.barSummary.data.avgwtt),
                            "avgtrt": parseInt(scope.barSummary.data.avgtrt),
                            "open": scope.barSummary.data.open,
                            "closed": scope.barSummary.data.closed,
                            "statusWtt": scope.barSummary.data.statusWtt,
                            "statusTrt": scope.barSummary.data.statusTrt,
                            "description": scope.barSummary.data.description,
                            "status": scope.barSummary.data.status,
                            "customersServed": scope.barSummary.data.customersServed,
                            "sorting": scope.barSummary.data.name ? parseInt(scope.barSummary.data.name.split(' ')[1]) : '',
                            "currentCustomerName": scope.barSummary.data.currentCustomerName,
                            "currentServiceCurrentTransactionTime": scope.barSummary.data.currentServiceCurrentTransactionTime,
                            "currentServiceName": scope.barSummary.data.currentServiceName,
                            "currentTicketNumber": scope.barSummary.data.currentTicketNumber,
                            "currentTransactionTime": scope.barSummary.data.currentTransactionTime,
                            "currentVisitId": scope.barSummary.data.currentVisitId,
                            "serviceTargetTransTime": scope.barSummary.data.serviceTargetTransTime,
                            "staffFullName": scope.barSummary.data.staffFullName,
                            "totaltrt": parseInt(scope.barSummary.data.totaltrt),
                            "workProfileName": scope.barSummary.data.workProfileName

                        });
                    }
                    else {
                        for (var i = 0; i < scope.barSummary.data.length; i++) {

                            scope.barSummaryData.push({
                                "emiratePrefix": scope.barSummary.data[i].emiratePrefix,
                                "branchId": scope.barSummary.data[i].branchId,
                                "name": scope.barSummary.data[i].branchName ? scope.barSummary.data[i].branchName : scope.barSummary.data[i].branchName,
                                "counter": scope.barSummary.data[i].name,
                                "served": scope.barSummary.data[i].served,
                                "waitting": scope.barSummary.data[i].waitting,
                                "avgwtt": parseInt(scope.barSummary.data[i].avgwtt),
                                "avgtrt": parseInt(scope.barSummary.data[i].avgtrt),
                                "open": scope.barSummary.data[i].open,
                                "closed": scope.barSummary.data[i].closed,
                                "statusWtt": scope.barSummary.data[i].statusWtt,
                                "statusTrt": scope.barSummary.data[i].statusTrt,
                                "description": scope.barSummary.data[i].description,
                                "status": scope.barSummary.data[i].status,
                                "customersServed": scope.barSummary.data[i].customersServed,
                                "sorting": scope.barSummary.data[i].name ? parseInt(scope.barSummary.data[i].name.split(' ')[1]) : '',
                                "currentCustomerName": scope.barSummary.data[i].currentCustomerName,
                                "currentServiceCurrentTransactionTime": scope.barSummary.data[i].currentServiceCurrentTransactionTime,
                                "currentServiceName": scope.barSummary.data[i].currentServiceName,
                                "currentTicketNumber": scope.barSummary.data[i].currentTicketNumber,
                                "currentTransactionTime": scope.barSummary.data[i].currentTransactionTime,
                                "currentVisitId": scope.barSummary.data[i].currentVisitId,
                                "serviceTargetTransTime": scope.barSummary.data[i].serviceTargetTransTime,
                                "staffFullName": scope.barSummary.data[i].staffFullName,
                                "totaltrt": parseInt(scope.barSummary.data[i].totaltrt),
                                "workProfileName": scope.barSummary.data[i].workProfileName
                            });
                        }
                    }
                    //console.log($filter('orderBy')(scope.barSummaryData, 'avgwtt', true));
                    $('.chart-summary').addClass('on-charted');
                    $('.chart-summary').parents('.pile').removeClass('chart-loading');


                });
            });
        }).then(function () {
            timeout(function () {
                scope.$apply(function () {
                    $('.popup-scroll .summary-scroll').slimScroll({
                        position: $('body').attr('dir') == 'rtl' ? 'left' : 'right',
                        height: '100%',
                        railVisible: false,
                        alwaysVisible: false,// Use a fixed height for the scroll bar
                        useFixedHeight: true,
                        fixedHeight: '50px'
                    }).bind('slimscrolling', function (e, pos) {
                    });
                });
            });
        }).then(function () {
            timeout(function () {
                scope.$apply(function () {
                    $('.summary-scroll').each(function () {
                        $(this).find(".summary-progress-w").each(function (i) {

                            var arrElements = this.getElementsByClassName("stats-number");
                            var maxValue = scope.graphSettings.waiting.maxvalue; //parseInt(arrElements[0].getAttribute("data-to"));
                            var mWidth = parseInt($(this).data("val")) > maxValue ? 100 : parseInt(($(this).data("val") * 100) / maxValue);
                            // console.log(scope.graphSettings.waiting.green);
                            var green = (scope.graphSettings.waiting.green * 100) / maxValue;
                            var amber = (scope.graphSettings.waiting.amber * 100) / maxValue;
                            var red = (scope.graphSettings.waiting.maxvalue * 100) / maxValue;
                            $(this).find('.bar:not(.expanded)').each(function () {
                                if (mWidth <= green) {
                                    $(this).addClass('happy');
                                    $(this).addClass('empty');
                                }
                                else if (mWidth > green && mWidth <= amber) {
                                    $(this).addClass('normal');
                                }
                                else if (mWidth > amber) {
                                    $(this).addClass('sad');
                                }

                                //console.log(mWidth);
                                $(this).css("max-width", mWidth + "%");
                                $(this).addClass('expanded');
                            });
                        });
                    });

                })
            });

        }).then(function () {
            timeout(function () {
                scope.$apply(function () {
                    $('.summary-scroll').each(function () {
                        $(this).find(".summary-progress-t").each(function (i) {

                            var arrElements = this.getElementsByClassName("stats-number");
                            var maxValue = scope.graphSettings.transac.maxvalue; //parseInt(arrElements[0].getAttribute("data-to"));
                            var mWidth = parseInt($(this).data("val")) > maxValue ? 100 : parseInt(($(this).data("val") * 100) / maxValue);
                            var green = (scope.graphSettings.transac.green * 100) / maxValue;
                            var amber = (scope.graphSettings.transac.amber * 100) / maxValue;
                            var red = (scope.graphSettings.transac.maxvalue * 100) / maxValue;
                            $(this).find('.bar:not(.expanded)').each(function () {
                                if (mWidth <= green) {
                                    $(this).addClass('happy');
                                    $(this).addClass('empty');
                                }
                                else if (mWidth > green && mWidth <= amber) {
                                    $(this).addClass('normal');
                                }
                                else if (mWidth > amber) {
                                    $(this).addClass('sad');
                                }

                                //console.log(mWidth);
                                $(this).css("max-width", mWidth + "%");
                                $(this).addClass('expanded');
                            });
                        });
                    });

                })
            });

        })

    }

    //get branch summary
    scope.loadOperationalSummary = function (e, m, b) {

        scope.Ctitle = {
            en: "Emirates",
            ar: "الإمارات"
        };
        scope.barOperationalData = [];
        scope.barOperational = null;
        var elem = null;
        if (e) {
            elem = $(e.target.closest('.pile'));
            $(elem).addClass('chart-loading').find('.chart-summary').removeClass('on-charted');
        }
        else {
            //$('.pile').addClass('chart-loading').find('.chart-summary').removeClass('on-charted')
        }

        var served = null;

        if (m) {
            scope.Ctitle = {
                en: "Branch",
                ar: "فرع"
            };

            if (b) {
                served = function () {
                    return api.getOperationalSummary(m, b);
                }
            }
            else {
                served = function () {
                    return api.getOperationalSummary(m);
                }
            }
        }
        else {
            if (scope.filter.emirate) {
                scope.Ctitle = {
                    en: "Branch",
                    ar: "فرع"
                };
                if (scope.filter.emirate && scope.filter.branch) {
                    served = function () {
                        return api.getOperationalSummary(scope.filter.emirate.branchPrefix, scope.filter.branch.id);
                    }

                }
                else {
                    served = function () {
                        return api.getOperationalSummary(scope.filter.emirate.branchPrefix);
                    }
                }
            }

            else {
                served = function () {
                    return api.getOperationalSummary()
                }

            }
        }


        served().then(function (data) {
            scope.barOperational = null;
            timeout(function () {
                scope.$apply(function () {

                    scope.barOperationalData = [];
                    scope.barOperational = null;
                    scope.barOperational = {
                        data: data,
                        error: data == null || data.error ? true : false,
                        empty: data.length == 0 ? true : false
                    };
                    if (scope.filter.branch) {
                        scope.barOperationalData.push(data);
                    }
                    else {
                        if (!scope.barOperational.data.length) {
                            scope.barOperationalData.push({
                                "name": scope.barOperational.data.branchName ? scope.barOperational.branchName : scope.barOperational.data.name,
                                "served": scope.barOperational.data.served,
                                "noShow": scope.barOperational.data.noShow,
                                "waitting": scope.barOperational.data.waitting,
                                "avgwtt": parseInt(scope.barOperational.data.avgwtt),
                                "avgtrt": parseInt(scope.barOperational.data.avgtrt),
                                "open": scope.barOperational.data.open,
                                "closed": scope.barOperational.data.closed,
                                "statusWtt": scope.barOperational.data.statusWtt,
                                "statusTrt": scope.barOperational.data.statusTrt,
                                "emiratePrefix": scope.barOperational.data.emiratePrefix,
                                "id": scope.barOperational.data.branchId,
                                "description": scope.barOperational.data.description
                            });
                        }
                        else {
                            for (var i = 0; i < scope.barOperational.data.length; i++) {
                                scope.barOperationalData.push({
                                    "name": scope.barOperational.data[i].branchName ? scope.barOperational.data[i].branchName : scope.barOperational.data[i].name,
                                    "served": scope.barOperational.data[i].served,
                                    "noShow": scope.barOperational.data[i].noShow,
                                    "waitting": scope.barOperational.data[i].waitting,
                                    "avgwtt": parseInt(scope.barOperational.data[i].avgwtt),
                                    "avgtrt": parseInt(scope.barOperational.data[i].avgtrt),
                                    "open": scope.barOperational.data[i].open,
                                    "closed": scope.barOperational.data[i].closed,
                                    "statusWtt": scope.barOperational.data[i].statusWtt,
                                    "statusTrt": scope.barOperational.data[i].statusTrt,
                                    "emiratePrefix": scope.barOperational.data[i].emiratePrefix,
                                    "id": scope.barOperational.data[i].branchId,
                                    "description": scope.barOperational.data[i].description
                                });
                            }
                        }
                    }


                    $('.chart-summary').addClass('on-charted');
                    $('.chart-summary').parents('.pile').removeClass('chart-loading');


                });
            });
        }).then(function () {
            timeout(function () {
                scope.$apply(function () {
                    $('.chart-summary .summary-scroll').slimScroll({
                        position: $('body').attr('dir') == 'rtl' ? 'left' : 'right',
                        height: '100%',
                        railVisible: false,
                        alwaysVisible: false,// Use a fixed height for the scroll bar
                        useFixedHeight: true,
                        fixedHeight: '50px'
                    }).bind('slimscrolling', function (e, pos) {
                    });
                });
            });
        })


    }


    //get branch summary Queues
    scope.loadOperationalSummaryQ = function (e, m, b) {
        scope.Qtitle = {
            en: "Emirates",
            ar: "الإمارات"
        };
        scope.barOperationalDataQ = [];
        scope.barOperationalQ = null;
        var elem = null;
        if (e) {
            elem = $(e.target.closest('.pile'));
            $(elem).addClass('chart-loading').find('.chart-summary').removeClass('on-charted');
        }
        else {
            //$('.pile').addClass('chart-loading').find('.chart-summary').removeClass('on-charted')
        }

        var served = null;
        if (m) {
            scope.Qtitle = {
                en: "Branch",
                ar: "فرع"
            };
            if (b) {
                scope.Qtitle = {
                    en: "Queue",
                    ar: "الطابور"
                };
                served = function () {
                    return api.getOperationalSummaryQ(m, b);
                }
            }
            else {
                served = function () {
                    return api.getOperationalSummaryQ(m);
                }
            }
        }
        else {
            if (scope.filter.emirate) {
                scope.Qtitle = {
                    en: "Branch",
                    ar: "فرع"
                };
                if (scope.filter.emirate && scope.filter.branch) {
                    scope.Qtitle = {
                        en: "Queue",
                        ar: "الطابور"
                    };
                    served = function () {
                        return api.getOperationalSummaryQ(scope.filter.emirate.branchPrefix, scope.filter.branch.id);

                    }

                }
                else {
                    served = function () {
                        return api.getOperationalSummaryQ(scope.filter.emirate.branchPrefix);
                    }
                }
            }

            else {
                served = function () {
                    return api.getOperationalSummaryQ()
                }

            }
        }


        served().then(function (data) {
            scope.barOperationalQ = null;
            timeout(function () {
                scope.$apply(function () {
                    scope.inbr = false;
                    scope.barOperationalDataQ = [];
                    scope.barOperationalQ = null;
                    scope.barOperationalQ = {
                        data: data,
                        error: data == null || data.error ? true : false,
                        empty: data.length == 0 ? true : false
                    };
                    if (scope.filter.branch || b) {
                        scope.inbr = true;
                        scope.barOperationalDataQ = data;
                    }
                    else {
                        if (!scope.barOperationalQ.data.length) {
                            scope.barOperationalDataQ.push({
                                "name": scope.barOperationalQ.data.branchName ? scope.barOperationalQ.data.branchName : scope.barOperationalQ.data.name,
                                "served": scope.barOperationalQ.data.served,
                                "waitting": scope.barOperationalQ.data.waitting,
                                "avgwtt": parseInt(scope.barOperationalQ.data.avgwtt).toFixed(0),
                                "avgtrt": parseInt(scope.barOperationalQ.data.avgtrt).toFixed(0),
                                "open": scope.barOperationalQ.data.open,
                                "closed": scope.barOperationalQ.data.closed,
                                "statusWtt": scope.barOperationalQ.data.statusWtt,
                                "statusTrt": scope.barOperationalQ.data.statusTrt,
                                "emiratePrefix": scope.barOperationalQ.data.emiratePrefix,
                                "id": scope.barOperationalQ.data.branchId,
                                "description": scope.barOperationalQ.data.description,
                                "noShow": scope.barOperationalQ.data.noShow
                            });
                        }
                        else {
                            for (var i = 0; i < scope.barOperationalQ.data.length; i++) {
                                scope.barOperationalDataQ.push({
                                    "name": scope.barOperationalQ.data[i].branchName ? scope.barOperationalQ.data[i].branchName : scope.barOperationalQ.data[i].name,
                                    "served": scope.barOperationalQ.data[i].served,
                                    "waitting": scope.barOperationalQ.data[i].waitting,
                                    "avgwtt": parseInt(scope.barOperationalQ.data[i].avgwtt).toFixed(0),
                                    "avgtrt": parseInt(scope.barOperationalQ.data[i].avgtrt).toFixed(0),
                                    "open": scope.barOperationalQ.data[i].open,
                                    "closed": scope.barOperationalQ.data[i].closed,
                                    "statusWtt": scope.barOperationalQ.data[i].statusWtt,
                                    "statusTrt": scope.barOperationalQ.data[i].statusTrt,
                                    "emiratePrefix": scope.barOperationalQ.data[i].emiratePrefix,
                                    "id": scope.barOperationalQ.data[i].branchId,
                                    "description": scope.barOperationalQ.data[i].description,
                                    "noShow": scope.barOperationalQ.data[i].noShow
                                });
                            }
                        }
                    }


                    $('.chart-summary').addClass('on-charted');
                    $('.chart-summary').parents('.pile').removeClass('chart-loading');


                });
            });
        }).then(function () {
            timeout(function () {
                scope.$apply(function () {
                    $('.popup-scroll .summary-scroll').slimScroll({
                        position: $('body').attr('dir') == 'rtl' ? 'left' : 'right',
                        height: $('.popup-pillar').height(),
                        railVisible: false,
                        alwaysVisible: false,// Use a fixed height for the scroll bar
                        useFixedHeight: true,
                        fixedHeight: '50px'
                    }).bind('slimscrolling', function (e, pos) {
                    });
                });
            });
        }).then(function () {
            timeout(function () {
                scope.$apply(function () {
                    $('.summary-scroll').find(".summary-progress-w").each(function (i) {
                        var arrElements = this.getElementsByClassName("stats-number");
                        var maxValue = scope.graphSettings.waiting.maxvalue; //parseInt(arrElements[0].getAttribute("data-to"));
                        var mWidth = parseInt($(this).data("val")) > maxValue ? 100 : parseInt(($(this).data("val") * 100) / maxValue);
                        // console.log(scope.graphSettings.waiting.green);
                        var green = (scope.graphSettings.waiting.green * 100) / maxValue;
                        var amber = (scope.graphSettings.waiting.amber * 100) / maxValue;
                        var red = (scope.graphSettings.waiting.maxvalue * 100) / maxValue;
                        $(this).find('.bar:not(.expanded)').each(function () {
                            if (mWidth <= green) {
                                $(this).addClass('happy');
                                $(this).addClass('empty');
                            }
                            else if (mWidth > green && mWidth <= amber) {
                                $(this).addClass('normal');
                            }
                            else if (mWidth > amber) {
                                $(this).addClass('sad');
                            }

                            //console.log(mWidth);
                            $(this).css("max-width", mWidth + "%");
                            $(this).addClass('expanded');
                        });
                    });
                })
            })
        }).then(function () {
            timeout(function () {
                scope.$apply(function () {
                    $('.summary-scroll').find(".summary-progress-t").each(function (i) {
                        var arrElements = this.getElementsByClassName("stats-number");
                        var maxValue = scope.graphSettings.transac.maxvalue; //parseInt(arrElements[0].getAttribute("data-to"));
                        var mWidth = parseInt($(this).data("val")) > maxValue ? 100 : parseInt(($(this).data("val") * 100) / maxValue);
                        // console.log(scope.graphSettings.waiting.green);
                        var green = parseInt(scope.graphSettings.transac.green * 100) / maxValue;
                        var amber = parseInt(scope.graphSettings.transac.amber * 100) / maxValue;
                        var red = parseInt(scope.graphSettings.transac.maxvalue * 100) / maxValue;
                        $(this).find('.bar:not(.expanded)').each(function () {
                            if (mWidth <= green) {
                                $(this).addClass('happy');
                                $(this).addClass('empty');
                            }
                            else if (mWidth > green && mWidth <= amber) {
                                $(this).addClass('normal');
                            }
                            else if (mWidth > amber) {
                                $(this).addClass('sad');
                            }

                            //console.log(mWidth);
                            $(this).css("max-width", mWidth + "%");
                            $(this).addClass('expanded');
                        });
                    });
                })
            });

        });

    }


    //get branch summary Counters
    scope.loadOperationalSummaryC = function (e, m, b) {

        scope.Ctitle = {
            en: "Emirates",
            ar: "الإمارات"
        };
        scope.barOperationalDataC = [];
        scope.barOperationalC = null;
        var elem = null;
        if (e) {
            elem = $(e.target.closest('.pile'));
            $(elem).addClass('chart-loading').find('.chart-summary').removeClass('on-charted');
        }
        else {
            //$('.pile').addClass('chart-loading').find('.chart-summary').removeClass('on-charted')
        }

        var served = null;

        if (m) {
            scope.Ctitle = {
                en: "Branch",
                ar: "فرع"
            };
            if (b) {
                scope.Ctitle = {
                    en: "Counter",
                    ar: "منفذ الخدمة"
                };
                served = function () {
                    return api.getOperationalSummary(m, b, 'counter');
                }
            }
            else {
                served = function () {
                    return api.getOperationalSummary(m);
                }
            }
        }
        else {
            if (scope.filter.emirate) {
                scope.Ctitle = {
                    en: "Branch",
                    ar: "فرع"
                };
                if (scope.filter.emirate && scope.filter.branch) {
                    scope.Ctitle = {
                        en: "Counter",
                        ar: "منفذ الخدمة"
                    };
                    served = function () {
                        return api.getOperationalSummary(scope.filter.emirate.branchPrefix, scope.filter.branch.id, 'counter');
                    }

                }
                else {
                    served = function () {
                        return api.getOperationalSummary(scope.filter.emirate.branchPrefix);
                    }
                }
            }

            else {
                served = function () {
                    return api.getOperationalSummary()
                }

            }
        }


        served().then(function (data) {
            scope.barOperationalC = null;
            timeout(function () {
                scope.$apply(function () {
                    scope.inbr = false;
                    scope.barOperationalDataC = [];
                    scope.barOperationalC = null;
                    scope.barOperationalC = {
                        data: data,
                        error: data == null || data.error ? true : false,
                        empty: data.length == 0 ? true : false
                    };
                    if (scope.filter.branch || b) {
                        scope.inbr = true;
                        for (var i = 0; i < scope.barOperationalC.data.length; i++) {
                            scope.barOperationalDataC.push({
                                "name": scope.barOperationalC.data[i].name,
                                "sorting": parseInt(scope.barOperationalC.data[i].name.split(' ')[1]),
                                "description": scope.barOperationalC.data[i].description,
                                "currentCustomerName": scope.barOperationalC.data[i].currentCustomerName,
                                "currentServiceCurrentTransactionTime": scope.barOperationalC.data[i].currentServiceCurrentTransactionTime,
                                "currentServiceName": scope.barOperationalC.data[i].currentServiceName,
                                "currentTicketNumber": scope.barOperationalC.data[i].currentTicketNumber,
                                "currentTransactionTime": scope.barOperationalC.data[i].currentTransactionTime,
                                "currentVisitId": scope.barOperationalC.data[i].currentVisitId,
                                "emiratePrefix": scope.barOperationalC.data[i].emiratePrefix,
                                "id": scope.barOperationalC.data[i].branchId,
                                "customersServed": scope.barOperationalC.data[i].customersServed,
                                "serviceTargetTransTime": scope.barOperationalC.data[i].serviceTargetTransTime,
                                "staffFullName": scope.barOperationalC.data[i].staffFullName,
                                "status": scope.barOperationalC.data[i].status,
                                "statusTrt": scope.barOperationalC.data[i].statusTrt,
                                "totaltrt": parseInt(scope.barOperationalC.data[i].totaltrt),
                                "workProfileName": scope.barOperationalC.data[i].workProfileName
                            });
                        }
                    }
                    else {
                        if (!scope.barOperationalC.data.length) {
                            scope.barOperationalDataC.push({
                                "name": scope.barOperationalC.data.branchName ? scope.barOperationalC.data.branchName : scope.barOperationalC.data.name,
                                "served": scope.barOperationalC.data.served,
                                "waitting": scope.barOperationalC.data.waitting,
                                "avgwtt": parseInt(scope.barOperationalC.data.avgwtt),
                                "avgtrt": parseInt(scope.barOperationalC.data.avgtrt),
                                "open": scope.barOperationalC.data.open,
                                "closed": scope.barOperationalC.data.closed,
                                "statusWtt": scope.barOperationalC.data.statusWtt,
                                "statusTrt": scope.barOperationalC.data.statusTrt,
                                "emiratePrefix": scope.barOperationalC.data.emiratePrefix,
                                "id": scope.barOperationalC.data.branchId,
                                "description": scope.barOperationalC.data.description,
                                "totaltrt": scope.barOperationalC.data.totaltrt
                            });
                        }
                        else {
                            for (var i = 0; i < scope.barOperationalC.data.length; i++) {
                                scope.barOperationalDataC.push({
                                    "name": scope.barOperationalC.data[i].branchName ? scope.barOperationalC.data[i].branchName : scope.barOperationalC.data[i].name,
                                    "served": scope.barOperationalC.data[i].served,
                                    "waitting": scope.barOperationalC.data[i].waitting,
                                    "avgwtt": parseInt(scope.barOperationalC.data[i].avgwtt),
                                    "avgtrt": parseInt(scope.barOperationalC.data[i].avgtrt),
                                    "open": scope.barOperationalC.data[i].open,
                                    "closed": scope.barOperationalC.data[i].closed,
                                    "statusWtt": scope.barOperationalC.data[i].statusWtt,
                                    "statusTrt": scope.barOperationalC.data[i].statusTrt,
                                    "emiratePrefix": scope.barOperationalC.data[i].emiratePrefix,
                                    "id": scope.barOperationalC.data[i].branchId,
                                    "description": scope.barOperationalC.data[i].description
                                });
                            }
                        }
                    }


                    $('.chart-summary').addClass('on-charted');
                    $('.chart-summary').parents('.pile').removeClass('chart-loading');


                });
            });
        }).then(function () {
            timeout(function () {
                scope.$apply(function () {
                    $('.chart-summary .summary-scroll').slimScroll({
                        position: $('body').attr('dir') == 'rtl' ? 'left' : 'right',
                        height: '100%',
                        railVisible: false,
                        alwaysVisible: false,// Use a fixed height for the scroll bar
                        useFixedHeight: true,
                        fixedHeight: '50px'
                    }).bind('slimscrolling', function (e, pos) {
                    });
                });
            });
        }).then(function () {
            timeout(function () {
                scope.$apply(function () {
                    $('.summary-scroll').find(".summary-progress-w").each(function (i) {
                        var arrElements = this.getElementsByClassName("stats-number");
                        var maxValue = scope.graphSettings.waiting.maxvalue; //parseInt(arrElements[0].getAttribute("data-to"));
                        var mWidth = parseInt($(this).data("val")) > maxValue ? 100 : parseInt(($(this).data("val") * 100) / maxValue);
                        // console.log(scope.graphSettings.waiting.green);
                        var green = (scope.graphSettings.waiting.green * 100) / maxValue;
                        var amber = (scope.graphSettings.waiting.amber * 100) / maxValue;
                        var red = (scope.graphSettings.waiting.maxvalue * 100) / maxValue;
                        $(this).find('.bar:not(.expanded)').each(function () {
                            if (mWidth <= green) {
                                $(this).addClass('happy');
                                $(this).addClass('empty');
                            }
                            else if (mWidth > green && mWidth <= amber) {
                                $(this).addClass('normal');
                            }
                            else if (mWidth > amber) {
                                $(this).addClass('sad');
                            }
                            //console.log(mWidth);
                            $(this).css("max-width", mWidth + "%");
                            $(this).addClass('expanded');
                        });
                    });
                })
            });

        }).then(function () {
            timeout(function () {
                scope.$apply(function () {
                    $('.summary-scroll').find(".summary-progress-t").each(function (i) {
                        var arrElements = this.getElementsByClassName("stats-number");
                        var maxValue = scope.graphSettings.transac.maxvalue; //parseInt(arrElements[0].getAttribute("data-to"));
                        var mWidth = parseInt($(this).data("val")) > maxValue ? 100 : parseInt(($(this).data("val") * 100) / maxValue);
                        // console.log(scope.graphSettings.waiting.green);
                        var green = (scope.graphSettings.transac.green * 100) / maxValue;
                        var amber = (scope.graphSettings.transac.amber * 100) / maxValue;
                        var red = (scope.graphSettings.transac.maxvalue * 100) / maxValue;
                        $(this).find('.bar:not(.expanded)').each(function () {
                            if (mWidth <= green) {
                                $(this).addClass('happy');
                                $(this).addClass('empty');
                            }
                            else if (mWidth > green && mWidth <= amber) {
                                $(this).addClass('normal');
                            }
                            else if (mWidth > amber) {
                                $(this).addClass('sad');
                            }
                            //console.log(mWidth);
                            $(this).css("max-width", mWidth + "%");
                            $(this).addClass('expanded');
                        });
                    });
                })
            });

        });

    }

    //get Happiness Rank
    scope.happinessDuration = [{ ens: "month", en: 'monthly', ar: 'شهر' }, { ens: "week", en: 'weekly', ar: 'اسبوع' }, { ens: "day", en: 'daily', ar: 'يوم' }];
    scope.happinessconfig = {
        duration: "daily",
    }
    scope.loadHappinessRank = function (e) {



        scope.happinessRank = null;

        var elem = null;
        if (e) {
            elem = $(e.target.closest('.pile'));
            $(elem).addClass('chart-loading').find('.chart-happiness').removeClass('on-charted');
        }
        else {
            //$('.pile').addClass('chart-loading').find('.chart-summary').removeClass('on-charted')
        }

        var served = null;

        if (scope.filter.emirate) {

            if (scope.filter.emirate && scope.filter.branch) {
                served = function () {
                    return api.getBranchHappinessRank(scope.filter.emirate.branchPrefix, scope.filter.branch.id);
                }
            }
            else {
                served = function () {
                    return api.getBranchHappinessRank(scope.filter.emirate.branchPrefix);
                }
            }

        }

        else {
            served = function () {
                return api.getBranchHappinessRank()
            }

        }


        served().then(function (data) {

            timeout(function () {
                scope.$apply(function () {

                    scope.happinessRankData = [];
                    scope.happinessRank = null;
                    scope.happinessRank = {
                        data: data,
                        error: data == null || data.error ? true : false,
                        empty: data.length == 0 ? true : false
                    };
                    if (scope.filter.emirate && scope.filter.branch) {
                        scope.happinessRank = {
                            data: [data],
                            error: data == null || data.error ? true : false,
                            empty: data.length == 0 ? true : false
                        };
                    }
                    //console.log($filter('orderBy')(scope.barSummaryData, 'avgwtt', true));
                    $('.chart-happiness').addClass('on-charted');
                    $('.chart-happiness').parents('.pile').removeClass('chart-loading');


                });
            });
        }).then(function () {
            timeout(function () {
                scope.$apply(function () {

                    $('.happiness-scroll').slimScroll({
                        position: $('body').attr('dir') == 'rtl' ? 'left' : 'right',
                        height: $('.chart-happiness').parents('.pile').height() - 175,
                        railVisible: false,
                        alwaysVisible: false,// Use a fixed height for the scroll bar
                        useFixedHeight: true,
                        fixedHeight: '50px'
                    }).bind('slimscrolling', function (e, pos) {
                    });
                });
            });
        }).then(function () {
            timeout(function () {
                scope.$apply(function () {
                    $('.chart-happiness .progress .stats-number').countTo({
                        speed: 2000,
                        refreshInterval: 50,
                        onUpdate: function (value) {
                            if (value > 33.333 && value <= 66.6666) {
                                //alert(1)
                                $(this).prev('.stats-img').addClass('ind-normal')
                            }
                            else if (value > 66.6666) {
                                //alert(2)
                                $(this).prev('.stats-img').addClass('ind-happy')
                            }
                        }
                    });

                })
            });

        });

    }
    //get Happiness Status
    scope.loadHappinessStatus = function (e) {

        scope.happinessStatus = null;

        var served = null;

        if (scope.filter.emirate) {

            if (scope.filter.emirate && scope.filter.branch) {
                served = function () {
                    return api.getBranchHappinessStatus(scope.filter.emirate.branchPrefix, scope.filter.branch.id);
                }
            }
            else {
                served = function () {
                    return api.getBranchHappinessStatus(scope.filter.emirate.branchPrefix);
                }
            }

        }

        else {
            served = function () {
                return api.getBranchHappinessStatus()
            }

        }


        served().then(function (data) {

            timeout(function () {
                scope.$apply(function () {

                    scope.happinessStatus = null;
                    if (scope.happinessconfig.duration == "daily") {
                        scope.happinessStatus = data.daily;
                    }
                    else if (scope.happinessconfig.duration == "monthly") {
                        scope.happinessStatus = data.monthly;
                    }
                    else if (scope.happinessconfig.duration == "weekly") {
                        scope.happinessStatus = data.weekly;
                    }
                    else {
                        scope.happinessStatus = data.total;
                    }



                });
            });
        }).then(function () {
            timeout(function () {
                scope.$apply(function () {
                    //$('.count-tem .stats-number').countTo({
                    //    speed: 3000,
                    //    from: 0,
                    //    to: scope.happinessStatus.active,
                    //    refreshInterval: 50
                    //});
                    //$('.count-tem .stats-inactive').countTo({
                    //    speed: 3000,
                    //    from: 0,
                    //    to: scope.happinessStatus.inactive,
                    //    refreshInterval: 50
                    //});

                })
            });

        });

    }
    scope.loadHappinessRadar = function (e) {

        scope.happinessradar = [];
        var elem = null;
        if (e) {
            elem = $(e.target.closest('.pile'));
            $(elem).addClass('chart-loading').find('.radar-happiness').removeClass('on-charted');
        }
        var served = null;

        if (scope.filter.emirate) {

            if (scope.filter.emirate && scope.filter.branch) {
                served = function () {
                    return api.getHappinessRadar(scope.filter.emirate.branchPrefix, scope.filter.branch.id);
                }
            }
            else {
                served = function () {
                    return api.getHappinessRadar(scope.filter.emirate.branchPrefix);
                }
            }

        }

        else {
            served = function () {
                return api.getHappinessRadar()
            }

        }


        served().then(function (data) {

            timeout(function () {
                scope.$apply(function () {

                    scope.happinessRadar = [];
                    if (scope.happinessconfig.duration == "daily") {
                        scope.happinessRadar = {
                            data: data.daily,
                            error: data == null || data.error ? true : false,
                            empty: data.length == 0 ? true : false
                        };
                    }
                    else if (scope.happinessconfig.duration == "monthly") {
                        scope.happinessRadar = {
                            data: data.monthly,
                            error: data == null || data.error ? true : false,
                            empty: data.length == 0 ? true : false
                        };
                    }
                    else if (scope.happinessconfig.duration == "weekly") {
                        scope.happinessRadar = {
                            data: data.weekly,
                            error: data == null || data.error ? true : false,
                            empty: data.length == 0 ? true : false
                        };
                    }
                    else {
                        scope.happinessRadar = {
                            data: data.weekly,
                            error: data == null || data.error ? true : false,
                            empty: data.length == 0 ? true : false
                        };
                    }
                });
            });
        }).then(function () {
            timeout(function () {

                scope.$apply(function () {
                    scope.happinessgoodEn = [];
                    scope.happinessexEn = {};
                    scope.happinesspoEn = [];
                    scope.happinessgoodAr = [];
                    scope.happinessexAr = [];
                    scope.happinesspoAr = [];
                    for (var i = 0; i < scope.happinessRadar.data.good.length; i++) {
                        scope.happinessgoodEn.push({
                            axis: scope.happinessRadar.data.good[i].texts.en,
                            value: scope.happinessRadar.data.good[i].value,

                        });
                    };
                    scope.happinessexEn = {
                        data: [[scope.happinessRadar.data.excellent[0].value, scope.happinessRadar.data.excellent[1].value]],
                        label1_en: scope.happinessRadar.data.excellent[0].texts.en,
                        label2_en: scope.happinessRadar.data.excellent[1].texts.en,
                        label1_ar: scope.happinessRadar.data.excellent[0].texts.ar,
                        label2_ar: scope.happinessRadar.data.excellent[1].texts.ar,
                        value1: scope.happinessRadar.data.excellent[0].value,
                        value2: scope.happinessRadar.data.excellent[1].value
                    };

                    for (var i = 0; i < scope.happinessRadar.data.poor.length; i++) {
                        scope.happinesspoEn.push({
                            axis: scope.happinessRadar.data.poor[i].texts.en,
                            value: scope.happinessRadar.data.poor[i].value,

                        });
                    };
                    for (var i = 0; i < scope.happinessRadar.data.good.length; i++) {
                        scope.happinessgoodAr.push({
                            axis: scope.happinessRadar.data.good[i].texts.ar,
                            value: scope.happinessRadar.data.good[i].value,

                        });
                    };
                    for (var i = 0; i < scope.happinessRadar.data.excellent.length; i++) {
                        scope.happinessexAr.push({
                            axis: scope.happinessRadar.data.excellent[i].texts.ar,
                            value: scope.happinessRadar.data.excellent[i].value,

                        });
                    };
                    for (var i = 0; i < scope.happinessRadar.data.poor.length; i++) {
                        scope.happinesspoAr.push({
                            axis: scope.happinessRadar.data.poor[i].texts.ar,
                            value: scope.happinessRadar.data.poor[i].value,

                        });
                    };

                })
            })
        }).then(function () {
            timeout(function () {
                scope.$apply(function () {
                    var good = [scope.happinessgoodEn];
                    var poor = [scope.happinesspoEn];
                    var goodAr = [scope.happinessgoodAr];
                    var poorAr = [scope.happinesspoAr];
                    var exc = d3.scale.ordinal().range(["#ffb823"]);
                    var poorc = d3.scale.ordinal().range(["#f5516c"]);
                    var margin = { top: 100, right: 100, bottom: 100, left: 100 },
                        width = Math.min(390, window.innerWidth - 10) - margin.left - margin.right,
                        height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);
                    var mycfg2 = {
                        w: width,
                        h: height,
                        margin: margin,
                        levels: 5,
                        roundStrokes: true,
                        color: exc
                    };
                    var mycfg3 = {
                        w: width,
                        h: height,
                        margin: margin,
                        levels: 5,
                        roundStrokes: true,
                        color: poorc
                    }
                    RadarChart("#good-radar", good, mycfg2);
                    RadarChart("#poor-radar", poor, mycfg3);
                    RadarChart("#good-radar-ar", goodAr, mycfg2);
                    RadarChart("#poor-radar-ar", poorAr, mycfg3);
                    $('.radar-happiness').addClass('on-charted');
                    $('.radar-happiness').parents('.pile').removeClass('chart-loading');
                })
            })
        })
    }
    //get Happiness Score
    scope.loadHappinessScore = function (e) {

        scope.happinessScore = null;

        var served = null;

        if (scope.filter.emirate) {

            if (scope.filter.emirate && scope.filter.branch) {
                served = function () {
                    return api.getBranchHappinessScore(scope.filter.emirate.branchPrefix, scope.filter.branch.id);
                }
            }
            else {
                served = function () {
                    return api.getBranchHappinessScore(scope.filter.emirate.branchPrefix);
                }
            }

        }

        else {
            served = function () {
                return api.getBranchHappinessScore()
            }

        }

        served().then(function (data) {

            timeout(function () {
                scope.$apply(function () {

                    scope.happinessScore = null;
                    if (scope.happinessconfig.duration == "daily") {
                        scope.happinessScore = data.daily;
                    }
                    else if (scope.happinessconfig.duration == "monthly") {
                        scope.happinessScore = data.monthly;
                    }
                    else if (scope.happinessconfig.duration == "weekly") {
                        scope.happinessScore = data.weekly;
                    }
                    else {
                        scope.happinessScore = data.total;
                    }



                });
            });
        }).then(function () {
            timeout(function () {
                scope.$apply(function () {
                    $('.stats-count .stats-number').countTo({
                        from: 0,
                        to: scope.happinessScore.avg,
                        speed: 3000,
                        refreshInterval: 50
                    });

                })
            });

        });
    }

    scope.loadSalariesList = function (e, m, b) {
        scope.Qtitle = {
            en: "Emirates",
            ar: "الإمارات"
        };
        var elem = null;

        scope.SalariesTable = [];
        if (e) {
            elem = $(e.target.closest('.pile'));
            $(elem).addClass('chart-loading')
            //.find('.chart-line').removeClass('on-charted');
        }

        var served = null;
        if (m) {
            scope.Qtitle = {
                en: "Branch",
                ar: "فرع"
            };
            if (b) {
                scope.Qtitle = {
                    en: "Counter",
                    ar: "منفذ الخدمة"
                };
                served = function () {
                    return api.getSalariesList(m, b);
                }
            }
            else {
                served = function () {
                    return api.getSalariesList(m);
                }
            }
        }
        else {
            if (scope.filter.emirate) {
                scope.Qtitle = {
                    en: "Branch",
                    ar: "فرع"
                };
                if (scope.filter.emirate && scope.filter.branch) {
                    scope.Qtitle = {
                        en: "Counter",
                        ar: "منفذ الخدمة"
                    };
                    served = function () {
                        return api.getSalariesList(scope.filter.emirate.branchPrefix, scope.filter.branch.id);
                    }
                }
                else {
                    served = function () {
                        return api.getSalariesList(scope.filter.emirate.branchPrefix);;
                    }
                }
            }
            else {
                served = function () {
                    return api.getSalariesList();
                }
            }
        }
        served().then(function (data) {
            timeout(function () {
                scope.$apply(function () {
                    scope.SalariesTableData = [];
                    scope.SalariesTable = null;

                    if (scope.filter.branch || b) {// all counters per one branch
                        scope.SalariesTable = {
                            data: data,
                            error: data == null || data.error ? true : false,
                            empty: data.length == 0 ? true : false
                        };
                        for (var i = 0; i < scope.SalariesTable.data.length; i++) {
                            scope.SalariesTableData.push({
                                "name": scope.SalariesTable.data[i].companyNameEn,
                                "count": scope.SalariesTable.data[i].estAccountNumber,
                                "percentage": scope.SalariesTable.data[i].estSalaryPercent
                            });
                        }

                    }
                    else {// all branches per one emirate
                        if (scope.filter.emirate || m) {
                            scope.SalariesTable = {
                                data: data,
                                error: data == null || data.error ? true : false,
                                empty: data.length == 0 ? true : false
                            };
                            Object.getOwnPropertyNames(scope.SalariesTable.data).forEach(key => {
                                var value = (scope.SalariesTable.data)[key];
                                var branchData = key.split(':');
                                scope.SalariesTableData.push({
                                    "name": branchData[1],
                                    "count": value[0].count,
                                    "percentage": value[0].percentage,
                                    "emiratePrefix": (branchData[1].split('-'))[0],
                                    "branchId": branchData[0],
                                });
                              });
                        }
                        else {  //for all emirates
                            scope.SalariesTable = {
                                data: data,
                                error: data == null || data.error ? true : false,
                                empty: data.length == 0 ? true : false
                            };

                            Object.getOwnPropertyNames(scope.SalariesTable.data).forEach(key => {
                                var value = (scope.SalariesTable.data)[key];
                                scope.SalariesTableData.push({
                                    "name": key,
                                    "count": value[0].count,
                                    "percentage": value[0].percentage,
                                    "emiratePrefix": key,
                                });
                              });
                        }
                    }
                });
            });
        }).then(function () {
            timeout(function () {
                scope.$apply(function () {

                    $('.pile-content').parents('.pile').removeClass('chart-loading');

                    // $('.popup-scroll .summary-scroll-details').slimScroll({
                    //     position: $('body').attr('dir') == 'rtl' ? 'left' : 'right',
                    //     height: '100%',
                    //     railVisible: false,
                    //     alwaysVisible: false,// Use a fixed height for the scroll bar
                    //     useFixedHeight: true,
                    //     fixedHeight: '50px'
                    // }).bind('slimscrolling', function (e, pos) {
                    // })

                })
            });

        });

    }
    scope.cou_dx = false;
    scope.loadEmployeesList = function (e, m, b) {
        scope.Qtitle = {
            en: "Emirates",
            ar: "الإمارات"
        };
        var elem = null;

        scope.EmployeesTable = [];
        if (e) {
            elem = $(e.target.closest('.pile'));
            $(elem).addClass('chart-loading')
            //.find('.chart-line').removeClass('on-charted');
        }

        var served = null;
        if (m) {
            scope.Qtitle = {
                en: "Branch",
                ar: "فرع"
            };
            if (b) {
                scope.Qtitle = {
                    en: "Counter",
                    ar: "منفذ الخدمة"
                };
                served = function () {
                    return api.getEmployeesList(m, b);
                }
            }
            else {
                served = function () {
                    return api.getEmployeesList(m);
                }
            }
        }
        else {
            if (scope.filter.emirate) {
                scope.Qtitle = {
                    en: "Branch",
                    ar: "فرع"
                };
                if (scope.filter.emirate && scope.filter.branch) {
                    scope.Qtitle = {
                        en: "Counter",
                        ar: "منفذ الخدمة"
                    };
                    served = function () {
                        return api.getEmployeesList(scope.filter.emirate.branchPrefix, scope.filter.branch.id);
                    }
                }
                else {
                    served = function () {
                        return api.getEmployeesList(scope.filter.emirate.branchPrefix);;
                    }
                }
            }
            else {
                served = function () {
                    return api.getEmployeesList();
                }
            }
        }
        served().then(function (data) {
            timeout(function () {
                scope.$apply(function () {
                    scope.EmployeesTableData = [];
                    scope.EmployeesTable = null;

                    if (scope.filter.branch || b) {// all counters per one branch
                        scope.EmployeesTable = {
                            data: data,
                            error: data == null || data.error ? true : false,
                            empty: data.length == 0 ? true : false
                        };

                        scope.cou_dx = true;
                        for (var i = 0; i < scope.EmployeesTable.data.length; i++) {
                            scope.EmployeesTableData.push({
                                "name": scope.EmployeesTable.data[i].branchName,
                                "estAccountNumber": scope.EmployeesTable.data[i].estAccountNumber,
                                "empNationalityNameEn": scope.EmployeesTable.data[i].empNationalityNameEn,
                                "empNationalityNameAr": scope.EmployeesTable.data[i].empNationalityNameAr,
                                "regionEn": scope.EmployeesTable.data[i].regionEn,
                                "regionAr": scope.EmployeesTable.data[i].regionAr,
                            });
                        }
                    }
                    else {// all branches per one emirate
                        scope.cou_dx = false;
                        if (scope.filter.emirate || m) {
                            scope.EmployeesTable = {
                                data: data,
                                error: data == null || data.error ? true : false,
                                empty: data.length == 0 ? true : false
                            };
                            console.log(scope.EmployeesTable)
                            Object.getOwnPropertyNames(scope.EmployeesTable.data).forEach(key => {
                                var value = (scope.EmployeesTable.data)[key];
                                var branchData = key.split(':');
                                var Foreigners, emirati, Arab, GCC;
                                value.forEach(element => {
                                   switch (element.nationalityNameEn) {
                                       case 'Foreigners':
                                       Foreigners = element.percentage;
                                           break;
                                           case 'Emirati':
                                            emirati = element.percentage;
                                           break;
                                           case 'Arab':
                                            Arab = element.percentage;
                                           break;
                                           case 'GCC':
                                            GCC = element.percentage;
                                           break;
                                       default:
                                           break;
                                   }
                                })
                                console.log(branchData)
                                scope.EmployeesTableData.push({
                                    "name": branchData[1] == undefined ? '': branchData[1],
                                    "Emirati": emirati,
                                    "GCC": GCC,
                                    "Arab": Arab,
                                    "Foreigners": Foreigners,
                                    "emiratePrefix": branchData[1] == undefined ? '' : (branchData[1].split('-'))[0],
                                    "branchId": branchData[0],
                                });
                        })
                        }
                        else {  //for all emirates
                            scope.EmployeesTable = {
                                data: data,
                                error: data == null || data.error ? true : false,
                                empty: data.length == 0 ? true : false
                            };
                            Object.getOwnPropertyNames(scope.EmployeesTable.data).forEach(key => {
                                var value = (scope.EmployeesTable.data)[key];
                                var Foreigners, emirati, Arab, GCC;
                               value.forEach(element => {
                                  switch (element.nationalityNameEn) {
                                      case 'Foreigners':
                                      Foreigners = element.percentage;
                                          break;
                                          case 'Emirati':
                                           emirati = element.percentage;
                                          break;
                                          case 'Arab':
                                           Arab = element.percentage;
                                          break;
                                          case 'GCC':
                                           GCC = element.percentage;
                                          break;
                                      default:
                                          break;
                                  }
                                   });
                                     scope.EmployeesTableData.push({
                                        "name": key,
                                        "Emirati": emirati,
                                        "GCC": GCC,
                                        "Arab": Arab,
                                        "Foreigners": Foreigners,
                                        "emiratePrefix": key,
                                    });
                              console.log( scope.EmployeesTableData);
                             });
                        }
                    }
                });
            });
        }).then(function () {
            timeout(function () {
                scope.$apply(function () {

                    $('.pile-content').parents('.pile').removeClass('chart-loading');

                    // $('.popup-scroll .summary-scroll-details').slimScroll({
                    //     position: $('body').attr('dir') == 'rtl' ? 'left' : 'right',
                    //     height: '100%',
                    //     railVisible: false,
                    //     alwaysVisible: false,// Use a fixed height for the scroll bar
                    //     useFixedHeight: true,
                    //     fixedHeight: '50px'
                    // }).bind('slimscrolling', function (e, pos) {
                    // })

                })
            });

        });

    }

    //DONE:REMOVE  scope.embr ={}

    scope.resetdrill = function () {
        scope.embr = {
            emirate: "",
            branch: "",
            emName: null,
            brName: null
        };
    }
    scope.resetdrillBranch = function () {
        scope.embr.branch = "";
        scope.embr.brName = null;
    }
    scope.filterOperational = function (type, e) {
        e.preventDefault();
        var elem;


        if (e) {
            //elem = $(e.target.closest('.pile'));
            elem = $(e.target);
        }
        var emID = $(elem).attr('data-emirateID');
        var brID = $(elem).attr('data-branchID');
        if (emID) {
            scope.embr = {
                emirate: emID,
                branch: brID ? brID : null,
                emName: emID && brID ? scope.embr.emName : $(elem).text(),
                brName: brID ? $(elem).text() : null
            };
            if (type == false) {
                if ($(elem).attr('data-type') == 'H') {
                    if (brID != "") {
                        scope.loadTransactionsPerHourDetails(e, emID, brID);
                    }
                    else {
                        scope.loadTransactionsPerHourDetails(e, emID);
                    }
                }
                else if ($(elem).attr('data-type') == 'D') {
                    if (brID != "") {
                        scope.loadServedPerDepartmentDetails(e, emID, brID)
                    }
                    else {
                        scope.loadServedPerDepartmentDetails(e, emID);
                    }
                }
            }
            else {


                if (type == 'Q') {

                    if (brID != "") {
                        scope.loadOperationalSummaryQ(e, emID, brID)
                    }
                    else {
                        scope.loadOperationalSummaryQ(e, emID);
                    }

                }
                else if (type == 'C') {
                    if (brID != "") {
                        scope.loadOperationalSummaryC(e, emID, brID)
                    }
                    else {
                        scope.loadOperationalSummaryC(e, emID);
                    }

                }
                else if (type == 'S') {
                    if (brID != "") {
                        scope.loadOperationalSummary(e, emID, brID)
                    }
                    else {
                        scope.loadOperationalSummary(e, emID);
                    }

                }
                else if (type == 'H') {
                    if (brID != "") {
                        scope.loadTransactionsPerHourDetails(e, emID, brID);
                    }
                    else {
                        scope.loadTransactionsPerHourDetails(e, emID);
                    }

                }
                else if (type == 'D') {
                    if (brID != "") {
                        scope.loadServedPerDepartmentDetails(e, emID, brID)
                    }
                    else {
                        scope.loadServedPerDepartmentDetails(e, emID);
                    }

                }
                else if (type == 'B') {
                    if (brID != "") {
                        scope.loadServedPerBranch(e, emID, brID);
                    }
                    else {
                        scope.loadServedPerBranch(e, emID);
                    }
                }
                else if (type == 'P') {
                    if (brID != "") {
                        scope.loadBranchSummary(e, emID, brID)
                    }
                    else {
                        scope.loadBranchSummary(e, emID);
                    }
                }
                else if (type == 'A') {
                    if (brID != "") {
                        scope.loadSalariesList(e, emID, brID)
                    }
                    else {
                        scope.loadSalariesList(e, emID);
                    }
                }
                else if (type == 'EM') {
                    if (brID != "") {
                        scope.loadEmployeesList(e, emID, brID)
                    }
                    else {
                        scope.loadEmployeesList(e, emID);
                    }

                }
            }
        }
    }


    //open side menu, filter and notifications
    scope.open = function (e, switch_on) {

        e.preventDefault();
        var elem = $(e.target.closest('.toggle-open'));
        var elemData = elem.data('open');
        //$(elem).toggleClass('open');
        //$('.toggle-open-target[data-open=' + elemData + ']').toggleClass('open');

        switch (switch_on) {

            case 'emirates':
                if ($(elem).hasClass('open')) {
                    $(elem).removeClass('open');
                    $('.toggle-open-target[data-open=' + elemData + ']').removeClass('open');
                    scope.getFiltered();
                }
                else {
                    $(elem).addClass('open');
                    $('.toggle-open-target[data-open=' + elemData + ']').addClass('open');
                }
                break;
            case 'noti':
                $('.notification-menu').toggleClass('open');
                $(elem).toggleClass('open');
                break;
            case 'menu':
                $('.left-menu').toggleClass('open');
                $(elem).toggleClass('open');
                break;
            case 'dept':
                $('.department-panel-container').toggleClass('open');
                $(elem).toggleClass('open');
                break;
            default:

        }
    }


    scope.export = function (e, data) {
        var data = data;
        if (data == '')
            return;

        JSONToCSVConvertor(data, "CCR", true);
    }
    scope.openPile = function (e) {

        e.preventDefault();
        var elem = $(e.target.closest('.pile'));
        $('body .popup-helper').remove();
        $('body').append("<div class='popup-helper'></div>");

        $('.pile-popup').addClass('opened');
        $('.pile-popup').find('.popup-pillar[data-popup=' + $(elem).attr('data-popup') + ']').addClass('active');
        //scope.initFunctions();


    }


    // $('a.back-popup').on('click', function () {
    $(document).on('click', 'a.back-popup', function () {
        $('.pile-popup').removeClass('opened');
        $('.pile-popup .popup-pillar').removeClass('active');
        scope.embr = {
            emirate: null,
            branch: null,
            emName: null,
            brName: null
        };
        scope.initFunctions();
    });


    //DONE: REMOVE getFiltered method

    var drawGauge = function (eleID, wait, settings) {

        var waitTime = wait;

        $('#' + eleID).empty();//.removeClass('on-charted');

        var dimensions = {};
        var win = $(window).width();

        if (win > 1366) {
            dimensions = {
                size: $('#' + eleID).parent().outerWidth() - 70,
                clipWidth: $('#' + eleID).parent().outerWidth() - 70,
                clipHeight: $('#' + eleID).parent().outerHeight() - 90,
                ringWidth: 30
            }
        }
        else {
            dimensions = {
                size: $('#' + eleID).parent().outerWidth() - 70,
                clipWidth: $('#' + eleID).parent().outerWidth() - 70,
                clipHeight: $('#' + eleID).parent().outerHeight() - 20,
                ringWidth: 20
            }
        }

        var powerGauge = gauge('#' + eleID, {
            size: dimensions.size,
            clipWidth: dimensions.clipWidth,
            clipHeight: dimensions.clipHeight,
            ringWidth: dimensions.ringWidth,
            minValue: 0,
            maxValue: parseInt(settings.maxvalue),
            majorTicks: parseInt(settings.maxvalue) / 5,
            transitionMs: 4000,
            green: parseInt(settings.green) / 5,
            amber: (parseInt(settings.amber) - parseInt(settings.green)) / 5,
            red: (parseInt(settings.maxvalue) - parseInt(settings.amber)) / 5
        });

        powerGauge.render(waitTime);

        function updateReadings() {
            // just pump in random data here...
            //powerGauge.update(Math.random() * 10);

            powerGauge.update(waitTime);
        }

        // every few seconds update reading values
        updateReadings();
        //setInterval(function () {
        //    updateReadings();
        //}, 5 * 1000);

        setTimeout(function () {
            $('#' + eleID).addClass('on-charted');
        })

    }


    //DONE: remove clearFilter method


    scope.aXisesColor = "#bbbbbb";
    scope.lineColor = "#c40029";
    var drawLine = function ($scope, chartId, data) {
        // D3.js code for drawing a Donut chart - Start



        var LineMarkersChart = new CanvasJS.Chart(chartId[0].id, {
            animationEnabled: true,
            axisX: {
                lineColor: $scope.aXisesColor,
                tickColor: $scope.aXisesColor,
                labelFontColor: $scope.aXisesColor,
                titleFontColor: $scope.aXisesColor,
            },
            axisY: {
                lineColor: $scope.aXisesColor,
                tickColor: "white",
                labelFontColor: $scope.aXisesColor,
                titleFontColor: $scope.aXisesColor,
                gridColor: '#f3f3f3',
                suffix: "k",
                crosshair: {
                    enabled: true
                }
            },
            data: [{
                type: "line",
                color: $scope.lineColor,
                dataPoints: data
            }]
        });
        LineMarkersChart.render();








    }
    scope.countdownInterval = function () {
        scope.intervalload = interval(scope.initFunctions, intervalDuration);
    }


    scope.loadSalaries = function (e, m, b) {
        var elem = null;
        if (e) {
            elem = $(e.target.closest('.pile'));
            $(elem).addClass('chart-loading').find('.chart-gauge').removeClass('on-charted');
        }
        $('.barra-nivel').attr("style", "width: 0");
        var await = null;
        scope.salaries = null;
        // if (m) {
        //     if (b) {
        //         await = function () {
        //             return api.getSalaries(m, b);
        //         };
        //     }
        //     else {
        //         await = function () {
        //             return api.getSalaries(m);
        //         };
        //     }
        // }
        //  else {
        if (scope.filter.emirate) {
            if (scope.filter.emirate && scope.filter.branch) {
                await = function () {
                    return api.getSalaries(scope.filter.emirate.branchPrefix, scope.filter.branch.id);
                };
            }
            else {
                await = function () {
                    return api.getSalaries(scope.filter.emirate.branchPrefix);
                };
            }
        }
        else {
            await = function () {
                return api.getSalaries();
            };
        }
        //  }
        await().then(function (data) {
            timeout(function () {
                scope.$apply(function () {
                    scope.salaries = null;
                    scope.salaries = {
                        data: data,
                        error: data == null || data.error ? true : false,
                        empty: data == 0 ? true : false
                    };
                    //progress bar
                    if(scope.salaries.data[0].percentage > 100){  //wrong values greater than 100
                        scope.salaries.data[0].percentage = 100;
                    }
                    $('.barra-nivel').animate({ width: scope.salaries.data[0].percentage + '%' });
                    $('.chart-gauge').addClass('on-charted').closest('.pile').removeClass('chart-loading');

                });
            });
        });
    }

    scope.loadEmployeesSalaries = function (e, m, b) {
        var elem = null;
        if (e) {
            elem = $(e.target.closest('.pile'));
            $(elem).addClass('chart-loading').find('.chart-gauge').removeClass('on-charted');
        }
        var await = null;
        scope.employeesSalaries = null;
        // if (m) {
        //     if (b) {
        //         await = function () {
        //             return api.getEmployeesSalaries(m, b);
        //         };
        //     }
        //     else {
        //         await = function () {
        //             return api.getEmployeesSalaries(m);
        //         };
        //     }
        // }
        //  else {
        if (scope.filter.emirate) {
            if (scope.filter.emirate && scope.filter.branch) {
                await = function () {
                    return api.getEmployeesSalaries(scope.filter.emirate.branchPrefix, scope.filter.branch.id);
                };
            }
            else {
                await = function () {
                    return api.getEmployeesSalaries(scope.filter.emirate.branchPrefix);
                };
            }
        }
        else {
            await = function () {
                return api.getEmployeesSalaries();
            };
        }
        //  }
        await().then(function (data) {
            timeout(function () {
                scope.$apply(function () {
                    scope.employeesSalaries = null;
                    scope.employeesSalaries = {
                        data: data,
                        error: data == null || data.error ? true : false,
                        empty: data == 0 ? true : false
                    };
                    $('.chart-gauge').addClass('on-charted').closest('.pile').removeClass('chart-loading');

                });
            });
        });
    }

    scope.initFunctions = function () {
        api.passDepartment(scope.filter.department);
        $('.pile').addClass('chart-loading');
        //httpRequestCanceller = $q.defer();
        //httpRequestCanceller.resolve();
        scope.loadWaitingTime(null, scope.embr.emirate, scope.embr.branch);
        scope.loadTransactionTime(null, scope.embr.emirate, scope.embr.branch);
        scope.loadCounterStatus(null, scope.embr.emirate, scope.embr.branch);
        scope.loadCustomerStatus(null, scope.embr.emirate, scope.embr.branch);
        scope.loadTransactionsPerHour(null, scope.embr.emirate, scope.embr.branch);
        scope.loadServedPerBranch(null, scope.embr.emirate, scope.embr.branch);
        scope.loadServedPerDepartment(null, scope.embr.emirate, scope.embr.branch);
        scope.loadBranchSummary(null, scope.embr.emirate, scope.embr.branch);
        scope.loadOperationalSummary(null, scope.embr.emirate, scope.embr.branch);
        scope.loadOperationalSummaryC(null, scope.embr.emirate, scope.embr.branch);
        scope.loadOperationalSummaryQ(null, scope.embr.emirate, scope.embr.branch);
        scope.loadServedPerDepartmentDetails(null, scope.embr.emirate, scope.embr.branch);
        scope.loadTransactionsPerHourDetails(null, scope.embr.emirate, scope.embr.branch);
        scope.loadHappinessRank(null, scope.embr.emirate, scope.embr.branch);
        scope.loadHappinessScore(null, scope.embr.emirate, scope.embr.branch);
        scope.loadHappinessStatus(null, scope.embr.emirate, scope.embr.branch);
        scope.loadHappinessRadar(null, scope.embr.emirate, scope.embr.branch);
        scope.loadSalaries(null, scope.embr.emirate, scope.embr.branch);
        scope.loadEmployeesSalaries(null, scope.embr.emirate, scope.embr.branch);
        scope.loadEmployeesList(null, scope.embr.emirate, scope.embr.branch);
        scope.loadSalariesList(null, scope.embr.emirate, scope.embr.branch);

        

    }






    //close opened side menu
    $('header .nav-icon.float-l.toggle-open').removeClass('open');
    $('header .left-menu').removeClass('open');



    //init
    // if (!window.isLoaded) {

    //     window.addEventListener("load", function () {
    //         loadGraphSettings();
    //         scope.initFunctions();
    //         loadDepartment();
    //         loadEmirates();
    //        // scope.countdownInterval();

    //     }, false);
    // } else {
    loadGraphSettings();
    scope.initFunctions();
    scope.loadDepartment();
    scope.loadEmirates();

    // scope.countdownInterval();
    //   }

    // }




    scope.$on('sendDown', function (e) {
        scope.$emit("sendUp", scope.initFunctions());
    });



}


mainModule.controller("MainController", ["$scope", "$http", "$api", "$timeout", "$interval", "$q", "$filter", "$compile", "$rootScope", MainController])
    .filter("emptyToEnd", function () {
        return function (array, key) {
            var present = array.filter(function (item) {
                return item[key];
            });
            var empty = array.filter(function (item) {
                return !item[key]
            });
            return present.concat(empty);
        };
    });



//}())
