var CreatejsParticleManager = function(AM){
	var scope = this;

	ParticleManager.call(scope);

	var addParticle = scope.addParticle;
	var removeParticle = scope.removeParticle;

	scope.addParticle = function(type, obj, init, container){
		addParticle(type, obj, init);
		container.addChild(obj);
	}

	scope.removeParticle = function(particle){		
		// debugger;
		removeParticle(particle);
		particle.parent.removeChild(particle)
		AM.put(particle);		
	}	
}