/**
 * Title: Replicate Commands
 * Author Ian Gauk
 *
 * @plugindesc Replicates event commands from a specified coordinate to all other tiles that match
 * the specified coordinate tile
 *
 * @help To use, choose a tile to replicate the event commands for, note the coordinates. In the map notetags,
 * add the following on a new line `<replicate commands:x,y>` where x and y are the coordinates of the noted
 * tile.
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
            const regExCommand = line.match(/<replicate commands:(\d+),(\d+)>/i);
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
                $dataMap.events.filter(event => !!event).forEach(event => {
                    if (Math.abs($gameMap.tileId(event.x, event.y, 0) - tileId) < 16) { // TODO: approx for autotile
                        event.pages.forEach(page => page.list = eventToCopy.pages[0].list);
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
