var SubtleText = {

    textVis: false, 

    _textBlocks: "",

    _wordDelay: 0,

    _wordPause: 0,

    _letterSpeed: 0,

    _current: 0,

    init: function ( textTarget, wordDelay, wordPause, letterSpeed ) {

        console.log("Subtle.init");

        // GET TEXTBLOCKS FROM EXTERNAL TEXT FILE // TEXT.JS
        this._target = textTarget;
        this._textBlocks = SubtleSources;
        this._wordDelay = wordDelay;
        this._wordPause = wordPause;
        this._letterSpeed = letterSpeed;

        this.mainLoop();

    },

    mainLoop: function () {

        // console.log("Subtle.mainLoop");

        var self = this;

        // IF AT END RETURN TO BEGINNING
        if ( this._current === this._textBlocks.length ) {
            this._current = 0;
        }

        // GET FIRST BLOCK
        var text = this._textBlocks[ this._current ];
        
        // INJECT TEXT INTO TARGET WRAPPER
        this._target.empty().append("<li>" + text + "</li")

        // APPLY LETTERING AND SHOW
        var block = this._target.find("li");
        block.lettering().show();

        setTimeout( function(){

            self.fadeIn( block );

        }, this._wordDelay );

    },

    fadeIn: function ( block ) {

        console.log("Subtle.fadeIn");

        var letters = block.children("span").length,
            index = 0,
            currentLetter,
            self = this;

        // console.log( 80, letters );

        // LOOP THROUGH LETTERS
        var interval = setInterval( function(){

            if ( index < letters ) {

                currentLetter = block.find("span").eq(index);
                currentLetter.css({
                    "filter" : "blur(0px)",
                    "opacity" : "1"
                });
                index++;

            } else {
                
                // console.log("Clear interval.");
                clearInterval(interval);
                // DELAY AND THEN
                setTimeout( function(){
                    self.fadeOut( block, letters );                         
                }, self._wordPause );
              
            }
            
        }, this._letterSpeed );

    },

    fadeOut: function ( block, letters ) {

        // console.log("Subtle.fadeOut");

        var index = 0,
            self = this;

        // LOOP THROUGH LETTERS
        var interval = setInterval( function(){

            if ( index < letters ) {

                currentLetter = block.find("span").eq(index);
                currentLetter.css({
                    "filter" : "",
                    "opacity" : "0"
                });

                index++;

            } else {
                
                // console.log("Clear interval.");
                clearInterval(interval);
                block.hide();
                // WHEN FINISHED RUN MAIN LOOP AGAIN
                self._current++;
                self.mainLoop();

                console.log("Subtle.fadedOut");
              
            }
            
        }, this._letterSpeed );           

    },

    toggleVis: function () {

        // console.log("SubtleText.toggleVis");

        console.log( 136, this._target );

        if ( this.textVis ) {
            console.log( "SubtleText hidden." );
            this._target.hide();
        } else {
            console.log( "SubtleText visible." );
            this._target.show();            
        }

    }

}