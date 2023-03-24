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
const HORSE_SWITCH = 18;
const BISHOP_SWITCH = 20;
const ROOK_SWITCH = 19;

// --- HOVER --- //
const WALK_ICON = 31;
const DEATH_ICON = 1;
const PUSH_ICON = 77;
const CONVEYOR_ICON = 82;
const EXIT_ICON = 72;
const BUTTON_ICON = 74;


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
const PIT_OPEN_SE = { name: PIT_OPEN_SE_NAME, volume: 40, pitch: 110 };
const PIT_FALL_SE_NAME = "pitFALL";
const PIT_FALL_SE = { name: PIT_FALL_SE_NAME, volume: 100, pitch: 100 };
const FIRE_BURN_SE_NAME = "fireBURN";
const FIRE_BURN_SE = { name: FIRE_BURN_SE_NAME, volume: 100, pitch: 100 };
const FIRE_TRIGGERED_SE_NAME = "flameTRIGGERED";
const FIRE_TRIGGERED_SE = { name: FIRE_TRIGGERED_SE_NAME, volume: 30, pitch: 110 };
const FLAME_ACTIVE_SE_NAME = "flameACTIVE";
const FLAME_ACTIVE_SE = { name: FLAME_ACTIVE_SE_NAME, volume: 70, pitch: 110 };
const PUSHING_SE_NAME = "Earth4";
const PUSHING_SE = { name: PUSHING_SE_NAME, volume: 20, pitch: 140 };
const BOULDER_DEATH_SE_NAME = "boulderDEATH";
const BOULDER_DEATH_SE = { name: BOULDER_DEATH_SE_NAME, volume: 100, pitch: 140 };
const SPIKE_ON_SE_NAME = "spikeON"
const SPIKE_OFF_SE_NAME = "spikeOFF"
const SPIKE_ON_SE = { name: SPIKE_ON_SE_NAME, volume: 40, pitch: 120 };
const SPIKE_OFF_SE = { name: SPIKE_OFF_SE_NAME, volume: 40, pitch: 80 };
const SPIKE_SE_MAP = new Map([[true, SPIKE_ON_SE], [false, SPIKE_OFF_SE]]);
const BUTTON_SWITCH_SE_NAME = "buttonSWITCH";
const BUTTON_SWITCH_SE = { name: BUTTON_SWITCH_SE_NAME, volume: 70, pitch: 110 };
const BUTTON_OFF_SE_NAME = "buttonOFF";
const BUTTON_OFF_SE = { name: BUTTON_OFF_SE_NAME, volume: 70, pitch: 90 };
const GATE_OPEN_SE_NAME = "Open2"
const GATE_OPEN_SE = { name: GATE_OPEN_SE_NAME, volume: 60, pitch: 100 };
// --- IMAGES --- //
const SUN_FLARE_IMAGE = {"tileId": 0, "characterName": "!Flame", "direction": 3, "pattern": 0, "characterIndex": 6};
const FIRE_IMAGE = {"tileId": 0, "characterName": "!Other2", "direction": 1, "pattern": 0, "characterIndex": 3};

// --- MOVEMENT --- //
const UP = Game_Character.ROUTE_MOVE_UP;
const DOWN = Game_Character.ROUTE_MOVE_DOWN;
const LEFT = Game_Character.ROUTE_MOVE_LEFT;
const RIGHT = Game_Character.ROUTE_MOVE_RIGHT;
const directionMap = new Map([
    ["up", UP],
    ["down", DOWN],
    ["left", LEFT],
    ["right", RIGHT]
])
const LOWER_L = Game_Character.ROUTE_MOVE_LOWER_L;
const LOWER_R = Game_Character.ROUTE_MOVE_LOWER_R;
const UPPER_L = Game_Character.ROUTE_MOVE_UPPER_L;
const UPPER_R = Game_Character.ROUTE_MOVE_UPPER_R;
const validDirections = [
    UP, DOWN, LEFT, RIGHT,
    LOWER_L, LOWER_R, UPPER_L, UPPER_R
]
const validDirectionsCoordinateOffset = new Map([
    [UP, [0, -1]],
    [DOWN, [0, 1]],
    [LEFT, [-1, 0]],
    [RIGHT, [1, 0]],
    [LOWER_L, [-1, 1]],
    [LOWER_R, [1, 1]],
    [UPPER_L, [-1, -1]],
    [UPPER_R, [1, -1]]
]);

