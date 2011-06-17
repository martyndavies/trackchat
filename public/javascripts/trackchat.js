// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults
$(document).ready(function(){
	$('ul').hide(); // hide any lists
	$('.spinner').hide();
	$('.errors').hide();
	
	function letsGo() {
		var tweetStore = [];
		
		$('.button').fadeOut('slow');
		$('.spinner').delay(600).fadeIn("slow");
		
		$.getJSON('/tweets.json', function(twitter) {
			$.each(twitter.data.tweets, function(i, tweet){
				urlReadyText = tweet.text
				tweetStore.push(urlReadyText);
			});
			
			var stripTweets = encodeURIComponent(tweetStore)
			var url = 'http://developer.echonest.com/api/v4/artist/extract?api_key=TGUNRHOPCCFWRVO0A&format=jsonp&callback=?&text=' + stripTweets + '&results=35&sort=hotttnesss-desc&bucket=images';
			
			$.ajax({
				cache: true,
				dataType: "json",
				crossDomain: true,
				jsonpCallback: "echonest",
				url: url,
				success: function(echonest) {
						$.each(echonest.response.artists, function(i, artist) {
							var imgurl = [];
							var imghref;
							var blankimage = "/images/blank.gif";
							if (artist.images[0] == undefined) {
								imgurl.push(blankimage);
							} else {
							imgurl.push(artist.images[0].url);
							};

							// Check that the img is there, otherwise replace it with a holding image
							$.ajax({
						        type: "HEAD",
						        url: imgurl,
								crossDomain: false,
								statusCode: {
									301: function() {
										imghref = "/images/blank.gif";
									}
								},
						        success: function() {
						        	imghref = imgurl;
						        },
								error: function() {
									imghref = "/images/blank.gif";
								} 
						    });
							
							// if the imgurl is just empty then set it to a holding image
							if (imgurl != null) {
								imghref = imgurl;
							} else {
								imghref = "/images/blank.gif";
							};
							
							// Append the image information and links to the <ul>
							$('.artist-list').append('<li class=\"'+i+'\"><a href=\"#\" class=\"info\" title=\"'+artist.id+'\"><img src=\"'+imghref+'\" alt=\"'+ artist.name + '\" width=\"100\" height=\"100\" border=\"0\"/></a></li>');

						});
							
						// Fade out the spinner, then fade in the artists
						$('.spinner').fadeOut('slow', function() {
							$('.artist-list').fadeIn('slow', function() {
								$('.nav').fadeIn('slow');
							});
						});		
				},
				error: function(a, b, c) {
					$('.errors').append('<li>Sorry, there was an error and we didn\'\t mean it...</li>').fadeIn("slow");
					//alert("Error: "+ a + b + c);
				}
			});
		});
	return false;
	};
	
	// Go and get the artist information on click!
	$('.info').live('click',function() {
		$('#returned-info:visible').fadeOut('slow');
		
		var artistid = $(this).attr('title');
		var artisturl = 'http://developer.echonest.com/api/v4/artist/profile?api_key=TGUNRHOPCCFWRVO0A&id='+artistid+'&bucket=id:7digital&bucket=urls&bucket=years_active&bucket=id:musicbrainz&format=jsonp&callback=?';
		//alert(artistid);
		$.ajax({
			cache: true,
			dataType: "json",
			crossDomain: true,
			jsonpCallback: "echonest",
	        url: artisturl,
	        success: function(echonest) {
				var artistUrls = [];
				var artistName = echonest.response.artist.name;
				$.each(echonest.response.artist.urls, function(service, url) {
					$('.listoflinks').append('<li><a href=\"'+url+'\">'+url+'</a></li>');
				});
				$('#returned-info .name .titlespan').after(artistName);
				$('#returned-info').fadeIn('slow');
	        },
			error: function() {
				$('.errors').append('<li>Sorry, there was an error getting information for that artist!</li>').fadeIn("slow");
			} 
	    });
		$(this).children().css('border-color', 'red');
		return false;
	});
	
	// first big button
	$(".letsgo").click(letsGo);
	
	$('.play').click(function() {
		alert('play button clicked');
	});
		
	// Reload function
	$('.reload').click(function() {
		$(this).html('Reloading...');
		$('#returned-info:visible').fadeOut('slow');
		$('.artist-list').fadeOut("slow", function() {
			$('.artist-list li').delay(600).remove();
			letsGo();
			$('.reload').delay(600).html('Reload');
		});	
	});
	
});

