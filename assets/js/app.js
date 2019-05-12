/// <reference path="vendor/angular.min.js" />


(function () {
    var app = angular.module("MainModule", ['ngSanitize', "checklist-model", 'ngRoute'])
    // here we define our unique filter
    app.filter('unique', function () {
        // we will return a function which will take in a collection
        // and a keyname
        return function (collection, keyname) {
            // we define our output and keys array;
            var output = [],
                keys = [];

            // we utilize angular's foreach function
            // this takes in our original collection and an iterator function
            angular.forEach(collection, function (item) {
                // we check to see whether our object exists
                if (item != null) {


                    var key = item[keyname];
                    // if it's not already part of our keys array
                    if (keys.indexOf(key) === -1) {
                        // add it to our keys array
                        keys.push(key);
                        // push this item to our final output array
                        output.push(item);
                    }
                }
            });
            // return our array which should be devoid of
            // any duplicates
            return output;
        };
    });

    // app routing
    app.config(function ($routeProvider) {
        if ($('body').attr('dir') == 'ltr') {
            $routeProvider
            .when("/", {
                templateUrl: "./assets/components/defaultMain.html",
                controller: 'MainController'
            })
            .when("/notifications", {
                templateUrl: "./assets/components/notifications.html",
                controller: 'notificationsCtrl'
            })
            .when("/fines", {
                templateUrl: "./assets/components/fines.html",
                controller: 'finesCtrl'
            });
        } else {
            $routeProvider
            .when("/", {
                templateUrl: "./assets/components/defaultMain-ar.html",
                controller: 'MainController'
            })
            .when("/notifications", {
                templateUrl: "./assets/components/notifications-ar.html",
                controller: 'notificationsCtrl'
            })
            .when("/fines", {
                templateUrl: "./assets/components/fines-ar.html",
                controller: 'finesCtrl'
            });
        }
    });

}())
