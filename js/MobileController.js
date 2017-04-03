function MobileController(){
	$('#gameCanvas').on('touchstart', handleTouchStart);        
	$('#gameCanvas').on('touchmove', handleTouchMove);
	$('#gameCanvas').on('touchend', handleTouchEnd);
	var xDown = null;                                                        
	var yDown = null;   

	var lastKey;

	function handleTouchStart(evt){
	    xDown = evt.touches[0].clientX;                                      
	    yDown = evt.touches[0].clientY;   	                                
	}        

	function handleTouchMove(evt) {
		evt.preventDefault()
		if(!xDown || !yDown){
	        return;
		}

	    var xUp = evt.touches[0].clientX;                                    
	    var yUp = evt.touches[0].clientY;

	    var xDiff = xDown - xUp;
	    var yDiff = yDown - yUp;

	    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {
	        if ( xDiff > 0 ) {
	            /* left swipe */ 
	            console.log('left swipe');
	            lastKey = 37;
	            simulateKey(37);

	        } else {
	            /* right swipe */
	            console.log('right swipe');
	            lastKey = 39;
	            simulateKey(39);
	        }                       
	    } else {
	        if ( yDiff > 0 ) {
	            /* up swipe */
	            console.log('up swipe'); 
	            lastKey = 38;
	            simulateKey(38);
	        } else { 
	            /* down swipe */
	            console.log('down swipe');
	            lastKey = 40;
	            simulateKey(40);
	        }                                                                 
	    }

	    /* reset values */
	    xDown = null;
	    yDown = null;                                             
	}

	function handleTouchEnd(evt){
		$.event.trigger({type: 'keyup', keyCode: lastKey});
	}

	function simulateKey(key){
		$.event.trigger({ type : 'keydown', keyCode : key });		
	}
}