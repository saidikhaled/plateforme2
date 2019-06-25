var postNumber = 0;

var Board = function (selector) {
	var $elem = $(selector);

	function initialize () {
		$elem.on('click', newPostIt);
	}

	initialize();
};

var PostIt = function () {
	function initialize () {
		$('#board').append(
			'<div class="post-it" id="' +
				postNumber +
				'"><div class="header"><a href="#">X</a></div><div contenteditable="true" class="content"></div></div>'
		);
		$('#' + postNumber).css({ top: event.pageY, left: event.pageX });
		$('.post-it').draggable({ handle: '.header' });
		$('.content').on('click', stopPostItCreation);
		$('a').on('click', deletePostIt);
	}

	function stopPostItCreation (e) {
		e.stopPropagation();
	}

	function deletePostIt (e) {
		e.stopPropagation();
		var $parent = $(this.parentElement.parentElement);
		$parent.remove();
	}

	initialize();
};

$(function () {
	new Board('#board');
});

function newPostIt () {
	new PostIt();
	postNumber += 1;
}
