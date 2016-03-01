function repair(room) {
	//console.log(JSON.stringify(room));
	
	var broke = room.find(FIND_STRUCTURES, {
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
	if (broke !== null && broke.length === 0)
		broke = null;
	
	var wall = room.find(FIND_STRUCTURES, {
        filter: function(s) {
			if(s.hits < 100000) {
				//console.log('broken walls!');
				if(s.structureType == STRUCTURE_WALL) {
					//console.log('found a wall');
					return true;
				}
				if(s.structureType == STRUCTURE_RAMPART) {
					return true;
				}
			}
			else{
				return false;
			}
		}
	});
	if (wall !== null && wall.length === 0)
		wall = null;
	
	var towers = room.find(FIND_MY_STRUCTURES, {
		filter: function(s) {
			return s.structureType == STRUCTURE_TOWER;
		}
	});
	
	if(towers === null){
		return;
	}	
	
	for (var i = 0; i < towers.length; ++i) {
		var tower = towers[i];
			
		var bad = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
		if (bad !== null) {
			tower.attack(bad);
		}
		else if(tower.energy > 750) {
			if(broke !== null) {
				//console.log('fixing thing!');
				tower.repair(broke[0]);
			}
			else if(wall !== null) {
				//console.log('fixing walls!');
				tower.repair(wall[0]);
			}
		}
	}
}
	
module.exports = {
	run: function() {
		for (var name in Game.rooms) {
			var room = Game.rooms[name];
			repair(room);
		}
	}
};