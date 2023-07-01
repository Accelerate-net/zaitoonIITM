angular.module('OrderInfo',['ngRoute', 'ngCookies'])

.config(['$qProvider', function ($qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
}])



.controller('DetailsController', ['$scope','$http', '$interval', '$cookies', function($scope, $http, $interval, $cookies) {

      if(!$cookies.get("user")){
        window.location = "index.html";
      }

      $scope.isFaked = false;

      $scope.init = function(){

        $scope.item=null;
        $scope.cart=null;
        var data = {};
        data.orderID = localStorage.getItem("displayOrder");
        data.token = JSON.parse($cookies.get("user")).token;
        
        $('#loading').show();

        $http({
          method  : 'POST',
          url     : 'https://www.accelerateengine.app/food-engine/apis/orderinfo.php',
          data    : data,
          headers : {'Content-Type': 'application/x-www-form-urlencoded'}
         })
          .then(function(response) {
          $('#loading').hide();
            if(response.data.status){
              $scope.item = response.data.response;
              $scope.isTakeAway = response.data.response.isTakeaway;
              console.log($scope.isTakeAway)
              $scope.address = JSON.parse(response.data.response.address || '[]');
              $scope.cart = response.data.response.cart;
            }
            else{
              $scope.isFaked = true;
              window.location="account.html";
            }

          });

        }

        $scope.init();

        //Repeated Pooling of Track Page
        $interval(function () {
          $scope.init();
        }, 20000);

    }]);
