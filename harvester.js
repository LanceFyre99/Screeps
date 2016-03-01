function chooseSource(unit) {
    var room = unit.room;
    var sources = room.find(FIND_SOURCES);
    if (sources.length == 1)
        return sources[0];
    var source;
    for (var i = 0; i < sources.length; ++i) {
        source = sources[i];
        if (source.id != room.memory.lastSourceId)
            break;
    }
    room.memory.lastSourceId = source.id;
    return source;
}

module.exports = function (unit) {
	
	var haveCarry = true;
	
	if(haveCarry === false) {
		if(unit.carry.energy < unit.carryCapacity) {
			var sources = unit.room.find(FIND_SOURCES);
			if(unit.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
				unit.moveTo(sources[1]);
			}
		}
		else{
			if(unit.transfer(Game.spawns.Spawn1, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
				unit.moveTo(Game.spawns.Spawn1);
			}
			if(unit.transfer(Game.spawns.Spawn1, RESOURCE_ENERGY) == ERR_FULL) {
				role = 'portm';
			}
		}
	}
	
	else {
		if(unit.memory.source === undefined || unit.memory.source === null) {
			var well = chooseSource(unit);
			if(well === null){
				return;
			}
			unit.memory.source = well.id;
		}
		else{
			var source = Game.getObjectById(unit.memory.source);
			if(unit.harvest(source) == ERR_NOT_IN_RANGE) {
				unit.moveTo(source);
			}
			unit.drop(RESOURCE_ENERGY);
		}
	}
};
