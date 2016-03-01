function chooseDropoff(unit) {
    var item;

    var pos = unit.pos;

    var filter = function(type, ratio) {
        ratio = ratio || 1.0;
        return function(item) {
            if (item.structureType != type)
                return false;
            return item.energy < (ratio * item.energyCapacity);
        };
    };

    item = pos.findClosestByRange(FIND_STRUCTURES, {
        filter: filter(STRUCTURE_SPAWN)
    });
    if (item !== null)
        return item;

    item = pos.findClosestByRange(FIND_STRUCTURES, {
        filter: filter(STRUCTURE_EXTENSION)
    });
    if (item !== null)
        return item;

    item = pos.findClosestByRange(FIND_STRUCTURES, {
        filter: filter(STRUCTURE_TOWER)
    });
    if (item !== null)
        return item;

    var storage = unit.room.storage;
    if (storage) {
        if (storage.store.energy < storage.storeCapacity) {
            return storage;
        }
    }

    return null;
}

function deliver(unit) {
    var depot = chooseDropoff(unit);
    if (depot === null)
        return;

    if (unit.transfer(depot, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        unit.moveTo(depot);
        return;
    }

    if (unit.carry.energy === 0) {
        unit.memory = 'miner'; // Back to mining
    }
}

module.exports = {
	chooseDropoff: chooseDropoff,
	deliver: deliver,
};