//==========================================================================
// EliMZ_HoldFade.js
//==========================================================================

/*:
@target MZ
@base EliMZ_Book

@plugindesc ♦5.0.0♦ Hold the fade in command when map transfer.
@author Hakuen Studio
@url https://hakuenstudio.itch.io/eli-hold-fade-for-rpg-maker-mz

@help
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
If you like my work, please consider supporting me on Patreon!
Patreon      → https://www.patreon.com/hakuenstudio
Terms of Use → https://www.hakuenstudio.com/terms-of-use-5-0-0
Facebook     → https://www.facebook.com/hakuenstudio
Instagram    → https://www.instagram.com/hakuenstudio
Twitter      → https://twitter.com/hakuen_studio
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
============================================================================
Features
============================================================================

• When starting a new game or transferring between maps, you can choose to 
stay faded out and use a plugin command to fade in when you want.
• Deactivate the movement of the player and events(self-movement) while 
it faded out.

============================================================================
How to use
============================================================================

Just put a note tag on the map: <HoldFade> (Not case sensitive)

Now every time you enter this map, it will not fade in automatically, 
letting you do some configurations in it and then, call the fade in event
command.
You can also make that automatically setting up the plugin parameter 
'Auto Hold Fade' to true.
To illustrate this better, let's see how the transfer works without and 
with this plugin:

● Without:
• The player is in Map 1
• The player activates an event to transfer to Map 2
• The screen is fade out
• The player gets in Map 2
• Screen fade in.

● With:
• The player is in Map 1
• The player activates an event to transfer to Map 2
• The screen is fade out
• The player gets in Map 2
• Screen doesn't fade in automatically unless you manually fade in with 
event command.
• Optional, it can prevent the movement of events(self-movement) and player 
while it faded out.

============================================================================
Update Log
============================================================================

https://tinyurl.com/holdFade

============================================================================

@param autoHold
@text Auto Hold Fade
@type boolean
@desc Choose "Auto" if you want to hold the fade in automatically for every map.
@default false

@param waitForMove
@text Wait fade for move
@type boolean
@desc If true, the player and events(self movement) will not be able to move until the fade is gone. 
@default false

@command releaseFade
@text Release fade
@desc This is only for backwards compatibility. You can now use the Fade In event command.

*/

"use strict"

var Eli = Eli || {}
var Imported = Imported || {}
Imported.Eli_HoldFade = true

/* ========================================================================== */
/*                                   PLUGIN                                   */
/* ========================================================================== */
{

Eli.HoldFade = {

    version: 5.00,
    url: "https://hakuenstudio.itch.io/eli-hold-fade-for-rpg-maker-mz",
    parameters: {autoHold: false, waitForMove: false},
    alias: {},

    mustWaitForMove(){
        return this.parameters.waitForMove && SceneManager._scene._fadeOpacity
    },

    param(){
        return this.parameters
    },

}

const Plugin = Eli.HoldFade
const Alias = Eli.HoldFade.alias


/* ------------------------------- GAME PLAYER ------------------------------ */
{

Alias.Game_Player_canMove = Game_Player.prototype.canMove;
Game_Player.prototype.canMove = function() {
    const alias = Alias.Game_Player_canMove.call(this)
    return alias && !Plugin.mustWaitForMove()
}

}

/* ------------------------------- GAME EVENT ------------------------------- */
{

Alias.Game_Event_updateSelfMovement = Game_Event.prototype.updateSelfMovement;
Game_Event.prototype.updateSelfMovement = function() {
    if(!Plugin.mustWaitForMove()){
        Alias.Game_Event_updateSelfMovement.call(this)
    }
}

}

/* -------------------------------- SCENE MAP ------------------------------- */
{

Alias.Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded
Scene_Map.prototype.onMapLoaded = function() {
    Alias.Scene_Map_onMapLoaded.call(this)
    if(Plugin.param().autoHold || this.hasHoldFadeNote()){
        $gameScreen.startFadeOut(1)
    }
}

Scene_Map.prototype.hasHoldFadeNote = function(){
    return $dataMap.note.toLowerCase().includes('<holdfade>')
}

}

}
