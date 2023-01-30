/*:
 * @author Sergey Khlynovskiy
 * @plugindesc chess movement
 * 
 * @help does chess stuff
 *  
*/


(function() {
  var params = PluginManager.parameters("chess");

  const Chess_Game_Event_setup = Game_Map.prototype.setup;
  Game_Map.prototype.setup = function(mapId) {
    Chess_Game_Event_setup.apply(this, arguments);
    this.pawns = {
      49: [Game_Character.ROUTE_MOVE_DOWN],
    }
  };

  const Chess_Game_Event_updateEvents = Game_Map.prototype.updateEvents;
  Game_Map.prototype.updateEvents = function() {
    Chess_Game_Event_updateEvents.apply(this, arguments);
    this.checkEat();
  };

  Game_Map.prototype.checkEat = function() {
    const playerLoc = [$gamePlayer.x, $gamePlayer.y];
  
    // pawn eats player
    for (const [pawn, path] of Object.entries(this.pawns)) {
      const pawnLoc = [$gameMap.event(pawn).x, $gameMap.event(pawn).y];

      let route = this.checkEatPawn(pawnLoc, playerLoc);
      if (route) {
        $gameMap.event(pawn).forceMoveRoute(route);
        // TODO: game end
        //this._interpreter.setWaitMode('route');
      }
    }
  }

  Game_Map.prototype.checkEatPawn = function(pawnLoc, playerLoc) {
    if (playerLoc[0] == pawnLoc[0]-1 && playerLoc[1] == pawnLoc[1] + 1) {
      return {list: [{code: Game_Character.ROUTE_MOVE_LOWER_L}, {code: Game_Character.ROUTE_END}], repeat: false, skippable: false};
    } else if (playerLoc[0] == pawnLoc[0]+1 && playerLoc[1] == pawnLoc[1] + 1) {
      return {list: [{code: Game_Character.ROUTE_MOVE_LOWER_R}, {code: Game_Character.ROUTE_END}], repeat: false, skippable: false};
    }
  }
})();