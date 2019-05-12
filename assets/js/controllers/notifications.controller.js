var mainModule = angular.module('MainModule');
mainModule.controller('notificationsCtrl', ["$scope", "$api", "$apiNoti", "$compile", function (scope, api, apiNoti, compile) {

    //close opened side menu
    $('header .nav-icon.float-l.toggle-open').removeClass('open');
    $('header .left-menu').removeClass('open');

    scope.$on('sendDown', function (e) {
        scope.$emit("sendUp", scope.initFunctions());
    });

    //modal email
    scope.showModalEmail = false;
    scope.counter = 0;
    scope.toggleModalEmail = function () {
        scope.counter++;
        scope.showModalEmail = !scope.showModalEmail;
        if (scope.counter == 1) {
            $('.EmailBody').richText();//just at the first time
        }
        if (scope.showModalEmail == true) {  //load default data when open
            scope.loadEmailTemplate();
        }
    };

    $(".modal[title='EMAIL']").on('hide.bs.modal', function () {  //when close modal empty textarea
        $('.EmailBody').val('');
        $('.richText-editor').empty();
    });

    scope.selectedViolationType = {};
    scope.selectedViolationCode = 1;

    scope.changedViolationValue = function (item) {
        scope.selectedViolationCode = item.violationCode;
        $('.EmailBody').val('');
        $('.richText-editor').empty();
        scope.loadEmailTemplate();
    }

    scope.loadEmailTemplate = function () {
        apiNoti.getEmailTemplate(scope.selectedCenterType, scope.selectedViolationCode).then(function (data) {
            scope.emailTemplate = data;
            $(scope.emailTemplate).each(function (i, ele) {
                if (ele.type == "textarea") {
                    scope.emailTemplateBody = ele;
                } else {
                    scope.emailTemplateSubject = ele;
                }
            });

            scope.selectedViolationType = scope.violations[0];
            $('.EmailBody').val(scope.emailTemplate[0].value);
            $('.richText-editor').append(scope.emailTemplate[0].value);
        }, function () {
            scope.error = "error";
        });
    }

    scope.saveEmailTemplate = function () {
        var updatedEmailTemplate = scope.emailTemplate.map(function (ele) {
            var el = {
                "key": ele.key,
                "value": ele.type == "text" ? ele.value : $('.EmailBody').val()
            };
            return el;
        });
        apiNoti.updateEmail(updatedEmailTemplate).then(function (response) {
            if (response.status == 200) {
                scope.showSnackbarSuccess();
            }
        }, function (error) {
            console.log(error.statusText);
        });
    }
    //end of modal email


    //modal config
    scope.showModalConfig = false;
    scope.toggleModalConfig = function () {
        scope.showModalConfig = !scope.showModalConfig;
        if (scope.showModalConfig == true) {  //load default data when open
            scope.loadEmailConfig();
        }
    };
    scope.loadEmailConfig = function () {
        apiNoti.getEmailConfig(scope.selectedCenterType).then(function (data) {
            scope.emailConfig = data;
            // scope.test = '<div class="form-group" ng-repeat="c in emailConfig"> <label for="input{{$index}}">{{c.label}}</label> <input type="{{c.type}}" name="{{c.key}}"  ng-model="c.value" ng-value="c.value" class="form-control" id="input{{$index}}" /></div>';
            // var html = compile(scope.test)(scope);
            // angular.element(document.getElementById("test2")).append(html);
        }, function () {
            scope.error = "error";
        });
    }

    scope.saveEmailConfig = function () {
        var updatedEmailConfig = scope.emailConfig.map(function (ele) {
            var e = {
                "key": ele.key,
                "value": ele.value
            };
            return e;
        });
        apiNoti.updateEmail(updatedEmailConfig).then(function (response) {
            if (response.status == 200) {
                scope.showSnackbarSuccess();
            }
        }, function (error) {
            console.log(error.status);
        })
    }
    //end of modal config


    //search notifications
    var d = new Date();
    var currentYear = d.getFullYear();
    var currentMonth = d.getMonth() + 1;

    scope.notiFromDate = '1/' + (currentMonth) + '/' + currentYear;
    scope.notiToDate = new Date(currentYear, currentMonth, 0).getDate() + '/' + (currentMonth) + '/' + currentYear;

    scope.vioOptions = {};
    scope.vioOptions.selectedViolation = 0;

    scope.loadViolations = function () {
        apiNoti.getViolationsTypes().then(function (data) {
            scope.violations = data;
        }, function () {
            scope.error = "error";
        });
    }

    scope.searchNotifications = function (e) {
        scope.loading = true;
        scope.notifications = {
            centerTypeCode: scope.selectedCenterType,
            fromDate: scope.notiFromDate,
            toDate: scope.notiToDate,
            emirateCode: scope.emirateCode,
            centerCode: scope.centerCode,
            violationType: scope.vioOptions.selectedViolation
        }
        apiNoti.postNotifications(scope.notifications).then(function (data) {
            scope.allNotifications = {
                data: data,
                error: data == null || data.error ? true : false,
                empty: data == 0 ? true : false
            };

            console.log(scope.allNotifications.data)
        }, function () {
            scope.error = "error";
        }).then(function (data) {
            scope.loading = false;
        });
    }

    scope.resetDeafult = function (e) {
        scope.notiFromDate = '1/' + (currentMonth) + '/' + currentYear;
        scope.notiToDate = new Date(currentYear, currentMonth, 0).getDate() + '/' + (currentMonth) + '/' + currentYear;
        scope.vioOptions.selectedViolation = 0;
    }

    scope.loadNotificatinDetails = function (e) {
        scope.loadingDetails = true;
        if (!$(e.target).parents('tbody').hasClass('active')) {  //hit the open item again
            $(e.target).parents('tbody').addClass('active');
            $(e.target).parents('tbody').find('i.fa-minus-circle').removeClass("fa-minus-circle").addClass("fa-plus-circle");
            scope.loadingDetails = false;
        } else {
            $(e.target).parents('.table').find('tbody').removeClass('active');
            $(e.target).parents('tbody').siblings('tbody').find('i.fa-minus-circle').removeClass("fa-minus-circle").addClass("fa-plus-circle");
            scope.notificationDetails = {
                centerTypeCode: scope.selectedCenterType,
                fromDate: scope.notiFromDate,
                toDate: scope.notiToDate,
                emirateCode: $(e.target).parents('td').data('emirate'),
                centerCode: $(e.target).parents('td').data('center'),
                violationType: $(e.target).parents('td').attr('data-viotype')
                // emirateCode: scope.emirateCode,  //from filter or table
                // centerCode: scope.emirateCode ? $(e.target).parents('td').data('center') : null, // from parent tr is better but low performance
                // violationType: scope.vioOptions.selectedViolation
            }
            apiNoti.postNotificationsDetails(scope.notificationDetails).then(function (data) {
                scope.allNotificationDetails = {
                    data: data,
                    error: data == null || data.error ? true : false,
                    empty: data == 0 ? true : false
                };
                console.log(scope.allNotificationDetails)

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
        // scope.centerCode = scope.filter.branch == null ? null : (scope.filter.branch.emiratePrefix + '-' + scope.filter.branch.branchSuffix);
        scope.centerCode = scope.filter.branch == null ? null : scope.filter.branch.id;

        scope.loadViolations();
        scope.searchNotifications();

    }

    scope.initFunctions();


}]);

