/* jshint -W083 */

var harvester = require('harvester');
var Turret = require('Turret');
var Portm = require('Portm');
var Carry = require('Carry');
var Links = require('Links');

var body = {
	'miner': [WORK, WORK, WORK, WORK, WORK, MOVE],
	'maker': [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
	'control': [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE],
	'guard': [TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE],
	'scavenger': [CARRY, CARRY, MOVE, MOVE],
	'Carry': [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
	'refiller': [CARRY, CARRY, MOVE],
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
		'refiller': 0,
		'remaker': 0,
	};
	
    for(var name in Game.creeps) {
        var unit = Game.creeps[name];
		
		var countAs;
		
		if (unit.memory.role == 'makerrefill') {
			countAs = 'maker';
		}
		else if (unit.memory.role == 'controlrefill') {
			countAs = 'control';
		}
		else if (unit.memory.role == 'portm') {
			countAs = 'miner';
		}
		else if (unit.memory.role == 'dismantle') {
			countAs = 'remaker';
		}
		else {
			countAs = unit.memory.role;
		}
		
		if (countAs in pop)
			pop[countAs] += 1;
                    
    	if(unit.memory.role == 'miner') {
			harvester(unit);
		}
		
		if(unit.memory.role == 'portm') {
			Portm.deliver(unit);
		}
		
		if(unit.memory.role == 'Carry') {
			Carry.run(unit);
		}
		
        if(unit.memory.role == 'control') {
            if(unit.carry.energy === 0) {
				unit.memory.role = 'controlrefill';
			}
            else {
                if(unit.room.controller) {
                    if(unit.upgradeController(unit.room.controller) == ERR_NOT_IN_RANGE) {
                        unit.moveTo(unit.room.controller, {reusePath: 30});
                    }   
                }
            }
        }
		
		if(unit.memory.role == 'maker') {
		    if(unit.carry.energy === 0) {
				unit.memory.role = 'makerrefill';
			}
			else {
				var target = unit.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
				if(unit.build(target) == ERR_NOT_IN_RANGE) {
					unit.moveTo(target);
				}
			}
		}
		
		if(unit.memory.role == 'dismantle') {
			//console.log('Out of power');
			if(unit.carry.energy < unit.carryCapacity) {
				//console.log('IM GONNA WRECK IT');
				var old = Game.flags.Q.pos.findClosestByRange(FIND_STRUCTURES, {
					filter: function(q) {
						return q.structureType == STRUCTURE_WALL;
					}
				});
				if(unit.dismantle(old) == ERR_NOT_IN_RANGE) {
					unit.moveTo(old);
				}
			}
			else {
				unit.memory.role = 'remaker';
			}
		}
		
		if(unit.memory.role == 'remaker') {
			//console.log('Recycling is good!');
			if(unit.carry.energy === 0) {
				unit.memory.role = 'dismantle';
			}
			else {
				var New = unit.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
				if(unit.build(New) == ERR_NOT_IN_RANGE) {
					unit.moveTo(New);
				}
			}
		}

        if(unit.memory.role == 'guard') {
            var targets = unit.room.find(FIND_HOSTILE_CREEPS);
            if(targets.length) {
                if(unit.attack(targets[0]) == ERR_NOT_IN_RANGE) {
                    unit.moveTo(targets[0]);
                }
            }
    	}
    	
		if(unit.memory.role == 'refiller') {
			if(unit.carry.energy === 0) {
				if(unit.room.storage.transferEnergy(unit) == ERR_NOT_IN_RANGE) {
					unit.moveTo(unit.room.storage);
				}
			}
			else {
				var Link = unit.pos.findClosestByRange(FIND_MY_STRUCTURES, {
					filter: function(s) {
						if(s.structureType == STRUCTURE_LINK) {
							return true;
						}
						else {
							return false;
						}
					}
				});
				if(Link.energy != Link.energyCapacity && Link !== null){
					if(unit.transfer(Link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
						unit.moveTo(Link);
					}
				}
				else{
					var toFill = unit.room.find(FIND_MY_STRUCTURES, {
						filter: function(s) {
							if(s.structureType == STRUCTURE_TOWER) {
								return true;
							}
							else {
								return false;
							}
						}
					});
					if(unit.transfer(toFill[1], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
						unit.moveTo(toFill[1]);
					}
				}
			}
		}
		
        if(unit.memory.role == 'makerrefill') {
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
                unit.memory.role = 'maker';
            }
        }
		
		if(unit.memory.role == 'controlrefill') {
            if(unit.carry.energy < unit.carryCapacity) {
				var dstLink = Game.getObjectById(unit.room.memory.dstLinkId);
				if(dstLink === null){
					if(unit.room.storage === null){
						if(Game.spawns.Spawn1.energy >= 250) {
							if(Game.spawns.Spawn1.transferEnergy(unit) == ERR_NOT_IN_RANGE) {
								unit.moveTo(Game.spawns.Spawn1);				
							}
						}
					}
					else {
						if(unit.room.storage.transferEnergy(unit) == ERR_NOT_IN_RANGE) {
							unit.moveTo(unit.room.storage, {reusePath: 30});
						}
					}
				}
				else{
					if(dstLink.transferEnergy(unit) == ERR_NOT_IN_RANGE) {
						unit.moveTo(dstLink, {reusePath: 30});
					}
				}
			}
            else {
                unit.memory.role = 'control';
            }
        }
    }
	
	console.log(JSON.stringify(pop));
	
	for(var name in Game.rooms) {
		var room = Game.rooms[name];
		var spawns = room.find(FIND_MY_SPAWNS);
		var evil = room.find(FIND_HOSTILE_CREEPS);
		var wantRefillers = true;
		var wantDismantlers = false;
		
		for (var name in spawns) {
			
			var spawn = spawns[name];
		
			if (pop.Carry < 2) {
				if (spawn.canCreateCreep(body.Carry) === 0) {
					spawn.createCreep(body.Carry, makeName('Carry'), {role: 'Carry'});
					return;
				}
			}
			if (evil.length) {
				if (pop.guard < 2) {
					if (spawn.canCreateCreep(body.guard) === 0) {
						spawn.createCreep(body.guard, makeName('guard'), {role: 'guard'});
						return;
					}
				}
			}
			if (pop.miner < 2) {
				if (spawn.canCreateCreep(body.miner) === 0) {
					spawn.createCreep(body.miner, makeName('miner'), {role: 'miner'});
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
				if (wantDismantlers === true) {
					if (pop.remaker < 1) {
						if (spawn.canCreateCreep(body.maker) === 0) {
							spawn.createCreep(body.maker, makeName('remaker'), {role: 'remaker'});
							return;
						}
					}
				}
				else {
					if (pop.maker < 1) {
						if (spawn.canCreateCreep(body.maker) === 0) {
							spawn.createCreep(body.maker, makeName('maker'), {role: 'maker'});
							return;
						}
					}
				}
			}
			if(wantRefillers === true) {
				if (pop.refiller < 1) {
					if (spawn.canCreateCreep(body.refiller) === 0) {
						spawn.createCreep(body.refiller, makeName('refiller'), {role: 'refiller'});
						return;
					}
				}
			}
		}
	}
	Turret.run();
	Links.run();
};