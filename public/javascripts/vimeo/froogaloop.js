/*!
 * Froogaloop Microframework.
 * Copyright 2010 Vimeo, LLC.
 * @author: Joseph Schmitt
 *
 * Froogaloop is a small Javascript utility framework to help with the complexities
 * involved in dealing with using the Javascript API through window.postMessage
 * for controlling Vimeo's Moogaloop video player. This framework provides a simple
 * API to call functions and add event listeners to Moogaloop when it is embedded
 * using an <iframe>.
 *
 * USAGE:
 * The Froogaloop framework automatically searches the document for all iframes that
 * are embeds of Vimeo videos. It then adds two new functions to the iframe HTMLElement:
 * api and addEvent. To call a function that acts upon the player (such as play, pause,
 * or seek), use the api method. To add an event listener that listens for player
 * events, use the addEvent method.
 *
 * NOTES:
 * 1. To gain JavaScript api access to the Vimeo player, you must pass in a value of 1
 *    for the js_api url parameter to the iframe.
 * 2. If you have more than one iframe per page, each iframe must have a unique id attribute
 *    set and that id must be passed to the iframe via the js_swf_id query parameter.
 *
 *
 * EXAMPLE:
 * var iframe = document.getElementById("myIframe");
 * iframe.api("api_play");
 * iframe.api("api_seekTo", 30);
 * iframe.api("api_setVolume", 80);
 * 
 * iframe.get("api_getDuration", function(duration){
 *    // Handles duration checking
 * });
 *
 * iframe.addEvent("onPlay", function(player_id){
 *    // Handle onPlay event
 * });
 *
 * iframe.addEvent("onSeek", function(time, player_id){
 *    // Handle onSeek event
 * });
 */

