/*
Title: Replicate Commands
Author Ian Gauk

### Info about plugin ###
Copies the commands from all tiles with the same icon when specified in the map comments

*/

'use strict';

var ReplicateCommands = ReplicateCommands || {};

(function () {

    DataManager.processCommandReplication = function() {
        if (!$dataMap) return;
        if (!$dataMap.note) return;
        const noteData = $dataMap.note.split('\n');
        console.log(noteData);
        $dataMap.replicateCommands = new Set();
        for (let i = 0; i < noteData.length; i++) {
            const line = noteData[i];
            const regExCommand = line.match(/<replicate commands:([^>:]*)>/i);
            if (regExCommand && regExCommand[1]) {
                $dataMap.replicateCommands.add(regExCommand[1]); // push the icon to the commands to replicate set
            }
        }
    };

    // Called on map init
    ReplicateCommands.Game_Map_Setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapId) {
        if ($dataMap) DataManager.processCommandReplication();
        ReplicateCommands.Game_Map_Setup.call(this, mapId);
    };
}());
