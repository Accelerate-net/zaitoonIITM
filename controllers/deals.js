angular.module('Deals', ['ngRoute', 'ngCookies', 'gm'])


.config(['$qProvider', function ($qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
}])



	.directive('googlePlaceSuggestions', function($log, $http) {
	  return {
	    restrict: 'A',
	    require: '?ngModel',
	    link: function(scope, element, attrs, ngModel) {
	      var autocomplete = new google.maps.places.Autocomplete(element[0]);
	      autocomplete.setComponentRestrictions( {'country': ['in']});
	      autocomplete.setFields( ['address_components', 'geometry', 'name']);
	      
	      google.maps.event.addListener(autocomplete, 'place_changed', function() {
	      
	      
	          var place = autocomplete.getPlace();
	          if (!place.geometry) {
	            // User entered the name of a Place that was not suggested and
	            // pressed the Enter key, or the Place Details request failed.
	            window.alert("No details available for input: '" + place.name + "'");
	            return;
	          }
	          else{
	          	var lat = place.geometry.location.lat();
	          	var lng = place.geometry.location.lng();
	          	var fancyPlace = place.name;
	          	
	          	
		          var temp = JSON.parse(localStorage.getItem('location')) || [];
		          temp.location = fancyPlace;
		          temp.locationCode = lat+'_'+lng;
		          localStorage.setItem("location", JSON.stringify(temp));
		          
	          	
		          	//Try updating outlet:
			        $http.get("https://www.accelerateengine.app/food-engine/apis/googleoutletassigner.php?lat="+lat+"&lng="+lng+"&version=web").then(function(response) {
			       	      var outletInfo = response.data.response;
			              if(response.data.isServed){
			                localStorage.setItem("outletInfo", JSON.stringify(outletInfo));
			                localStorage.setItem("isDeliveryAvailable", true);
			                window.location = "deals.html";
			              }
			              else{
			                $('#beyondDeliveryWarning').modal('show');
			              	localStorage.setItem("outletInfo", JSON.stringify(outletInfo));
			                localStorage.setItem("isDeliveryAvailable", false);
			              }	
			      	});
		      
	          }
	          
	      });
	    }
	  };
	})
	
	
	
    .controller('DealsController', ['$scope','$http', '$cookies', function($scope, $http, $cookies) {

      //Check if the user is Logged In
      if($cookies.get("user")){
        $scope.isLoggedIn = true;
      }
      else{
        $scope.isLoggedIn = false;
      }

      
      //Check if the location is set
      if(!localStorage.getItem("location")){
        $scope.isLocationSet = false;
      }
      else{
        $scope.locationData = JSON.parse(localStorage.getItem("location"));
        if($scope.locationData.location != null ){
          $scope.isLocationSet = true;
        }
        else{
          $scope.isLocationSet = false;
        }
      }      
      
      //New Location Selection
      $scope.isNewCitySet = false;
      $scope.newCityName = '';
      
      $scope.getPopularAreas = function(cityName){
	      $http.get("https://www.accelerateengine.app/food-engine/apis/popularareas.php?city="+cityName).then(function(response) {
	        $scope.popularAreasList = response.data.response;
	      });
      }
      
      $scope.getPopularAreas('ALL');
           
      
      $scope.toggleLocation = function() {
	if(document.getElementById('myNewLocationWindow').style.display == "block"){
		document.getElementById('myNewLocationWindow').style.display = "none";
	}
	else{
		document.getElementById('myNewLocationWindow').style.display = "block";
	
		if($scope.isLocationSet){
			$scope.googleLocation = $scope.locationData.location;
		}
	}
      }
      
      $scope.closeLocation = function(){
      	$scope.isNewCitySet = false;
        $scope.newCityName = '';
        document.getElementById('locationInput').value = "";
        document.getElementById('remoteNewLocation').style.display = "none";        
        document.getElementById('myNewLocationWindow').style.display = "none"; 
      }
      
      $scope.updateOutlet = function(lat_lng_code){
      
      	var saved_coords = lat_lng_code.split('_');
      
	      $http.get("https://www.accelerateengine.app/food-engine/apis/googleoutletassigner.php?lat="+saved_coords[0]+"&lng="+saved_coords[1]+"&version=web").then(function(response) {
	       	      var outletInfo = response.data.response;

	              if(response.data.isServed){
	                localStorage.setItem("outletInfo", JSON.stringify(outletInfo));
	                localStorage.setItem("isDeliveryAvailable", true);
	              }
	              else{
	              	localStorage.setItem("outletInfo", JSON.stringify(outletInfo));
	                localStorage.setItem("isDeliveryAvailable", false);
	              }	
	              
	              window.location = "deals.html";
	              
	      });
	          
      }
            
       
      $scope.hideBeyondDeliveryWarning = function(){
      	$('#beyondDeliveryWarning').modal('show');
      	window.location = "deals.html";
      }
           
      $scope.setLocationFromPopular = function(popularObject){
      
      	var temp = {};
      	temp.location = popularObject.originalName;
      	temp.locationCode = popularObject.code;
	
	localStorage.setItem("location", JSON.stringify(temp));
	$scope.updateOutlet(popularObject.code);      	
 	          	
	$scope.closeLocation();
      }     
     
	                         
        //New Google Place selection
    	$scope.googleLocation = "";
    	


      
      $scope.limiter = 0;
      $scope.isLeft = true;

      $scope.isFound = false;
      
      $scope.myOutlet = "";
      if(localStorage.getItem("outletInfo")){
      	var temp = JSON.parse(localStorage.getItem("outletInfo"));
        $scope.myOutlet = temp.outlet;
      }      

      $scope.init = function(){
        var data = {};
        //data.id = 0;
        data.outlet = $scope.myOutlet;

        data.token = $scope.isLoggedIn? JSON.parse($cookies.get("user")).token : "";
	$('#loading').show();
        $http({
          method  : 'POST',
          url     : 'https://www.accelerateengine.app/food-engine/apis/fetchdealsweb.php',
          data    : data, //forms user object
          headers : {'Content-Type': 'application/x-www-form-urlencoded'}
         })
          .then(function(response) {
              $('#loading').hide();
              if(!response.data.status){
                $scope.isLeft = false;
                $scope.isFound = false;
                $scope.errorMsg = response.data.error;
              }
              else{
              	$scope.isFound = true;
              	$scope.errorMsg = "";
              	
              	$scope.dealsList = response.data.deals;
              	$scope.combosList = response.data.combos;
                
              }

              if($scope.dealsList.length%5 == 0){
                $scope.isLeft = true;
              }
              else{
              	$scope.isLeft = false;
              }
          });

        }
        $scope.init();


        $scope.loadMore = function() {
/*
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
*/
        }




    $scope.addToCart = function(item){

            var code = item.itemCode;

            if(localStorage.getItem("itemsInfo") === null){
                var temp = [];
                localStorage.setItem("itemsInfo", JSON.stringify(temp));
            }
            var info = JSON.parse(localStorage.getItem("itemsInfo")); //getting items from localStorage
            var i = 0;
            var flag = -1;

            while(i<info.length)
            {
                //checks if item aldready in cart and returns the position of that object if exists
                if(info[i].itemCode==code)
                {
                    flag = i;
                    break;
                }
                i++;
            }
            if(flag != -1){
                var item = JSON.parse(localStorage.itemsInfo);
                //var info = JSON.parse(localStorage.getItem("itemsInfo"))[x];
                item[flag].qty +=1;
                localStorage.setItem("itemsInfo", JSON.stringify(item));
                //console.log(info.itemQuantity);
                console.log((JSON.parse(localStorage.getItem("itemsInfo")))[0]);
            }
            else if(flag == -1){
                var oldItems = JSON.parse(localStorage.getItem('itemsInfo')) || [];
                var newItem = item;
                newItem.qty = 1;
                oldItems.push(newItem);
                var x = JSON.parse(localStorage.getItem("itemsInfo")) ;
                //console.log(x.itemQuantity);
                localStorage.setItem('itemsInfo', JSON.stringify(oldItems));
                var temp_count = Number(document.getElementById("quickCartCount").innerHTML);
		document.getElementById("quickCartCount").innerHTML = temp_count+1;
            }
            
            //Animate
            $("#dish_name_"+code).fadeOut(function(){
                document.getElementById("dish_name_"+code).innerHTML = "<i class='fa fa-check'></i> Added";
             	$("#dish_name_"+code).fadeIn(function(){
             		setTimeout(function(){                 	
	             		$("#dish_name_"+code).fadeOut(function(){
	             			document.getElementById("dish_name_"+code).innerHTML = "Add to Cart";
	             			$("#dish_name_"+code).fadeIn();             		
	             		});
	             	}, 1000);              
            	});              
            });            
            

    }
    
    


    }])

 

;