// --- OPEN STATES GATE --- //
const OPEN_STATES = [undefined, 'A', 'B', 'C', 'D'];

/**
 * Checks if a position coincides with a wall
 * @param position [x,y] coordinates of position
 * @returns {boolean} true if
 */
function isWall(position) {
  return $gameMap.eventsXy(position[0], position[1]).some(eventAtPosition => {
    const isUnopenedGate = !!eventAtPosition.gate && eventAtPosition.gate.state !== eventAtPosition.gate.requiredNumberButtonsPressed;
    let blockedConveyor = false;
    if (!!eventAtPosition.conveyor) {
      const conveyorOffset = validDirectionsCoordinateOffset.get(eventAtPosition.conveyor.direction);
      blockedConveyor = $gameMap.eventsXy(eventAtPosition.x + conveyorOffset[0], eventAtPosition.y + conveyorOffset[1]).some(event => {
        return !!event.pushable && event.pushable.invalidOffsets.some(offset => offset[0] === conveyorOffset[0] && offset[1] === conveyorOffset[1]);
      });
    }
    let blockedPushable = false;
    if (!!eventAtPosition.pushable) {
      const xDirection = (position[0] - $gamePlayer.x) / Math.max(1, Math.abs(position[0] - $gamePlayer.x));
      const yDirection = (position[1] - $gamePlayer.y) / Math.max(1, Math.abs(position[1] - $gamePlayer.y));
      blockedPushable = eventAtPosition.pushable.invalidOffsets.some(offset => offset[0] === xDirection && offset[1] === yDirection);
    }
    return eventAtPosition.isWall || isUnopenedGate || blockedConveyor || blockedPushable;
  })
}

function getRandomInt(max, min = 0) {
  return Math.floor(Math.random() * max) + min;
}

function XOR(a,b) {
  return ( a || b ) && !( a && b );
}

function findSEIndex(name) {
  return AudioManager._seBuffers.findIndex(se => se.url.includes(name));
}

function stopSEByName(name, all = false) {
  let index = findSEIndex(name);
  while (index !== -1) {
    AudioManager._seBuffers[index].stop();
    AudioManager._seBuffers.splice(index, 1);
    index = AudioManager._seBuffers.findIndex(se => se.url.includes(name));
    if (!all) {
      break;
    }
  }
}

function touching(eventA, eventB) {
  return eventA.x === eventB.x && eventA.y === eventB.y;
}

function surroundingOffsets(centralEvent, eventsToCheckFor) {
  const coordinateOffsets = Array.from(validDirectionsCoordinateOffset.values());
  const surroundingOffsets = [];
  for (let i = 0; i < coordinateOffsets.length; i++) {
    const offset = coordinateOffsets[i];
    const offsetX = offset[0];
    const offsetY = offset[1];
    if ((eventsToCheckFor.some(event => event.x === centralEvent.x + offsetX && event.y === centralEvent.y + offsetY))) {
      surroundingOffsets.push(coordinateOffsets[i]);
    }
  }
  return surroundingOffsets;
}

