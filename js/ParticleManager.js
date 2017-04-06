var ParticleManager = function(){
	var scope = this;

	var particleCollection = [];

	var particleTypes = {};

	var stepTimer;

	var FPS = 60;

	var STEP_INTERVAL = 1000 / FPS;

	var counter = 0;

	scope.addType = function(typeName, behaviourFunc){
		particleTypes[typeName] = particleTypes[typeName] || {};
		particleTypes[typeName].behaviourFunc = behaviourFunc;		
	}

	scope.addParticle = function(type, obj, init){			
		obj['PM_type'] = type;
		init.call(obj);
		particleCollection.push(obj);
	}

	scope.removeParticle = function(particle){				
		var index = particleCollection.indexOf(particle);
		if(index !== -1) particleCollection.splice(index, 1);	
		// debugger;	
	}

	var step = function(){
		clearInterval(stepTimer);		

		stepTimer = setInterval(function(){						
			for(var i = 0; i < particleCollection.length; i++){
				var particle = particleCollection[i];

				var type = particle.PM_type;

				var behaviourFunc = particleTypes[type].behaviourFunc; 				

				// if particle has died 
				if(behaviourFunc.call(particle)) scope.removeParticle(particle);
			}
		}, STEP_INTERVAL);
	}

	step();
}