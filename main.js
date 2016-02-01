/* jshint -W083 */

var harvester = require('harvester');

var body = {
	'miner': [WORK, CARRY, MOVE],
	'maker': [WORK, CARRY, MOVE],
	'control': [WORK, CARRY, MOVE],
	'guard': [ATTACK, ATTACK, MOVE, MOVE],
};

function makeName(role) {
	var creeps = Game.creeps;
	for (var i = 0; i < 1000000; ++i) {
		var name = role + i;
		if (!creeps.hasOwnProperty(name))
			return name;
	}
	console.log("Error: too many creeps!");
	return null;
}

module.exports.loop = function () {	
	var pop = {
		'miner': 0,
		'maker': 0,
		'control': 0,
		'guard': 0,
	};
	
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
		
		var role = creep.memory;
		
		var countAs;
		
		if (role == 'makerrefill') {
			countAs = 'maker';
		}
		else if (role == 'controlrefill') {
			countAs = 'control';
		}
		else if (role == 'ext') {
		    countAs = 'miner';
		}
		else {
			countAs = role;
		}
		
		if (countAs in pop)
			pop[countAs] += 1;

        var roads = creep.pos.findClosestByRange(FIND_MY_STRUCTURES,{
			filter: function(object) {
				//console.log(object);
				if(object.structureType != STRUCTURE_ROAD) {
					//console.log("filtering non-road");
					return false;
				}
				if(object.hits == object.hitsMax) {
					//console.log("filtering non-damaged")
					return false;
				}
				else{    
					//console.log("found damaged roadroad");
					return true;
				}
			}
		});
                    
    	if(creep.memory == 'miner') {
			harvester(creep);
		}
		
		if (creep.memory == 'ext') {
			var closestEmpty = creep.pos.findClosestByRange(FIND_MY_STRUCTURES,{
				filter: function(object) {
				//console.log(object);
				
					if(object.structureType != STRUCTURE_EXTENSION) {
					//console.log("filtering non-extention");
					return false;
					}
					
					if(object.energy == object.energyCapacity) {
						//console.log("filtering filled");
						return false;
					}
					
					else{    
						//console.log("found empty");
						return true;
					}
			
				}
			});
			
			if(creep.carry.energy !== 0) {
				if(creep.transfer(closestEmpty, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					creep.moveTo(closestEmpty);
				}
			}	
				
			if(closestEmpty === null) {
				creep.memory = 'miner';
			}
			
			if(creep.carry.energy === 0) {
			    creep.memory = 'miner';
			}
		}
		
		if(creep.memory == 'maker') {
		    if(creep.carry.energy === 0) {
				creep.memory = 'makerrefill';
			}
			else {
				var target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
				if(creep.build(target) == ERR_NOT_IN_RANGE) {
					creep.moveTo(target);
				}
			}
		}
		
        if(creep.memory == 'control') {
            if(creep.carry.energy === 0) {
				creep.memory = 'controlrefill';
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
    	
    	if(creep.memory == 'demo') {
            var buildings = creep.room.find(FIND_HOSTILE_STRUCTURES);
            if(buildings.length) {    
                if(creep.attack(buildings[0]) ==  ERR_NOT_IN_RANGE) {
                    creep.moveTo(buildings[0]);
    	    
                }    
            }
        }
        
        if(creep.memory == 'roadman') {
            if(creep.carry.energy === 0) {
                creep.memory = 'refill';
            }
            else {
                if(creep.repair(roads) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(roads);
                }
            }
        }
        
        if(creep.memory == 'makerrefill') {
            if(creep.carry.energy < creep.carryCapacity) {
				if(Game.spawns.Spawn1.energy >= 250) {
					if(Game.spawns.Spawn1.transferEnergy(creep) == ERR_NOT_IN_RANGE) {
						creep.moveTo(Game.spawns.Spawn1);				
					}
				}
			}
            else {
                creep.memory = 'maker';
            }
        }
		
		if(creep.memory == 'controlrefill') {
            if(creep.carry.energy < creep.carryCapacity) {
				if(Game.spawns.Spawn1.energy >= 250) {
					if(Game.spawns.Spawn1.transferEnergy(creep) == ERR_NOT_IN_RANGE) {
						creep.moveTo(Game.spawns.Spawn1);				
					}
				}	
            }
            else {
                creep.memory = 'control';
            }
        }
    }
	
	console.log(JSON.stringify(pop));
	
	var spawn = Game.spawns.Spawn1;
	
	if (pop.miner < 5) {
		if (spawn.canCreateCreep(body.miner) === 0) {
			spawn.createCreep(body.miner, makeName('miner'), 'miner');
			return;
		}
	}
	if (pop.control < 3) {
		if (spawn.canCreateCreep(body.control) === 0) {
			spawn.createCreep(body.control, makeName('control'), 'control');
			return;
		}
	}		
	// Lucas: write more spawn rules ..
};