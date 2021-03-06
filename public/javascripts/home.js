var ContentPopup = new Class({

  Implements: Options,
  options: {
    triggerEvent: 'click',
    popAnimSpeed: 500
  },

  jQuery: 'contentPopup',

  initialize: function(selector, options) {
    this.setOptions(options);
    this.$elt = $(selector);

    // Init/cache elements
    this.$trigger = $(this.options.trigger);
    this.$title = this.$trigger.find(this.options.title);
    this.$otherPopups = $(this.options.otherPopups).not(this.$elt);

    // Set zIndex to top
    this.$elt.css({ zIndex: 999 });

    // Save height and shrink it
    this.height = this.$elt.height() + this._descMaxHeight();
    this.$elt.height(0);
    this.$elt.hide();

    // Bind trigger event
    this.$trigger.bind(this.options.triggerEvent, $.proxy(this.showHandler, this));
  },
  
  _descMaxHeight: function() {
    var maxHeight = 0;
    this.$elt.find('.desc').each(function(){
      if ($(this).height() > maxHeight)
      {
        maxHeight = $(this).height();
      }
    });
    return maxHeight;
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
    if (!this.hidden())
    {
      return;
    }
    
    // Play sound
    soundManager.play(this.$trigger.attr('id'));
    
    // Hide other popups
    this.$otherPopups.each(function(){
      $(this).contentPopup('hide');
    });

    // Show dismisser
    this._showDismisser();

    // Show popup with animation
    this.$elt.show();
    this.$elt.animate({ height: this.height }, this.options.popAnimSpeed);
    
    // Show title
    this.$title.show();
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
    
    // Hide title
    this.$title.hide();
  },
  
  hidden: function() {
    return !this.$elt.is(':visible');
  }

});



$(document).ready(function() {
  
  /* Hide elements */
  $('.bb-title').hide();
  $('.bb').hide();
  
  trameCallbacks = {
    onplay: function() {
      $.scPlayer.stopAll();
      $('#trame-control').addClass('play');
    },
    onpause: function() {
      $('#trame-control').removeClass('play');
    }
  }

  soundManager.debugMode = false;
  soundManager.url = '/javascripts/soundmanager/swf/';
  soundManager.onload = function() {
    soundManager.createSound('bb-active-matter','/sounds/click-01.mp3');
    soundManager.createSound('bb-active-project','/sounds/click-02.mp3');
    soundManager.createSound('bb-active-sounds','/sounds/click-03.mp3');
    soundManager.createSound('bb-active-contact','/sounds/click-04.mp3');
    soundManager.createSound({
      id: 'trame',
      url: '/sounds/trame.mp3',
      autoPlay: true,
      onplay: trameCallbacks.onplay,
      onresume: trameCallbacks.onplay,
      onpause: trameCallbacks.onpause
    });
    // soundManager.mute('trame');
  };

  $.scPlayer.defaults.loadArtworks = 0;
  $.scPlayer.defaults.onDomReady = null;
  $('.sc-player').scPlayer();
  $(document).bind('onPlayerPlay.scPlayer', function(event){
    soundManager.pause('trame');
  });
  $('#trame-control').click(function(){
    if ($(this).hasClass('play'))
    {
      soundManager.pause('trame');
    }
    else
    {
      soundManager.play('trame');
    }
  });
  
  // Fade bubbles in
  var bbs = new Array();
  $('.bb').each(function(){
    bbs.push($(this));
  });
  for (var i = 0; i < bbs.length; i++)
  {
    var delay = 6000 + 6000 * Math.random();
    bbs[i].fadeIn(delay);
  }

  // Bubble titles
  $('.active').hover(function(){
    $(this).find('.bb-title').fadeIn(400);
  }, function(){
    if ($(this).find('.content-pane').contentPopup('hidden'))
    {
      $(this).find('.bb-title').fadeOut(400);
    }
  });
  
  /* Accordion */
  var accordionOptions = {
    event: "mouseover",
    active: false,
    header: '.title'
  };
  $('#sounds-list').accordion(accordionOptions);
  
  $('#bb-active-matter .content-pane').contentPopup({ trigger: '#bb-active-matter', otherPopups: '.content-pane', title: '.bb-title' });
  $('#bb-active-project .content-pane').contentPopup({ trigger: '#bb-active-project', otherPopups: '.content-pane', title: '.bb-title' });
  $('#bb-active-sounds .content-pane').contentPopup({ trigger: '#bb-active-sounds', otherPopups: '.content-pane', title: '.bb-title' });
  $('#bb-active-contact .content-pane').contentPopup({ trigger: '#bb-active-contact', otherPopups: '.content-pane', title: '.bb-title' });
  
  /* Lightbox */
  $("a[rel^='pretty-photo']").prettyPhoto({
    show_title: false
  });
  $("a[rel^='pretty-photo']").click(function(){
    $.scPlayer.stopAll();
    soundManager.pause('trame');
  });

});