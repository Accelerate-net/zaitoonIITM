angular.module('FullMenu', ['gm', 'ngCookies'])

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
	          	
	          	
		          var temp = JSON.parse(localStorage.getItem('location')) || {};
		          temp.location = fancyPlace;
		          temp.locationCode = lat+'_'+lng;
		          localStorage.setItem("location", JSON.stringify(temp));
		          
	          	
		          	//Try updating outlet:
			        $http.get("https://www.accelerateengine.app/food-engine/apis/googleoutletassigner.php?lat="+lat+"&lng="+lng+"&version=web").then(function(response) {
			       	      var outletInfo = response.data.response;
			              if(response.data.isServed){
			                localStorage.setItem("outletInfo", JSON.stringify(outletInfo));
			                localStorage.setItem("isDeliveryAvailable", true);
			                window.location = "index.html";
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
	


    .controller('MenuController', function($scope, $http, $cookies) {

      //Check if the user is Logged In
      if($cookies.get("user")){
        if(!$cookies.get("donotRegenerate"))
        {       
          //Regenerate Token
          var data = {};
          data.token = JSON.parse($cookies.get("user")).token;

          $http({
            method  : 'POST',
            url     : 'https://www.accelerateengine.app/food-engine/apis/regeneratetoken.php',
            data    : data, //forms user object
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
           })
          .then(function(response) {
            if(response.data.status){
      				$scope.isLoggedIn = true;
      				var temp_user = JSON.parse($cookies.get("user"));
      				temp_user.token = response.data.newtoken

		              //Set new cookies
		              var now = new Date();
		              now.setDate(now.getDate() + 7);
		              $cookies.put("user", JSON.stringify(temp_user), {
		                  expires: now
		              });
		
		              //Donot Regenerate Flag - Cookie
		              var nowRegenerate = new Date();
		              nowRegenerate.setDate(nowRegenerate.getDate() + 1);
		              $cookies.put("donotRegenerate", "DO_NOT_REGENERATE", {
		                  expires: nowRegenerate
		              });
      			}
      			else{
              			$cookies.remove("user");
      				$scope.isLoggedIn = false;
      				if(response.data.error != ""){
					$('#systemWarningWindow').modal('show');
					document.getElementById("systemErrorMsg").innerHTML = response.data.error;
				}
      			}
          });
        }
        else{
          $scope.isLoggedIn = true;
        }
      }
      else{
        $scope.isLoggedIn = false;
      }

      //Is it a delivery or takeaway?
      $scope.isTakeAway = false;

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
      
      $scope.hideBeyondDeliveryWarning = function(){
      	$('#beyondDeliveryWarning').modal('show');
      	window.location = "index.html";
      }
      
      
      //Feedback Section
        $scope.tag = "";
  	$scope.selection = "";
  	$scope.isStarFilled = false;
  	$scope.starRating = "";
  
      $scope.fillTill = function(id){      

	    $scope.isStarFilled = true;
	
	
	    $scope.starRating = id;
	    //Set a tag which matches the selection
	
	    //Less than 5 means, a negative review.
	    if(id < 5)
	      $scope.selection = 'N';
	    else
	      $scope.selection = 'P';
	
	    $scope.tag = "";
	    switch (id){
	      case 1:
	      {
	        $scope.tag = "Terrible";
	        break;
	      }
	      case 2:
	      {
	        $scope.tag = "Bad";
	        break;
	      }
	      case 3:
	      {
	        $scope.tag = "OK";
	        break;
	      }
	      case 4:
	      {
	        $scope.tag = "Good";
	        break;
	      }
	      case 5:
	      {
	        $scope.tag = "Awesome";
	        break;
	      }
	    }
	
	    var i = 1;
	    while(i <= id){
	      document.getElementById("star"+i).className ="fa fa fa-star";
	      i++;
	    }
	    //Empty the remaining stars
	    while(i <= 5){
	      document.getElementById("star"+i).className ="fa fa fa-star-o";
	      i++;
	    }
      }
      
      
	  //Negative Feedback
	  $scope.negative_feedback = {};
	  $scope.negative_feedback.quality = false;
	  $scope.negative_feedback.service = false;
	  $scope.negative_feedback.delivery = false;
	  $scope.negative_feedback.food = false;
	  $scope.negative_feedback.app = false;
	  $scope.negative_feedback.other = false;
	
	  //Positive Feedback
	  $scope.positive_feedback = {};
	  $scope.positive_feedback.quality = false;
	  $scope.positive_feedback.service = false;
	  $scope.positive_feedback.delivery = false;
	  $scope.positive_feedback.food = false;
	  $scope.positive_feedback.app = false;
	  $scope.positive_feedback.other = false;
	        
	        
	  $scope.commentsFeed = "";
	  //Characters Left in the comments
	  document.getElementById('commentsBox').onkeyup = function(){
	    document.getElementById('characterCount').innerHTML =   (150-(this.value.length))+ ' characters left.';
	  }
  	  
  	  
      $scope.feedbackOrderID = "";  
      $scope.feedbackBrief = "";    
      $scope.checkFeedback = function(){      	      	
          var data = {};
          data.token = JSON.parse($cookies.get("user")).token;

          $http({
            method  : 'POST',
            url     : 'https://www.accelerateengine.app/food-engine/apis/getlatestorderid.php',
            data    : data, //forms user object
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
           })
          .then(function(response) {
            	if(response.data.status){
            		$scope.feedbackOrderID = response.data.response;
            		var temp_cart = response.data.cart.items;
            		var mylist = "";
            		temp_cart.forEach(function(item) {
            			if(mylist == ""){
			  		mylist = item.itemName;
			  	}
			  	else{
			  		mylist = mylist +", "+ item.itemName;
			  	}
			});
            		$scope.feedbackBrief = "Order #"+$scope.feedbackOrderID+" ("+mylist+") on "+response.data.date;
            		$('#feedbackWindow').modal('show');
            	}
          });                          	
      }
      
      //Call checkFeedback if logged in
      if($scope.isLoggedIn){
      	$scope.checkFeedback();
      }
      
      $scope.submitFeedback = function(){
      
      	      if($scope.starRating == 5){
	        var reviewObject = {
	          "rating" : $scope.starRating,
	          "quality" : $scope.positive_feedback.quality,
	          "service" : $scope.positive_feedback.service,
	          "delivery" : $scope.positive_feedback.delivery,
	          "food" : $scope.positive_feedback.food,
	          "app" : $scope.positive_feedback.app,
	          "other" : $scope.positive_feedback.other,
	          "comment" : $scope.commentsFeed
	        }
	      }
	      else{
	        var reviewObject = {
	          "rating" : $scope.starRating,
	          "quality" : $scope.negative_feedback.quality,
	          "service" : $scope.negative_feedback.service,
	          "delivery" : $scope.negative_feedback.delivery,
	          "food" : $scope.negative_feedback.food,
	          "app" : $scope.negative_feedback.app,
	          "other" : $scope.negative_feedback.other,
	          "comment" : $scope.commentsFeed
	        }
	      }	      
	      
	      //POST review
	      var data = {};
	      data.token =JSON.parse($cookies.get("user")).token;
	      data.orderID = $scope.feedbackOrderID;
	      data.review = reviewObject;
	      
	      document.getElementById('myFeedSubmit').setAttribute("disabled","disabled");
	      document.getElementById('myFeedSubmit').innerHTML = "...";
	
	      $http({
	        method  : 'POST',
	        url     : 'https://www.accelerateengine.app/food-engine/apis/postreview.php',
	        data    : data,
	        headers : {'Content-Type': 'application/x-www-form-urlencoded'},
	        timeout : 10000
	       })
	      .then(function(response) {
			$('#feedbackWindow').modal('hide');
	      });
      
      }
      
      
      
      
      //New Location Selection
      
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
	              
	              window.location = "index.html";
	      });
	          
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
    	

      
      

      // For Search
      $scope.searchKeyword  = "";


    //Default Outlet = "VELACHERY";
    var outletcode = "HALROAD";
    if(localStorage.getItem("outletInfo") != null){
    	if(JSON.parse(localStorage.getItem("outletInfo"))){
      		outletcode = JSON.parse(localStorage.getItem("outletInfo")).outlet;
      	}
    }


    //FIRST LOAD
    $scope.renderFailed = false;
    $scope.isRenderLoaded = false;                    

                    $http({
                        method: 'GET',
                        url: 'https://www.accelerateengine.app/food-engine/apis/fetchmenuweb.php?outlet='+outletcode,
                        timeout: 10000
                    })
                    .then(function (response) {
		        $scope.menu = response.data;
		        
		        $scope.renderFailed = false;
                        $scope.isRenderLoaded = true;
                        
		    }, function(response) {
		        $scope.renderFailed = true;
		    });
    

    $scope.featureMenu = {};
    $http.get("https://www.accelerateengine.app/food-engine/apis/featuremenuweb.php?outlet="+outletcode).then(function(response) {        
		
        var p = response.data;
        for (var key in p) {
	  if (p.hasOwnProperty(key)) {
	    switch(p[key].cuisine){
	    	case "ARABIAN":{
	    		$scope.featureMenu.ARABIAN = p[key].featured;
	    		break;
	    	}
	    	case "INDIAN":{
	    		$scope.featureMenu.INDIAN = p[key].featured;
	    		break;
	    	}
	    	case "CHINESE":{
	    		$scope.featureMenu.CHINESE = p[key].featured;
	    		break;
	    	}
	    	case "DESSERTS":{
	    		$scope.featureMenu.DESSERTS = p[key].featured;
	    		break;
	    	}	   
	    }
	  }	  
	}	
        
    });
    
    $scope.getFeatureList = function(main){
    	if(main == 'ARABIAN'){
    		return $scope.featureMenu.ARABIAN;
    	} 
    	else if(main == 'CHINESE'){
    		return $scope.featureMenu.CHINESE;
    	} 
    	else if(main == 'INDIAN'){
    		return $scope.featureMenu.INDIAN;
    	} 
    	else if(main == 'DESSERTS'){
    		return $scope.featureMenu.DESSERTS;
    	}    	
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
            }
            else if(flag == -1){
                var oldItems = JSON.parse(localStorage.getItem('itemsInfo')) || [];
                var newItem = item;
                newItem.qty = 1;
                oldItems.push(newItem);
                var x = JSON.parse(localStorage.getItem("itemsInfo")) ;
                localStorage.setItem('itemsInfo', JSON.stringify(oldItems));

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
            

            renderCart();
    }

  })