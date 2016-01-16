module.exports = function (creep) {
    
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
    
    if(creep.carry.energy < creep.carryCapacity) {
        var sources = creep.room.find(FIND_SOURCES);
        if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[0]);
        }
    }
    else{
        if(creep.transfer(Game.spawns.Spawn1, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(Game.spawns.Spawn1);
        }
        if(creep.transfer(Game.spawns.Spawn1, RESOURCE_ENERGY) == ERR_FULL) {
            
            if(creep.transfer(closestEmpty, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestEmpty);
            }
        }
    }
}