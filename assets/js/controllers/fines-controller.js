var mainModule = angular.module('MainModule');
mainModule.controller('finesCtrl', ["$scope", "$api", "$apiNoti", "$apiFines", "$compile", "$timeout", function (scope, api, apiNoti, apiFines, compile, timeout) {

    //close opened side menu
    $('header .nav-icon.float-l.toggle-open').removeClass('open');
    $('header .left-menu').removeClass('open');

    scope.$on('sendDown', function (e) {
        scope.$emit("sendUp", scope.initFunctions());
    });

    //set from and to dates
    var d = new Date();
    var currentYear = d.getFullYear();
    var currentMonth = d.getMonth() + 1;

    scope.fineFromDate = '1/' + (currentMonth) + '/' + currentYear;
    scope.fineToDate = new Date(currentYear, currentMonth, 0).getDate() + '/' + (currentMonth) + '/' + currentYear;
    scope.curentDay = new Date().getDate() + '/' + (currentMonth) + '/' + currentYear;

    //validate only accept numvers and dot
    scope.regex = /^[0-9]*\.?[0-9]*$/;

    scope.resetDeafult = function (e) {
        scope.fineFromDate = '1/' + (currentMonth) + '/' + currentYear;
        scope.fineToDate = new Date(currentYear, currentMonth, 0).getDate() + '/' + (currentMonth) + '/' + currentYear;
    }

    scope.loadFinesDetailsById = function (e) {
        var fineId = $(e.target).parents('tr').data('finedetailid');
        apiFines.getFineById(fineId).then(function (data) {
            scope.fineByIdData = data;
            console.log(scope.fineByIdData)
        }, function () {
            scope.error = "error";
        });
        apiFines.getFineDetailsById(fineId).then(function (data) {
            scope.fineDetailsByIdData = data[0];
            console.log(scope.fineDetailsByIdData)
        }, function () {
            scope.error = "error";
        });
    }

    //modal view fine details
    scope.showModalViewFineDetails = false;
    scope.toggleViewFineDetails = function (e) {
        scope.showModalViewFineDetails = !scope.showModalViewFineDetails;
        if (scope.showModalViewFineDetails == true) {  //load default data when open

            scope.loadFinesDetailsById(e);

        }
    };

    //modal add fine
    scope.addFineFlag = true;
    scope.showModalAddFine = false;
    scope.toggleAddFine = function () {
        scope.showModalAddFine = !scope.showModalAddFine;
        if (scope.showModalAddFine == true) {  //load default data when open

            scope.subViolationTypes = null;  // reset sub-violations dropdown data, but fire onchange when modal loads is error at angularjs, so it returns an error //TODO
            scope.vioActionsOptions.selectedAction = null; //reset radio buttons values , deselect all (violations actions)

            scope.loadBranchDetails();
            scope.loadViolationsTypes();
            scope.loadViolationActions();
        }
    };

    //scope.reqAmount = true;
    scope.resetInput_VioValue = function () {  //TODO
        scope.fine.list[0].amount = null;
        //if (inputVal !== 9) {  // fine action value

        //}
        // if (inputVal !== 9) {  // fine action value
        //     scope.reqAmount = false;  //amount is not required when other action
        //     timeout(function () {
        //         scope.$watch('fineForm', function (fineForm) {
        //             if (fineForm) {
        //                 if (scope.fineForm.$valid) {
        //                     $('input[name="amount"]').attr('required', false)

        //                 }
        //             }
        //         })
        //     });
        //     scope.fine.list[0].amount = null;
        // }
        // else {
        //     scope.reqAmount = true;
        //     timeout(function () {
        //         scope.$watch('fineForm', function (fineForm) {
        //             if (fineForm) {
        //                 if (scope.fineForm.$valid) {
        //                     $('input[name="amount"]').attr('required', true)
        //                 }
        //             }
        //         });
        //     })
        // }
    }



    scope.loadBranchDetails = function () {
        apiFines.getBranchById(scope.centerCode).then(function (data) {
            scope.branchDetail = {
                centerName: data.branchName,
                propertyNumber: data.address_post_code,
                ownerName: data.address_line2,
                emirateName: data.emirateName
            }

            //initialize fine default data
            scope.fine = {
                branchId: scope.centerCode,
                emirateCode: scope.filter.emirate == null ? null : scope.filter.branch.emiratePrefix,
                centerCode: scope.filter.branch == null ? null : (scope.filter.branch.emiratePrefix + '-' + scope.filter.branch.branchSuffix),
                centerTypeCode: scope.selectedCenterType,

                emirateName: scope.branchDetail.emirateName,
                ownerName: scope.branchDetail.ownerName,
                propertyNumber: scope.branchDetail.propertyNumber,
                centerName: scope.branchDetail.centerName,

                valueBankGuarantee: null,  //reset value (type=number)
                unpaidCharges: null, //reset value (type=number)
                numPreviousViolations: null, //reset value (type=number)

                //tradeLicenseExpDate: scope.curentDay,   //date
                dateLicense: scope.curentDay,  //date
                list: [{
                    violationDate: scope.curentDay,  //date
                    amount: null //reset value (type=number)
                }]
            };
        }, function () {
            scope.error = "error";
        })
    }

    //load violations types for fines dropdown
    scope.loadViolationsTypes = function () {
        apiFines.getViolationsTypesForFines().then(function (data) {
            scope.violationTypes = data;
        }, function () {
            scope.error = "error";
        });
    }

    //load SUB violations types details for fines dropdown
    scope.sub_VioTypesOptions = {};
    scope.sub_VioTypesOptions.selectedViolationTypeDetails = null;
    scope.loadSUB_ViolationsTypes = function (item) {
        apiFines.getSUB_ViolationsTypesForFines(item.violationTypeId).then(function (data) {
            scope.subViolationTypes = data;
        }, function () {
            scope.error = "error";
        });
    }

    //load fines actions radio buttons
    scope.vioActionsOptions = {};
    scope.vioActionsOptions.selectedAction = null;
    scope.loadViolationActions = function () {
        apiFines.getViolationActions().then(function (data) {
            scope.violationActions = data;
        }, function () {
            scope.error = "error";
        });
    }

    scope.addFine = function () {
        scope.showModalAddFine = false;

        //fine attribues
        //  scope.fine.referenceNo = angular.copy(scope.fine.referenceNo);
        //  scope.fine.valueBankGuarantee = angular.copy(scope.fine.valueBankGuarantee);
        //  scope.fine.unpaidCharges = angular.copy(scope.fine.unpaidCharges);
        //  scope.fine.restSysMinistry = angular.copy(scope.fine.restSysMinistry);
        //  scope.fine.numPreviousViolations = angular.copy(scope.fine.numPreviousViolations);
        //  scope.fine.list[0].violationDetail = angular.copy(scope.fine.list[0].violationDetail);
        //  scope.fine.list[0].amount = angular.copy(scope.fine.list[0].amount);

        //selected checkbox and radio button values
        scope.fine.list[0].violationTypeDetailId = angular.copy(scope.sub_VioTypesOptions.selectedViolationTypeDetails.id);
        scope.fine.list[0].violationAction = angular.copy(scope.vioActionsOptions.selectedAction);

        //optional props, so should bind here
        scope.fine.list[0].notes = scope.fine.list[0].notes != undefined ? angular.copy(scope.fine.list[0].notes) : '';

        //edit date formates
        scope.fine.tradeLicenseExpDate = angular.copy(scope.fine.tradeLicenseExpDate).replace(/\//g, "-");   //date
        scope.fine.dateLicense = angular.copy(scope.fine.dateLicense).replace(/\//g, "-");   //date
        scope.fine.list[0].violationDate = angular.copy(scope.fine.list[0].violationDate).replace(/\//g, "-");   //date

        console.log(scope.fine);

        apiFines.addFine(scope.fine).then(function (response) {
            console.log(response.status)
            if (response.status == 200) {
                scope.showSnackbarSuccess();
                scope.initFunctions();  // refresh table data
            }
        }, function () {
            scope.error = "error";
        })

    }

    //search fines
    scope.searchFines = function () {
        scope.loading = true;
        scope.fines = {
            centerTypeCode: scope.selectedCenterType,
            fromDate: scope.fineFromDate,
            toDate: scope.fineToDate,
            emirateCode: scope.emirateCode,
            branchId: scope.centerCode
        }
        apiFines.postFines(scope.fines).then(function (data) {
            scope.allFines = {
                data: data,
                error: data == null || data.error ? true : false,
                empty: data == 0 ? true : false
            };

            console.log(scope.allFines.data)
        }, function () {
            scope.error = "error";
        }).then(function (data) {
            scope.loading = false;
        });
    }

    //get fine details
    scope.loadFinesDetails = function (e) {
        scope.loadingDetails = true;
        if (!$(e.target).parents('tbody').hasClass('active')) {  //hit the open item again
            $(e.target).parents('tbody').addClass('active');
            $(e.target).parents('tbody').find('i.fa-minus-circle').removeClass("fa-minus-circle").addClass("fa-plus-circle");
            scope.loadingDetails = false;
        } else {
            $(e.target).parents('.table').find('tbody').removeClass('active');
            $(e.target).parents('tbody').siblings('tbody').find('i.fa-minus-circle').removeClass("fa-minus-circle").addClass("fa-plus-circle");
            scope.finesDetails = {
                centerTypeCode: scope.selectedCenterType,
                fromDate: scope.fineFromDate,
                toDate: scope.fineToDate,
                emirateCode: $(e.target).parents('td').data('emirate'),
                centerCode: $(e.target).parents('td').data('center')
            }
            apiFines.postFinesDetails(scope.finesDetails).then(function (data) {
                scope.allFinesDetails = {
                    data: data,
                    error: data == null || data.error ? true : false,
                    empty: data == 0 ? true : false
                };
                console.log(scope.allFinesDetails)

            }, function () {
                scope.error = "error";
            }).then(function (data) {
                scope.loadingDetails = false;
                $(e.target).parents('tbody').siblings('tbody').addClass('active');
                $(e.target).parents('tbody').find('i.fa-plus-circle').removeClass("fa-plus-circle").addClass("fa-minus-circle");
            });
        }
    }



    scope.initFunctions = function (e) {
        scope.selectedCenterType = (Object.keys(scope.filter.selctedDepartment).length === 0 && (scope.filter.selctedDepartment).constructor === Object) ?
            departmentsList[0].centerTypeCode : scope.filter.selctedDepartment.centerTypeCode;

        scope.emirateCode = scope.filter.emirate == null ? null : scope.filter.emirate.branchPrefix;
        scope.centerCode = scope.filter.branch == null ? null : scope.filter.branch.id;

        scope.addFineFlag = scope.filter.branch == null ? true : false;

        scope.searchFines();
    }

    scope.initFunctions();


}]);