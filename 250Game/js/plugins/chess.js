/*:
 * @author Sergey Khlynovskiy
 * @plugindesc chess movement
 * 
 * @help does chess stuff
 *  
*/


/**
 * Checks if a position coincides with a wall
 * @param mapInfo with information on wall placement
 * @param position [x,y] coordinates of position
 * @returns {boolean} true if
 */
function isWall(mapInfo, position) {
  const isWall = false;
  if (mapInfo['wall']) {
    return mapInfo['wall'].find((wall) => $gameMap.event(wall)._x === position[0] && $gameMap.event(wall)._y === position[1]);
  }
  return isWall;
}

(function() {
  const params = PluginManager.parameters("chess");

  // load from notes on map load
  // TODO: load by tile id
  const Chess_Game_On_Load = Game_Player.prototype.performTransfer;
  Game_Player.prototype.performTransfer = function() {
    Chess_Game_On_Load.call(this);
    $gamePlayer.setThrough(false);
    try {
      let mapInfo = JSON.parse($dataMap.note.split('/')[0]);
      $gameVariables.setValue(7, mapInfo);
    } catch (e) {
      console.log(e);
    }
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
        if (enemy === "pawn") {
          route = this.checkEatPawn(enemyLoc, playerLoc);
        }


        if (route) {
          $gameMap.event(id).forceMoveRoute(route);
      	  $gameParty.members()[0].setHp(0) //Carlin: Kills player, Game Over
          // TODO: game end
          //this._interpreter.setWaitMode('route');
        }

        if (enemy === "spike" && enemyLoc[0] === playerLoc[0] && enemyLoc[1] === playerLoc[1] && $gameSwitches.value(4) == true) {
          $gameParty.members()[0].setHp(0)
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

  /**
   * Returns a route for the bishop if possible, or null if not possible
   * @param startCoordinates player starting position [x, y]
   * @param requestCoordinates requested movement position [x, y]
   */
  Game_Map.prototype.bishopRoute = function(startCoordinates, requestCoordinates) {
    const mapInfo = $gameVariables.value(7);

    let canMove = (Math.abs(startCoordinates[0] - requestCoordinates[0]) === Math.abs(startCoordinates[1] - requestCoordinates[1]))
        && !isWall(mapInfo, requestCoordinates);

    if (canMove) {
      const horizontalMovement = requestCoordinates[0] - startCoordinates[0];
      const verticalMovement = startCoordinates[1] - requestCoordinates[1]; // RPG Maker 0,0 top left

      const route = {list: [{code: Game_Character.ROUTE_SWITCH_ON, parameters: [2]}], repeat: false, skippable: false};
      let routeCode;
      if (horizontalMovement > 0 && verticalMovement > 0) {
        routeCode = Game_Character.ROUTE_MOVE_UPPER_R;
      } else if (horizontalMovement < 0 && verticalMovement < 0) {
        routeCode = Game_Character.ROUTE_MOVE_LOWER_L;
      } else if (horizontalMovement < 0 && verticalMovement > 0) {
        routeCode = Game_Character.ROUTE_MOVE_UPPER_L;
      } else if (horizontalMovement > 0 && verticalMovement < 0) {
        routeCode = Game_Character.ROUTE_MOVE_LOWER_R;
      }
      const finalizeRouteElements = [{code: Game_Character.ROUTE_SWITCH_OFF, parameters: [2]}, {code: Game_Character.ROUTE_END}];
      for (let i = 0; i < Math.abs(verticalMovement); i++) {
        route.list.push({code: routeCode})
      }

      route.list = route.list.concat(finalizeRouteElements);
      return route;
    }
    return null;
  }

  /**
   * Returns a route for the rook if possible, or null if not possible
   * @param startCoordinates player starting position [x, y]
   * @param requestCoordinates requested movement position [x, y]
   */
  Game_Map.prototype.rookRoute = function(startCoordinates, requestCoordinates) {
    const mapInfo = $gameVariables.value(7);

    let canMove = (startCoordinates[0] === requestCoordinates[0] || startCoordinates[1] === requestCoordinates[1])
        && !isWall(mapInfo, requestCoordinates);

    if (canMove) {
      const horizontalMovement = requestCoordinates[0] - startCoordinates[0];
      const verticalMovement = startCoordinates[1] - requestCoordinates[1]; // RPG Maker 0,0 top left

      const route = {list: [{code: Game_Character.ROUTE_SWITCH_ON, parameters: [2]}], repeat: false, skippable: false};
      let routeCode;
      if (verticalMovement && verticalMovement > 0) {
        routeCode = Game_Character.ROUTE_MOVE_UP;
      } else if (verticalMovement && verticalMovement < 0) {
        routeCode = Game_Character.ROUTE_MOVE_DOWN;
      } else if (horizontalMovement && horizontalMovement > 0) {
        routeCode = Game_Character.ROUTE_MOVE_RIGHT;
      } else if (horizontalMovement && horizontalMovement < 0) {
        routeCode = Game_Character.ROUTE_MOVE_LEFT;
      }
      const finalizeRouteElements = [{code: Game_Character.ROUTE_SWITCH_OFF, parameters: [2]}, {code: Game_Character.ROUTE_END}];
      for (let i = 0; i < Math.max(Math.abs(verticalMovement), Math.abs(horizontalMovement)); i++) {
        route.list.push({code: routeCode})
      }

      route.list = route.list.concat(finalizeRouteElements);
      return route;
    }
    return null;
  }

  // return a route for the horse if possible otherwise null
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
      if (possiblePos[i].toString() === horseEnd.toString()) {
        canGo = !isWall(mapInfo, horseEnd);
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