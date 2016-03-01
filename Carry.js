var Miner = require("Portm");

var COLLECT = "collect";
var DELIVER = "deliver";

// Find the best resource drop for this unit.
function bestDrop(unit) {
    var best = null;
    var bestValue = 0;
    var pos0 = unit.pos;
    var drops = unit.room.find(FIND_DROPPED_RESOURCES);
    for (var i = 0; i < drops.length; ++i) {
        var item = drops[i];
        var pos1 = item.pos;
        if (pos0.inRangeTo(pos1, 3))
            return item; // Automatically grab anything within 3 tiles
        var dx = pos0.x - pos1.x;
        var dy = pos0.y - pos1.y;
        var norm = Math.sqrt((dx * dx) + (dy * dy));
        var value = item.amount / norm;
        if (bestValue < value) {
            best = item;
            bestValue = value;
        }
    }
    return best;
}

function collect(unit) {
    var source = false;

    if (source === false)
        source = collectDrop(unit);

    if (unit.carry.energy > 0) {
        unit.memory.task = DELIVER;
        deliver(unit); // We might be next to delivery target
        return;
    }

    if (source === false) {
        // console.log("[" + unit.name + "] idle ..");
        return;
    }
}



function collectDrop(unit) {
    var drop;

    var dropId = unit.memory.dropId;
    if (_.isUndefined(dropId) || dropId === null) {
        drop = bestDrop(unit);
    }
    else {
        drop = Game.getObjectById(dropId);
    }

    if (drop !== null) {
        var pos = drop.pos;
        //console.log("[" + unit.name + "] pickup " + drop.amount + " from (" + pos.x + ", " + pos.y + ")");

        var e = unit.pickup(drop);
        switch (e) {
        case OK:
            return true;
        case ERR_NOT_IN_RANGE:
            unit.moveTo(drop, {reusePath: 10});
            unit.memory.dropId = drop.id;
            return true;
        default:
            //console.log("[" + unit.name + "] error collecting drop: " + e);
            break;
        }
    }

    unit.memory.dropId = null;
    return false;
}

function deliver(unit) {
    if (unit.carry.energy === 0) {
        unit.memory.task = COLLECT;
        return;
    }

    item = Miner.chooseDropoff(unit);
    if (item === null) return;
    //console.log("[" + unit.name + "] deliver " + unit.carry.energy + " to " + item.structureType);

    var e = unit.transfer(item, RESOURCE_ENERGY);
    switch (e) {
    case ERR_NOT_IN_RANGE:
        unit.moveTo(item);
        return;
    case ERR_FULL:
    case ERR_INVALID_TARGET:
        //console.log("[" + unit.name + "] Delivery error " + e);
        break;
    }

    if (unit.carry.energy === 0) {
        unit.memory.task = COLLECT; // Back to collecting
    }
}

function run(unit) {
   var item = null;

    switch (unit.memory.task) {
    case COLLECT:
        collect(unit);
        break;

    case DELIVER:
        deliver(unit);
        break;

    default:
        if (_.isUndefined(unit.memory.task)) {
            unit.memory.task = COLLECT;
        }
        break;
    }
}

module.exports = {
    run: run
};