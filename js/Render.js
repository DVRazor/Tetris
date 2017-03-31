var Render = function(GLASS_WIDTH, GLASS_HEIGHT, lineWidth){

	var scope = this;
	var $scope = $(scope);

	// EVENT
	scope.LOADED = 'loaded';   

	var SQUARE_SIZE = 40;

	var FPS = 60;

	var AM = scope.AM = new AssetManager();

	var colors = ['blue', 'green', 'red', 'yellow'];

	scope.getRandomColor = function(){
	  var r = Math.floor(Math.random() * colors.length);
	  return colors[r].toUpperCase();
	};

	var preload, manifest, canvas, stage;

	var background, glassContainer, figureContainerCurrent, figureContainerNext, text;   

	var panelX, panelY, panelHeight, panelWidth 	

	preload = scope.preload = new createjs.LoadQueue(false, 'assets/images/');

	preload.on('complete', onComplete);

	manifest = [
		{id: colors[0], src: 'block_blue.png'},
		{id: colors[1], src:'block_green.png'},
		{id: colors[2], src: 'block_red.png'},
		{id: colors[3], src: 'block_yellow.png'}
	];
	
	preload.loadManifest(manifest);

	var tweenfigureContainerCurrentY;	

	var oldY;
	var newY;
/*
	 ██████╗ ██████╗ ███╗   ███╗██████╗ ██╗     ███████╗████████╗███████╗
	██╔════╝██╔═══██╗████╗ ████║██╔══██╗██║     ██╔════╝╚══██╔══╝██╔════╝
	██║     ██║   ██║██╔████╔██║██████╔╝██║     █████╗     ██║   █████╗  
	██║     ██║   ██║██║╚██╔╝██║██╔═══╝ ██║     ██╔══╝     ██║   ██╔══╝  
	╚██████╗╚██████╔╝██║ ╚═╝ ██║██║     ███████╗███████╗   ██║   ███████╗
	 ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚══════╝╚══════╝   ╚═╝   ╚══════╝

*/
	function onComplete(){
		canvas = document.getElementById('gameCanvas');
		stage = new createjs.Stage(canvas);
 
		populateAM();
 
		glassContainer = new createjs.Container();
		glassContainer.x = lineWidth;
		var width = SQUARE_SIZE * GLASS_WIDTH;
		var height = SQUARE_SIZE * GLASS_HEIGHT;
		glassContainer.cache(0, 0, width, height);
 
		figureContainerCurrent = new createjs.Container();

		figureContainerNext = new createjs.Container();
		
		background = createBackground();
		background.cache(0, 0, canvas.width, canvas.height);		
 
		stage.addChild(background, glassContainer, figureContainerCurrent);	 
		
		createjs.Ticker.on('tick', tick);
		createjs.Ticker.setFPS(FPS);
		$scope.trigger(scope.LOADED);
   }

   function tick(){   		
   		stats.begin();   		
   		stage.update();
   		stats.end();

   }

	function populateAM(){
		for(var i = 0; i < colors.length; i++){
			AM.addItem(colors[i], (function(index){
				return function(){
					return new createjs.Bitmap(preload.getResult(colors[index]))
				}				
			})(i), 20);
		}
	}
/*
	██████╗  ██████╗ 
	██╔══██╗██╔════╝ 
	██████╔╝██║  ███╗
	██╔══██╗██║   ██║
	██████╔╝╚██████╔╝
	╚═════╝  ╚═════╝                  
*/

	function createBackground(){
		var background = new createjs.Container();

		var glassBG = new createjs.Shape(); 
		var g = glassBG.graphics;
 
		// vertical lines
		g.setStrokeStyle(2);
		g.beginStroke("black");
 
		for(var i = 0; i <= GLASS_WIDTH; i++){
			g.moveTo(i * SQUARE_SIZE + lineWidth, 0);
			g.lineTo(i * SQUARE_SIZE + lineWidth, GLASS_HEIGHT * SQUARE_SIZE);
		}
 
		// horizontal lines
		for(var i = 0; i <= GLASS_HEIGHT; i++){
			g.moveTo(lineWidth, i * SQUARE_SIZE);
			g.lineTo(GLASS_WIDTH * SQUARE_SIZE + lineWidth, i * SQUARE_SIZE);
		}
 
		g.endStroke();
 
		// glass walls
		g.setStrokeStyle(lineWidth);
		g.beginStroke("black");
 
		g.moveTo(lineWidth / 2, 0);
		g.lineTo(lineWidth / 2, GLASS_HEIGHT * SQUARE_SIZE);
		g.moveTo(0, GLASS_HEIGHT * SQUARE_SIZE + lineWidth / 2);
		g.lineTo(GLASS_WIDTH * SQUARE_SIZE + lineWidth * 1.5, GLASS_HEIGHT * SQUARE_SIZE + lineWidth / 2);
		g.moveTo(GLASS_WIDTH * SQUARE_SIZE + 1.5 * lineWidth, GLASS_HEIGHT * SQUARE_SIZE + lineWidth);
		g.lineTo(GLASS_WIDTH * SQUARE_SIZE + 1.5 * lineWidth, 0);
 
		g.endStroke();

		// panel
		panelX = GLASS_WIDTH * SQUARE_SIZE + lineWidth * 2;
		panelY = 0;
		panelHeight = GLASS_HEIGHT * SQUARE_SIZE + lineWidth - 0.5; 
		panelWidth = canvas.width - panelX;

		g.setStrokeStyle(1);
		g.beginStroke("#000000");
		g.beginFill("black");
		g.drawRect(panelX, panelY, panelWidth, panelHeight);

		var nextText = new createjs.Text('NEXT', "25px Arial", 'yellow' )
		nextText.x = panelX + panelWidth / 2;
		nextText.y = panelHeight - 6 * SQUARE_SIZE - lineWidth;
		nextText.textAlign = 'center';
		
		background.addChild(glassBG);
		background.addChild(nextText);
		background.addChild(figureContainerNext);

		return background;
	}
 
	scope.update = function(figure_current, figure_next){		
		setBlocks();
		setCurrentFigure(figure_current);				
		stage.update();
	};
 
	scope.reset = function(){
		// for each block in glass
		while(glassContainer.numChildren > 0){
			var child = glassContainer.getChildAt(0);
			child.needsUpdate = false;
			scope.removeBlockFromGlass(child);
		}
		// for each block in figure
		while(figureContainerCurrent.numChildren > 0){
			var child = figureContainerCurrent.getChildAt(0);
			figureContainerCurrent.removeChild(child);
			AM.put(child);
		}
 
		stage.update();
	};

	/*
	 ██████╗ ██████╗ ███╗   ██╗████████╗ █████╗ ██╗███╗   ██╗███████╗██████╗ ███████╗
	██╔════╝██╔═══██╗████╗  ██║╚══██╔══╝██╔══██╗██║████╗  ██║██╔════╝██╔══██╗██╔════╝
	██║     ██║   ██║██╔██╗ ██║   ██║   ███████║██║██╔██╗ ██║█████╗  ██████╔╝███████╗
	██║     ██║   ██║██║╚██╗██║   ██║   ██╔══██║██║██║╚██╗██║██╔══╝  ██╔══██╗╚════██║
	╚██████╗╚██████╔╝██║ ╚████║   ██║   ██║  ██║██║██║ ╚████║███████╗██║  ██║███████║
	 ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝╚══════╝	
	*/
 
	scope.addBlockToGlass = function(block){
		glassContainer.addChild(block);		
	};
 
	scope.removeBlockFromGlass = function(block){
		glassContainer.removeChild(block);
		AM.put(block);
	};
 
	scope.addCurrentFigure = function(figure){		
		figureContainerCurrent.y = figure.position.y * SQUARE_SIZE;
		figureContainerCurrent.x = figure.position.x * SQUARE_SIZE;

		addBlocksToFigureContainer(figure, figureContainerCurrent);		
		
	};


	scope.addNextFigure = function(figure){
		var centerX = figure.states[figure.phase].matrix[0].length / 2 * SQUARE_SIZE

		figureContainerNext.x = panelX + panelWidth / 2 - centerX;		
		figureContainerNext.y = panelHeight - SQUARE_SIZE * 4;		
		
		addBlocksToFigureContainer(figure, figureContainerNext);
		setBlocksInContainer(figure, figureContainerNext);		

		background.updateCache();
	}

	function addBlocksToFigureContainer(figure, figureContainer){
		var matrix = figure.states[figure.phase].matrix;
		for(var i = 0; i < matrix.length; i++){
			for(var j = 0; j < matrix[0].length; j++){
				var obj = matrix[i][j];
				if(obj){										
					figureContainer.addChild(obj);
				}
			}
		}
	}
 
	function setBlocks(){
		for(var i = 0; i < glassContainer.numChildren; i++){
			var child = glassContainer.getChildAt(i);
			if(child.needsUpdate){
				child.needsUpdate = false;				
				child.x = SQUARE_SIZE * child.column;
				child.y = SQUARE_SIZE * child.row;
			}
		}
		glassContainer.updateCache();
	}
 
	function setCurrentFigure(figure){
		if(!figure) return;

		var centerX = figure.states[figure.phase].center[0];
		var centerY = figure.states[figure.phase].center[1];
		
		figureContainerCurrent.x = lineWidth + (figure.position.x - centerX) * SQUARE_SIZE;		

		var newY = (figure.position.y) * SQUARE_SIZE;
		
		// if the target Y has changed create new tween
		if(oldY !== newY){ 
			// kill tween
			if(tweenfigureContainerCurrentY) tweenfigureContainerCurrentY.kill();
			var distanceY = Math.abs(figure.position.y * SQUARE_SIZE - figureContainerCurrent.y);

			// speed up
			if(distanceY > SQUARE_SIZE){
				tweenfigureContainerCurrentY = TweenLite.to(figureContainerCurrent, 1 / distanceY * SQUARE_SIZE, { y : newY, ease: Power1.easeOut} );
			}
			else{ 
				tweenfigureContainerCurrentY = TweenLite.to(figureContainerCurrent, 1 / distanceY * SQUARE_SIZE, { y : newY, ease:Power1.easeInOut} );						
			}						
		}	
		oldY = newY;
 		setBlocksInContainer(figure, figureContainerCurrent);
		
	}	

	function setBlocksInContainer(figure, figureContainer){
		var index = 0; 
		var matrix = figure.states[figure.phase].matrix;
		var centerX = figure.states[figure.phase].center[0];
		var centerY = figure.states[figure.phase].center[1];
 
		// child index 		
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