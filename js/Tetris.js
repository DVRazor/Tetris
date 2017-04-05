function Tetris(){

	var scope = this;
	var $scope = $(scope);

	// EVENTS

	scope.SCORE_CHANGED = 'score_changed';
	scope.GAME_OVER = 'game_over';
	
	// CONSTANTS

	const GLASS_WIDTH = 10;
	const GLASS_HEIGHT = 18;
	const GLASS_WALL = 10;
	const STEP_INTERVAL = 40;
	const FALL_DELTA_MAX = 1000;		
	
	var figures = ['1,1,0;0,1,1', '1,1,1,1', '1,0,0;1,1,1', '0,0,1;1,1,1', '1,1;1,1', '0,1,1;1,1,0', '0,1,0;1,1,1', '0,1,0;1,1,1;0,1,0'];		
	
	var pressed_keys = {};		

	var canMoveLeftRight = true;

	var glass = [];

	for(var i = 0; i < GLASS_HEIGHT; i++){
		glass[i] = [];
		for(var j = 0; j < GLASS_WIDTH; j++){
			glass[i].push(null);
		}
	}

	var is_paused = false;	

	var figure_current;

	var figure_next;

	var time_passed = 0;		
	
	var fall_delta = FALL_DELTA_MAX;	

	var render; // visual library

	var score = 0;

	var gameTimer;					

	var AM; // AssetManager

	var backgroundMusic;

/*
	██████╗ ██╗   ██╗██████╗ ██╗     ██╗ ██████╗    ███████╗██╗   ██╗███╗   ██╗ ██████╗████████╗██╗ ██████╗ ███╗   ██╗███████╗
	██╔══██╗██║   ██║██╔══██╗██║     ██║██╔════╝    ██╔════╝██║   ██║████╗  ██║██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║██╔════╝
	██████╔╝██║   ██║██████╔╝██║     ██║██║         █████╗  ██║   ██║██╔██╗ ██║██║        ██║   ██║██║   ██║██╔██╗ ██║███████╗
	██╔═══╝ ██║   ██║██╔══██╗██║     ██║██║         ██╔══╝  ██║   ██║██║╚██╗██║██║        ██║   ██║██║   ██║██║╚██╗██║╚════██║
	██║     ╚██████╔╝██████╔╝███████╗██║╚██████╗    ██║     ╚██████╔╝██║ ╚████║╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║███████║
	╚═╝      ╚═════╝ ╚═════╝ ╚══════╝╚═╝ ╚═════╝    ╚═╝      ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝

*/		

	scope.startGame = function(){
		if(is_paused) setState(states.PLAYING);		
		setState(states.PLAYING);		
	};
	
	scope.isPaused = function(){
		if(isState(states.PLAYING) || isState(states.PAUSED)) return is_paused;		
	};
	scope.getScore = function(){
		return score;
	};

	scope.setPaused = function(toPause){
		if(toPause){
			setState(states.PAUSED);			
		}
		else{
			setState(states.PLAYING);
		}
	};	

/*
	███████╗████████╗ █████╗  ██████╗ ███████╗
	██╔════╝╚══██╔══╝██╔══██╗██╔════╝ ██╔════╝
	███████╗   ██║   ███████║██║  ███╗█████╗  
	╚════██║   ██║   ██╔══██║██║   ██║██╔══╝  
	███████║   ██║   ██║  ██║╚██████╔╝███████╗
	╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚══════╝
*/

	function initStage(){
		render = new Render(GLASS_WIDTH, GLASS_HEIGHT, GLASS_WALL);
		$(render).on(render.LOADED, function(){			
			setState(states.START_SCREEN);
		});

		AM = render.AM;
	}		

/*
	██╗  ██╗███████╗██╗   ██╗███████╗
	██║ ██╔╝██╔════╝╚██╗ ██╔╝██╔════╝
	█████╔╝ █████╗   ╚████╔╝ ███████╗
	██╔═██╗ ██╔══╝    ╚██╔╝  ╚════██║
	██║  ██╗███████╗   ██║   ███████║
	╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝                                 

*/
	function onKeyDown(e){	
		e.preventDefault();					
		pressed_keys[e.keyCode] = true;
	}
	function onKeyUp(e){
		e.preventDefault();						
		pressed_keys[e.keyCode] = false;
	}
	function setKeyEventListeners(){
		$(window).on('keydown', onKeyDown);
		$(window).on('keyup', onKeyUp);
	}

	function removeKeyEventListeners(){			
		$(window).off('keydown', onKeyDown);
		$(window).off('keyup', onKeyUp);
	}

/*
	 ██████╗  █████╗ ███╗   ███╗███████╗    ███████╗██╗   ██╗███████╗███╗   ██╗████████╗███████╗
	██╔════╝ ██╔══██╗████╗ ████║██╔════╝    ██╔════╝██║   ██║██╔════╝████╗  ██║╚══██╔══╝██╔════╝
	██║  ███╗███████║██╔████╔██║█████╗      █████╗  ██║   ██║█████╗  ██╔██╗ ██║   ██║   ███████╗
	██║   ██║██╔══██║██║╚██╔╝██║██╔══╝      ██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║╚██╗██║   ██║   ╚════██║
	╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗    ███████╗ ╚████╔╝ ███████╗██║ ╚████║   ██║   ███████║
	 ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝    ╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝
												
*/

	var _startGame = function(){
		updateFigures();
		setKeyEventListeners();
		clearInterval(gameTimer);

		createjs.Sound.stop();
		backgroundMusic = createjs.Sound.play('background', {loop: -1, volume: 0.5, interrupt: createjs.Sound.INTERRUPT_ANY});					

		gameStep();
	};

	var _setPaused = function(toPause){
		// if "set play"
		if(toPause === false){
			setKeyEventListeners();
			render.pause(false);
			is_paused = false;
			gameStep();
			backgroundMusic.paused = false;
		}
		// if "set pause"
		else if(toPause === true){
			clearInterval(gameTimer);
			removeKeyEventListeners();	
			render.pause(true);				
			is_paused = true;
			backgroundMusic.paused = true;		
		}
	};

	function gameOver(){
		removeKeyEventListeners();
		clearInterval(gameTimer);
		createjs.Sound.stop();
		createjs.Sound.play('gameover')
		render.animateGameOver();
		$scope.trigger(scope.GAME_OVER);
	}

	function resetGame(){
		render.reset();
		is_paused = false;
		updateScore(0);
		fall_delta = FALL_DELTA_MAX;
		pressed_keys = {};

		// nullify glass
		for(var i = 0; i < GLASS_HEIGHT; i++){
			for(var j = 0; j < GLASS_WIDTH; j++){
				glass[i][j] = null;
			}
		}      
		
	}

	function checkFilledRows(){
		for(var i = glass.length - 1; i >= 0; i--){
			// if row is empty			
			if(glass[i].every(function(v){return v == null})) return;

			// if row is complete
			if (glass[i].every(function(v){return v != null})){
				// remove blocks from glass in Render and put to AM
				for(var k = 0; k < glass[i].length; k++){
					render.removeBlockFromGlass(glass[i][k]);
				}
				// for each row, replace it with the above row
				for(var j = i - 1; j >= 0; j--){
					glass[j+1] = glass[j].slice(); // replaced

				// set new row-coordinate
				for(var l = 0; l < glass[i].length; l++){
					if(glass[j+1][l]){
						glass[j+1][l].row = j+1;
						glass[j+1][l].needsUpdate = true;
					}
				}

					// if row is empty 
					if(glass[j].every(function(v){return v == null})) break;
				}
				updateScore();
				createjs.Sound.play('destroy', {interrupt: createjs.Sound.INTERRUPT_ANY});

				// rows moved down, check the same level again
				i++;
			}
		}	
	}

	function updateScore(newScore){		
		if(newScore !== undefined)	score = newScore;
		else score += GLASS_WIDTH;
		$scope.trigger(scope.SCORE_CHANGED);
	}

	/*
	 ██████╗  █████╗ ███╗   ███╗███████╗    ██╗      ██████╗  ██████╗ ██████╗ 
	██╔════╝ ██╔══██╗████╗ ████║██╔════╝    ██║     ██╔═══██╗██╔═══██╗██╔══██╗
	██║  ███╗███████║██╔████╔██║█████╗      ██║     ██║   ██║██║   ██║██████╔╝
	██║   ██║██╔══██║██║╚██╔╝██║██╔══╝      ██║     ██║   ██║██║   ██║██╔═══╝ 
	╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗    ███████╗╚██████╔╝╚██████╔╝██║     
	 ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝    ╚══════╝ ╚═════╝  ╚═════╝ ╚═╝                               

	*/	
	function gameStep(){			
		gameTimer = setInterval(function(){
			// if left and right not pressed together
			if(!(pressed_keys[37] && pressed_keys[39])){
				// arrow left
				if(pressed_keys[37]){
					if(canMoveLeftRight){
						moveFigure(-1, 0);
						canMoveLeftRight = false;
						setTimeout(function(){canMoveLeftRight = true}, 80);
					}
				}
				// arrow right
				else if(pressed_keys[39]){
					// if (moveFigure(1, 0)) pressed_keys[39] = false;
					if(canMoveLeftRight){
						moveFigure(1, 0);
						canMoveLeftRight = false;
						setTimeout(function(){canMoveLeftRight = true}, 80);
					}
				}		
			}			

			// arrow up		
			if(pressed_keys[38]){
				var nextPhase = (figure_current.phase + 1) % 4;
				if (moveFigure(0, 0, nextPhase)) pressed_keys[38] = false;
			}

			// arrow down
			if(pressed_keys[40]){
				fall_delta /= 2;
			}
			else{
				fall_delta = FALL_DELTA_MAX;
			}

			// space — drop
			if(pressed_keys[32]){	
				dropFigure();		
				figureToGlass();
				pressed_keys[32] = false;
			}				
			// automatic fall							
			if(time_passed > fall_delta){
				time_passed = 0;
				if (!(moveFigure(0, 1))) {
					figureToGlass();
				}
			}
			time_passed += STEP_INTERVAL;

		}, STEP_INTERVAL);
	}	

/*
	███████╗██╗ ██████╗ ██╗   ██╗██████╗ ███████╗
	██╔════╝██║██╔════╝ ██║   ██║██╔══██╗██╔════╝
	█████╗  ██║██║  ███╗██║   ██║██████╔╝█████╗  
	██╔══╝  ██║██║   ██║██║   ██║██╔══██╗██╔══╝  
	██║     ██║╚██████╔╝╚██████╔╝██║  ██║███████╗
	╚═╝     ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝

*/
	function generateFigures(){
		var collection = [];		

		// for each figure in figures
		for(var i = 0; i < figures.length; i++){			
			var array = [];
			var rows = figures[i].split(';');			

			// fill array with 0's and 1's
			for(var j = 0; j < rows.length; j++){
				var row = rows[j].split(',').map(function(v){
					return +v;
				});
				array.push(row);
			}

			collection.push(array);
		}		

		return collection;
	}

	function updateFigures(){
		if(!figure_next){
			figure_current = createFigure();
			
		}
		else{
			figure_current = figure_next;
			figure_current.position.y = 0;
		}

		if(hasCollisions(figure_current.position.x, figure_current.position.y, figure_current.phase)){
			setState(states.GAME_OVER);
			return;
		}
		render.addCurrentFigure(figure_current);		

		figure_next = createFigure();
		
		render.addNextFigure(figure_next);

		render.update(figure_current, figure_next);
	}

	function createFigure(){		
		var fig = {};
		var len = _figures.length;
		var random = Math.floor(Math.random() * len);

		fig.position =
			{
				x: GLASS_WIDTH / 2,
				y: 0
			};

		fig.phase = 0;

		var type = _figures[random];

		var color = render.getRandomColor();

		// create a matrix of visual objects
		var matrix = type.slice();
		matrix = matrix.map(function(arr) {
			return arr.map(function(v) {
				if (v == 1) {
					var obj = AM.pull(AM.types[color]);
					return obj;
				}
				else return null;
			});
		});

		fig.states = {};

		// create matrices for 4 rotations
		for(var k = 0; k < 4; k++){
			fig.states[k] = {
				matrix : matrix,
				center: [Math.floor(matrix[0].length / 2), Math.floor(matrix.length / 2)]
			};

			matrix = rotateArray(matrix);
		}

		function rotateArray(array){
			var height = array.length;
			var width = array[0].length;
			var newArray = [];

			for(var i = 0; i < width; i++){
				var newRow = [];
				for(var j = height - 1; j >= 0; j--){
					newRow.push(array[j][i]);
				}
				newArray.push(newRow);
			}

			return newArray;
		}
		
		return fig;
	}

	function figureToGlass(){		
		var position = figure_current.position;	
		var curFigure = figure_current.states[figure_current.phase];
		var array = curFigure.matrix;

		// move objects from figure to glass
		for(var i = 0; i < array.length; i++){
			for(var j = 0; j < array[i].length; j++){
				if(array[i][j]) {
					var centerX = curFigure.center[0];
					var centerY = curFigure.center[1];		
					var currentX = position.x - centerX + j;
					var currentY = position.y - centerY + i;			 		
					if(glass[currentY] !== undefined && glass[currentY][currentX] !== undefined){
						array[i][j].row = currentY;
						array[i][j].column = currentX;			
						render.addBlockToGlass(array[i][j], glass);
						glass[currentY][currentX] = array[i][j];
					}
				}	
			}
		}	

		createjs.Sound.play('hit', { volume: 0.8, interrupt: createjs.Sound.INTERRUPT_NONE });

		checkFilledRows();
		updateFigures();

		render.update();
	}

	function moveFigure(x, y, phase){
		if(!figure_current) return;

		if(phase === undefined)
		{				
			phase = figure_current.phase;
		}

		var position = figure_current.position;	

		if(hasCollisions(position.x + x, position.y + y, phase)){
			return false;
		}

		// if rotating figure
		if(phase != figure_current.phase){
			createjs.Sound.play('whoosh');
		}

		figure_current.position.x += x;
		figure_current.position.y += y;
		figure_current.phase = phase;

		render.update(figure_current);

		return true;
	}

	function dropFigure(){
		while(true){				
			var hasMoved = moveFigure(0, 1);
			if(hasMoved) continue;						
			return;
		}
	}

	function hasCollisions(newPositionX, newPositionY, newPhase){
		var curFigure = figure_current.states[newPhase];
		var array = curFigure.matrix;

		for(var i = 0; i < array.length; i++){
			for(var j = 0; j < array[i].length; j++){
				if(array[i][j]){
					var centerX = curFigure.center[0];
					var centerY = curFigure.center[1];
					var newX = newPositionX - centerX + j;
					var newY = newPositionY - centerY + i;
					// check for walls
					if(newX < 0 || newX >= GLASS_WIDTH || newY >= GLASS_HEIGHT) return true;
					// check for content in glass
					if(glass[newY] !== undefined && glass[newY][newX] !== undefined && glass[newY][newX]) return true;
				}
			}
		}

		return false;
	}
	/*

	███████╗████████╗ █████╗ ████████╗███████╗    ███╗   ███╗ █████╗  ██████╗██╗  ██╗██╗███╗   ██╗███████╗
	██╔════╝╚══██╔══╝██╔══██╗╚══██╔══╝██╔════╝    ████╗ ████║██╔══██╗██╔════╝██║  ██║██║████╗  ██║██╔════╝
	███████╗   ██║   ███████║   ██║   █████╗      ██╔████╔██║███████║██║     ███████║██║██╔██╗ ██║█████╗  
	╚════██║   ██║   ██╔══██║   ██║   ██╔══╝      ██║╚██╔╝██║██╔══██║██║     ██╔══██║██║██║╚██╗██║██╔══╝  
	███████║   ██║   ██║  ██║   ██║   ███████╗    ██║ ╚═╝ ██║██║  ██║╚██████╗██║  ██║██║██║ ╚████║███████╗
	╚══════╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚══════╝    ╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝╚══════╝
*/

	var states = scope.states = {};
	states.LOADING = 0;
	states.START_SCREEN = 1;
	states.PLAYING = 2;
	states.PAUSED = 3;
	states.GAME_OVER = 4;	

	var state = states.LOADING;

	var setState = scope.setState = function(_state){
		switch(_state){
			case states.START_SCREEN:
				if(isState(states.LOADING) || isState(states.GAME_OVER)){
					resetGame();
					_setState();						
					return;
				}
				break;

			case states.PLAYING:
				if(isState(states.START_SCREEN)){
					_setState();
					_startGame();
					return;
				}
				if(isState(states.PAUSED)){					
					_setState();	
					_setPaused(false);					
					return;
				}
				if(isState(states.GAME_OVER) || isState(states.PLAYING)){
					_setState();
					resetGame();
					_startGame();
					return;
				}
				break;

			case states.PAUSED:
				if(isState(states.PLAYING)){
					_setState();
					_setPaused(true);
					return;
				}
				break;

			case states.GAME_OVER:
				if(isState(states.PLAYING) || isState(states.GAME_OVER)){
					_setState();
					gameOver();
					return;
				}
				break;

			default: 				
				break;

		}

		function _setState(){
			console.log("setState: %s => %s", state, _state);
			state = _state;
		}

	};
	var getState = function(){
		return state;
	};

	var isState = function(_state){
		return getState() == _state;
	};


/*
	██╗      ██████╗  █████╗ ██████╗ 
	██║     ██╔═══██╗██╔══██╗██╔══██╗
	██║     ██║   ██║███████║██║  ██║
	██║     ██║   ██║██╔══██║██║  ██║
	███████╗╚██████╔╝██║  ██║██████╔╝
	╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝ 
																	   
	*/
	var _figures = generateFigures();
	initStage();
}	


