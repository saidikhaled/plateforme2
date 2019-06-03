$(document).ready(function () {
	$('#comment_form').submit(function (event) {
		// Prevent the form from submitting via the browser.
		event.preventDefault();
		event.stopPropagation();
		ajaxPost();
	});

	function ajaxPost () {
		// PREPARE FORM DATA
		var formData = {
			comment : $('#comment').val()
		};
		// DO POST
		$.ajax({
			type        : 'POST',
			contentType : 'application/json',
			url         : '/forum/addCom/' + $('#comment_form').data('forumid'),
			data        : JSON.stringify(formData),
			success     : function (data) {
				$('#comments').append(
					"<div id='show_comments' class='bg-light pl-3 mb-3'><p  class='p-2 align-content-center '>" +
						data.lastComment +
						'</p></diV>'
				);
				//addComment(comment);
			},
			error       : function (e) {
				alert('Error!');
				console.log('ERROR: ', e);
			}
		});

		// Reset FormData after Posting
		resetData();
	}
	function resetData () {
		$('#comment').val('');
	}
});
