/*
Title: Replicate Commands
Author Ian Gauk

### Info about plugin ###
Copies the commands from all tiles with the same icon when specified in the map comments

*/

'use strict';

var ReplicateCommands = ReplicateCommands || {};

(function () {

    DataManager.processCommandReplication = function () {
        if (!$dataMap) return;
        if (!$dataMap.note) return;
        const noteData = $dataMap.note.split('\n');
        console.log(noteData);
        $dataMap.replicateCommands = new Set();
        for (let i = 0; i < noteData.length; i++) {
            const line = noteData[i];
            const regExCommand = line.match(/<replicate commands:(\d),(\d)>/i);
            if (regExCommand && regExCommand[1] && regExCommand[2]) {
                $dataMap.replicateCommands.add({x: regExCommand[1], y: regExCommand[2]}); // push the icon to the commands to replicate set
            }
        }

        $dataMap.replicateCommands.forEach(command => {
            console.log(command.x, command.y)
            const x = parseInt(command.x);
            const y = parseInt(command.y);

            const eventToCopy = $dataMap.events.filter(event => !!event).find(event => {
                return event.x === x && event.y === y;
            });
            if (!eventToCopy) {
                console.log("Tile is undefined, specify the correct coordinates")
            } else {
                const tileId = $gameMap.tileId(eventToCopy.x, eventToCopy.y, 0);
                console.log("TILE ID TO COPY", tileId);
                $dataMap.events.filter(event => !!event).forEach(event => {
                    if ($gameMap.tileId(event.x, event.y, 0) === tileId) {
                        event.pages = eventToCopy.pages;
                    } else {
                        console.log($gameMap.tileId(event.x, event.y, 0));
                    }
                })
            }
        })
    };

    // Called on map init
    ReplicateCommands.Game_Map_Setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function (mapId) {
        if ($dataMap) DataManager.processCommandReplication();
        ReplicateCommands.Game_Map_Setup.call(this, mapId);
    };
}());
