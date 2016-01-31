/* jshint -W083 */

var harvester = require('harvester');

module.exports.loop = function () {
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        
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
		
		if(creep.memory == 'maker') {
		    if(creep.carry.energy === 0) {
				if(Game.spawns.Spawn1.transferEnergy(creep) == ERR_NOT_IN_RANGE) {
					creep.moveTo(Game.spawns.Spawn1);				
				}
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
        
        if(creep.memory == 'refill') {
            if(creep.carry.energy < creep.carryCapacity) {
                if(Game.spawns.Spawn1.transferEnergy(creep) == ERR_NOT_IN_RANGE) {
					creep.moveTo(Game.spawns.Spawn1);				
		        }
            }
            //else {
                //creep
            //}
        }    
    }
};