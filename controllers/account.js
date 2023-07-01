angular.module('Account', ['ngRoute', 'ngCookies'])


.config(['$qProvider', function ($qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
}])

    .controller('HistoryController', ['$scope','$http', '$cookies', function($scope, $http, $cookies) {

      //Check if the user is Logged In
      if($cookies.get("user")){
        $scope.isLoggedIn = true;
      }
      else{
        $scope.isLoggedIn = false;
        window.location = "index.html";
      }


      // //Logout function
      // $scope.logoutNow = function(){
      //   if($cookies.get("user")){
      //     localStorage.removeItem("admin");
      //     window.location = "adminlogin.html";
      //   }
      // }


      $scope.limiter = 0;
      $scope.isLeft = true;

      $scope.isFound = false;

      $scope.init = function(){
        var data = {};
        data.id = $scope.limiter;
        data.token = JSON.parse($cookies.get("user")).token;
	$('#loading').show();
        $http({
          method  : 'POST',
          url     : 'https://www.accelerateengine.app/food-engine/apis/orderhistory.php',
          data    : data, //forms user object
          headers : {'Content-Type': 'application/x-www-form-urlencoded'}
         })
          .then(function(response) {
          $('#loading').hide();

              if(!response.data.status){
                $scope.isLeft = false;
                $scope.errorMsg = response.data.error;
                window.location = "index.html";
              }
              else{
                $scope.item = response.data.response;
              }

              if($scope.item.length > 0){
                $scope.isFound = true;
              }

              if($scope.item.length%5 != 0){
                $scope.isLeft = false;
              }
          });

        }
        $scope.init();


        $scope.loadMore = function() {

          console.log('loading more')

          $scope.limiter = $scope.limiter + 5;

          var data = {};
          data.id = $scope.limiter;
          data.token = JSON.parse($cookies.get("user")).token;
	  $('#loading').show();
          $http({
            method  : 'POST',
            url     : 'https://www.accelerateengine.app/food-engine/apis/orderhistory.php',
            data    : data, //forms user object
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
           })
            .then(function(response) {
		$('#loading').hide();
                if(response.data.response.length == 0){
                  $scope.isLeft = false;
                }

                if(!response.data.status){
                  $scope.isLeft = false;
                  $scope.errorMsg = response.data.error;
                  //localStorage.removeItem("user"); //Login Again
                }
                else{
                  $scope.item = $scope.item.concat(response.data.response);
                }

                if($scope.item.length%5 != 0){
                  $scope.isLeft = false;
                }
            });

        }

        $scope.showOrder = function(id) {
          localStorage.setItem("displayOrder", id);
          window.location = "orderdetails.html";
        }


    }])

    .controller('UserProfileController', ['$scope','$http', '$cookies', function($scope, $http, $cookies) {

         var data = {};
         data.token = JSON.parse($cookies.get("user")).token;

         $http({
           method  : 'POST',
           url     : 'https://www.accelerateengine.app/food-engine/apis/fetchusers.php',
           data    : data, //forms user object
           headers : {'Content-Type': 'application/x-www-form-urlencoded'}
          })
           .then(function(response) {
               $scope.user = response.data;
               $scope.profileName = $scope.user.name;
               $scope.profileEmail = $scope.user.email;
           });

         $scope.toggleFlag = 0;
         $scope.swapFlag = function(to){
           $scope.toggleFlag = to;
         }

         //To change profile changes
         $scope.saveProfile = function(name, email){

           if(name != ""){

             $scope.user.name = name;
             $scope.user.email = email;
             $scope.profileName = name;
             $scope.profileEmail = email;


             var data = {};
             data.name = name;
             data.email = email;
             data.token = JSON.parse($cookies.get("user")).token;

	     $('#loading').show();
             $http({
               method  : 'POST',
               url     : 'https://www.accelerateengine.app/food-engine/apis/edituser.php',
               data    : data, //forms user object
               headers : {'Content-Type': 'application/x-www-form-urlencoded'}
              })
               .then(function(response) {
               	$('#loading').hide();
                 if(response.data.status){
                   $scope.toggleFlag = 0;
                   $scope.ProfileEditMsg = "Changes saved successfully";
                 }
                 else {
                   $scope.ProfileEditMsg = response.data.error;
                 }
               });
           }
         }

     }]);


;
