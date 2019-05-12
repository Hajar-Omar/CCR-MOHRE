// scroll directive
var mainModule = angular.module('MainModule');
mainModule.directive('customScroll', function () {
    return {
        restrict: 'A',
        scope: {
            theme: '='
        },
        link: function postLink(scope, iElement, iAttrs, controller, transcludeFn) {
                iElement.mCustomScrollbar({
                theme: scope.theme,
            });
        }
    };
});