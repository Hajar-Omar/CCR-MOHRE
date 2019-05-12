angular.module("MainModule").controller('appController', ['$scope', "$api", "$timeout", "$apiNoti", "$apiFines", "$rootScope", function (scope, api, timeout, apiNoti, apiFines, rootScope) {

    //print function for aspecific range date, emirate, branch, center type
    var d = new Date();
    var currentYear = d.getFullYear();  //2018
    var currentMonth = d.getMonth() + 1;

    scope.printDateFrom = '01/' + ("0" + (currentMonth + '').slice(-2)) + '/' + currentYear;
    scope.printDateTo = new Date(currentYear, currentMonth, 0).getDate() + '/' + ("0" + (currentMonth + '').slice(-2)) + '/' + currentYear;

    scope.printPage = function () {
        var emrt = scope.filter.emirate ? scope.filter.emirate.branchPrefix : '';
        var brnch = scope.filter.branch ? scope.filter.branch.id : '';

        scope.printDateFrom = $('.input-group.date.print-from input').val(); //not logical
        scope.printDateTo = $('.input-group.date.print-to input').val(); //.replace(/\//g, '');

        var fromArr = scope.printDateFrom.split("/");
        var fromDate = fromArr[2] + fromArr[1] + fromArr[0] + '';
        var toArr = scope.printDateTo.split("/");
        var toDate = toArr[2] + toArr[1] + toArr[0] + '';

        //centerType, emirateID, branchID, printFromDate, printToDate
        var url = api.printFromTo(scope.filter.selctedDepartment.prefix, emrt, brnch, fromDate, toDate);
        window.open(url);

        //close print menu
        $('.printDropDown').removeClass('active');
        $('.printDropDown > div').slideUp();
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
                //close print menu
                $('.printDropDown').removeClass('active');
                $('.printDropDown > div').slideUp();


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
    scope.embr = {
        emirate: "",
        branch: "",
        emName: null,
        brName: null
    };

    scope.getFiltered = function () {
        scope.embr = {
            emirate: null,
            branch: null,
            emName: null,
            brName: null
        };
        //$('.chart-gauge').removeClass('on-charted');
        $('.pile').addClass('chart-loading').find('.chart-gauge').removeClass('on-charted');
        scope.initFunctions();

        $('.filter.toggle-open').removeClass('open');
        $('.toggle-open-target[data-open=' + $('.filter.toggle-open').data('open') + ']').removeClass('open');
    }

    //load all department on-load
    scope.loadDepartment = function () {

        api.getDepartment().then(function (data) {
            timeout(function () {
                scope.$apply(function () {
                    scope.department = null;
                    var mohre = [], nonmohre = [];
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].prefix == 'MOHRE') {
                            mohre.push(data[i]);
                        }
                        else {
                            //if (i == 1) {
                            //    nonmohre.push({
                            //        id: "allother", nameEN: "All Others", nameAR: "الأقسام الباقية", prefix: "AllOTHERS", description: "NON MOHRE Service"
                            //    })
                            //}
                            nonmohre.push(data[i]);
                        }
                    }

                    scope.department = {
                        dataMohre: mohre,
                        dataNonMohre: nonmohre,
                        error: 'Departments Error Found!',
                        emoty: 'No Departments Found'
                    };
                });
            }, 1000);
        }, function () {
            scope.error = 'Department Error';
        });
    };


    //load all emirates on-load
    scope.loadEmirates = function () {
        api.getEmirates().then(function (data) {
            timeout(function () {
                scope.$apply(function () {
                    scope.emirates = {
                        data: data,
                        error: "Emirates Error Found!",
                        emoty: "No Emirates Found"
                    };
                });
            }, 1000);
        }, function () {
            scope.error = "Emirates Error";
        });
    };

    scope.filter = {
        department: [],
        emirate: null,
        branch: null,
        counter: null,
        selctedDepartment: {}
    };
    //get branches per emirate
    scope.loadBranches = function (emID, e) {

        scope.loadingBranches = true;
        scope.branches = null;
        //  scope.counters = null;
        // scope.loadingCounters = false;
        scope.filter.branch = null;
        scope.filter.counter = null;
        var elem = $(e.target.closest('.filter-item'));
        $('.filter-panel.emirates .filter-item').removeClass('active');
        $(elem).addClass('active');

        api.getBranches(emID).then(function (data) {
            timeout(function () {
                scope.$apply(function () {
                    scope.branches = {
                        data: data,
                        mesage: "Select From Emirates to Display Branches",
                        error: "Branches Error Found!",
                        empty: "No Branches Found in This Emirate!"
                    };
                });
            }, 1000);
        }, function () {
            scope.error = "error";
        });
    };

    scope.selectDepartment = departmentsList;

    scope.updateSelected = function (e) {
        e.preventDefault();
        var elem = $(e.target.closest('.filter-dept-item'));
        for (var i = 0; i < scope.selectDepartment.length; i++) {
            if (scope.selectDepartment[i].prefix == elem.attr('data-prefix')) {
                scope.selectDepartment[i].selected = true;
            }
            else {
                scope.selectDepartment[i].selected = false;
            }
        }
        $('body').attr('data-prefix', elem.attr('data-prefix'))

        //check controller name to determine which url for center type
        switch ($('.main').data('controller')) {
            case 'MainController':
                api.passDepartment(scope.filter.selctedDepartment, true);
              //  api.passCenterTypeCode(scope.filter.selctedDepartment, true);  // for the salaries APIs
                break;
            case 'notificationsCtrl':
                apiNoti.passCenterType(scope.filter.selctedDepartment, true);
                break;
            case 'finesCtrl':
                apiNoti.passCenterType(scope.filter.selctedDepartment, true);
                break;
            default:
                break;
        }

        if (elem.attr('data-selected') == 'false') {
            scope.initFunctions();
        }

        console.log(scope.filter.selctedDepartment);
        console.log($('.main').data('controller'));
    };


    //change main-title for served per branch section
    servdPerPlaces = [{ en: ['per Emirate', 'per Branch', 'within branch'] }, { ar: ['حسب الإمارة', 'حسب الفرع', 'داخل الفرع'] }];
    scope.servdPerPlaceEN = servdPerPlaces[0].en[0];
    scope.servdPerPlaceAR = servdPerPlaces[1].ar[0];

    scope.clearFilter = function (param, splice) {
        if (param == 'department') {
            if (splice) {
                scope.filter.department.splice(scope.filter.department.indexOf(splice), 1)
            }
            else {
                scope.filter.department = [];
            }
            $('[data-model="NONMOHRE"][data-prefix = "AllOTHERS"]:checked').prop('checked', false);
            $('.all-filter-dep').remove();
        }
        else if (param == 'emirates') {
            scope.filter.emirate = null;
            scope.filter.branch = null;
            scope.filter.counter = null;
            scope.loadingBranches = false;
            scope.loadingCounters = false;
            scope.branches = null;
            scope.counters = null;

            scope.servdPerPlaceEN = servdPerPlaces[0].en[0];
            scope.servdPerPlaceAR = servdPerPlaces[1].ar[0];
        }
        else if (param == 'branches') {
            scope.filter.branch = null;
            scope.filter.counter = null;
            scope.loadingCounters = false;
            scope.counters = null;

            scope.servdPerPlaceEN = servdPerPlaces[0].en[1];
            scope.servdPerPlaceAR = servdPerPlaces[1].ar[1];
        }

        else if (param == 'counters') {
            scope.filter.counter = null;
            scope.loadingCounters = false;
        }
        if (!$('.filter-panel-container').hasClass('open')) {
            scope.initFunctions();
        }
    }

    // show the snackbar
    scope.showSnackbarSuccess = function() {
        $('.snackbar').addClass('show');
        setTimeout(function () {
            $('.snackbar').removeClass('show');
        }, 3000);
    }

    scope.initFunctions = function () {
        scope.$broadcast('sendDown');
    }


    scope.loadDepartment();
    scope.loadEmirates();


}]);