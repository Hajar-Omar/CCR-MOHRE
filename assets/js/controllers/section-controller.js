/// <reference path="../vendor/angular.min.js" />



(function () {
    var appHeader = angular.module("MainModule");
    var loadController = 0;
    var SectionController = function (scope, http, api, timeout) {
        if (loadController === 0) {

            scope.openPile = function (e) {
                var elem = $(e.target.closest('.filter-item'));
            }

        }
    }
    appHeader.controller("SectionController", ["$scope", "$http", "$api", "$timeout", SectionController]);
}())
