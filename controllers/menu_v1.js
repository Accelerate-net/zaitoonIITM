angular.module('FullMenu', ['siyfion.sfTypeahead', 'ngCookies'])

.config(['$qProvider', function ($qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
}])


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
        if($scope.locationData.city != null && $scope.locationData.location != null ){
          $scope.isLocationSet = true;
        }
        else{
          $scope.isLocationSet = false;
        }
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
	}
      }
      
      $scope.closeLocation = function(){
      	$scope.isNewCitySet = false;
        $scope.newCityName = '';
        document.getElementById('locationInput').value = "";
        document.getElementById('remoteNewLocation').style.display = "none";        
        document.getElementById('myNewLocationWindow').style.display = "none";   
        $('.typeahead').typeahead('val', '');   
      }
      
      $scope.updateOutlet = function(myLocationCode){

	      $http.get("https://www.accelerateengine.app/food-engine/apis/fetchoutletsweb.php?locationCode="+myLocationCode).then(function(response) {
	       	      var outletInfo = response.data.response;
	       	      //var outletInfo = JSON.parse(temp);	       	                   

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
            
      $scope.setLocationFromPopular = function(locationObj){
      	var temp = {};
      	temp.location = locationObj.originalName;
      	temp.locationCode = locationObj.code;
      	temp.city = locationObj.city;
	
	localStorage.setItem("location", JSON.stringify(temp));
	$scope.updateOutlet(locationObj.code);      	
 	          	
	$scope.closeLocation();
      }     
     
     $scope.initTypeahead = function(){
     
	     var mycity = $scope.newCityName;
	     var areaSuggestions = new Bloodhound({
	        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
	        queryTokenizer: Bloodhound.tokenizers.whitespace,
	        remote: {
	          url: 'https://www.accelerateengine.app/food-engine/apis/searchareas.php?city='+mycity+'&key=%QUERY',
	          wildcard: '%QUERY'
	        }
	      });
	      
	      $('#remoteNewLocation .typeahead').typeahead('destroy');
		
	      $('#remoteNewLocation .typeahead').typeahead({hint: true, highlight: true, minLength: 2}, {
	        name: 'area',
	        display: 'value',
	        limit: 10,
	        source: areaSuggestions,
	        templates: {
		        empty: function(context){
		          $(".tt-dataset").text('No locations found');
		        }
		}
	      });
    
    
      
      }
 
	      
	                          

      $scope.setNewCity = function(cityName){
      	$scope.newCityName = cityName;
      	$scope.isNewCitySet = true;
      	document.getElementById('remoteNewLocation').style.display = "block";
      	$scope.getPopularAreas(cityName);
      	$scope.initTypeahead();
      }
            
      
      
      
      
      
      
      
      

      //console.log($scope.isLoggedIn);

      // var data = {};
      // data.cuisine = "ARABIAN";
      // data.isFilter = false;
      //
      // $http({
      //   method  : 'POST',
      //   url     : 'http://localhost/vega-web-app/online/services/fetchmenuweb.php',
      //   data    : data, //forms user object
      //   headers : {'Content-Type': 'application/x-www-form-urlencoded'}
      //  })
      // .then(function(response) {
      //   $scope.menu = response.data;
      //   console.log($scope.menu)
      //   if($scope.menu.length == 0)
      //     $scope.isEmpty = true;
      //   else
      //     $scope.isEmpty = false;
      // });

      // For Search
      $scope.searchKeyword  = "";


    //Default Outlet = "VELACHERY";
    var outletcode = "HALROAD";
    if(localStorage.getItem("outletInfo") != null){
    	if(JSON.parse(localStorage.getItem("outletInfo"))){
      		outletcode = JSON.parse(localStorage.getItem("outletInfo")).outlet;
      	}
    }

    $http.get("https://www.accelerateengine.app/food-engine/apis/fetchmenuweb.php?outlet="+outletcode).then(function(response) {
        $scope.menu = response.data;
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

    .controller('CartController', function($scope) {
       $scope.cartNotEmpty = true;
       $scope.cartCount = 10;
	});