/* jshint -W083 */

var harvester = require('harvester');
var Turret = require('Turret');
var Portm = require('Portm');
var Carry = require('Carry');

var body = {
	'miner': [WORK, WORK, CARRY, MOVE],
	'maker': [WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
	'control': [WORK, CARRY, CARRY, MOVE, MOVE],
	'guard': [ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE],
	'scavenger': [CARRY, CARRY, MOVE, MOVE],
	'Carry': [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
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
	var construct = Game.spawns.Spawn1.room.find(FIND_CONSTRUCTION_SITES);
	
	var pop = {
		'miner': 0,
		'maker': 0,
		'control': 0,
		'guard': 0,
		'Carry': 0,
	};
	
    for(var name in Game.creeps) {
        var unit = Game.creeps[name];
		
		var role = unit.memory.role;
		
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
		else if (role == 'tow') {
		    countAs = 'miner';
		}
		else if (role == 'stor') {
			countAs = 'miner';
		}
		else if (role == 'portm') {
			countAs = 'miner';
		}
		else {
			countAs = role;
		}
		
		if (countAs in pop)
			pop[countAs] += 1;
                    
    	if(role == 'miner') {
			harvester(unit);
		}
		
		if(role == 'portm') {
			Portm.deliver(unit);
		}
		
		if(role == 'Carry') {
			Carry.run(unit);
		}
		
		if (role == 'ext') {
			var closestEmpty = unit.pos.findClosestByRange(FIND_MY_STRUCTURES,{
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
			
			if(unit.carry.energy !== 0) {
				if(unit.transfer(closestEmpty, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					unit.moveTo(closestEmpty);
				}
			}	
				
			if(closestEmpty === null) {
				role = 'tow';
			}
			
			if(unit.carry.energy === 0) {
			    role = 'miner';
			}
		}
		
		if(role == 'tow') {
			var Tower = unit.pos.findClosestByRange(FIND_MY_STRUCTURES,{
				filter: function(object) {
				//console.log(object);
				
					if(object.structureType != STRUCTURE_TOWER) {
					//console.log("filtering non-extention");
					return false;
					}
					
					if(object.energy == object.energyCapacity) {
						//console.log("filtering filled");
						return false;
					}
					
					else{    
						console.log("found empty");
						return true;
					}
			
				}
			});
			
			if(unit.carry.energy !== 0) {
				if(unit.transfer(Tower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					unit.moveTo(Tower);
				}
			}	
				
			if(Tower === null) {
				role = 'stor';
			}
			
			if(unit.carry.energy === 0) {
			    role = 'miner';
			}
		}
		
		if(role == 'stor') {
			
			
			if(unit.carry.energy !== 0) {
				if(unit.transfer(Storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					unit.moveTo(Storage);
				}
			}	
			if(Storage === null) {
				role = 'miner';
			}
			if(unit.carry.energy === 0) {
				role = 'miner';
			}
		}
		
		if(role == 'maker') {
		    if(unit.carry.energy === 0) {
				role = 'makerrefill';
			}
			else {
				var target = unit.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
				if(unit.build(target) == ERR_NOT_IN_RANGE) {
					unit.moveTo(target);
				}
			}
		}
		
        if(role == 'control') {
            if(unit.carry.energy === 0) {
				role = 'controlrefill';
			}
            else {
                if(unit.room.controller) {
                    if(unit.upgradeController(unit.room.controller) == ERR_NOT_IN_RANGE) {
                        unit.moveTo(unit.room.controller);
                    }   
                }
            }
        }
		
        if(role == 'guard') {
            var targets = unit.room.find(FIND_HOSTILE_CREEPS);
            if(targets.length) {
                if(unit.attack(targets[0]) == ERR_NOT_IN_RANGE) {
                    unit.moveTo(targets[0]);
                }
            }
    	}
    	
    	if(role == 'demo') {
            var buildings = unit.room.find(FIND_HOSTILE_STRUCTURES);
            if(buildings.length) {    
                if(unit.attack(buildings[0]) ==  ERR_NOT_IN_RANGE) {
                    unit.moveTo(buildings[0]);
    	    
                }    
            }
        }
        
        if(role == 'roadman') {
            if(unit.carry.energy === 0) {
                role = 'refill';
            }
            else {
                if(unit.repair(roads) == ERR_NOT_IN_RANGE) {
                    unit.moveTo(roads);
                }
            }
        }
		
		if(role == 'scavenger') {
			if(unit.carry.energy < unit.carryCapacity) {
				var dropped = unit.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
				if(unit.pickup(dropped) == ERR_NOT_IN_RANGE) {
					unit.moveTo(dropped);
				}
			}
			else{
				if(unit.transfer(Game.spawns.Spawn1, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					unit.moveTo(Game.spawns.Spawn1);
				}
			}
		}
        if(role == 'makerrefill') {
            if(unit.carry.energy < unit.carryCapacity) {
				if(unit.room.storage === null){
					if(Game.spawns.Spawn1.energy >= 250) {
						if(Game.spawns.Spawn1.transferEnergy(unit) == ERR_NOT_IN_RANGE) {
							unit.moveTo(Game.spawns.Spawn1);				
						}
					}
				}
				else {
					if(unit.room.storage.transferEnergy(unit) == ERR_NOT_IN_RANGE) {
						unit.moveTo(unit.room.storage);
					}
				}
			}
            else {
                role = 'maker';
            }
        }
		
		if(role == 'controlrefill') {
            if(unit.carry.energy < unit.carryCapacity) {
				if(unit.room.storage === null){
					if(Game.spawns.Spawn1.energy >= 250) {
						if(Game.spawns.Spawn1.transferEnergy(unit) == ERR_NOT_IN_RANGE) {
							unit.moveTo(Game.spawns.Spawn1);				
						}
					}
				}
				else {
					if(unit.room.storage.transferEnergy(unit) == ERR_NOT_IN_RANGE) {
						unit.moveTo(unit.room.storage);
					}
				}
			}
            else {
                role = 'control';
            }
        }
    }
	
	console.log(JSON.stringify(pop));
	
	var spawn = Game.spawns.Spawn1;
	
	if (pop.miner < 2) {
		if (spawn.canCreateCreep(body.miner) === 0) {
			spawn.createCreep(body.miner, makeName('miner'), {role: 'miner'});
			return;
		}
	}
	if (pop.Carry < 2) {
		if (spawn.canCreateCreep(body.Carry) === 0) {
			spawn.createCreep(body.Carry, makeName('Carry'), {role: 'Carry'});
			return;
		}
	}
	if (pop.control < 1) {
		if (spawn.canCreateCreep(body.control) === 0) {
			spawn.createCreep(body.control, makeName('control'), {role: 'control'});
			return;
		}
	}
	if(construct !== null && construct.length > 0) {
		if (pop.maker < 1) {
			if (spawn.canCreateCreep(body.maker) === 0) {
				spawn.createCreep(body.maker, makeName('maker'), {role: 'maker'});
			}
		}
	}
	Turret.run();
};