/*jshint -W083 */

function links(room) {
    var dstLinkId = room.memory.dstLinkId;
    if (_.isUndefined(dstLinkId)) {
        console.log('no memory');
		return;
	}

    // Find any source links that are full
    // UNDONE: look for source links with cooldown == 0 and source at ~80%?
    var srcLinks = room.find(FIND_STRUCTURES, {
        filter: function(item) {
            if (item.structureType != STRUCTURE_LINK)
                return false;
            if (item.cooldown > 0)
                return false;
            return item.energy > (0.5 * item.energyCapacity);
        }
    });

    if (srcLinks === null) {
        console.log('no src');
		return;
	}

    var dstLink = Game.getObjectById(dstLinkId);
    if (dstLink === null)
        return;

    if (dstLink.energy !== 0)
        return;

    for (var i = 0; i < srcLinks.length; ++i) {
        var srcLink = srcLinks[i];
        if (srcLink.transferEnergy(dstLink) != OK)
            break;
    }
}

module.exports = {
	run: function() {
		for (var name in Game.rooms) {
			var room = Game.rooms[name];
			console.log('doing links');
			if(_.isUndefined(room.memory.dstLinkId)){
				console.log('assigning dest');
				var dstlink = room.find(FIND_STRUCTURES, {
					filter: function(item) {
						if (item.structureType != STRUCTURE_LINK)
							return false;
						if (item.cooldown > 0)
							return false;
						if (item.energy > 0)
							return false;
						else{
							console.log('found thing');
							return true;
						}
					}
				});
				if(dstlink.length != 1){
					console.log('too many');
					return;
				}
				else{
					room.memory.dstLinkId = dstlink[0].id;
					console.log('memory changed');
				}
			}
			links(room);
		}
	}
};