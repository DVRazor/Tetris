var ParticleManager = function(){
	var scope = this;

	var particleCollection = [];

	var particleTypes = {};

	scope.types = {};

	var stepTimer;

	var FPS = 60;

	var STEP_INTERVAL = 1000 / FPS;
	
	scope.addType = function(typeName, init, behaviourFunc){		
		typeName = typeName.toUpperCase();

		// save index of this type
		var index = scope.types[typeName];
		if(index === undefined){
		   index = Object.keys(scope.types).length;
		}
		scope.types[typeName] = scope.types[typeName] || index;

		// save particle type and its props by index
		particleTypes[index] = particleTypes[index] || {};
		particleTypes[index].behaviourFunc = behaviourFunc;
		particleTypes[index].init = init;
	};

	scope.addParticle = function(index, params){
		var particle = particleTypes[index].init(params);

		particle.PM_index = index;		

		particleCollection.push(particle);
		
		return particle;
	};

	scope.removeParticle = function(particle){
		var index = particleCollection.indexOf(particle);
		if(index !== -1) particleCollection.splice(index, 1);
	};

	function step(){	
		clearInterval(stepTimer);

		stepTimer = setInterval(function(){
			for(var i = 0; i < particleCollection.length; i++){
				var particle = particleCollection[i];
				var index = particle.PM_index;
				var behaviourFunc = particleTypes[index].behaviourFunc;

				// if particle has died 
				if(behaviourFunc.call(particle)) scope.removeParticle(particle);
			}
		}, STEP_INTERVAL);
	}

	scope.stop = function(){
		clearInterval(stepTimer);
	}

	scope.start = function(){
		step();
	}
}