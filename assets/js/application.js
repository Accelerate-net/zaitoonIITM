!function ($) {

  $(function(){

    var $window = $(window)
    var $body   = $(document.body)

    var navHeight = $('.navbar').outerHeight(true) + 10

    // $body.scrollspy({
    //   target: '.bs-sidebar',
    //   offset: navHeight
    // })

    setTimeout(function () {
    $('[data-spy="scroll"]').each(function () {
        $(this).scrollspy('refresh');
    })
    }, 3000)

    $window.on('load', function () {
      $body.scrollspy('refresh')
    })

    $('.bs-docs-container [href=#]').click(function (e) {
      e.preventDefault()
    })

    // back to top
    setTimeout(function () {
      var $sideBar = $('.bs-sidebar')

      $sideBar.affix({
        offset: {
          top: function () {
            var offsetTop      = $sideBar.offset().top
            var sideBarMargin  = parseInt($sideBar.children(0).css('margin-top'), 10)
            var navOuterHeight = $('.bs-docs-nav').height()

            return (this.top = offsetTop - navOuterHeight - sideBarMargin)
          }
        , bottom: function () {
            return (this.bottom = $('.bs-footer').outerHeight(true))
          }
        }
      })
    }, 100)
    
    //floating title
    setTimeout(function () {
      var $sideBar = $('.floatingHead')

      $sideBar.affix({
        offset: {
          top: function () {
            var offsetTop      = $sideBar.offset().top
            var sideBarMargin  = parseInt($sideBar.children(0).css('margin-top'), 10)
            var navOuterHeight = $('.bs-docs-nav').height()                              

            return (this.top = offsetTop-30-navOuterHeight)
          }
        }
      })
      $(this).css("background", "green");  
    }, 100)
    
    $(window).scroll(function(){
	  $('.menuArea').each(function(){
	    var t = $(this).offset().top - 50,
	        tit = $(this).find('h4').text(),
	        h = $(this).height(),
	        ws = $(window).scrollTop();
	    if (t < ws && ws < (h+t)) {
			 $('.floatingTitle').html(tit);
	    } 
	  })
    })
		

    
    

    setTimeout(function () {
      $('.bs-top').affix()
    }, 100)

    // tooltip demo
    $('.tooltip-demo').tooltip({
      selector: "[data-toggle=tooltip]",
      container: "body"
    })

    $('.tooltip-test').tooltip()
    $('.popover-test').popover()

    $('.bs-docs-navbar').tooltip({
      selector: "a[data-toggle=tooltip]",
      container: ".bs-docs-navbar .nav"
    })

    // popover demo
    $("[data-toggle=popover]")
      .popover()

    // button state demo
    $('#fat-btn')
      .click(function () {
        var btn = $(this)
        btn.button('loading')
        setTimeout(function () {
          btn.button('reset')
        }, 3000)
      })

    // carousel demo
    $('.bs-docs-carousel-example').carousel()
})

}(window.jQuery)
