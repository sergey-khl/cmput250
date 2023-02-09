/*:
 * @author Sergey Khlynovskiy
 * @plugindesc chess movement
 * 
 * @help does chess stuff
 *  
*/


(function() {
  var params = PluginManager.parameters("chess");

  // load from notes on map load
  // TODO: load by tile id
  var Chess_Game_On_Load = Game_Player.prototype.performTransfer;
  Game_Player.prototype.performTransfer = function() {
    Chess_Game_On_Load.call(this);
    $gamePlayer.setThrough(false);
    let mapInfo = JSON.parse($dataMap.note);
    $gameVariables.setValue(7, mapInfo);
  };


  const Chess_Game_Event_updateEvents = Game_Map.prototype.updateEvents;
  Game_Map.prototype.updateEvents = function() {
    Chess_Game_Event_updateEvents.apply(this, arguments);
    if (!$gameSwitches.value(2)) {
      this.checkEat();
    }
  };

  Game_Map.prototype.checkEat = function() {
    const playerLoc = [$gamePlayer.x, $gamePlayer.y];
    // a little gross
    const mapInfo = $gameVariables.value(7);
    for (const [enemy, ids] of Object.entries(mapInfo)) {
      let route = null;

      ids.forEach((id) => {
  
        const enemyLoc = [$gameMap.event(id).x, $gameMap.event(id).y];
        if (enemy == "pawn") {
          route = this.checkEatPawn(enemyLoc, playerLoc);
        }


        if (route) {
          $gameMap.event(id).forceMoveRoute(route);
          // TODO: game end
          //this._interpreter.setWaitMode('route');
        }
      })
    }
  }

  // return a route for pawn eating if possible otherwise null
  Game_Map.prototype.checkEatPawn = function(pawnStart, pawnEnd) {
    if (pawnEnd[0] == pawnStart[0]-1 && pawnEnd[1] == pawnStart[1] + 1) {
      return {list: [{code: Game_Character.ROUTE_MOVE_LOWER_L}, {code: Game_Character.ROUTE_END}], repeat: false, skippable: false};
    } else if (pawnEnd[0] == pawnStart[0]+1 && pawnEnd[1] == pawnStart[1] + 1) {
      return {list: [{code: Game_Character.ROUTE_MOVE_LOWER_R}, {code: Game_Character.ROUTE_END}], repeat: false, skippable: false};
    } else {
      return null;
    }
  }

  // return a route for the hourse if possible otherwise null
  Game_Map.prototype.horseRoute = function(horseStart, horseEnd) {
    const mapInfo = $gameVariables.value(7);
    const possiblePos = [
      [horseStart[0]-2, horseStart[1]+1],
      [horseStart[0]-2, horseStart[1]-1],
      [horseStart[0]-1, horseStart[1]+2],
      [horseStart[0]-1, horseStart[1]-2],
      [horseStart[0]+1, horseStart[1]+2],
      [horseStart[0]+1, horseStart[1]-2],
      [horseStart[0]+2, horseStart[1]+1],
      [horseStart[0]+2, horseStart[1]-1]
    ];

    let canGo = true;
    let route = null;

    for (let i = 0; i < possiblePos.length; i++) {
      if (possiblePos[i].toString() == horseEnd.toString()) {
        mapInfo['wall'].forEach((wall) => {
          if ([$gameMap.event(wall)._x, $gameMap.event(wall)._y].toString() == horseEnd) {
            canGo = false;
          }
        })
        // setting routes. very gross i know so if you have a better idea lmk
        if (canGo) {
          switch (i) {
            case 0:
              route = {list: [{code: Game_Character.ROUTE_SWITCH_ON, parameters: [2]}, {code: Game_Character.ROUTE_MOVE_LEFT}, {code: Game_Character.ROUTE_MOVE_LEFT}, {code: Game_Character.ROUTE_MOVE_DOWN}, {code: Game_Character.ROUTE_SWITCH_OFF, parameters: [2]}, {code: Game_Character.ROUTE_END}], repeat: false, skippable: false};
              break;
            case 1:
              route = {list: [{code: Game_Character.ROUTE_SWITCH_ON, parameters: [2]}, {code: Game_Character.ROUTE_MOVE_LEFT}, {code: Game_Character.ROUTE_MOVE_LEFT}, {code: Game_Character.ROUTE_MOVE_UP}, {code: Game_Character.ROUTE_SWITCH_OFF, parameters: [2]}, {code: Game_Character.ROUTE_END}], repeat: false, skippable: false};
              break;
            case 2:
              route = {list: [{code: Game_Character.ROUTE_SWITCH_ON, parameters: [2]}, {code: Game_Character.ROUTE_MOVE_LEFT}, {code: Game_Character.ROUTE_MOVE_DOWN}, {code: Game_Character.ROUTE_MOVE_DOWN}, {code: Game_Character.ROUTE_SWITCH_OFF, parameters: [2]}, {code: Game_Character.ROUTE_END}], repeat: false, skippable: false};
              break;
            case 3:
              route = {list: [{code: Game_Character.ROUTE_SWITCH_ON, parameters: [2]}, {code: Game_Character.ROUTE_MOVE_LEFT}, {code: Game_Character.ROUTE_MOVE_UP}, {code: Game_Character.ROUTE_MOVE_UP}, {code: Game_Character.ROUTE_SWITCH_OFF, parameters: [2]}, {code: Game_Character.ROUTE_END}], repeat: false, skippable: false};
              break;
            case 4:
              route = {list: [{code: Game_Character.ROUTE_SWITCH_ON, parameters: [2]}, {code: Game_Character.ROUTE_MOVE_RIGHT}, {code: Game_Character.ROUTE_MOVE_DOWN}, {code: Game_Character.ROUTE_MOVE_DOWN}, {code: Game_Character.ROUTE_SWITCH_OFF, parameters: [2]}, {code: Game_Character.ROUTE_END}], repeat: false, skippable: false};
              break;
            case 5:
              route = {list: [{code: Game_Character.ROUTE_SWITCH_ON, parameters: [2]}, {code: Game_Character.ROUTE_MOVE_RIGHT}, {code: Game_Character.ROUTE_MOVE_UP}, {code: Game_Character.ROUTE_MOVE_UP}, {code: Game_Character.ROUTE_SWITCH_OFF, parameters: [2]}, {code: Game_Character.ROUTE_END}], repeat: false, skippable: false};
              break;
            case 6:
              route = {list: [{code: Game_Character.ROUTE_SWITCH_ON, parameters: [2]}, {code: Game_Character.ROUTE_MOVE_RIGHT}, {code: Game_Character.ROUTE_MOVE_RIGHT}, {code: Game_Character.ROUTE_MOVE_DOWN}, {code: Game_Character.ROUTE_SWITCH_OFF, parameters: [2]}, {code: Game_Character.ROUTE_END}], repeat: false, skippable: false};
              break;
            case 7:
              route = {list: [{code: Game_Character.ROUTE_SWITCH_ON, parameters: [2]}, {code: Game_Character.ROUTE_MOVE_RIGHT}, {code: Game_Character.ROUTE_MOVE_RIGHT}, {code: Game_Character.ROUTE_MOVE_UP}, {code: Game_Character.ROUTE_SWITCH_OFF, parameters: [2]}, {code: Game_Character.ROUTE_END}], repeat: false, skippable: false};
              break;
          }
          return route;
        }
        canGo = true;
      }
    }
    return route;
  }

  // here we can get rid of enemies so an invisible pawn can't eat the player
  Game_Map.prototype.removeMapInfo = function(info, id) {
    const mapInfo = $gameVariables.value(7);
    mapInfo[info] = mapInfo[info].filter((v, i, arr) => v != id);
    $gameVariables.setValue(7, mapInfo);
  }
})();