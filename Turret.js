	
	
	
	var thing = Game.spawns.Spawn1.room.find(FIND_STRUCTURES);
	
	var towers = Game.spawns.Spawn1.room.find(FIND_MY_STRUCTURES, {
        filter: function(s) {
			return s.structureType == STRUCTURE_TOWER;
		}
	});

	var broke = Game.spawns.Spawn1.room.find(FIND_STRUCTURES, {
        filter: function(s) {
			if(s.structureType == STRUCTURE_WALL) {
				return false;
			}
			if(s.structureType == STRUCTURE_RAMPART) {
				return false;
			}
			if(s.hits == s.hitsMax) {
				return false;
			}
			else{
				return true;
			}
		}
	});
	
	var wall = Game.spawns.Spawn1.room.find(FIND_STRUCTURES, {
        filter: function(s) {
			if(s.structureType == STRUCTURE_WALL) {
				return true;
			}
			if(s.structureType == STRUCTURE_RAMPART) {
				return true;
			}
			else{
				return false;
			}
		}
	});
	
module.exports = {
	run: function() {
		if(towers === null){
			return;
		}	
		for (var i = 0; i < towers.length; ++i) {
			var tower = towers[i];
				
			var bad = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
			if (bad !== null) {
				tower.attack(bad[0]);
				continue;
			}
			if(tower.energy > 750)
				if(broke[0] !== null) {
					tower.repair(broke[0]);
					continue;
				}
			}
	}
};