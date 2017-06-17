var BlueText = {
	
	textVis: false, 

    _current: 0,

	init: function () {

		console.log("BlueText.init");

		// APPEND WRAPPER 
        $("body").append("<div id='blue_wrapper'></div>");

        // GET TEXTBLOCKS FROM EXTERNAL TEXT FILE // TEXT.JS
        this._target = $("#blue_wrapper");
        this._textBlocks = BlueSources;
        this._wordDelay = 12000;
        this._wordPause = 8000;
        this._letterSpeed = 120;

        this.mainLoop();

    },

    mainLoop: function () {

		console.log("BlueText.mainLoop");

        var wordDelayWiggle = ( Math.random() + 1 ) * this._wordDelay, 
        	self = this;

        // IF AT END RETURN TO BEGINNING
        if ( this._current === this._textBlocks.length ) {
            this._current = 0;
        }

        // GET FIRST BLOCK
        var text = this._textBlocks[ this._current ];
        
        // INJECT TEXT INTO WRAPPER
		this._target.empty().append("<p>" + text + "</p>")

		// APPLY LETTERING AND SHOW
		var block = this._target.find("p");
		block.lettering().show();

        setTimeout( function(){

            self.type( block );

        }, wordDelayWiggle );

    },

    type: function ( block ) {

    	console.log("BlueText.type");

    	var letters = block.children("span").length,
            index = 0,
            currentLetter,
            self = this;

		function letterLoop () {

			var letterSpeedWiggle = ( Math.random() + 1 ) * self._letterSpeed;

			if ( index < letters ) {

                currentLetter = block.find("span").eq(index);
                currentLetter.css({
                    "opacity" : "1"
                });
                index++;
                // RUN AGAIN AFTER RANDOMIZED DELAY
                setTimeout( function(){
                	letterLoop();                	
                }, letterSpeedWiggle );

            } else { // END OF BLOCK

                // DELAY AND THEN
                setTimeout( function(){

				    self.erase( block, letters );
				                     
                }, self._wordPause );
              
            }

		}

		letterLoop();

    },

    erase: function ( block, letters ) {

    	console.log("BlueText.erase");

    	// TWO CHOICES:
    	// ONE BY ONE OR SELECT ALL + ERASE

    	var self = this;

    	if ( Math.random() > 0.5 ) {

	        var index = letters,
				letterSpeedWiggle = ( Math.random() + 0.5 ) * this._letterSpeed / 2;

	        // LOOP THROUGH LETTERS
	        var interval = setInterval( function(){

	            if ( index > 0 ) {

	                currentLetter = block.find("span").eq(index);
	                currentLetter.css({
	                    "filter" : "",
	                    "opacity" : "0"
	                });

	                index--;

	            } else {
	                
	                // console.log("Clear interval.");
	                clearInterval(interval);
	                block.hide();
	                // WHEN FINISHED RUN MAIN LOOP AGAIN
	                self._current++;
	                self.mainLoop();
	              
	            }
	            
	        }, letterSpeedWiggle  );   

    	} else {

	        // SELECT ALL + ERASE
        	var range = document.createRange();
        	range.selectNodeContents( block[0] );
		    var sel = window.getSelection();
		    sel.removeAllRanges();
		    sel.addRange( range );

		    setTimeout( function(){
				self._current++;
				self.mainLoop();
			}, 500 );

    	}

    },

    toggleVis: function () {

    	console.log("BlueText.toggleVis");

    	if ( this.textVis ) {
    		console.log( "BlueText hidden." );
    		this._target.hide();
    	} else {
    		console.log( "BlueText visible." );
    		this._target.show();    		
    	}

    }

}