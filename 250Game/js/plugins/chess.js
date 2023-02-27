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
  return !!$gameMap.eventsXy(position[0], position[1])[0].isWall;
}

const LOAD_EVENT = 6;
const SPIKE_ON_EVENT = 22;
const HORSE_SWITCH = 18;
const BISHOP_SWITCH = 20;
const ROOK_SWITCH = 19;
const HOVER_ICON = 31;

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
      } else if (comment.match(/<chess:spike>/i)) { // TODO: add timing here instead of in event
        this.spike = { opposite: false };
      } else if (comment.match(/<chess:spike:opp>/i)) {
        this.spike = { opposite: true }
      } else if (comment.match(/<chess:pit>/i)) {
        this.pit = { isActivated: false }
      } else if (comment.match(/<chess:pawn>/i)) {
        this.isPawn = true;
      }
    });
  };

  Game_Event.prototype.isSpike = function() {
    return !!this.spike;
  }

  const Chess_Update_Events = Game_Map.prototype.updateEvents;
  Game_Map.prototype.updateEvents = function() {
    Chess_Update_Events.apply(this, arguments);
    this.updateChessEvents.apply(this, arguments);
  };

  function spikeOn(event) {
    return event.spike.opposite ? !$gameSwitches.value(SPIKE_ON_EVENT) : $gameSwitches.value(SPIKE_ON_EVENT);
  }

  Game_Map.prototype.updateChessEvents = function() {
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
      if (event.isSpike() && event.isTouchingPlayer && spikeOn(event)) {
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

  // TODO: fix this, it does not actually work...
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

  Game_Character.prototype.highlightChessMoves = function() {
    let highlightFunction;
    if ($gameSwitches.value(HORSE_SWITCH)) { highlightFunction = this.highlightKnight; }
    else if ($gameSwitches.value(ROOK_SWITCH)) { highlightFunction = this.highlightRook; }
    else if ($gameSwitches.value(BISHOP_SWITCH)) { highlightFunction = this.highlightBishop; }
    if (highlightFunction) { highlightFunction.call(this) }
  }

  Game_Character.prototype.isValidBishopEvent = function(event) {
    return (Math.abs(this.x - event.x) === Math.abs(this.y - event.y)) && !event.isWall
        && (this.x !== event.x && this.y !== event.y);
  }

  Game_Character.prototype.isValidRookEvent = function(event) {
    return (this.x === event.x && this.y !== event.y) || (this.x !== event.x && this.y === event.y) && !event.isWall;
  }

  Game_Character.prototype.isValidKnightEvent = function(event) {
    const validKnightMoves = [
      [this.x - 2, this.y + 1],
      [this.x - 2, this.y - 1],
      [this.x - 1, this.y + 2],
      [this.x - 1, this.y - 2],
      [this.x + 1, this.y + 2],
      [this.x + 1, this.y - 2],
      [this.x + 2, this.y + 1],
      [this.x + 2, this.y - 1]
    ];
    return validKnightMoves.some(move => event.x === move[0] && event.y === move[1]) && !event.isWall;
  }

  function highlight(event) {
    if (!event.mouseSettings.hoverIcon) {
      event.mouseSettings.hoverIcon = HOVER_ICON;
    }
  }

  function removeChessHighlight(event) {
    if (event.mouseSettings.hoverIcon) {
      event.mouseSettings.hoverIcon = undefined;
    }
  }

  Game_Character.prototype.highlightBishop = function() {
    let definedEvents = $gameMap.events().filter(event => !!event);
    definedEvents.filter(event => this.isValidBishopEvent(event)).forEach(highlight);
    definedEvents.filter(event => !this.isValidBishopEvent(event)).forEach(removeChessHighlight);
  }

  Game_Character.prototype.highlightRook = function() {
    let definedEvents = $gameMap.events().filter(event => !!event);
    definedEvents.filter(event => this.isValidRookEvent(event)).forEach(highlight);
    definedEvents.filter(event => !this.isValidRookEvent(event)).forEach(removeChessHighlight);
  }

  Game_Character.prototype.highlightKnight = function() {
    let definedEvents = $gameMap.events().filter(event => !!event);
    definedEvents.filter(event => this.isValidKnightEvent(event)).forEach(highlight);
    definedEvents.filter(event => !this.isValidKnightEvent(event)).forEach(removeChessHighlight);
  }

  const Chess_Route_End = Game_Character.prototype.processRouteEnd;
  Game_Character.prototype.processRouteEnd = function() {
    console.log("PROCESS ROUTE END");
    Chess_Route_End.call(this);
    this.highlightChessMoves();
  }

  Game_Character.prototype.moveChess = function(destinationCoordinates) {
    let movementFunction;
    if ($gameSwitches.value(HORSE_SWITCH)) {  movementFunction = this.moveKnight; }
    else if ($gameSwitches.value(ROOK_SWITCH)) {movementFunction = this.moveRook; }
    else if ($gameSwitches.value(BISHOP_SWITCH)) { movementFunction = this.moveBishop; }
    if (movementFunction) {
      movementFunction.call(this, destinationCoordinates);
      return true;
    } else {
      return false;
    }
  }

  /**
   * Moves a route for the bishop if possible, or null if not possible
   * @param requestCoordinates requested movement position [x, y]
   */
  Game_Character.prototype.moveBishop = function(requestCoordinates) {
    let canMove = (Math.abs(this.x - requestCoordinates[0]) === Math.abs(this.y - requestCoordinates[1]))
        && !isWall(requestCoordinates);

    if (canMove) {
      const horizontalMovement = requestCoordinates[0] - this.x;
      const verticalMovement = this.y - requestCoordinates[1]; // RPG Maker 0,0 top left

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
      this.forceMoveRoute(route);
      $gameMap._interpreter.setWaitMode("route");
      return true;
    }
    return false;
  }

  /**
   * Returns a route for the rook if possible, or null if not possible
   * @param requestCoordinates requested movement position [x, y]
   */
  Game_Character.prototype.moveRook = function(requestCoordinates) {
    let canMove = (this.x === requestCoordinates[0] || this.y === requestCoordinates[1])
        && !isWall(requestCoordinates);

    if (canMove) {
      const horizontalMovement = requestCoordinates[0] - this.x;
      const verticalMovement = this.y - requestCoordinates[1]; // RPG Maker 0,0 top left

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
      this.forceMoveRoute(route);
      $gameMap._interpreter.setWaitMode("route");
      return true;
    }
    return false;
  }

  // return a route for the horse if possible otherwise null
  Game_Character.prototype.moveKnight = function(horseEnd) {
    const possiblePos = [
      [this.x-2, this.y+1],
      [this.x-2, this.y-1],
      [this.x-1, this.y+2],
      [this.x-1, this.y-2],
      [this.x+1, this.y+2],
      [this.x+1, this.y-2],
      [this.x+2, this.y+1],
      [this.x+2, this.y-1]
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
          this.forceMoveRoute(route);
          $gameMap._interpreter.setWaitMode("route");
          return true;
        }
        canGo = true;
      }
    }
    return false;
  }
})();
