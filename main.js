var harvester = require('harvester');

module.exports.loop = function () {
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
                    
    	if(creep.memory == 'miner') {
	    harvester(creep);
	}
		
	if(creep.memory == 'builder') {
	    if(creep.carry.energy == 0) {
		if(Game.spawns.Spawn1.transferEnergy(creep) == ERR_NOT_IN_RANGE) {
		    creep.moveTo(Game.spawns.Spawn1);				
		}
	    }
	    else {
		var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
		if(targets.length) {
		    if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
			creep.moveTo(targets[0]);
		    }
		}
	    }
	}
		
        if(creep.memory == 'control') {
            if(creep.carry.energy == 0) {
		if(Game.spawns.Spawn1.transferEnergy(creep) == ERR_NOT_IN_RANGE) {
		    creep.moveTo(Game.spawns.Spawn1);				
                }
            }
            else {
                if(creep.room.controller) {
                    if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.controller);
                    }   
                }
            }
        }
		
        if(creep.memory == 'guard') {
            var targets = creep.room.find(FIND_HOSTILE_CREEPS);
            if(targets.length) {
                if(creep.attack(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            }
    	}
    }
}
