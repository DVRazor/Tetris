var CreatejsParticleManager = function(AM){
	var scope = this;

	ParticleManager.call(scope);

	scope.containers = {};

	var addParticle = scope.addParticle;
	var removeParticle = scope.removeParticle;

	scope.addParticle = function(typeName, container, params){
		registerContainer(container);

		var particle = addParticle(typeName, params);
		container.addChild(particle);
	}

	scope.removeParticle = function(particle){	
		removeParticle(particle);
		particle.parent.removeChild(particle);

		resetObject(particle);
		AM.put(particle);		
	};

	function resetObject(obj){
		obj.x = 0;
		obj.y = 0;
		obj.scaleX = 1;
		obj.scaleY = 1;
		obj.alpha = 1;
		obj.rotation = 0;
	}

	function registerContainer(container){
		var id = container.id;
		scope.containers[id] = container;		
	}
}