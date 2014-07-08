/**
 * Freeow!
 * Stylish, Growl-like message boxes
 *
 * Copyright (c) 2012 PJ Dietz
 * Version: 1.0.2
 * Modified: 2012-05-03
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * http://pjdietz.com/jquery-plugins/freeow/
 */

/**
 * This is a custom implementation of Freeow. Do not upgrade without making the neccessary changes.
 *      Change List
 *          - Added swiping feature using mouse.
 *          - Changed template function to accept and build a jQuery object instead of just accepting text/html.
 *          - Added ability to store metadata (alertID, eventID, etc.) in the Freeow object.
 */

/*global setTimeout, jQuery */

(function ($) {

    "use strict";

    var Freeow;

    Freeow = function (title, message, options, metadata) {

        var startStyle, i, u;

        // Merge the options.
        this.options = $.extend({}, $.fn.freeow.defaults, options);
        this.metadata = $.extend({}, metadata);

        // Build the element with the template function.
        this.element = $(this.options.template(title, message));

        // Set its initial style to the startStyle or hideStyle.
        if (this.options.startStyle) {
            startStyle = this.options.startStyle;
        }
        else {
            startStyle = this.options.hideStyle;
        }
        this.element.css(startStyle);

        // Store a reference to it in the data.
        this.element.data("freeow", this);

        // Add to the element.
        for (i = 0, u = this.options.classes.length; i < u; i += 1) {
            this.element.addClass(this.options.classes[i]);
        }

        // Bind the event handler.
        this.element.mousedown(this.options.onDown);
        this.element.hover(this.options.onHover);

        // Default. Set to true in show() if there's an autoHideDelay.
        this.autoHide = false;

    };

    Freeow.prototype = {

        attach: function (container) {

            if (this.options.prepend) {
                $(container).prepend(this.element);
            } else {
                $(container).append(this.element);
            }

            this.show();
        },

        show: function () {

            var opts, self, fn, delay;

            opts = {
                duration: this.showDuration
            };

            // If an auto hide delay is set, create a callback function and
            // set it to fire after the auto hide time expires.
            if (this.options.autoHide && this.options.autoHideDelay > 0) {

                this.autoHide = true;

                self = this;
                delay = this.options.autoHideDelay;
                fn = function () {
                    if (self.autoHide) {
                        self.hide();
                    }
                };

                opts.complete = function () {
                    setTimeout(fn, delay);
                };

            }

            // Animate to the "show" style.
            // Optionally, set the auto hide function to fire on a delay.
            this.element.animate(this.options.showStyle, opts);

        },

        hide: function () {

            var self = this; // Keep "this" from current scope;

            this.element.animate(this.options.hideStyle, {
                duration: this.options.hideDuration,
                complete: function () {
                    self.destroy();
                }
            });

        },

        destroy: function () {

            // Remove the Freeow instance from the element's data.
            this.element.data("freeow", undefined);

            // Remove the element from the DOM.
            this.element.remove();

        }

    };

    // Extend jQuery -----------------------------------------------------------

    if (typeof $.fn.freeow === "undefined") {

        $.fn.extend({

            freeow: function (title, message, options, metadata) {

                return this.each(function () {

                    var f;

                    f = new Freeow(title, message, options, metadata);
                    f.attach(this);

                }); // return this.each()

            } // freeow()

        }); // $.fn.extend()

        var startX = null;
        var startY = null;
        var containerX = null;
        var clickActive = false;
        // Configuration Defaults.
        $.fn.freeow.defaults = {

            autoHide: true,
            autoHideDelay: 3000,
            classes: [],
            prepend: true,
            startStyle: null,
            showStyle: {opacity: 1.0},
            showDuration: 250,
            hideStyle: {opacity: 0.0},
            hideDuration: 500,

            onHover: function (event) {
                $(this).data("freeow").autoHide = false;

            },

            onDown: function (event){
                if(clickActive == true){
                    $(this).css({left: 0});
                    clickActive = false;
                    $(this).parents().eq(1).attr('unselectable', 'off')
                        .css('user-select', 'text')
                        .css('-moz-user-select', 'text')
                        .css('-khtml-user-select', 'text')
                        .css('-webkit-user-select', 'text');
                    return;
                }
                clickActive = true;
                startX = event.pageX;
                startY = event.pageY;

                var temp = $(this).parent().position();
                containerX = temp.left;

                //Bind the body onUp event so the user isn't selecting everything
                $(this).parents().eq(1).attr('unselectable', 'on')
                    .css('user-select', 'none')
                    .css('-moz-user-select', 'none')
                    .css('-khtml-user-select', 'none')
                    .css('-webkit-user-select', 'none');


                var self = this;

                var mouseUpListener = function(event){
                    $(self).parents().eq(1).off('mouseup', mouseUpListener);
                    $(self).parents().eq(1).off('mousemove', mouseMoveListener);

                    //MouseUp triggered
                    if(clickActive == true){

                        clickActive = false;

                        if(Math.abs(event.pageY - startY) > 50)
                        { // if the user drug over 50 pixels up or down, they may not be swiping
                            $(self).css({left: 0});
                        }
                        else if(event.pageX - startX < 100)
                        { // Too short of a swipe
                            $(self).css({left: 0});
                        }
                        else
                        { // Should be an official swipe.
                            br.Timeline.ignoredHiddenEntities.push(parseInt($(self).find('.IDs').text()));
                            $(self).data("freeow").hide();
                        }
                    }

                    $(this).parents().eq(1).attr('unselectable', 'off')
                        .css('user-select', 'text')
                        .css('-moz-user-select', 'text')
                        .css('-khtml-user-select', 'text')
                        .css('-webkit-user-select', 'text');
                };

                var mouseMoveListener = function(event){
                    if(clickActive == true){
                        if(startX == 0){
                            $(self).css({left: 0});
                            clickActive = false;
                            $(self).parents().eq(1).off('mouseup', mouseUpListener);
                            $(self).parents().eq(1).off('mousemove', mouseMoveListener);
                            return;
                        }

                        var temp = event.pageX - startX;
                        if(event.pageX < containerX)
                        {
                            $(self).css({left: 0});
                            clickActive = false;
                            $(self).parents().eq(1).off('mouseup', mouseUpListener);
                            $(self).parents().eq(1).off('mousemove', mouseMoveListener);
                        }
                        else if(Math.abs(event.pageY - startY) > 50)
                        {
                            $(self).css({left: 0});
                            clickActive = false;
                            $(self).parents().eq(1).off('mouseup', mouseUpListener);
                            $(self).parents().eq(1).off('mousemove', mouseMoveListener);
                        }
                        else if(event.pageX < startX)
                        {
                            $(self).css({left: 0});
                            clickActive = false;
                            $(self).parents().eq(1).off('mouseup', mouseUpListener);
                            $(self).parents().eq(1).off('mousemove', mouseMoveListener);
                        }
                        else
                        {
                            $(self).css({left: temp});
                        }
                    }
                };

                $(this).parents().eq(1).on('mouseup', mouseUpListener);
                $(this).parents().eq(1).on('mousemove', mouseMoveListener);
            },

        //    onMove: function(event){},

            template: function (title, message) {

                var closeButton = $('<span class="close"></span>').click(function() {
                    var alertId = $(this).parents(br.Timeline.NotificationCenter.FREEOW_CONTAINER_CLASS).data('freeow').metadata.alertId;
                    br.Timeline.NotificationCenter.deleteNotification(alertId);
                });
                
                message.wrapAll('<div class="container-freeow"><div class="background"><div class="content"></div></div></div>');
                var newContainer = message.parents('.container-freeow');
                newContainer.append(closeButton);
                message.parent().prepend('<h2>' + title + '</h2>');

                return newContainer;
            }

        }; // $.fn.freeow.defaults

    } // if undefined

}(jQuery));
