var ContentPopup = new Class({
	
	Implements: Options,
	options: {
		triggerEvent: 'click',
		popAnimSpeed: 800
	},
	
	jQuery: 'contentPopup',
	
	initialize: function(selector, options) {
		this.setOptions(options);
		this.$elt = $(selector);
		
		// Init/cache elements
		this.$trigger = $(this.options.trigger);
		this.$otherPopups = $(this.options.otherPopups);
		
		// Set zIndex to top
		this.$elt.css({ zIndex: 999 });
		
		// Save height and shrink it
		this.height = this.$elt.height();
		this.$elt.height(0);
		this.$elt.hide();
		
		// Bind trigger event
		this.$trigger.bind(this.options.triggerEvent, $.proxy(this.showHandler, this));
	},
	
	_showDismisser: function() {
		var $dismisser = $('#dismisser');
		
		// Create dismisser if doesn't exist
		if (!$dismisser.length)
		{
			$('body').append('<div id="dismisser" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></div>');
			$dismisser = $('#dismisser');
		}
		
		// Set dismisser just behind active items
		var zIndex = $dismisser.css('zIndex');
		$('.bb.active').each(function(){
			var bbZIndex = $(this).css('zIndex');
			if (bbZIndex <= zIndex)
			{
				$dismisser.css({zIndex: bbZIndex - 1});
			}
		});
		
		// Click event to hide popup
		$dismisser.one('click', $.proxy(this._hideHandler, this));
		
		// Show dismisser
		$dismisser.show();
	},
	_hideDismisser: function() {
		$dismisser = $('#dismisser');
		$dismisser.hide();
		$dismisser.unbind('click');
	},

	showHandler: function(e) {
		this.show();
	},
	_hideHandler: function(e) {
		this.hide();
	},

	show: function() {
		// Hide other popups
		this.$otherPopups.contentPopup('hide');
		
		// Show dismisser
		this._showDismisser();
		
		// Show popup with animation
		this.$elt.show();
		this.$elt.animate({ height: this.height }, this.options.popAnimSpeed);
	},
	hide: function() {
		// Hide popup with animation
		if (this.$elt.height())
		{
			this.$elt.animate(
				{ height: 0 },
				this.options.popAnimSpeed,
				function(){
					$(this).hide();
				}
			)
		}
		
		// Hide dismisser
		this._hideDismisser();
	}
	
});



$(document).ready(function() {

$.scPlayer.defaults.loadArtworks = 0;
$.scPlayer.defaults.onDomReady = null;
$('.sc-player').scPlayer();

// Fade bubbles in
var bbs = new Array();
$('.bb').each(function(){
	bbs.push($(this));
});
for (var i = 0; i < bbs.length; i++)
{
	bbs[i].fadeIn(4000);
}

// Bubble titles
$('.active').hover(function(){
	$(this).find('.bb-title').fadeIn(400);
}, function(){
	$(this).find('.bb-title').fadeOut(400);
});

// var contentPopups = new Array();
// $('.active').each(function(){
// 	contentPopups.push(new ContentPopup($(this).find('.content-pane'), $(this), 'click'));
// });
$('#bb-active-1 .content-pane').contentPopup({ trigger: '#bb-active-1', otherPopups: '.content-pane' });
$('#bb-active-2 .content-pane').contentPopup({ trigger: '#bb-active-2', otherPopups: '.content-pane' });
$('#bb-active-3 .content-pane').contentPopup({ trigger: '#bb-active-3', otherPopups: '.content-pane' });
// var popup = new ContentPopup('.content-pane');
// $('.active').click(function(){
// 	$(this).find('.content-pane').fadeIn(400);
// });

/* Lightbox */
$("a[rel^='pretty-photo']").prettyPhoto({
	show_title: false
});
	
});