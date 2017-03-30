var Render = function(glassWidth, glassHeight, lineWidth){

	var scope = this;
	var $scope = $(scope);

	// EVENT
	scope.LOADED = 'loaded';   

	var SQUARE_SIZE = 40;

	var FPS = 40;

	var AM = scope.AM = new AssetManager();

	var colors = ['blue', 'green', 'red', 'yellow'];

	scope.getRandomColor = function(){
	  var r = Math.floor(Math.random() * colors.length);
	  return colors[r].toUpperCase();
	};

	var preload, manifest, canvas, stage;

	var background, glassContainer, figureContainer, text;   

	preload = scope.preload = new createjs.LoadQueue(false, 'assets/');

	preload.on('complete', onComplete);

	manifest = [
		{id: colors[0], src: 'block_blue.png'},
		{id: colors[1], src:'block_green.png'},
		{id: colors[2], src: 'block_red.png'},
		{id: colors[3], src: 'block_yellow.png'}
	];
	
	preload.loadManifest(manifest);

	var tween;

	function onComplete(){
		canvas = document.getElementById('gameCanvas');
		stage = new createjs.Stage(canvas);
 
		populateAM();
 
		glassContainer = new createjs.Container();
		glassContainer.x = lineWidth;
 
		figureContainer = new createjs.Container();
 
		background = createBackground();
		background.cache(0, 0, canvas.width, canvas.height);

		text = new createjs.Text("", "20px Arial", 'red');
		text.x = 100;
		text.y = 50;
 
		stage.addChild(background);
		stage.addChild(glassContainer);
		stage.addChild(figureContainer);
		stage.addChild(text);	
 
		// stage.update();
		createjs.Ticker.on('tick', tick);
		createjs.Ticker.setFPS(FPS);
		$scope.trigger(scope.LOADED);
   }

   function tick(){   		
   		stage.update();
   }

	function populateAM(){
		for(var i = 0; i < colors.length; i++){
			AM.addItem(colors[i], function(){
				return new createjs.Bitmap(preload.getResult(colors[i]));
			}, 200);
		}
	}

	function createBackground(){
		var background = new createjs.Shape();
		var g = background.graphics;
 
		// vertical lines
		g.setStrokeStyle(2);
		g.beginStroke("black");
 
		for(var i = 0; i <= glassWidth; i++){
			g.moveTo(i * SQUARE_SIZE + lineWidth, 0);
			g.lineTo(i * SQUARE_SIZE + lineWidth, glassHeight * SQUARE_SIZE);
		}
 
		// horizontal lines
		for(var i = 0; i <= glassHeight; i++){
			g.moveTo(lineWidth, i * SQUARE_SIZE);
			g.lineTo(glassWidth * SQUARE_SIZE + lineWidth, i * SQUARE_SIZE);
		}
 
		g.endStroke();
 
		// glass walls
		g.setStrokeStyle(lineWidth);
		g.beginStroke("black");
 
		g.moveTo(lineWidth / 2, 0);
		g.lineTo(lineWidth / 2, glassHeight * SQUARE_SIZE);
		g.moveTo(0, glassHeight * SQUARE_SIZE + lineWidth / 2);
		g.lineTo(glassWidth * SQUARE_SIZE + lineWidth * 1.5, glassHeight * SQUARE_SIZE + lineWidth / 2);
		g.moveTo(glassWidth * SQUARE_SIZE + 1.5 * lineWidth, glassHeight * SQUARE_SIZE + lineWidth);
		g.lineTo(glassWidth * SQUARE_SIZE + 1.5 * lineWidth, 0);
 
		g.endStroke();
 
		return background;
	}
 
	scope.update = function(figure){
		// if(tween) tween.kill();
		setBlocks();
		setFigure(figure);
		stage.update();
	};
 
	scope.reset = function(){
		// for each block in glass
		while(glassContainer.numChildren > 0){
			var child = glassContainer.getChildAt(0);
			scope.removeBlock(child);
		}
		// for each block in figure
		while(figureContainer.numChildren > 0){
			var child = figureContainer.getChildAt(0);
			figureContainer.removeChild(child);
			AM.put(child);
		}
 
		stage.update();
	};
 
	scope.addBlock = function(block){
		glassContainer.addChild(block);
	};
 
	scope.removeBlock = function(block){
		glassContainer.removeChild(block);
		AM.put(block);
	};
 
	scope.addFigure = function(figure){
		if(tween) tween.kill();
		figureContainer.y = figure.position.y * SQUARE_SIZE;
		var matrix = figure.states[figure.phase].matrix;
		for(var i = 0; i < matrix.length; i++){
			for(var j = 0; j < matrix[0].length; j++){
				var obj = matrix[i][j];
				if(obj){										
					figureContainer.addChild(obj);
				}
			}
		}
	};
 
	function setBlocks(){
		for(var i = 0; i < glassContainer.numChildren; i++){
			var child = glassContainer.getChildAt(i);
			child.x = SQUARE_SIZE * child.column;
			child.y = SQUARE_SIZE * child.row;
		}
	}
 
	function setFigure(figure){
		if(!figure) return;
 
		var centerX = figure.states[figure.phase].center[0];
		var centerY = figure.states[figure.phase].center[1];
		var matrix = figure.states[figure.phase].matrix;
 
		figureContainer.x = lineWidth + (figure.position.x - centerX) * SQUARE_SIZE;		

		var newY = (figure.position.y) * SQUARE_SIZE;

		if(tween) tween.kill();
		var distanceY = Math.abs(figure.position.y * SQUARE_SIZE - figureContainer.y);
		tween = TweenLite.to(figureContainer, 1 / distanceY * SQUARE_SIZE, {y : newY, ease: Power0.easeNone, immediateRender: true});
		
		var index = 0; // child index 		
		for(var i = 0; i < matrix.length; i++){
			for(var j = 0; j < matrix[i].length; j++){
				if(matrix[i][j]){
					var child = figureContainer.getChildAt(index);
					child.x = j * SQUARE_SIZE;					
					child.y = (i - centerY) * SQUARE_SIZE;	
					index++;
				}
			}
		}
	}
};