(function($){
	$(document).ready(function(){
		var tetris = new Tetris();
		$(tetris)
			.on(tetris.SCORE_CHANGED, onScoreChanged)
			.on(tetris.GAME_OVER, onGameover);

		var $startBtn = $('#start');
		var $pauseBtn = $('#pause');
		var $playBtn = $('#play');
		var $newBtn = $('#new');

		$startBtn.on('click', function(){
			$pauseBtn.show();
			$playBtn.hide();
			tetris.startGame();						
		});

		$pauseBtn.on('click', function(){
			if(tetris.isPaused() !== false)	return;
			tetris.setPaused(true);
			$(this).hide();
			$playBtn.show();
		});

		$playBtn.on('click', function(){
			if(tetris.isPaused() !== true)	return;
			tetris.setPaused(false);
			$(this).hide();
			$pauseBtn.show();
		});
	

		function onGameover(e){
			console.log('GAME OVER');            
		}

		function onScoreChanged(e){
			var $score = $('#score');
			$score.html(tetris.getScore());            
		}
	});

})(jQuery);