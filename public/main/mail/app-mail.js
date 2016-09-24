/**
 * Created by QH217 on 9/24/2016.
 */
var app = angular.module('app', ['ngRoute']);

app.config(['$routeProvider','$locationProvider',
    function($routeProvider) {
        $routeProvider.
        when('/messages', {
            templateUrl: 'main/mail/templates/mail-inbox.html',
            controller: 'inboxController'
        }).
        when('/detail', {
            templateUrl: 'main/mail/templates/mail-detail.html',
            controller: 'viewMailController'
        }).otherwise('/messages')
    }]);

app.factory('messages', function () {
    var savedData = {};
    function set(data) {
        savedData = data;
    }
    function get() {
        return savedData;
    }

    return {
        set: set,
        get: get
    }
});

app.controller('mainController', function ($scope) {
    $scope.title = "BETA";
});

app.controller('inboxController', function ($scope, $http, $location, messages) {
    $http.get('/mail/messages',{cache: true})
        .then(function (response) {
            $scope.data = response.data;
        });

    $scope.viewMail = function(message_id){
        $http.post('/mail/messages/content',{message_id: message_id}, {cache: true})
            .then(function (response) {
                messages.set(response.data);
                $scope.messages = response.data;
                $location.path('/detail');
            });
    };

});

app.controller('viewMailController', function ($scope, $http, $location, messages) {
    $scope.message = messages.get();

    $scope.toInbox = function () {
        $location.path('/messages');
    };

    $scope.downloadFile = function (file_id) {
        $http.get('/mail/files/download?file_id=' + file_id,{cache: true})
            .then(function (response) {
                window.location = response.data.link_download;
            });
    };
});

