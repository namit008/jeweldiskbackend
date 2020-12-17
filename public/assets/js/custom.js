// Home Slide
$('.home-slide').slick({
  infinite: true,
  slidesToShow: 1,
  dots: false,
  autoplay: true,
  slidesToScroll: 1
});

// Owner info slider 
$('.owner-info-slide').slick({
  infinite: true,
  slidesToShow: 1,
  dots: true,
  arrows: false,
  autoplay: true,
  slidesToScroll: 1
});

// scrollTop
$(document).ready(function(){ 
			
	$(window).scroll(function(){
		if ($(this).scrollTop() > 100) {
			$('.scrollup').fadeIn();
		} else {
			$('.scrollup').fadeOut();
		}
	}); 
	
	$('.scrollup, .menu-scroll').click(function(){
		$("html, body").animate({ scrollTop: 0 }, 600);
		return false;
	});

});
