angular.module('DineIn', ['ngRoute', 'ngCookies'])

.config(['$qProvider', function ($qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
}])



.controller('DineInController', ['$scope','$http', '$cookies', function($scope, $http, $cookies) {

    //Check if the user is Logged In
    if($cookies.get("user")){
      $scope.isLoggedIn = true;


	   //Clear Pick Up location cache.
	   if(localStorage.getItem("pickupOutlet")){
	     localStorage.removeItem("pickupOutlet");
	   }
	

	      //Check if cart is empty?
	      $scope.isCartEmpty = false;
	      if(JSON.parse(localStorage.getItem("itemsInfo")) == ""){
	        $scope.isCartEmpty = true;
	        window.location = "index.html";
	      }




    }
    else{
      $scope.isLoggedIn = false;

      window.location = "index.html";
    }


    //Default payment options
    $scope.isCOD = false;
    $scope.setMode = function(mode){
      if(mode == 'COD')
        $scope.isCOD = true;
      else
        $scope.isCOD = false;
    }



    //comments
    $scope.orderStuff = {};
    $scope.orderStuff.comments = "";
    
    //Time Slot selection
    $scope.slotTime = 0;
    
    $scope.changeSlot = function(code){
    	$scope.slotTime = code;
    }



    //Coupon Stuff
    $scope.isCouponApplied = false;
    $scope.isCouponFailed = false;
    $scope.couponDiscount = 0;


    //List of outlets in the city
    var temp_location = JSON.parse(localStorage.getItem("location"));

    if(localStorage.getItem("outletInfo") != ""){
      $scope.outletMeta = JSON.parse(localStorage.getItem("outletInfo"));
      $scope.selectedPickup = JSON.parse(localStorage.getItem("outletInfo")).outlet;
    }

    //To re-enable Order Place button
    $scope.restartOrder = function(){
      $scope.isPaymentPending = false;
    }

    $scope.fetchOutlets = function() {
      $http.get('https://www.accelerateengine.app/food-engine/apis/fetchoutletssimple.php?city='+temp_location.city)
      .then(function(response){
        $scope.outletsList = response.data.response;
      });
    }

    //Is Online Payment Available?
    $scope.isPrepaidAllowed = true;
    if($scope.outletMeta){
      $scope.isPrepaidAllowed = $scope.outletMeta['isAcceptingOnlinePayment'];

      if(!$scope.isPrepaidAllowed){
        $scope.isCOD = true;
      }
    }

    //Payment key
    $scope.paymentKey = "";
    if($scope.outletMeta){
      $scope.paymentKey = $scope.outletMeta.razorpayID;
    }





      //Order-Payment status
      $scope.isPaymentPending = false;
      $scope.pendingOrder = "";

      $scope.checkout = function(checkoutAddress, comments, coupon){


        if(0){
          document.getElementById("orderAlert").innerHTML = "Contact Number can not be empty";
        }
        else{

            var info = JSON.parse(localStorage.getItem("itemsInfo"));
            var i = 0;
            var sub_total=0;
            while(i<info.length)   {
                sub_total += (info[i].qty*info[i].itemPrice);
                i++;
            }
            
            //TESTING
            var extra_total = 0;
            var tax_central = 0;
            var tax_state = 0;
            
            if($scope.outletMeta.isCentralTaxCollected){
              tax_central = (sub_total*($scope.outletMeta.centralTaxPercentage)).toFixed(2);
            }
            
            if($scope.outletMeta.isStateTaxCollected){
              tax_state = (sub_total*($scope.outletMeta.stateTaxPercentage)).toFixed(2);
            }
             
            
            extra_total = parseFloat(tax_central) + parseFloat(tax_state);
	    extra_total = Math.round(extra_total);
            

            var cart = {
                "cartTotal": sub_total,
                "cartExtra": extra_total,
                "items": info
            };
           
            
            var myOutlet = JSON.parse(localStorage.getItem("outletInfo")).outlet;

            var data = {};
            data.token = JSON.parse($cookies.get("user")).token;
            data.cart = cart;
            data.outlet = myOutlet;
            data.comments = comments.comments;
            data.location = JSON.parse(localStorage.getItem("location")).locationCode;
            data.modeOfPayment = "PRE";
            data.platform = "WEB";


	    $('#loading').show();
	    
            $http({
              method  : 'POST',
              url     : 'https://www.accelerateengine.app/food-engine/apis/createorderdinein.php',
              data    : data,
              headers : {'Content-Type': 'application/x-www-form-urlencoded'}
             })
              .then(function(response) {
              console.log(response)
              	$('#loading').hide();
                if(response.data.status){

                  $scope.isPaymentPending = true;
                  $scope.pendingOrder = response.data.orderid;

                    document.getElementById("orderAlert").innerHTML = "";
                    //Online Payment
                    var temp_user = JSON.parse($cookies.get("user"));
                    var options = {
                        "key": $scope.paymentKey,
                        "amount": response.data.amount*100,
                        "name": "Zaitoon Online",
                        "description": "Payment for Order #"+response.data.orderid,
                        "image": "https://www.accelerateengine.app/food-engine/apis/images/razor_icon.png",
                        "handler": function (payment_response){

                            var data = {};
                            data.token = JSON.parse($cookies.get("user")).token;
                            data.orderID = response.data.orderid;
                            data.transactionID = payment_response.razorpay_payment_id;
			    
			    var attemptsCount = 1;		    
			    processPayment();
			    
			    function processPayment(){
			    
				    $('#loadingPayment').modal('show');
				    var timeLeft = 20;
				    var mytimer = setInterval(function() {
				    	timeLeft--;
				    	document.getElementById("paymentTimer").innerHTML = timeLeft+" Seconds";
				    	if(timeLeft == 0)
				    	{
				    		clearInterval(mytimer);
				    		document.getElementById("paymentTimer").innerHTML = "Failed. Retrying...";
				    		setTimeout(function(){
				    			attemptsCount++;
				    			if(attemptsCount == 5){
				    				document.getElementById("paymentTimer").innerHTML = "Failed. Order was not Placed.";
				    				document.getElementById("paymentNote").innerHTML = "Create a REFUND REQUEST from Help menu Or contact care@zaitoon.online with Reference ID ("+data.transactionID+") for refunding the debited amount.";
				    				document.getElementById("paymentWarn").innerHTML = "";
				    				document.getElementById("loadingDot").style.visibility = 'hidden';
				    			}
				    			else{
				    				processPayment();
				    			}
				    		}, 2000);
				    	}
				    }, 1000);
			    
			    
	                            $http({
	                              method  : 'POST',
	                              url     : 'https://www.accelerateengine.app/food-engine/apis/processpaymentdinein.php',
	                              data    : data,
	                              headers : {'Content-Type': 'application/x-www-form-urlencoded'},
	                              timeout : 18000
	                             })
	                              .then(function(response) {
		                        clearInterval(mytimer);
	                              	$('#loadingPayment').modal('hide');
	                                if(response.data.status){
	                                  $scope.isPaymentPending = false;
	                                  localStorage.removeItem("itemsInfo");
	                                  localStorage.setItem("displayOrder", response.data.orderid);
	                                  window.location="orderdetails.html";
	                                }
	                                else{
	                                  $scope.isPaymentPending = true;
	                                  alert('Something went wrong. Order is not placed.');
	                                }
	                              });
			  }
                        },
                        "prefill": {
                            "name": temp_user.name,
                            "contact": temp_user.mobile,
                            "email": temp_user.email
                        },
                        "notes": {
                            "address": ""
                        },
                        "theme": {
                            "color": "#e74c3c"
                        }
                    };
                    var rzp1 = new Razorpay(options);
                    rzp1.open();
                    e.preventDefault();
                }
                else{
                  document.getElementById("orderAlert").innerHTML = response.data.error;
                }
              });
            }
        }


    }]);