const SPIKE_TIMING = 2000;
(function() {
  PluginManager.parameters("chess");
  let tickCounter = 0;
  let flameEvents = Array(10);
  let activeFlameTimeouts = [];
  let wallEvents = [];
  let spikeEvents = new Set();
  let pitEvents = new Set();
  let conveyorBeltEvents = [];
  let gateEvents = new Set();
  let buttonEvents = [];
  let boulderEvents = [];
  let pushableEvents = [];
  Input.keyMapper[37] = undefined;
  Input.keyMapper[38] = undefined;
  Input.keyMapper[39] = undefined;
  Input.keyMapper[40] = undefined;
  Input.keyMapper[98] = undefined;
  Input.keyMapper[100] = undefined;
  Input.keyMapper[102] = undefined;
  Input.keyMapper[104] = undefined;

  const Chess_Game_Map_Setup = Game_Map.prototype.setup;
  Game_Map.prototype.setup = function () {
    this.resetAllFlames();
    tickCounter = 0;
    flameEvents = Array(10);
    activeFlameTimeouts = [];
    wallEvents = [];
    spikeEvents = new Set();
    pitEvents = new Set();
    conveyorBeltEvents = [];
    gateEvents = new Set();
    buttonEvents = [];
    boulderEvents = [];
    pushableEvents = [];
    Chess_Game_Map_Setup.apply(this, arguments);
  }


  Game_Map.prototype.flameGroups = function() { return flameEvents.filter(group => !!group); };
  Game_Map.prototype.allFlames = function () { return Array.prototype.concat.apply([], flameEvents).filter(event => !!event); }
  Game_Map.prototype.walls = function() { return wallEvents };
  Game_Map.prototype.pits = function() { return Array.from(pitEvents) };
  Game_Map.prototype.spikes = function() { return Array.from(spikeEvents) };
  Game_Map.prototype.conveyors = function() { return conveyorBeltEvents };
  Game_Map.prototype.gates = function() { return Array.from(gateEvents) };
  Game_Map.prototype.buttons = function() { return buttonEvents };
  Game_Map.prototype.activeFlameTimeouts = function() { return activeFlameTimeouts };
  Game_Map.prototype.boulders = function() { return boulderEvents; }
  Game_Map.prototype.blockingEvents = function() {
    const unopenedGates = this.gates().filter(gateEvent => gateEvent.gate.state !== gateEvent.gate.requiredNumberButtonsPressed);
    return wallEvents.concat(unopenedGates);
  }
  Game_Map.prototype.pushables = function() { return pushableEvents; }
  Game_Map.prototype.weightedEvents = function () { return pushableEvents.concat(boulderEvents); }

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
      } else if (comment.match(/<chess:spike:?(\d*):?(true|false)?>/i)) {
        if (!spikeEvents.has(this)) {
          let match = comment.match(/<chess:spike:?(\d*):?(true|false)?>/i);
          let spikeDelay = 0;
          let startDown = true;
          let audioLeader = false; // plays audio for a set of spikes on same interval
          if (match[1]) {
            spikeDelay = parseInt(match[1]);
          }
          if (match[2]) {
            startDown = match[2].toLowerCase() === "true"
          }
          this.spike = { scheduled: false, active: !startDown, opposite: startDown, initialDelay: spikeDelay, audioLeader };
          setTimeout(() => {
            if (!$gameMap.spikes().some(spike => spike.spike.initialDelay === spikeDelay)) {
              this.spike.audioLeader = true;
            }
            spikeEvents.add(this);
          }, spikeDelay);
        }
      } else if (comment.match(/<chess:pit>/i)) {
        if (!pitEvents.has(this)) {
          this.pit = { isActivated: false };
          pitEvents.add(this);
        }
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
      } else if (comment.match(/<chess:flame:?(\d*)>/i)) {
        let flameGroup = parseInt(comment.match(/<chess:flame:?(\d*)>/i)[1]);
        if (isNaN(flameGroup)) { flameGroup = 0; }
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
        if (!flameEvents[flameGroup]) {
          flameEvents[flameGroup] = [this];
        } else {
          flameEvents[flameGroup].push(this);
        }
      } else if (comment.match(/<chess:button:([a-d]):?(true|false)?>/i)) {
        const match = comment.match(/<chess:button:([a-d]):?(true|false)?>/i);
        const buttonGroup = match[1];
        let hold = false;
        if (match[2]) {
          hold = match[2].toLowerCase() === "true"
        }
        this.button = {
          activated: false,
          group: buttonGroup.toUpperCase(),
          hold
        }
        $gameMap.buttons().push(this);
      } else if (comment.match(/<chess:gate:([a-d]):?([1-4]?)>/i)) {
        let match = comment.match(/<chess:gate:([a-d]):?([1-4])?>/i);
        const gateGroup = match[1];
        let requiredNumButtonsPressed = parseInt(match[2]);
        if (isNaN(requiredNumButtonsPressed)) { requiredNumButtonsPressed = 1; }
        this.gate = {
          state: 0,
          group: gateGroup.toUpperCase(),
          requiredNumberButtonsPressed: requiredNumButtonsPressed
        }
        gateEvents.add(this);
      } else if (comment.match(/<chess:boulder:?(left|right|up|down)?>/i)) {
        $gameMap.boulders().push(this);
      } else if (comment.match(/<chess:pushable:?(left|right|up|down)*>/i)) {
        let pushable = comment.match(/<chess:pushable:?(left|right|up|down)*>/i);
        let redirection;
        if (pushable.length) {
          redirection = directionMap.get([pushable[1]]);
        }
        this.pushable = { redirection, invalidOffsets: [] };
        $gameMap.pushables().push(this);
      }  else if (comment.match(/<chess:exit>/i)) {
        this.isExit = true;
      }
    });
    $gameMap.pushables().forEach(pushable => pushable.invalidOffsets = surroundingOffsets(pushable, $gameMap.blockingEvents()));
  };

  const Chess_Update_Events = Game_Map.prototype.updateEvents;
  Game_Map.prototype.updateEvents = function() {
    Chess_Update_Events.apply(this, arguments);
    this.updateChessEvents.apply(this, arguments);
  };

  Game_Map.prototype.playerDie = function (deathSoundEffect) {
    if (!$gamePlayer.isImmune) {
      if (deathSoundEffect) {
        AudioManager.playSe(deathSoundEffect);
      }
      $gameTemp.reserveCommonEvent(LOAD_EVENT);
      $gameSwitches.clear();
    }
  }

  Game_Map.prototype.updateFlameActivations = function() {
    this.flameGroups().forEach(flameGroup => {
      if (!flameGroup.some(event => event.flame.triggered || event.flame.triggering)) { // randomly select the next flame to activate
        const unTriggeredFlames = flameGroup.filter(event => !event.flame.triggered && !event.flame.triggering && !event.flame.active && !event.flame.activating);
        if (unTriggeredFlames.length) {
          unTriggeredFlames[getRandomInt(unTriggeredFlames.length)].triggerFlame();
        }
      }
      const flamesToActivate = flameGroup.filter(event => event.flame.triggered && !event.flame.active && !event.flame.activating);
      flamesToActivate.forEach(event => event.activateFlame());
    });
  }

  Game_Event.prototype.isDeadly = function() {
    const isActivatedSpike = this.spike && this.spike.active;
    const isActiveFlame = this.flame && this.flame.active;
    const isPitTrap = this.pit && this.pit.isActivated;
    const isBoulder = $gameMap.boulders().some(event => event === this);
    return isActivatedSpike || isActiveFlame || isPitTrap || isBoulder;
  }

  Game_Event.prototype.triggerFlame = function() {
    this.flame.triggering = true;
    const timeoutIdTriggering = setTimeout(() => {
      this.setImage(SUN_FLARE_IMAGE.characterName, SUN_FLARE_IMAGE.characterIndex);
      this.flame.triggered = true;
      this.flame.triggering = false;
      AudioManager.playSe(FIRE_TRIGGERED_SE);
      const index = $gameMap.activeFlameTimeouts().indexOf(timeoutIdTriggering);
      $gameMap.activeFlameTimeouts().splice(index, 1);
    }, getRandomInt(3000, 1000));
    $gameMap.activeFlameTimeouts().push(timeoutIdTriggering);
  }

  Game_Event.prototype.activateFlame = function() {
    this.flame.activating = true;
    const timeoutIdActivating = setTimeout(() => {
      this.flame.triggered = false;
      this.flame.activating = false;
      this.flame.active = true;
      stopSEByName(FIRE_TRIGGERED_SE_NAME);
      AudioManager.playSe(FLAME_ACTIVE_SE);
      this.setImage(FIRE_IMAGE.characterName, FIRE_IMAGE.characterIndex);
      const timeoutIdActive = setTimeout(() => {
        this.setImage('', 0);
        stopSEByName(FLAME_ACTIVE_SE_NAME);
        this.flame.active = false;
        this.setTileImage(SUN_FLARE_IMAGE.characterName, 3, 5);
        const index = $gameMap.activeFlameTimeouts().indexOf(timeoutIdActive);
        $gameMap.activeFlameTimeouts().splice(index, 1);
      }, 3000);
      $gameMap.activeFlameTimeouts().push(timeoutIdActive);
      const index = $gameMap.activeFlameTimeouts().indexOf(timeoutIdActivating);
      $gameMap.activeFlameTimeouts().splice(index, 1);
    }, 3000);
    $gameMap.activeFlameTimeouts().push(timeoutIdActivating);
  }

  Game_Map.prototype.resetAllFlames = function() {
    if (this.activeFlameTimeouts()) {
      this.activeFlameTimeouts().forEach(timeoutId => clearTimeout(timeoutId));
    }
    stopSEByName(FIRE_TRIGGERED_SE_NAME, true);
    stopSEByName(FLAME_ACTIVE_SE_NAME, true);
  }

  Game_Map.prototype.checkFlameDeath = function() {
    const playerCoordinates = [$gamePlayer.x, $gamePlayer.y];

    this.allFlames().forEach(flameEvent => {
      flameEvent.isTouchingPlayer = flameEvent.x === playerCoordinates[0] && flameEvent.y === playerCoordinates[1];

      if (flameEvent.isTouchingPlayer && flameEvent.flame.active) {
        this.playerDie(FIRE_BURN_SE);
      }
    });
  }

  Game_Map.prototype.updateSpikeTraps = function() {
    const playerCoordinates = [$gamePlayer.x, $gamePlayer.y];
    this.spikes().filter(spike => !spike.spike.scheduled).forEach(spike => {
      spike.spike.scheduled = true;
      setTimeout(() => {
        spike.spike.active = !spike.spike.active;
        $gameSelfSwitches.setValue([this.mapId(), spike._eventId, 'A'], XOR(spike.spike.active, !spike.spike.opposite));
        if (spike.spike.audioLeader) {
          AudioManager.playSe(SPIKE_SE_MAP.get(spike.spike.active));
        }
        spike.spike.scheduled = false;
      }, SPIKE_TIMING);
    })

    this.spikes().filter(spike => spike.spike.active).forEach(spikeEvent => {
      spikeEvent.isTouchingPlayer = spikeEvent.x === playerCoordinates[0] && spikeEvent.y === playerCoordinates[1];
      if (spikeEvent.isTouchingPlayer) {
        this.playerDie(SPIKE_DEATH_SE);
      }
    });
  }

  Game_Map.prototype.checkPushing = function() {
    const playerCoordinates = [$gamePlayer.x, $gamePlayer.y];

    this.pushables().forEach(pushable => {
      pushable.isTouchingPlayer = pushable.x === playerCoordinates[0] && pushable.y === playerCoordinates[1];

      if (pushable.isTouchingPlayer && $gamePlayer.isMoveRouteForcing() && !pushable.isMoveRouteForcing()) {
        const direction = $gamePlayer._moveRoute.list.find(movement => validDirections.includes(movement.code));
        const directionOffset = validDirectionsCoordinateOffset.get(direction.code);
        const intoImmovable = pushable.pushable.invalidOffsets.some(offset => offset[0] === directionOffset[0] && offset[1] === directionOffset[1]);
        if (!intoImmovable) {
          const route = {list: [{code: Game_Character.ROUTE_THROUGH_ON}], repeat: false, skippable: false, wait: false};
          route.list.push(direction);
          route.list.push({code: Game_Character.ROUTE_END});
          pushable.forceMoveRoute(route);
          AudioManager.playSe(PUSHING_SE);
          $gamePlayer.setThrough(false);
          $gamePlayer.processRouteEnd();
          $gamePlayer.pushing = true;
        }
      }
    });
  }

  Game_Map.prototype.updateBoulders = function() {
    const playerCoordinates = [$gamePlayer.x, $gamePlayer.y];

    this.boulders().forEach(boulder => {
      boulder.isTouchingPlayer = boulder.x === playerCoordinates[0] && boulder.y === playerCoordinates[1];
      const isTouchingPushable = this.pushables()
          .some(pushable => !!pushable.pushable.redirection && touching(pushable, boulder));

      if (isTouchingPushable && !boulder.isTouchingPassable && boulder.isMoveRouteForcing()) {
        const jumpCommand = { code: Game_Character.ROUTE_JUMP, parameters: [-1, 0] };
        boulder._moveRoute.list.splice(boulder._moveRouteIndex, 0, jumpCommand);
      }

      boulder.isTouchingPassable = isTouchingPushable;

      if (boulder.isTouchingPlayer) { this.playerDie(BOULDER_DEATH_SE); }
    });
  }

  Game_Map.prototype.checkConveyorBeltMovement = function() {
    const playerCoordinates = [$gamePlayer.x, $gamePlayer.y];

    this.conveyors().forEach(conveyorBeltEvent => {
      conveyorBeltEvent.isTouchingPlayer = conveyorBeltEvent.x === playerCoordinates[0] && conveyorBeltEvent.y === playerCoordinates[1];

      if (conveyorBeltEvent.isTouchingPlayer && !$gamePlayer.isMoveRouteForcing()) {
        conveyorBeltEvent.activateConveyorBelt();
      }

      this.pushables().filter(pushable => !pushable.isMoveRouteForcing()).forEach(pushable => {
        if (touching(conveyorBeltEvent, pushable)) {
          conveyorBeltEvent.activateConveyorBelt(pushable);
        }
      })
    });
  }

  Game_Map.prototype.updatePitTraps = function() {
    this.pits().forEach(pitEvent => {
      const playerCoordinates = [$gamePlayer.x, $gamePlayer.y];
      const touchingPlayer = pitEvent.x === playerCoordinates[0] && pitEvent.y === playerCoordinates[1];

      if  (!pitEvent.pit.isActivated && pitEvent.isTouchingPlayer && !touchingPlayer) {
        AudioManager.playSe(PIT_OPEN_SE);
        pitEvent.pit.isActivated = true;
        $gameSelfSwitches.setValue([this.mapId(), pitEvent._eventId, 'A'], true);
      }

      pitEvent.isTouchingPlayer = touchingPlayer;

      if (pitEvent.isTouchingPlayer && pitEvent.pit.isActivated) {
        this.playerDie(PIT_FALL_SE);
      }
    })
  }

  Game_Map.prototype.checkButtonActivation = function() {
    this.buttons().forEach(buttonEvent => {
      const playerCoordinates = [$gamePlayer.x, $gamePlayer.y];
      buttonEvent.isTouchingPlayer = buttonEvent.x === playerCoordinates[0] && buttonEvent.y === playerCoordinates[1];
      buttonEvent.isWeightedDown = this.weightedEvents().some(event => event.x === buttonEvent.x && event.y === buttonEvent.y);

      if ((buttonEvent.isTouchingPlayer || buttonEvent.isWeightedDown) && !buttonEvent.button.activated) {
        buttonEvent.button.activated = true;
        AudioManager.playSe(BUTTON_SWITCH_SE);
        $gameSelfSwitches.setValue([this.mapId(), buttonEvent._eventId, 'A'], true);
        this.gates().filter(gateEvent => gateEvent.gate.group === buttonEvent.button.group).forEach(gateEventToActivate => {
          if (gateEventToActivate.gate.requiredNumberButtonsPressed > gateEventToActivate.gate.state) {
            gateEventToActivate.gate.state++;
            AudioManager.playSe(GATE_OPEN_SE);
            $gameSelfSwitches.setValue([this.mapId(), gateEventToActivate._eventId, OPEN_STATES[gateEventToActivate.gate.state]], true);
          }
        });
      }

      if (!buttonEvent.isTouchingPlayer && !buttonEvent.isWeightedDown && buttonEvent.button.hold && buttonEvent.button.activated) {
        buttonEvent.button.activated = false;
        AudioManager.playSe(BUTTON_OFF_SE);
        $gameSelfSwitches.setValue([this.mapId(), buttonEvent._eventId, 'A'], false);
        this.gates().filter(gateEvent => gateEvent.gate.group === buttonEvent.button.group).forEach(gateEventToActivate => {
          if (gateEventToActivate.gate.state > 0) {
            $gameSelfSwitches.setValue([this.mapId(), gateEventToActivate._eventId, OPEN_STATES[gateEventToActivate.gate.state]], false);
            gateEventToActivate.gate.state--;
            AudioManager.playSe(GATE_OPEN_SE);
          }
        });
      }
    })
  }

  Game_Event.prototype.activateConveyorBelt = function(event) {
    const route = {list: [{code: Game_Character.ROUTE_THROUGH_ON}], repeat: false, skippable: false, wait: true};
    route.list.push({code: this.conveyor.direction});
    route.list.push({code: Game_Character.ROUTE_THROUGH_OFF});
    route.list.push({code: Game_Character.ROUTE_END});
    if (event) {
      route.wait = false;
      event.forceMoveRoute(route);
    } else {
      $gamePlayer.forceMoveRoute(route);
    }
  }

  Game_Map.prototype.updateChessEvents = function() {
    tickCounter++;
    if (tickCounter % 50 === 0) {
      this.updateFlameActivations();
    }
    this.checkPushing();
    this.updateSpikeTraps();
    this.checkConveyorBeltMovement();
    this.checkButtonActivation();
    this.checkFlameDeath();
    this.updateBoulders();
    this.updatePitTraps();
    $gamePlayer.highlightChessMoves();
  }

  const Chess_Event_Route_End = Game_Event.prototype.processRouteEnd;
  Game_Event.prototype.processRouteEnd = function() {
    Chess_Event_Route_End.call(this);
    if (this.pushable) {
      this.pushable.invalidOffsets = surroundingOffsets(this, $gameMap.blockingEvents());
      $gamePlayer.pushing = false;
    }
  }

  // ---------------------------------------- CHESS HIGHLIGHT ---------------------------------------- //
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
    let hoverIcon = WALK_ICON;
    if (event.isWall) {
      return;
    } else if (!!event.pushable) {
      hoverIcon = PUSH_ICON;
    } else if (event.isDeadly()) {
      hoverIcon = DEATH_ICON;
    } else if (!!event.conveyor) {
      hoverIcon = CONVEYOR_ICON;
    } else if (!!event.isExit) {
      hoverIcon = EXIT_ICON;
    } else if (!!event.button && !event.button.activated) {
      hoverIcon = BUTTON_ICON;
    }
    if (hoverIcon !== event.mouseSettings.hoverIcon) {
      event.mouseSettings.hoverIcon = hoverIcon;
      const scene = SceneManager._scene;
      if (scene instanceof Scene_Map && scene.isActive() && !$gameMessage.isBusy()) {
        scene.checkEventsUnderMouse(TouchInput.x, TouchInput.y); // TRIGGER ICON CHANGE DETECTION
      }
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
    this.isImmune = false;
  }

  Game_Character.prototype.bishopCanMove = function(requestCoordinates) {
    if (this.pushing || (Math.abs(this.x - requestCoordinates[0]) !== Math.abs(this.y - requestCoordinates[1])) || isWall(requestCoordinates)) {
      return false;
    }

    function isValidBishopMove() {
      return event => Math.abs(this.x - event.x) === Math.abs(this.y - event.y);
    }

    if (this.x > requestCoordinates[0] && this.y > requestCoordinates[1]) {
      return !$gameMap.blockingEvents().filter(isValidBishopMove.call(this)).some(event => (event.x < this.x && event.x > requestCoordinates[0]) && (event.y < this.y && event.y > requestCoordinates[1]));
    } else if (this.x < requestCoordinates[0] && this.y < requestCoordinates[1]) {
      return !$gameMap.blockingEvents().filter(isValidBishopMove.call(this)).some(event => (event.x > this.x && event.x < requestCoordinates[0]) && (event.y > this. y && event.y < requestCoordinates[1]));
    } else if (this.x > requestCoordinates[0] && this.y < requestCoordinates[1]) {
      return !$gameMap.blockingEvents().filter(isValidBishopMove.call(this)).some(event => (event.x < this.x && event.x > requestCoordinates[0]) && (event.y > this.y && event.y < requestCoordinates[1]));
    } else if (this.x < requestCoordinates[0] && this.y > requestCoordinates[1]) {
      return !$gameMap.blockingEvents().filter(isValidBishopMove.call(this)).some(event => (event.x > this.x && event.x < requestCoordinates[0]) && (event.y < this.y && event.y > requestCoordinates[1]))
    }
  }

  Game_Character.prototype.rookCanMove = function(requestCoordinates) {
    if (this.pushing || (this.x !== requestCoordinates[0] && this.y !== requestCoordinates[1]) || isWall(requestCoordinates)) {
      return false;
    }

    function isValidRookMove() {
      return event => this.x === event.x || this.y === event.y;
    }

    if (this.x < requestCoordinates[0]) {
      return !$gameMap.blockingEvents().filter(isValidRookMove.call(this)).some(event => event.x > this.x && event.x < requestCoordinates[0]);
    } else if (this.x > requestCoordinates[0]) {
      return !$gameMap.blockingEvents().filter(isValidRookMove.call(this)).some(event => event.x < this.x && event.x > requestCoordinates[0]);
    } else if (this.y < requestCoordinates[1]) {
      return !$gameMap.blockingEvents().filter(isValidRookMove.call(this)).some(event => event.y > this.y && event.y < requestCoordinates[1]);
    } else if (this.y > requestCoordinates[1]) {
      return !$gameMap.blockingEvents().filter(isValidRookMove.call(this)).some(event => event.y < this.y && event.y > requestCoordinates[1]);
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
        routeCode = UPPER_R;
      } else if (horizontalMovement < 0 && verticalMovement < 0) {
        routeCode = LOWER_L;
      } else if (horizontalMovement < 0 && verticalMovement > 0) {
        routeCode = UPPER_L;
      } else if (horizontalMovement > 0 && verticalMovement < 0) {
        routeCode = LOWER_R;
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
  Game_Character.prototype.moveKnight = function(requestCoordinates) {
    const knightValidMoves = [
      [this.x - 2, this.y + 1],
      [this.x - 2, this.y - 1],
      [this.x - 1, this.y + 2],
      [this.x - 1, this.y - 2],
      [this.x + 1, this.y + 2],
      [this.x + 1, this.y - 2],
      [this.x + 2, this.y + 1],
      [this.x + 2, this.y - 1]
    ];
    const validMove = destination => destination[0] === requestCoordinates[0] && destination[1] === requestCoordinates[1];
    const canMove = knightValidMoves.some(validMove) && !isWall(requestCoordinates);
    if (canMove) {
      let list = [{code: Game_Character.ROUTE_THROUGH_ON}]
      switch (knightValidMoves.findIndex(validMove)) {
        case 0:
          list.push({code: Game_Character.ROUTE_JUMP, parameters: [-2, 1]})
          break;
        case 1:
          list.push({code: Game_Character.ROUTE_JUMP, parameters: [-2, -1]})
          break;
        case 2:
          list.push({code: Game_Character.ROUTE_JUMP, parameters: [-1, 2]})
          break;
        case 3:
          list.push({code: Game_Character.ROUTE_JUMP, parameters: [-1, -2]})
          break;
        case 4:
          list.push({code: Game_Character.ROUTE_JUMP, parameters: [1, 2]})
          break;
        case 5:
          list.push({code: Game_Character.ROUTE_JUMP, parameters: [1, -2]})
          break;
        case 6:
          list.push({code: Game_Character.ROUTE_JUMP, parameters: [2, 1]})
          break;
        case 7:
          list.push({code: Game_Character.ROUTE_JUMP, parameters: [2, -1]})
          break;
      }
      list.push({code: Game_Character.ROUTE_THROUGH_OFF}, {code: Game_Character.ROUTE_END})
      const route = {list, repeat: false, skippable: false}
      this.chessJumping = true;
      this.forceMoveRoute(route);
      return true;
    } else {
      return false;
    }
  }
})();
