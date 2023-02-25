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
            const x = parseInt(command.x);
            const y = parseInt(command.y);

            const eventToCopy = $dataMap.events.filter(event => !!event).find(event => {
                return event.x === x && event.y === y;
            });
            if (!eventToCopy) {
                console.log("Tile is undefined, specify the correct coordinates")
            } else {
                const tileId = $gameMap.tileId(eventToCopy.x, eventToCopy.y, 0);
                for (let x = 0; x < $dataMap.width; x++) {
                    for (let y = 0; y < $dataMap.height; y++) {
                        if (Math.abs($gameMap.tileId(x, y, 0) - tileId) < 16 && !(x === eventToCopy.x && y === eventToCopy.y)) {
                            let event = $dataMap.events.filter(event => !!event).find(event => x === event.x && y === event.y)
                            if (event) {
                                event.pages.forEach(page => page.list = eventToCopy.pages[0].list.concat(page.list)); // could use index
                            } else {
                                let copiedEvent = {...eventToCopy};
                                copiedEvent.id = Math.max(...$dataMap.events.filter(event => !!event).map(event => event.id)) + 1;
                                copiedEvent.x = x;
                                copiedEvent.y = y;
                                $dataMap.events[copiedEvent.id] = copiedEvent;
                            }
                        }
                    }
                }
                console.log($dataMap.events);
            }
        })
    };

    // Called on save and on map refresh
    ReplicateCommands.Transfer_Player = Game_Player.prototype.performTransfer;
    Game_Player.prototype.performTransfer = function () {
        if ($dataMap) DataManager.processCommandReplication();
        ReplicateCommands.Transfer_Player.call(this);
    };
}());
