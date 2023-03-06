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

 2. <chess:spike(:opp)>
 Creates a spike trap that cannot be stepped on while game switch 4 is ON

 3. <chess:pit>
 Creates a tile that cannot be stepped on

 4. <chess:wall>
 Creates an impassable wall

 5. <chess:conveyor:DIRECTION>
 DIRECTION is one of (left/right/up/down)
 Creates a tile that pushes the player in the provided direction
 *  
*/


// --- SWITCHES --- //
const LOAD_EVENT = 6;
const SPIKE_ON_EVENT = 22;
const HORSE_SWITCH = 18;
const BISHOP_SWITCH = 20;
const ROOK_SWITCH = 19;

// --- HOVER --- //
const HOVER_ICON = 31;
const HOVER_ICON_COMMENT = "<hover_icon:" + HOVER_ICON + ">";

// --- SOUND EFFECTS --- //
const SPIKE_DEATH_SE_NAME = "spikeDEATH";
const SPIKE_DEATH_SE = { name: SPIKE_DEATH_SE_NAME, volume: 100, pitch: 100 };
const CHESS_MOVE_SE_1_NAME = "chessMOVEMENT";
const CHESS_MOVE_SE_2_NAME = "chessMOVEMENT2";
const CHESS_MOVE_SE_3_NAME = "chessMOVEMENT3";
const CHESS_MOVEMENT_SE_1 = {name: CHESS_MOVE_SE_1_NAME, volume: 90, pitch: 100};
const CHESS_MOVEMENT_SE_2 = {name: CHESS_MOVE_SE_2_NAME, volume: 90, pitch: 100};
const CHESS_MOVEMENT_SE_3 = {name: CHESS_MOVE_SE_3_NAME, volume: 90, pitch: 100};
const PIT_OPEN_SE_NAME = "pitOPEN";
const PIT_OPEN_SE = { name: PIT_OPEN_SE_NAME, volume: 100, pitch: 110 };
const PIT_FALL_SE_NAME = "pitFALL";
const PIT_FALL_SE = { name: PIT_FALL_SE_NAME, volume: 100, pitch: 100 };
const FIRE_BURN_SE_NAME = "fireBURN";
const FIRE_BURN_SE = { name: FIRE_BURN_SE_NAME, volume: 100, pitch: 100 };
const FIRE_TIGGERED_SE_NAME = "flameTRIGGERED";
const FIRE_TRIGGERED_SE = { name: FIRE_TIGGERED_SE_NAME, volume: 70, pitch: 110 };
const FLAME_ACTIVE_SE_NAME = "flameACTIVE";
const FLAME_ACTIVE_SE = { name: FLAME_ACTIVE_SE_NAME, volume: 70, pitch: 110 };

// --- IMAGES --- //
const SUN_FLARE_IMAGE = {"tileId": 0, "characterName": "!Flame", "direction": 3, "pattern": 0, "characterIndex": 6};
const FIRE_IMAGE = {"tileId": 0, "characterName": "!Other2", "direction": 1, "pattern": 0, "characterIndex": 3};

// --- MOVEMENT --- //
const UP = Game_Character.ROUTE_MOVE_UP;
const DOWN = Game_Character.ROUTE_MOVE_DOWN;
const LEFT = Game_Character.ROUTE_MOVE_LEFT;
const RIGHT = Game_Character.ROUTE_MOVE_RIGHT;

/**
 * Checks if a position coincides with a wall
 * @param position [x,y] coordinates of position
 * @returns {boolean} true if
 */
function isWall(position) {
  return !!$gameMap.eventsXy(position[0], position[1])[0].isWall;
}

function getRandomInt(max, min = 0) {
  return Math.floor(Math.random() * max) + min;
}