var Froogaloop = function() {
    var
    _this = {
        hasWindowEvent: false,
        PLAYER_DOMAIN: '',
        eventCallbacks: {},
        iframe_pattern: /player\.(([a-zA-Z0-9_\.]+)\.)?vimeo(ws)?\.com\/video\/([0-9]+)/i
    },

    /**
     * Attaches itself to all vimeo iframes.
     * 
     * @param iframes (NodeList): List of HTML nodes/elements that should be matched against
     * to check to see if they're a vimeo embed iframe.
     */
    init = function(iframes) {
        if (!iframes) {
            iframes = document.getElementsByTagName('iframe');
        }
        
        var cur_frame,
        i = 0,
        length = iframes.length,
        is_embed_iframe;

        for(i; i<length; i++) {
            cur_frame = iframes[i];
            is_embed_iframe = _this.iframe_pattern.test(cur_frame.getAttribute('src'));

            if(is_embed_iframe) {
                cur_frame.api = _that.api;
                cur_frame.get = _that.get;
                cur_frame.addEvent = _that.addEvent;
            }
        }
    },

    //////////////////////////////////////
    //              API                 //
    //////////////////////////////////////
    _that = {
        /*
         * Calls a function to act upon the player.
         *
         * @param functionName (String): Name of the Javascript API function to call. Eg: "api_play".
         * @param params (Array): List of parameters to pass when calling above function.
         */
        api: function( functionName, params )
        {
            postMessage( functionName, params, this );
        },
        
        get: function(functionName, callback )
        {
            var target_id = this.id != '' ? this.id : null;
            storeCallback(functionName, callback, target_id);
            
            postMessage( functionName, null, this );
        },

        /*
         * Registers an event listener and a callback function that gets called when the event fires.
         *
         * @param eventName (String): Name of the event to listen for.
         * @param callback (Function): Function that should be called when the event fires.
         * @param target (HTML Element): Reference to the <iframe> containing the player. Optional if a
         * target has been set by the Froogaloop.setTarget method.
         */
        addEvent: function( eventName, callback )
        {
            var target_id = this.id != '' ? this.id : null;
            storeCallback(eventName, callback, target_id);

            //The onLoad event is not passed to the SWF
            if(eventName != 'onLoad') {
                postMessage( 'api_addEventListener', [eventName, callback.name], this );
            }

            //Register message event listeners
            if( _this.hasWindowEvent ) {return false;}
            _this.PLAYER_DOMAIN = _utils.getDomainFromUrl(this.getAttribute('src'));

            // Listens for the message event.
            //W3C
            if( window.addEventListener ) {
                window.addEventListener('message', onMessageReceived, false);
            }
            //IE
            else {
                window.attachEvent('onmessage', onMessageReceived, false);
            }

            _this.hasWindowEvent = true;
        }
    },

    //////////////////////////////////////
    //    INTERNAL MESSAGE HANDLERS     //
    //    Do not wander down here.      //
    //    Thar be monsters.             //
    //////////////////////////////////////

    /**
     * Handles posting a message to the parent window.
     *
     * @param method (String): name of the method to call inside the player. For api calls
     * this is the name of the api method (api_play or api_pause) while for events this method
     * is api_addEventListener.
     * @param params (Object or Array): List of parameters to submit to the method. Can be either
     * a single param or an array list of parameters.
     * @param target (HTMLElement): Target iframe to post the message to.
     */
    postMessage = function( method, params, target )
    {
        if(!target.contentWindow.postMessage) {return false;}

        if( params === undefined || params === null ){ params = ''; }
        var
        url = target.getAttribute('src').split('?')[0],
        p = _utils.serialize({
            'method': method,
            'params': params,
            'id'    : target.getAttribute('id')
        });

        target.contentWindow.postMessage(p, url);
    },

    /**
     * Stores submitted callbacks for each iframe being tracked and each
     * event for that iframe.
     *
     * @param eventName (String): Name of the event. Eg. api_onPlay
     * @param callback (Function): Function that should get executed when the
     * event is fired.
     * @param target_id (String) [Optional]: If handling more than one iframe then
     * it stores the different callbacks for different iframes based on the iframe's
     * id.
     */
    storeCallback = function(eventName, callback, target_id)
    {
        if(target_id) {
            if(!_this.eventCallbacks[target_id]){ _this.eventCallbacks[target_id] = {}; }
            _this.eventCallbacks[target_id][eventName] = callback;
        }
        else {
            _this.eventCallbacks[eventName] = callback;
        }
    },

    /**
     * Retrieves stored callbacks.
     */
    getCallback = function(eventName, target_id)
    {
        if(target_id) {
            return _this.eventCallbacks[target_id][eventName];
        }
        else {
            return _this.eventCallbacks[eventName];
        }
    },

    /**
     * Event that fires whenever the window receives a message from its parent
     * via window.postMessage.
     */
    onMessageReceived = function(event)
    {
        // Handles messages from moogaloop only
        if(event.origin != _this.PLAYER_DOMAIN) {return false;}

        // Un-serialize the data and turn it into an object,
        // then send it to the message handler
        onMoogEvent( _utils.unserialize(event.data) );
    },

    onMoogEvent = function(data)
    {
        var
        params = data.params ? data.params.split('"').join('').split(",") : "",
        eventName = data.method,
        target_id = params[params.length-1];

        if(target_id == ''){ target_id = null; }
        
        var callback = getCallback(eventName, target_id);
        if(!callback) return false;

        if(params.length > 0 ) callback.apply(null, params);
        else callback.call();
    },



    //////////////////////////////////////
    //        UTILITY FUNCTIONS         //
    //////////////////////////////////////
    _utils = {
        r20: /%20/g,

        isArray: function(obj)
        {
            return Object.prototype.toString.call(obj) === "[object Array]";
        },

        isFunction: function(obj)
        {
            return Object.prototype.toString.call(obj) === "[object Function]";
        },

        unserialize: function(str)
        {
            if(!str) {return false;}

            var vars = {},
            arr = str.split("&"),
            key, value,
            i = 0;

            for(i; i<arr.length; i++) {
                key = unescape(arr[i].split("=")[0]);
                value = unescape(arr[i].split("=")[1]);

                //recursively unserialize
                if( value.indexOf("=") > -1 ) {value = _utils.unserialize(value);}

                vars[key] = value;
            }

            return vars;
        },

        // Serialize an array of form elements or a set of
        // key/values into a query string
        // Shamelessly stolen and modified from jQuery 1.4 http://jquery.com
        s: false,
        serialize: function( a )
        {
            _utils.s = [];

            for ( var prefix in a )
            {
                _utils.buildParams( prefix, a[prefix] );
            }

            // Return the resulting serialization
            return _utils.s.join("&").replace(_utils.r20, "+");
        },

        buildParams: function( prefix, obj )
        {
            var v, i=0, k=0;
            if ( _utils.isArray(obj) )
            {
                // Serialize array item.
                for( i; i<obj.length; i++ )
                {
                    obj[i] = encodeURIComponent( obj[i] );
                }
                _utils.addToParam( encodeURIComponent(prefix), obj.join(',') );
            }
            else {
                // Serialize scalar item.
                _utils.addToParam( encodeURIComponent(prefix), encodeURIComponent(obj) );
            }
        },

        addToParam: function( key, value ) {
            // If value is a function, invoke it and return its value
            value = _utils.isFunction(value) ? value() : value;
            _utils.s[ _utils.s.length ] = key + "=" + value;
        },

        /**
         * Returns a domain's root domain.
         * Eg. returns http://vimeo.com when http://vimeo.com/channels is sbumitted
         *
         * @param url (String): Url to test against.
         * @return url (String): Root domain of submitted url
         */
        getDomainFromUrl: function(url)
        {
            var url_pieces = url.split('/'),
            domain_str = '',
            i = 0;

            for(i; i<url_pieces.length; i++)
            {
                if(i<3) {domain_str += url_pieces[i];}
                else {break;}
                if( i<2 ) {domain_str += '/';}
            }

            return domain_str;
        }
    }
    ;//end of Methods list
    
    init();
    return {
        init: init
    };
}();