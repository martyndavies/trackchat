// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults
$(document).ready(function(){
	$('ul').hide(); // hide any lists
	$('.spinner').hide();
	$('.errors').hide();
	
	$(".letsgo").click(function() {
		var tweetStore = [];
		
		$('.button').fadeOut('slow');
		$('.spinner').delay(600).fadeIn("slow");
		
		$.getJSON('/tweets.json', function(twitter) {
			$.each(twitter.data.tweets, function(i, tweet){
				//$('.output-list').append('<li id='+i+'>'+ tweet.text + '</li>').fadeIn('slow');
				//urlReadyText = escape(tweet.text);
				urlReadyText = tweet.text
				tweetStore.push(urlReadyText);
			});
			var stripTweets = encodeURIComponent(tweetStore)
			var url = 'http://developer.echonest.com/api/v4/artist/extract?api_key=TGUNRHOPCCFWRVO0A&format=jsonp&callback=?&text=' + stripTweets + '&results=100&sort=hotttnesss-desc&bucket=images';
			$.ajax({
				cache: true,
				dataType: "json",
				crossDomain: true,
				jsonpCallback: "echonest",
				url: url,
				success: function(echonest) {
						$.each(echonest.response.artists, function(i, artist) {
							$('.artist-list').append('<li class=\"'+i+'\"><a href=\"#\" class=\"info\" title=\"'+artist.id+'\"><img src=\"'+artist.images[0].url+'\" alt=\"'+ artist.name + '\" width=\"100\" height=\"100\" border=\"0\"/></a></li>');
						});		
				},
				error: function(a, b, c) {
					$('.errors').append('<li>Sorry, there was an error and we didn\'\t mean it...</li>').fadeIn("slow");
					//alert("Error: "+ a + b + c);
				}
			});
			
			// Fade out the spinner, then fade in the artists
			$('.spinner').fadeOut('slow', function() {
				$('.artist-list').fadeIn('slow');
			});
			
		});
	return false;
	});
	
	$('.info').click(function() {
		var artist_id = $(this).attr("title");
		alert(artist_id);
		return false;
	});
	
});

