// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults
$(document).ready(function(){
	var api_key = 'TGUNRHOPCCFWRVO0A';
	var audioLink;
	var audioArtist;
	var audioTitle;
	var audioLength;
	var audioSource;
	var currentlyPlayingIndex;
	
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
			var url = 'http://developer.echonest.com/api/v4/artist/extract?api_key='+api_key+'&format=jsonp&callback=?&text=' + stripTweets + '&results=35&sort=hotttnesss-desc&bucket=images';
			
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
							if (artist.images[1] == undefined) {
								imgurl.push(blankimage);
							//} else if (artist.images[1] == contains last.fm){
							//	imgurl.push(artist.images[2].url);
							} else {
								imgurl.push(artist.images[1].url);
							};

							// Check that the img is there, otherwise replace it with a holding image
							$.ajax({
						        type: "HEAD",
						        url: imgurl,
								crossDomain: false,
								statusCode: {
									301: function() {
										imghref = "/images/blank.gif";
									},
									403: function() {
										imghref = "/images/blank.gif";
									},
									501: function() {
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
							} else if (artist.name == "Hey") {
								imghref = "/images/blank.gif";
							} else {
								imghref = "/images/blank.gif";
							};
							
							// Append the image information and links to the <ul>
							$('.artist-list').append('<li class=\"'+i+'\"><a href=\"#\" class=\"info\" title=\"'+artist.id+'\"><img src=\"'+imghref+'\" alt=\"'+ artist.name + '\" width=\"100\" height=\"100\" border=\"0\"/></a></li>');

						});
							
						// Fade out the spinner, then fade in the artists
						$('.spinner').fadeOut('slow', function() {
							$('.artist-list').fadeIn('slow', function() {
								$('.reload').delay(600).html('Reload');
								$('.nav').fadeIn('slow');
							});
						});		
				},
				error: function(a, b, c) {
					$('.errors').append('<li>Sorry, there was an error and we didn\'\t mean it...</li>').fadeIn("slow").delay(10000).fadeOut('slow', function(){$('.errors li').remove();});
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
		var artisturl = 'http://developer.echonest.com/api/v4/artist/profile?api_key='+api_key+'&id='+artistid+'&bucket=id:7digital&bucket=urls&bucket=years_active&bucket=id:musicbrainz&format=jsonp&callback=?';
		
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
				$('.errors').after('<li>Sorry, there was an error getting information for that artist!</li>').fadeIn("slow").delay(10000).fadeOut('slow', function(){$('.errors li').remove();});
			} 
	    });

		$(this).children().css('border-color', 'red');
		return false;
	});
	
	// first big button
	$(".letsgo").click(letsGo);
		
	// Reload function
	$('.reload').click(function() {
		$('.back, .stop, .next').fadeOut('slow');
		$(this).html('Reloading...');
		$('#returned-info:visible').fadeOut('slow');
		$('.artist-list').fadeOut("slow", function() {
			$('.artist-list li').delay(600).remove();
			letsGo();
			currentlyPlayingIndex = 0;
		});	
	});
	
	
	

	// Get 1 track of audio for the specified artist
	function getAudio(artistid) {
		var artisturl = 'http://developer.echonest.com/api/v4/artist/audio?api_key='+api_key+'&id='+artistid+'&format=jsonp&results=1&start=0&callback=?';
		$.ajax({
			cache: true,
			dataType: "json",
			jsonpCallback: "echonestAudio",
			crossDomain:true,
	        url: artisturl,
	        success: function(echonestAudio) {
				if (echonestAudio.response.audio[0] == undefined) {
					$('body').find('.title', artistid).children().css('border-color', '#4E9B06');
					skip();
				} else {
					audioLink = echonestAudio.response.audio[0].url;
					audioArtist = echonestAudio.response.audio[0].artist;
					audioTitle = echonestAudio.response.audio[0].title;
				};

				
				// check links for validity
				$.ajax({
			        type: "HEAD",
			        url: audioLink,
					crossDomain: false,
					statusCode: {
						404: function() {
							$('body').find('.title', artistid).children().css('border-color', '#4E9B06');
							skip();	
						}
					},
			        success: function() {
			        	audioLink = echonestAudio.response.audio[0].url;
			        },
					error: function() {
					} 
			    });

	        },
			error: function(a, b, c) {
				$('.errors').append('<li>Sorry, there was an error getting audio for that artist! Details: </li>'+a+b+c).fadeIn("slow").delay(10000).fadeOut('slow', function(){$('.errors li').remove();});
			} 
	    });
	};

	
	//SoundManager2 Setup
	soundManager.url = '/swf/'; // directory where SM2 .SWFs live
	soundManager.useHTML5Audio = true;
	soundManager.useFlashBlock = false;
	soundManager.debugMode = false;
	


	function getandplay() {
		if (currentlyPlayingIndex == null) {
			currentlyPlayingIndex = 0;
		}
		var thisArtistID = $('body').find('.info').eq(currentlyPlayingIndex).attr('title');
		getAudio(thisArtistID);
		setTimeout(function() {
			soundManager.onready(function() {
			  // SM2 has loaded - now you can create and play sounds!
			  var artistTrack = soundManager.createSound({
			    id: 'artistTrack-'+currentlyPlayingIndex,
			    url: audioLink,
				onplay: function(){
					$('.play').html('Playing...');
					$('body').find('.info').eq(currentlyPlayingIndex).children().css('border-color', 'red');
					$('.next').fadeIn('slow', function() {
						$('.stop').fadeIn('slow', function() {
							if (currentlyPlayingIndex != 0) {
								$('.back').fadeIn('slow');
							};
						});
					});
					currentlyPlayingIndex++;
					$('.nowplaying').html('Now playing: \''+audioTitle+'\'&nbsp;by&nbsp'+audioArtist).fadeIn("slow");
				},
				onload: function() {
	
				},
				onfinish: function() {
					$('body').find('.info').eq(currentlyPlayingIndex-1).children().css('border-color', '#4E9B06');
					getandplay();
				},
				ontimeout: function() {
					$('.errors').append('<li>Damn! Track done timed out!</li>').fadeIn("slow").delay(10000).fadeOut('slow', function(){$('.errors li').remove()});
					$('body').find('.info').eq(currentlyPlayingIndex).children().css('border-color', '#4E9B06');
					currentlyPlayingIndex++;
					getandplay();
				},
				onerror: function() {
					$('body').find('.info').eq(currentlyPlayingIndex).children().css('border-color', '#4E9B06');
					currentlyPlayingIndex++;
					getandplay();
				}
			  });
			artistTrack.play();
			});
		}, 1000);
		return false;
	};
	
	function skip() {
		soundManager.stopAll();
		currentlyPlayingIndex = currentlyPlayingIndex + 1;
		getandplay();
	}
	
	// on click, run the audio function, then play it, when it's done, move on...
	$('.play').live('click', getandplay);
	$('.stop').click(function(){
		soundManager.stopAll();
		soundManager.destroySound('artistTrack'+currentlyPlayingIndex);
		$('body').find('.info').children().css('border-color', '#4E9B06');
		$('.nowplaying').fadeOut('slow');
		$('.next, .back').fadeOut('slow');
		$('.play').html('Play');
		currentlyPlayingIndex = 0;
		return false;
	});
	$('.next').click(function() {
		soundManager.stopAll();
		soundManager.destroySound('artistTrack'+currentlyPlayingIndex);
		$('body').find('.info').eq(currentlyPlayingIndex-1).children().css('border-color', '#4E9B06');
		getandplay();
		return false;
	});
	$('.back').click(function() {
		soundManager.stopAll();
		soundManager.destroySound('artistTrack'+currentlyPlayingIndex);
		$('body').find('.info').eq(currentlyPlayingIndex-1).children().css('border-color', '#4E9B06');
		currentlyPlayingIndex = currentlyPlayingIndex - 2;
		//alert(currentlyPlayingIndex);
		getandplay();
		return false;
	});
});

