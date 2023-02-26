/*:
 * @author Sergey Khlynovskiy
 * @author Ian Gauk
 * @plugindesc Controls chess movement
 * 
 * @help Provides functionality for a chess game, such as player movement and traps. Made specificially
 * for the underpromotion chess game.

 ###=========================================================================
 ## Instructions
 ###=========================================================================
 Use event comments
 1. <chess:pawn>
 Creates an enemy chess pawn, that attacks along the diagonal

 2. <chess:spike>
 Creates a spike trap that cannot be stepped on while game switch 4 is ON

 3. <chess:pit>
 Creates a tile that cannot be stepped on

 4. <chess:wall>
 Creates an impassable wall
 *  
*/

/**
 * Checks if a position coincides with a wall
 * @param position [x,y] coordinates of position
 * @returns {boolean} true if
 */
function isWall(position) {
  return $gameMap.eventsXy(position[0], position[1])[0].isWall;
}

const LOAD_EVENT = 6;
const SPIKE_ON_EVENT = 22;

(function() {
  const params = PluginManager.parameters("chess");

  const Chess_Setup_Page = Game_Event.prototype.setupPage;
  Game_Event.prototype.setupPage = function() {
    Chess_Setup_Page.apply(this, arguments);
    this.setupChess();
  };

  Game_Event.prototype.setupChess = function() {
    if (this._erased) {
      return;
    }

    const comments = this.getComments();
    comments.forEach((comment) => {
      if (comment.match(/<chess:wall>/i)) {
        this.isWall = true;
      } else if (comment.match(/<chess:spike>/i)) {
        this.isSpike = true;
      } else if (comment.match(/<chess:pit>/i)) {
        this.pit = { isActivated: false }
      } else if (comment.match(/<chess:pawn>/i)) {
        this.isPawn = true;
      }
    });
  };


  const Chess_Update_Events = Game_Map.prototype.updateEvents;
  Game_Map.prototype.updateEvents = function() {
    Chess_Update_Events.apply(this, arguments);
    this.updateChessEvents.apply(this, arguments);
  };

  Game_Map.prototype.updateChessEvents = function() {
    const gameMap = this;
    this.events().forEach(event => {
      const playerCoordinates = [$gamePlayer.x, $gamePlayer.y];
      const touchingPlayer = event.x === playerCoordinates[0] && event.y === playerCoordinates[1];
      if (!!event.pit && !event.pit.isActivated && event.isTouchingPlayer && !touchingPlayer) {
        // true if the player was previously on this event but is moving away
        // TODO: play sound effect
        $gameSelfSwitches.setValue([this.mapId(), event._eventId, 'A'], true);
        event.pit.isActivated = true;
      }
      event.isTouchingPlayer = touchingPlayer;
      if (event.isSpike && event.isTouchingPlayer && $gameSwitches.value(SPIKE_ON_EVENT)) {
        $gameTemp.reserveCommonEvent(LOAD_EVENT);
      } else if (!!event.pit && event.isTouchingPlayer && event.pit.isActivated) {
        $gameTemp.reserveCommonEvent(LOAD_EVENT);
      } else if (!!event.pit && event.isTouchingPlayer && event.pit.isActivated) {
        $gameTemp.reserveCommonEvent(LOAD_EVENT);
      } else if (event.isPawn) {
        const pawnRoute = this.checkEatPawn([event.x, event.y], playerCoordinates);
        if (pawnRoute) {
          this.pawnAttack(event, pawnRoute);
        }
      }
    });
  }

  Game_Map.prototype.pawnAttack = function(event, pawnRoute) {
    event.forceMoveRoute(pawnRoute);
    while (event.isMoveRouteForcing()) {
      const playerCoordinates = [$gamePlayer.x, $gamePlayer.y];
      let playerIsTouchingEvent = event.x === playerCoordinates[0] && event.y === playerCoordinates[1];
      if (playerIsTouchingEvent) {
        $gameTemp.reserveCommonEvent(LOAD_EVENT);
        break;
      }
    }
  }

  /**
   * Return a route for pawn eating if possible otherwise null
   */
  Game_Map.prototype.checkEatPawn = function (pawnStart, pawnEnd) {
    if (pawnEnd[0] === pawnStart[0]-1 && pawnEnd[1] === pawnStart[1] + 1) {
      return {list: [{code: Game_Character.ROUTE_MOVE_LOWER_L}, {code: Game_Character.ROUTE_END}], repeat: false, skippable: false};
    } else if (pawnEnd[0] === pawnStart[0]+1 && pawnEnd[1] === pawnStart[1] + 1) {
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
    let canMove = (Math.abs(startCoordinates[0] - requestCoordinates[0]) === Math.abs(startCoordinates[1] - requestCoordinates[1]))
        && !isWall(requestCoordinates);

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
    let canMove = (startCoordinates[0] === requestCoordinates[0] || startCoordinates[1] === requestCoordinates[1])
        && !isWall(requestCoordinates);

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
    console.log(horseStart, horseEnd);
    const mapInfo = $gameVariables.value(15);
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
        canGo = !isWall(horseEnd);
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
})();
