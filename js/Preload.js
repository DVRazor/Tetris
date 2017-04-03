var Preload = function(callback){

	var scope = this;

	var preload, manifest, sounds;

	var colors = scope.colors = ['blue', 'green', 'red', 'yellow'];

	var sounds = ['background', 'whoosh', 'hit', 'select', 'destroy', 'gameover'];

	preload = scope.preload = new createjs.LoadQueue(false, 'assets/');

	preload.installPlugin(createjs.Sound);

	preload.on('complete', callback);

	manifest = [
		{id: colors[0], src: 'images/block_blue.png'},
		{id: colors[1], src:'images/block_green.png'},
		{id: colors[2], src: 'images/block_red.png'},	
		{id: colors[3], src: 'images/block_yellow.png'},		
	];	

	sounds = [
		{id: sounds[0], src: 'audio/bg.mp3', data: 1},
		{id: sounds[1], src: 'audio/whoosh.mp3'},
		{id: sounds[2], src: 'audio/hit.mp3', data: 1},
		{id: sounds[3], src: 'audio/select.mp3', data: 1},
		{id: sounds[4], src: 'audio/destroy.mp3', data: 1},
		{id: sounds[5], src: 'audio/gameover.mp3', data: 1}
	]

	preload.loadManifest(manifest);	
	preload.loadManifest(sounds)
	
}