(function() {
  const params = PluginManager.parameters("chess");

  let tickCounter = 0;
  const flameEvents = [];
  const wallEvents = [];
  const spikeEvents = [];
  const pitEvents = [];
  const conveyorBeltEvents = [];
  Game_Map.prototype.flames = function() { return flameEvents };
  Game_Map.prototype.walls = function() { return wallEvents };
  Game_Map.prototype.pits = function() { return pitEvents };
  Game_Map.prototype.spikes = function() { return spikeEvents };
  Game_Map.prototype.conveyors = function() { return conveyorBeltEvents };



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
        $gameMap.walls().push(this);
      } else if (comment.match(/<chess:spike>/i)) { // TODO: add timing here instead of in event
        this.spike = { opposite: false };
        $gameMap.spikes().push(this);
      } else if (comment.match(/<chess:spike:opp>/i)) {
        this.spike = { opposite: true }
        $gameMap.spikes().push(this);
      } else if (comment.match(/<chess:pit>/i)) {
        this.pit = { isActivated: false }
        $gameMap.pits().push(this);
      } else if (comment.match(/<chess:conveyor:left>/i)) {
        this.conveyor = { direction: LEFT }
        $gameMap.conveyors().push(this);
      } else if (comment.match(/<chess:conveyor:right>/i)) {
        this.conveyor = { direction: RIGHT }
        $gameMap.conveyors().push(this);
      } else if (comment.match(/<chess:conveyor:up>/i)) {
        this.conveyor = { direction: UP }
        $gameMap.conveyors().push(this);
      } else if (comment.match(/<chess:conveyor:down>/i)) {
        this.conveyor = { direction: DOWN }
        $gameMap.conveyors().push(this);
      } else if (comment.match(/<chess:flame>/i)) {
        this.flame = {
          /**
           * Dictates if the flame is currently on fire
           */
          active: false,
          /**
           * Dictates if the flame will soon become active
           */
          triggered: false,
          /**
           * True when the flame is in the process of activating
           */
          activating: false,
          /**
           * True when a flame is in the process of triggering
           */
          triggering: false
        };
        $gameMap.flames().push(this);
      }
    });
  };

  Game_Event.prototype.isSpike = function() {
    return !!this.spike;
  }

  Game_Event.prototype.isConveyorBelt = function() {
    return !!this.conveyor;
  }

  Game_Event.prototype.isFlame = function() {
    return !!this.flame;
  }

  const Chess_Update_Events = Game_Map.prototype.updateEvents;
  Game_Map.prototype.updateEvents = function() {
    Chess_Update_Events.apply(this, arguments);
    this.updateChessEvents.apply(this, arguments);
  };

  function spikeOn(event) {
    return event.spike.opposite ? !$gameSwitches.value(SPIKE_ON_EVENT) : $gameSwitches.value(SPIKE_ON_EVENT);
  }

  Game_Map.prototype.updateFlameActivations = function() {
    if (!flameEvents.some(event => event.flame.triggered || event.flame.triggering)) { // randomly select the next flame to activate
      const unTriggeredFlames = this.flames().filter(event => !event.flame.triggered && !event.flame.triggering && !event.flame.active && !event.flame.activating);
      if (unTriggeredFlames.length) {
        unTriggeredFlames[getRandomInt(unTriggeredFlames.length)].triggerFlame();
      }
    }
    const flamesToActivate = this.flames().filter(event => event.flame.triggered && !event.flame.active && !event.flame.activating);
    flamesToActivate.forEach(event => event.activateFlame());
  }

  Game_Event.prototype.triggerFlame = function() {
    this.flame.triggering = true;
    setTimeout(() => {
      this.setImage(SUN_FLARE_IMAGE.characterName, SUN_FLARE_IMAGE.characterIndex);
      this.flame.triggered = true;
      this.flame.triggering = false;
      AudioManager.playSe(FIRE_TRIGGERED_SE);
    }, getRandomInt(3000, 1000));
  }

  Game_Event.prototype.activateFlame = function() {
    this.flame.activating = true;
    setTimeout(() => {
      this.flame.triggered = false;
      this.flame.active = true;
      AudioManager.stopSe()
      AudioManager.playSe(FLAME_ACTIVE_SE);
      this.setImage(FIRE_IMAGE.characterName, FIRE_IMAGE.characterIndex);
      setTimeout(() => {
        this.setImage('', 0);
        this.flame.active = false;
        this.flame.activating = false;
        this.setTileImage(SUN_FLARE_IMAGE.characterName, 3, 5);
      }, 3000);
    }, 3000);
  }

  Game_Map.prototype.checkSpikeDeath = function() {
    const playerCoordinates = [$gamePlayer.x, $gamePlayer.y];

    this.spikes().forEach(spikeEvent => {
      spikeEvent.isTouchingPlayer = spikeEvent.x === playerCoordinates[0] && spikeEvent.y === playerCoordinates[1];

      if (spikeEvent.isTouchingPlayer && spikeOn(spikeEvent)) {
        AudioManager.playSe(SPIKE_DEATH_SE);
        $gameTemp.reserveCommonEvent(LOAD_EVENT);
      }
    });
  }

  Game_Map.prototype.checkConveyorBeltMovement = function() {
    const playerCoordinates = [$gamePlayer.x, $gamePlayer.y];

    this.conveyors().forEach(conveyorBeltEvent => {
      conveyorBeltEvent.isTouchingPlayer = conveyorBeltEvent.x === playerCoordinates[0] && conveyorBeltEvent.y === playerCoordinates[1];

      if (conveyorBeltEvent.isTouchingPlayer && !$gamePlayer.isMoveRouteForcing()) {
        conveyorBeltEvent.activateConveyorBelt();
      }
    });
  }

  Game_Map.prototype.checkFlameDeath = function() {
    const playerCoordinates = [$gamePlayer.x, $gamePlayer.y];

    this.flames().forEach(flameEvent => {
      flameEvent.isTouchingPlayer = flameEvent.x === playerCoordinates[0] && flameEvent.y === playerCoordinates[1];

      if (flameEvent.isTouchingPlayer && flameEvent.flame.active) {
        AudioManager.playSe(FIRE_BURN_SE);
        $gameTemp.reserveCommonEvent(LOAD_EVENT);
      }
    });
  }

  Game_Map.prototype.updatePitTraps = function() {
    this.pits().forEach(pitEvent => {
      const playerCoordinates = [$gamePlayer.x, $gamePlayer.y];
      const touchingPlayer = pitEvent.x === playerCoordinates[0] && pitEvent.y === playerCoordinates[1];

      if  (!pitEvent.pit.isActivated && pitEvent.isTouchingPlayer && !touchingPlayer) {
        AudioManager.playSe(PIT_OPEN_SE);
        $gameSelfSwitches.setValue([this.mapId(), pitEvent._eventId, 'A'], true);
        pitEvent.pit.isActivated = true;
      }

      pitEvent.isTouchingPlayer = touchingPlayer;

      if (pitEvent.isTouchingPlayer && pitEvent.pit.isActivated) {
        AudioManager.playSe(PIT_FALL_SE);
        $gameTemp.reserveCommonEvent(LOAD_EVENT);
        $gameSelfSwitches.setValue([this.mapId(), pitEvent._eventId, 'A'], false);
      }
    })
  }

  Game_Map.prototype.updateChessEvents = function() {
    tickCounter++;
    if (tickCounter % 50 === 0) {
      this.updateFlameActivations();
    }

    this.checkSpikeDeath();
    this.checkConveyorBeltMovement();
    this.checkFlameDeath();
    this.updatePitTraps();
  }

  Game_Event.prototype.activateConveyorBelt = function() {
    const route = {list: [{code: Game_Character.ROUTE_THROUGH_ON}], repeat: false, skippable: false};
    route.list.push({code: this.conveyor.direction});
    route.list.push({code: Game_Character.ROUTE_THROUGH_OFF});
    route.list.push({code: Game_Character.ROUTE_END});
    $gamePlayer.forceMoveRoute(route);
  }

  // ---------------------------------------- CHESS HIGHLIGHT ---------------------------------------- //
  Game_Character.prototype.highlightChessMoves = function() {
    let highlightFunction;
    if ($gameSwitches.value(HORSE_SWITCH)) { highlightFunction = this.highlightKnight; }
    else if ($gameSwitches.value(ROOK_SWITCH)) { highlightFunction = this.highlightRook; }
    else if ($gameSwitches.value(BISHOP_SWITCH)) { highlightFunction = this.highlightBishop; }
    if (highlightFunction) { highlightFunction.call(this) }
  }

  // Game_Map.prototype.removeAllChessHighlight = function() {
  //   this.events().forEach(event => removeChessHighlight(event));
  // }

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
      event.event().pages.forEach(page => page.list.push({"code":108,"indent":0,"parameters":[HOVER_ICON_COMMENT]}))
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

  const Chess_On_Map_Loaded = Scene_Map.prototype.onMapLoaded
  Scene_Map.prototype.onMapLoaded = function() {
    Chess_On_Map_Loaded.call(this);
    $gamePlayer.highlightChessMoves();
  }

  // const Chess_Start_Message = Window_Message.prototype.startMessage;
  // Window_Message.prototype.startMessage = function() {
  //   $gameMap.removeAllChessHighlight();
  //   Chess_Start_Message.call(this);
  // }
  //
  // const Chess_Terminate_Message = Window_Message.prototype.terminateMessage;
  // Window_Message.prototype.terminateMessage = function() {
  //   Chess_Terminate_Message.call(this);
  //   $gamePlayer.highlightChessMoves();
  // }



  // ---------------------------------------- CHESS MOVEMENT ---------------------------------------- //
  Game_Character.prototype.moveChess = function(destinationCoordinates) {
    let movementFunction;
    if ($gameSwitches.value(HORSE_SWITCH)) {  movementFunction = this.moveKnight; }
    else if ($gameSwitches.value(ROOK_SWITCH)) {movementFunction = this.moveRook; }
    else if ($gameSwitches.value(BISHOP_SWITCH)) { movementFunction = this.moveBishop; }
    if (movementFunction) {
      return movementFunction.call(this, destinationCoordinates);
    } else {
      return false;
    }
  }

  Game_Player.prototype.playChessMovementSE = function() {
    const movementSoundEffects = [
      CHESS_MOVEMENT_SE_1,
      CHESS_MOVEMENT_SE_2,
      CHESS_MOVEMENT_SE_3
    ];
    let randomSEIndex = getRandomInt(3);
    AudioManager.playSe(movementSoundEffects[randomSEIndex]);
  }

  const Chess_Route_End = Game_Player.prototype.processRouteEnd;
  Game_Player.prototype.processRouteEnd = function() {
    Chess_Route_End.call(this);
    this.highlightChessMoves();
    this.playChessMovementSE();
  }

  Game_Character.prototype.bishopCanMove = function(requestCoordinates) {
    if ((Math.abs(this.x - requestCoordinates[0]) !== Math.abs(this.y - requestCoordinates[1])) || isWall(requestCoordinates)) {
      return false;
    }

    function isValidBishopMove() {
      return event => Math.abs(this.x - event.x) === Math.abs(this.y - event.y);
    }

    if (this.x > requestCoordinates[0] && this.y > requestCoordinates[1]) {
      return !$gameMap.walls().filter(isValidBishopMove.call(this)).some(event => (event.x < this.x && event.x > requestCoordinates[0]) && (event.y < this.y && event.y > requestCoordinates[1]));
    } else if (this.x < requestCoordinates[0] && this.y < requestCoordinates[1]) {
      return !$gameMap.walls().filter(isValidBishopMove.call(this)).some(event => (event.x > this.x && event.x < requestCoordinates[0]) && (event.y > this. y && event.y < requestCoordinates[1]));
    } else if (this.x > requestCoordinates[0] && this.y < requestCoordinates[1]) {
      return !$gameMap.walls().filter(isValidBishopMove.call(this)).some(event => (event.x < this.x && event.x > requestCoordinates[0]) && (event.y > this.y && event.y < requestCoordinates[1]));
    } else if (this.x < requestCoordinates[0] && this.y > requestCoordinates[1]) {
      return !$gameMap.walls().filter(isValidBishopMove.call(this)).some(event => (event.x > this.x && event.x < requestCoordinates[0]) && (event.y < this.y && event.y > requestCoordinates[1]))
    }
  }

  Game_Character.prototype.rookCanMove = function(requestCoordinates) {
    if ((this.x !== requestCoordinates[0] && this.y !== requestCoordinates[1]) || isWall(requestCoordinates)) {
      return false;
    }

    function isValidRookMove() {
      return event => this.x === event.x || this.y === event.y;
    }

    if (this.x < requestCoordinates[0]) {
      return !$gameMap.walls().filter(isValidRookMove.call(this)).some(event => event.x > this.x && event.x < requestCoordinates[0]);
    } else if (this.x > requestCoordinates[0]) {
      return !$gameMap.walls().filter(isValidRookMove.call(this)).some(event => event.x < this.x && event.x > requestCoordinates[0]);
    } else if (this.y < requestCoordinates[1]) {
      return !$gameMap.walls().filter(isValidRookMove.call(this)).some(event => event.y > this.y && event.y < requestCoordinates[1]);
    } else if (this.y > requestCoordinates[1]) {
      return !$gameMap.walls().filter(isValidRookMove.call(this)).some(event => event.y < this.y && event.y > requestCoordinates[1]);
    }
  }

  /**
   * Moves a route for the bishop if possible, or null if not possible
   * @param requestCoordinates requested movement position [x, y]
   */
  Game_Character.prototype.moveBishop = function(requestCoordinates) {
    let canMove = this.bishopCanMove(requestCoordinates);

    if (canMove) {
      const horizontalMovement = requestCoordinates[0] - this.x;
      const verticalMovement = this.y - requestCoordinates[1]; // RPG Maker 0,0 top left

      const route = {list: [{code: Game_Character.ROUTE_THROUGH_ON}], repeat: false, skippable: false};
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
      for (let i = 0; i < Math.abs(verticalMovement); i++) {
        route.list.push({code: routeCode})
      }

      route.list.push({code: Game_Character.ROUTE_THROUGH_OFF});
      route.list.push({code: Game_Character.ROUTE_END});
      this.forceMoveRoute(route);
      return true;
    }
    return false;
  }

  /**
   * Returns a route for the rook if possible, or null if not possible
   * @param requestCoordinates requested movement position [x, y]
   */
  Game_Character.prototype.moveRook = function(requestCoordinates) {
    let canMove = this.rookCanMove(requestCoordinates);

    if (canMove) {
      const horizontalMovement = requestCoordinates[0] - this.x;
      const verticalMovement = this.y - requestCoordinates[1]; // RPG Maker 0,0 top left

      const route = {list: [{code: Game_Character.ROUTE_THROUGH_ON}], repeat: false, skippable: false};
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
      for (let i = 0; i < Math.max(Math.abs(verticalMovement), Math.abs(horizontalMovement)); i++) {
        route.list.push({code: routeCode})
      }

      route.list.push({code: Game_Character.ROUTE_THROUGH_OFF});
      route.list.push({code: Game_Character.ROUTE_END});
      this.forceMoveRoute(route);
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
        if (canGo) {
          switch (i) {
            case 0:
              route = {list: [{code: Game_Character.ROUTE_THROUGH_ON}, {code: Game_Character.ROUTE_MOVE_LEFT}, {code: Game_Character.ROUTE_MOVE_LEFT}, {code: Game_Character.ROUTE_MOVE_DOWN}, {code: Game_Character.ROUTE_THROUGH_OFF}, {code: Game_Character.ROUTE_END}], repeat: false, skippable: false};
              break;
            case 1:
              route = {list: [{code: Game_Character.ROUTE_THROUGH_ON}, {code: Game_Character.ROUTE_MOVE_LEFT}, {code: Game_Character.ROUTE_MOVE_LEFT}, {code: Game_Character.ROUTE_MOVE_UP}, {code: Game_Character.ROUTE_THROUGH_OFF}, {code: Game_Character.ROUTE_END}], repeat: false, skippable: false};
              break;
            case 2:
              route = {list: [{code: Game_Character.ROUTE_THROUGH_ON}, {code: Game_Character.ROUTE_MOVE_LEFT}, {code: Game_Character.ROUTE_MOVE_DOWN}, {code: Game_Character.ROUTE_MOVE_DOWN}, {code: Game_Character.ROUTE_THROUGH_OFF}, {code: Game_Character.ROUTE_END}], repeat: false, skippable: false};
              break;
            case 3:
              route = {list: [{code: Game_Character.ROUTE_THROUGH_ON}, {code: Game_Character.ROUTE_MOVE_LEFT}, {code: Game_Character.ROUTE_MOVE_UP}, {code: Game_Character.ROUTE_MOVE_UP}, {code: Game_Character.ROUTE_THROUGH_OFF}, {code: Game_Character.ROUTE_END}], repeat: false, skippable: false};
              break;
            case 4:
              route = {list: [{code: Game_Character.ROUTE_THROUGH_ON}, {code: Game_Character.ROUTE_MOVE_RIGHT}, {code: Game_Character.ROUTE_MOVE_DOWN}, {code: Game_Character.ROUTE_MOVE_DOWN}, {code: Game_Character.ROUTE_THROUGH_OFF}, {code: Game_Character.ROUTE_END}], repeat: false, skippable: false};
              break;
            case 5:
              route = {list: [{code: Game_Character.ROUTE_THROUGH_ON}, {code: Game_Character.ROUTE_MOVE_RIGHT}, {code: Game_Character.ROUTE_MOVE_UP}, {code: Game_Character.ROUTE_MOVE_UP}, {code: Game_Character.ROUTE_THROUGH_OFF}, {code: Game_Character.ROUTE_END}], repeat: false, skippable: false};
              break;
            case 6:
              route = {list: [{code: Game_Character.ROUTE_THROUGH_ON}, {code: Game_Character.ROUTE_MOVE_RIGHT}, {code: Game_Character.ROUTE_MOVE_RIGHT}, {code: Game_Character.ROUTE_MOVE_DOWN}, {code: Game_Character.ROUTE_THROUGH_OFF}, {code: Game_Character.ROUTE_END}], repeat: false, skippable: false};
              break;
            case 7:
              route = {list: [{code: Game_Character.ROUTE_THROUGH_ON}, {code: Game_Character.ROUTE_MOVE_RIGHT}, {code: Game_Character.ROUTE_MOVE_RIGHT}, {code: Game_Character.ROUTE_MOVE_UP}, {code: Game_Character.ROUTE_THROUGH_OFF}, {code: Game_Character.ROUTE_END}], repeat: false, skippable: false};
              break;
          }
          this.forceMoveRoute(route);
          return true;
        }
        canGo = true;
      }
    }
    return false;
  }
})();
