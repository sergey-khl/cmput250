//=============================================================================
// Community Plugins - Lighting system
// Community_Lighting.js
// Version: 1.026
/*=============================================================================
Forked from Terrax Lighting
=============================================================================*/
var Community = Community || {};
Community.Lighting = Community.Lighting || {};
Community.Lighting.parameters = PluginManager.parameters('Community_Lighting');
Community.Lighting.version = 1.026;
var Imported = Imported || {};
Imported.Community_Lighting = true;
/*:
* @plugindesc ▶MV灯光照明显示系统优化版
* @author Terrax, iVillain, Aesica, Eliaquim, Alexandre
*
* @param ---General Settings---
* @text 〓〓〓通用设置〓〓〓
* @default
*
* @param Options Menu Entry
* @text ▶选项菜单项
* @parent ---General Settings---
* @desc Adds an option to disable this plugin's lighting effects to the options menu (leave blank to omit)
* @default
*
* @param Reset Lights
* @text 地图更换重置
* @parent ---General Settings---
* @desc Resets the conditional lights on map change
* @type boolean
* @default false
*
* @param Kill Switch
* @text ▶独立开关
* @parent ---General Settings---
* @desc Possible values A,B,C,D. If Selfswitch X is switched ON, the event's lightsource will be disabled.
* @type select
* @option None
* @option A
* @option B
* @option C
* @option D
* @default None
*
* @param Kill Switch Auto
* @text 自动独立开关
* @parent ---General Settings---
* @desc If a conditional light is OFF(ON), lock the Kill Switch to ON(OFF)?
* @type boolean
* @default false
* 
* @param Note Tag Key
* @text 标签
* @parent ---General Settings---
* @desc Specify a key (<Key: Light 25 ...>) to be used with all note tags or leave blank for Terrax compatibility (Light 25 ...)
* @default cl
*
* @param ---DayNight Settings---
* @text 〓〓〓昼夜设置〓〓〓
* @default
*
* @param Save DaynightHours
* @text 小时
* @parent ---DayNight Settings---
* @desc Game variable the time of day (0-23) can be stored in.  Disable: 0
* @type number
* @min 0
* @default 0
*
* @param Save DaynightMinutes
* @text 分钟
* @parent ---DayNight Settings---
* @desc Game variable the time of day (0-59) can be stored in.  Disable: 0
* @type number
* @min 0
* @default 0
*
* @param Save DaynightSeconds
* @text 秒数
* @parent ---DayNight Settings---
* @desc Game variable the time of day (0-59) can be stored in.  Disable: 0
* @type number
* @min 0
* @default 0 
*
* @param Save Night Switch
* @text 夜间开关
* @parent ---DayNight Settings---
* @desc Game switch to set as ON during night and OFF during day.  Disable: 0
* @type number
* @min 0
* @default 0
*
* @param Night Hours
* @text 夜间时间
* @parent ---DayNight Settings---
* @desc Comma-separated list of night hours.  Not used/relevant if Save Night Switch set to 0.
* @default 0, 1, 2, 3, 4, 5, 6, 19, 20, 21, 22, 23
*
* @param DayNight Colors
* @text 昼夜颜色
* @parent ---DayNight Settings---
* @desc Set DayNight colors. Each color represents 1 hour of the day
* @default ["#6666ff","#6666ff","#6666ff","#6666ff","#6666ff","#6666ff","#9999ff","#ccccff","#ffffff","#ffffff","#ffffff","#ffffff","#ffffff","#ffffff","#ffffff","#ffffff","#ffffff","#ffffff","#ffcc88","#9999ff","#6666ff","#6666ff","#6666ff","#6666ff"]
* @type text[]
*
* @param ---Offset and Sizes---
* @text 〓〓〓偏移值和尺寸〓〓〓
* @default
*
* @param Player radius
* @text ▶玩家半径
* @parent ---Offset and Sizes---
* @desc Adjust the light radius around the player
* Default: 300
* @type number
* @min 0
* @default 300
*
* @param Flashlight offset
* @text 手电筒偏移
* @parent ---Offset and Sizes---
* @desc Increase this setting to move up the flashlight for double height characters.
* Default: 0
* @type number
* @min -100
* @max 100
* @default 0
*
* @param Screensize X
* @text 屏幕尺寸 X
* @parent ---Offset and Sizes---
* @desc Increase if your using a higher screen resolution then the default
* Default : 866
* @default 866
* @type number
* @min 0
*
* @param Screensize Y
* @text 屏幕尺寸 Y
* @parent ---Offset and Sizes---
* @desc Increase if your using a higher screen resolution then the default
* Default : 630
* @default 630
* @type number
* @min 0
*
* @param ---Battle Settings---
* @text 〓〓〓战斗设定〓〓〓
* @default
*
* @param Battle Tinting
* @text ▶战斗着色
* @parent ---Battle Settings---
* @desc Add a tint layer to the battle screen? If set to false, no light effect will occur during battles.
* @type boolean
* @default true
*
* @param Light Mask Position
* @text ▶光罩位置
* @parent ---Battle Settings---
* @desc Place the light mask above the battlers, or between the battleground and the battlers?
* @type select
* @option Above Battlers
* @value Above Background and Battler
* @option Between Background and Battlers
* @value Between
* @default Above
*
* @param Lightmask Opacity
* @text 遮罩层不透明度
* @parent ---General Settings---
* @desc 修改灯光遮罩层的不透明度，范围0-100，数字越大就越黑
* Default : 100
* @default 100
* @type number
* @min 0
* @max 100

* @help
*〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓
*  汉化：硕明云书
*  鸣谢鹏程万里修正关于透明度功能
*  关闭灯光：Flashlight off
*  开启范围灯光：Fire radius 150 #ffffff
*  打开手电筒：Flashlight on 6 8 #ffffff 3
*  关玩家灯：Light radius 1 #ffffff
*  调整遮罩层不透明度：Lightmask_Opacity 80
* ▶ 例子 ヾ(•ω•`)o
*〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓
*
*   默认的标签 "CL" (不区分大小写):
*   <CL: Light 250 #ffffff>
*   <CL: Daynight>
*   ...等等
*
*   无注释标签:
*   Light 250 #ffffff
*   Daynight
*   ...等等
*
*
*   符号字符: 
*   []   值是可选的 (灯光中的亮度参数等)
*   |    从指定列表中选择值（on|off等）
*
*   在实际插件中不包括这些命令。
*
*
* ▶ 笔记标签列表ヾ(•ω•`)o
*〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓
* 
*   - 激活日/夜间循环  放入地图注释或事件注释
*   Light radius color [brightness] [direction] [id]
*   - Light		
*   - radius      100, 250, etc
*   - color       #ffffff, #ff0000, etc
*   - brightness  B50, B25, etc [optional]
*   - direction   D1: n.wall, D2: e.wall, D3: s.wall, D4: w.wall
*               D5 n.+e. walls, D6 s.+e. walls, D7 s.+w. walls,
*               D8 n.+w. walls, D9 n.-e. corner, D10 s.-e. corner
*               D11 s.-w. corner, D12 n.-w. corner  [optional]
*   - id          1, 2, 2345, etc--an id number for plugin commands [optional]
*   
*
*   闪烁
*	 <CL: Light 100 cycle #ff6666 10 #66ff66 10 #ff00ff 10>
*   火参数
*   - 与上面的 Light 参数相同，但添加了微妙的闪烁
*     火苗默认：<cl: fire 80 #a83232 B5 D0>
*
*   手电筒
*   Flashlight [bl] [bw] [c] [onoff] [D]
*   - Sets the light as a flashlight with beam length (bl) beam width (bw) color (c),
*      0|1 (onoff), and 1=up, 2=right, 3=down, 4=left for static direction (sdir)
*   - bl:       光束长度：任意数字，前面可选 "L", so 8, L8
*   - bw:       光束宽度：任意数字，前面可选 "W", so 12, W12
*   - onoff:    初始状态:  0, 1, off, on
*   - D:        强制方向（可选）: 0:全部面, 1:上, 2:右, 3:下, 4:左
*               Can be preceeded by "D", so D4.  If omitted, defaults to 0
*
* ▶ 地图 ヾ(•ω•`)o
*〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓
*   <cl: Daynight 10>
*   DayNight [speed]
*   Activates day/night cycle.  Put in map note or event note
*   - speed     用于更改时间流逝速度的可选参数。 10 是
				  默认速度，数字越大越慢，数字越小
	更快，0 完全停止时间的流动。 如果速度不
	指定，则使用当前速度。
*
*
* ▶ 独立开关和条件照明 ヾ(•ω•`)o
* 〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓
* 
*   如果“Kill Switch Auto”参数已设置为 true，则任何带有
*   一个（非）活动条件灯将其killswitch锁定为ON（OFF）。
*   您可以使用此差异为这些事件提供替代外观。
*   例如，一个有条件的灯光事件可以有一个页面，它显示一个
*   燃烧的蜡烛和第二页（仅在关闭开关打开时激活）
*   谁展示了一根未点燃的蜡烛
*
* ▶ 战斗中的插件 ヾ(•ω•`)o
* 〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓
*
*   如果在战斗开始时插件处于活动状态，战斗画面将
*   像在地图上一样着色。 太深的颜色会自动设置
*   到'#666666' (dark gray).
* 
*   如果没有可以从中获取色彩的地图（例如：战斗测试），
*   屏幕不会着色。
*
*   您可以使用以下插件命令手动为战斗画面着色。
*   请注意，这些命令只影响当前的战斗，
*   并且不会对地图产生影响。
*
* ▶ 插件命令 - 战斗 ヾ(•ω•`)o
*〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓
*
*   TintBattle set [color]
*   - 将战斗画面着色为用作参数的颜色。
*   - 自动将太暗的颜色设置为“#666666”（深灰色）。
*
*   TintBattle reset [speed]
*   - 将战斗画面重置为其原始颜色。
*   - 参数是淡入淡出的速度（1 非常快，20 更慢）
*
*   TintBattle fade [color] [speed]
*   - 将战斗画面淡化为用作第一个参数的颜色。
*   - 第二个参数是淡入淡出的速度（1 非常快，20 更慢）
*   - 仍然自动设置太深的颜色'#666666' (深灰色).
* 
* 
* ▶ 颜色代码大全 ヾ(•ω•`)o
*〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓
*
*  常用色
*▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁
*  纯红     #FF0000    橙色      #FF8C00      纯黄       #FFFF00
*  纯绿     #008000    青色      #00FFFF      纯蓝       #0000FF
*  紫色     #800080    粉红      #FFC0CB      纯白       #FFFFFF
*  灰色     #808080    纯黑      #000000      橙红       #FF4500
*
*
*  更多色
*▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁
*  栗色     #800000    暗红      #8B0000      褐棕色     #A52A2A	　
*  火砖色   #B22222    深红      #DC143C      大红       #FF0000	　
*  紫罗兰红 #C71585    浅紫红    #D87093      深粉       #FF1493	　
*  紫红     #FF00FF    亮粉色    #FF69B4      粉红       #FFC0CB	　
*  浅粉色   #FFB6C1    淡紫红    #FFF0F5      靛蓝       #4B0082	　
*  紫色     #800080    深洋红色  #8B008B      暗紫色     #9932CC	　
*  蓝紫色   #8A2BE2    深紫      #9400D3      石蓝色     #6A5ACD	　
*  中紫色   #9370DB    板岩蓝    #7B68EE      中紫色     #BA55D3	　
*  紫罗兰   #EE82EE    紫红      #DDA0DD      蓟色       #D8BFD8	　
*  淡紫     #E6E6FA    重褐色    #8B4513      黄土色     #A0522D	　
*  巧克力色 #D2691E    印第安红  #CD5C5C      玫瑰棕色   #BC8F8F	　	　　
*  浅肉色   #FFA07A    橙红橘红  #FF4500      番茄红     #FF6347	　
*  珊瑚色   #FF7F50    深橙色    #FF8C00      沙棕黄褐   #F4A460	　
*  秘鲁色   #CD853F    棕褐      #D2B48C      原木色     #DEB887	　
*  小麦色   #F5DEB3    鹿皮色    #FFE4B5      印安黄白   #FFDEAD	　
*  桃色     #FFDAB9    橘黄藕荷  #FFE4C4      瓷白       #FAEBD7	　
*  番木色   #FFEFD5    米稠色    #FFF8DC      浅米色     #FDF5E6	　
*  亚麻灰白 #FAF0E6    海贝色    #FFF5EE      雪白       #FFFAFA	　
*  花白色   #FFFAF0    象牙乳白  #FFFFF0      薄荷色     #F5FFFA	　
*  深秋暗黄 #B8860B    麒麟花黄  #DAA520      金色       #FFD700	
*  黄色     #FFFF00    卡其色    #F0E68C      淡菊黄色   #EEE8AA	
*  米黄浅褐 #F5F5DC    柠檬纱色  #FFFACD      浅秋黄浅金 #FAFAD2	　
*  浅黄鹅黄 #FFFFE0    墨绿深灰  #2F4F4F      深橄榄绿   #556B2F	　
*  橄榄色   #808000    墨绿绿绿  #006400      森林葱绿   #228B22	　
*  海绿藻绿 #2E8B57    绿色      #008080      浅海蓝海绿 #20B2AA	　
*  中海蓝石 #66CDAA    间海绿色  #3CB371      暗蓝深海绿 #8FBC8F	　
*  黄绿     #9ACD32    暗绿灰绿  #32CD32      石灰色绿黄 #00FF00	　
*  淡黄绿   #7FFF00    绿黄      #ADFF2F      春绿亮绿色 #00FA9A	　
*  春绿嫩绿 #00FF7F    嫩淡绿    #90EE90      淡绿苍绿   #98F898	　
*  海石碧绿 #7FFFD4    浅粉红蜜  #F0FFF0      夜蓝灰蓝   #191970	　
*  海军蓝   #000080    深蓝      #00008B      暗灰深石板 #483D8B	　
*  间蓝     #0000CD    宝蓝色    #4169E1      闪蓝色     #1E90FF	　
*  矢车菊色 #6495ED    深天蓝    #00BFFF      浅天蓝     #87CEFA	　
*  淡钢淡青 #B0C4DE    浅蓝淡蓝  #ADD8E6      钢蓝色铁青 #4682B4	　
*  深青色   #008B8B    藏青色    #5F9EA0      深粉蓝     #00CED1	　
*  宝绿海蓝 #48D1CC    蓝绿色    #40E0D0      天蓝       #87CECB	　
*  粉蓝浅蓝 #B0E0E6    苍白宝绿  #AFEEEE      淡青浅蓝   #E0FFFF	　
*  天蓝蔚蓝 #F0FFFF    爱丽丝蓝  #F0F8FF      青色       #00FFFF	　
*  黑       #000000    暗灰      #696969      灰         #808080
*  灰石板灰 #708090    亮蓝青灰  #778899      深灰       #A9A9A9
*  银灰     #C0C0C0    浅灰      #D3D3D3      亮灰       #DCDCDC
*  烟白色   #F5F5F5    幽灵白    #F8F8FF      大白色     #FFFF
*
*/

(function ($$) {
	let Community_tint_speed = 60;
	let Community_tint_target = '#000000';
	let colorcycle_count = [1000];
	let colorcycle_timer = [1000];
	let event_note = [];
	let event_id = [];
	let event_x = [];
	let event_y = [];
	let event_dir = [];
	let event_moving = [];
	let event_stacknumber = [];
	let event_eventcount = 0;
	let tiletype = 0;
	let tile_lights = [];
	let tile_blocks = [];

	let parameters = $$.parameters;
	let lightmask_opacity = Number(parameters['Lightmask Opacity']);  //灯光遮罩层透明的参数 Roc Modified 2022-11-1  
	let player_radius = Number(parameters['Player radius']);
	let reset_each_map = eval(String(parameters['Reset Lights']));
	let noteTagKey = parameters["Note Tag Key"] !== "" ? parameters["Note Tag Key"] : false;
	let dayNightSaveHours = Number(parameters['Save DaynightHours'] || 0);
	let dayNightSaveMinutes = Number(parameters['Save DaynightMinutes'] || 0);
	let dayNightSaveSeconds = Number(parameters['Save DaynightSeconds'] || 0);
	let dayNightSaveNight = +parameters["Save Night Switch"] || 0;
	let dayNightList = parseDayNightParams(parameters["DayNight Colors"], parameters["Night Hours"]);
	let flashlightoffset = Number(parameters['Flashlight offset'] || 0);
	let killswitch = parameters['Kill Switch'] || 'None';
	if (killswitch !== 'A' && killswitch !== 'B' && killswitch !== 'C' && killswitch !== 'D') {
		killswitch = 'None'; //Set any invalid value to no switch
	}
	let killSwitchAuto = eval(String(parameters['Kill Switch Auto']));
	//let add_to_options = parameters['Add to options'] || 'Yes';
	let optionText = parameters["Options Menu Entry"] || "";
	let lightInBattle = eval(String(parameters['Battle Tinting']));
	let battleMaskPosition = parameters['Light Mask Position'] || 'Above';
	if (battleMaskPosition !== 'Above' && battleMaskPosition !== 'Between') {
		battleMaskPosition = 'Above'; //Get rid of any invalid value
	}

	let options_lighting_on = true;
	let maxX = Number(parameters['Screensize X'] || 866);
	let maxY = Number(parameters['Screensize Y'] || 630);
	let tint_oldseconds = 0;
	let tint_timer = 0;
	let oldmap = 0;
	let oldseconds = 0;
	let daynightdebug = false;
	let event_reload_counter = 0;
	let Community_tint_speed_old = 60;
	let Community_tint_target_old = '#000000';
	let tileglow = 0;
	let glow_oldseconds = 0;
	let glow_dir = 1;
	let cyclecolor_counter = 0;
	//let darkcount = 0;
	//let daynightset = false;
	//let averagetime = [];
	//let averagetimecount = 0;
	let notetag_reg = RegExp("<" + noteTagKey + ":[ ]*([^>]+)>", "i");

	function getTag() {
		let result;
		let note = this.note;
		if (typeof note === "string") {
			if (noteTagKey) {
				result = note.match(notetag_reg);
				result = result ? result[1].trim() : "";
			}
			else result = note.trim();
		}
		return result;
	};
	function parseDayNightParams(dayNight, nightHours) {
		let result = [];
		try {
			dayNight = JSON.parse(dayNight);
			nightHours = nightHours.split(",").map(x => x = +x);
			result = [];
			for (let i = 0; i < dayNight.length; i++)
				result[i] = { "color": dayNight[i], "isNight": nightHours.contains(i) };
		}
		catch (e) {
			console.log("CommunitiyLighting: Night Hours and/or DayNight Colors contain invalid JSON data - cannot parse.");
			result = new Array(24).fill(undefined).map(x => x = { "color": "#000000", "isNight": false });
		}
		return result;
	};
	$$.getDayNightList = function () {
		return dayNightList;
	};
	function saveTime(hh, mm, ss = null) {
		let dayNightList = $gameVariables.GetDaynightColorArray();
		if (dayNightSaveHours > 0) $gameVariables.setValue(dayNightSaveHours, hh);
		if (dayNightSaveMinutes > 0) $gameVariables.setValue(dayNightSaveMinutes, mm);
		if (dayNightSaveSeconds > 0 && ss !== null) $gameVariables.setValue(dayNightSaveSeconds, ss);
		if (dayNightSaveNight > 0 && dayNightList[hh] instanceof Object) $gameSwitches.setValue(dayNightSaveNight, dayNightList[hh].isNight);
	};

	let _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function (command, args) {
		_Game_Interpreter_pluginCommand.call(this, command, args);
		if (typeof command != 'undefined') {
			this.communityLighting_Commands(command, args);
		}
	};

	Game_Interpreter.prototype.communityLighting_Commands = function (command, args) {
		command = command.toLowerCase();
		const allCommands = {
			tileblock: 'tileType', regionblock: 'tileType', tilelight: 'tileType', regionlight: 'tileType', tilefire: 'tileType', regionfire: 'tileType',
			tileglow: 'tileType', regionglow: 'tileType', tint: 'tint', daynight: 'dayNight', flashlight: 'flashLight', setfire: 'setFire', fire: 'fire', light: 'light',
			effect_on_event: 'effectOnEvent', effect_on_xy: 'effectOnXy', script: 'scriptF', reload: 'reload', lightmask_opacity: 'lightmask_opacity'	//Roc Modified 2022-11-1
		};
		const result = allCommands[command];
		if (result) {
			this[result](command, args);
		}
	};

	//修改遮罩层透明度参数 Roc Modified 2022-11-1
	Game_Interpreter.prototype.lightmask_opacity = function (command, args) {
		lightmask_opacity = Number(args[0]).clamp(0, 100);
	};

	Game_Interpreter.prototype.tileType = function (command, args) {
		const cmdArr = ['', 'tileblock', 'regionblock', 'tilelight', 'regionlight', 'tilefire', 'regionfire', 'tileglow', 'regionglow'];
		tiletype = cmdArr.indexOf(command);
		if (tiletype > 0) $$.tile(args);
	};

	Game_Interpreter.prototype.tint = function (command, args) {
		$$.tint(args);
	};

	Game_Interpreter.prototype.dayNight = function (command, args) {
		$$.DayNight(args);
	};

	Game_Interpreter.prototype.flashLight = function (command, args) {
		$$.flashlight(args);
	};

	Game_Interpreter.prototype.setFire = function (command, args) {
		flickerradiusshift = args[0];
		flickercolorshift = args[1];
		$gameVariables.SetFireRadius(flickerradiusshift);
		$gameVariables.SetFireColorshift(flickercolorshift);
	};

	Game_Interpreter.prototype.fire = function (command, args) {
		if (args[0].toLowerCase() == 'deactivate') {
			$gameVariables.SetScriptActive(false);
		} else {
			$gameVariables.SetScriptActive(true);
		}
		$$.fireLight(args);
	};

	Game_Interpreter.prototype.light = function (command, args) {
		$gameVariables.SetFire(false);
		if (args[0].toLowerCase() == 'deactivate') {
			$gameVariables.SetScriptActive(false);
		} else {
			$gameVariables.SetScriptActive(true);
		}
		$$.fireLight(args);
	};

	Game_Interpreter.prototype.effectOnEvent = function (command, args) {
		$$.effectOnEvent(args);
	};

	Game_Interpreter.prototype.effectOnXy = function (command, args) {
		$$.effectXy(args);
	};

	Game_Interpreter.prototype.scriptF = function (command, args) {
		if (args[0].toLowerCase() == 'deactivate') {
			$gameVariables.SetStopScript(true);
		} else {
			$gameVariables.SetStopScript(false);
		}
	};

	Game_Interpreter.prototype.reload = function (command, args) {
		if (args[0].toLowerCase() == 'events') {
			$$.ReloadMapEvents();
		}
	};

	Spriteset_Map.prototype.createLightmask = function () {
		this._lightmask = new Lightmask();
		this.addChild(this._lightmask);
	};

	function Lightmask() {
		this.initialize.apply(this, arguments);
	}

	Lightmask.prototype = Object.create(PIXI.Container.prototype);
	Lightmask.prototype.constructor = Lightmask;

	Lightmask.prototype.initialize = function () {
		PIXI.Container.call(this);
		this._width = Graphics.width;
		this._height = Graphics.height;
		this._sprites = [];
		this._createBitmap();
	};

	//Updates the Lightmask for each frame.

	Lightmask.prototype.update = function () {
		this._updateMask();
	};

	//@method _createBitmaps

	Lightmask.prototype._createBitmap = function () {
		this._maskBitmap = new Bitmap(maxX + 20, maxY);   // one big bitmap to fill the intire screen with black
		let canvas = this._maskBitmap.canvas;             // a bit larger then setting to take care of screenshakes
	};

	/**
	 * @method _updateAllSprites
	 * @private
	 */
	Lightmask.prototype._updateMask = function () {
		// 更新遮罩层透明度
		this.alpha = lightmask_opacity / 100;

		// ****** DETECT MAP CHANGES ********
		let map_id = $gameMap.mapId();
		if (map_id != oldmap) {
			oldmap = map_id;

			// recalc tile and region tags.
			$$.ReloadTagArea();

			//clear color cycle arrays
			for (let i = 0; i < 1000; i++) {
				colorcycle_count[i] = 0;
				colorcycle_timer[i] = 0;
			}

			$$.ReloadMapEvents();  // reload map events on map chance

			if (reset_each_map) {
				$gameVariables.SetLightArrayId([]);
				$gameVariables.SetLightArrayState([]);
				$gameVariables.SetLightArrayColor([]);
			}
		}

		// reload mapevents if event_data has chanced (deleted or spawned events/saves)
		if (event_eventcount != $gameMap.events().length) {
			$$.ReloadMapEvents();
		}

		// remove old sprites
		for (let i = 0, len = this._sprites.length; i < len; i++) {	  // remove all old sprites
			this._removeSprite();
		}

		if (options_lighting_on == true) {

			if ($gameVariables.GetStopScript() == false) {

				if ($gameVariables.GetScriptActive() == true && $gameMap.mapId() >= 0) {

					event_reload_counter++;  // reload map events every 200 cycles just in case.
					if (event_reload_counter > 200) {
						event_reload_counter = 0;
						$$.ReloadMapEvents()
					}

					if (event_note.length > 0) { // Are there lightsources on this map? If not, nothing to do.
						this._addSprite(-20, 0, this._maskBitmap);
						// ******** GROW OR SHRINK GLOBE PLAYER *********

						let firstrun = $gameVariables.GetFirstRun();
						if (firstrun === true) {
							Community_tint_speed = 60;
							Community_tint_target = '#000000';
							Community_tint_speed_old = 60;
							Community_tint_target_old = '#000000';
							$gameVariables.SetFirstRun(false);
							player_radius = Number(parameters['Player radius']);
							$gameVariables.SetRadius(player_radius);
						} else {
							player_radius = $gameVariables.GetRadius();
						}
						let lightgrow_value = player_radius;
						let lightgrow_target = $gameVariables.GetRadiusTarget();
						let lightgrow_speed = $gameVariables.GetRadiusSpeed();

						if (lightgrow_value < lightgrow_target) {
							lightgrow_value = lightgrow_value + lightgrow_speed;
							if (lightgrow_value > lightgrow_target) {
								//other wise it can keep fliping back and forth between > and <
								lightgrow_value = lightgrow_target;
							}
							player_radius = lightgrow_value;
						}
						if (lightgrow_value > lightgrow_target) {
							lightgrow_value = lightgrow_value - lightgrow_speed;
							if (lightgrow_value < lightgrow_target) {
								//other wise it can keep fliping back and forth between > and <
								lightgrow_value = lightgrow_target;
							}
							player_radius = lightgrow_value;
						}

						$gameVariables.SetRadius(player_radius);
						$gameVariables.SetRadiusTarget(lightgrow_target);

						// ****** PLAYER LIGHTGLOBE ********

						let canvas = this._maskBitmap.canvas;
						let ctx = canvas.getContext("2d");
						this._maskBitmap.fillRect(0, 0, maxX + 20, maxY, '#000000');

						ctx.globalCompositeOperation = 'lighter';
						let pw = $gameMap.tileWidth();
						let ph = $gameMap.tileHeight();
						let dx = $gameMap.displayX();
						let dy = $gameMap.displayY();
						let px = $gamePlayer._realX;
						let py = $gamePlayer._realY;
						let pd = $gamePlayer._direction;
						let x1 = (pw / 2) + ((px - dx) * pw);
						let y1 = (ph / 2) + ((py - dy) * ph);
						let paralax = false;
						// paralax does something weird with coordinates.. recalc needed
						if (dx > $gamePlayer.x) {
							let xjump = $gameMap.width() - Math.floor(dx - px);
							x1 = (pw / 2) + (xjump * pw);
						}
						if (dy > $gamePlayer.y) {
							let yjump = $gameMap.height() - Math.floor(dy - py);
							y1 = (ph / 2) + (yjump * ph);
						}

						let playerflashlight = $gameVariables.GetFlashlight();
						let playercolor = $gameVariables.GetPlayerColor();
						let flashlightlength = $gameVariables.GetFlashlightLength();
						let flashlightwidth = $gameVariables.GetFlashlightWidth();
						let playerflicker = $gameVariables.GetFire();
						let playerbrightness = $gameVariables.GetPlayerBrightness();


						let iplayer_radius = Math.floor(player_radius);

						if (iplayer_radius > 0) {
							if (playerflashlight == true) {
								this._maskBitmap.radialgradientFillRect2(x1, y1, 20, iplayer_radius, playercolor, '#000000', pd, flashlightlength, flashlightwidth);
							}
							y1 = y1 - flashlightoffset;
							if (iplayer_radius < 100) {
								// dim the light a bit at lower lightradius for a less focused effect.
								let r = hexToRgb(playercolor).r;
								let g = hexToRgb(playercolor).g;
								let b = hexToRgb(playercolor).b;
								g = g - 50;
								r = r - 50;
								b = b - 50;
								if (g < 0) {
									g = 0;
								}
								if (r < 0) {
									r = 0;
								}
								if (b < 0) {
									b = 0;
								}
								let newcolor = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

								this._maskBitmap.radialgradientFillRect(x1, y1, 0, iplayer_radius, newcolor, '#000000', playerflicker, playerbrightness);
							} else {
								this._maskBitmap.radialgradientFillRect(x1, y1, 20, iplayer_radius, playercolor, '#000000', playerflicker, playerbrightness);
							}

						}


						// *********************************** DAY NIGHT CYCLE TIMER **************************

						let daynightspeed = $gameVariables.GetDaynightSpeed();

						if (daynightspeed > 0 && daynightspeed < 5000) {

							let datenow = new Date();
							let seconds = Math.floor(datenow.getTime() / 10);
							if (seconds > oldseconds) {

								let daynighttimer = $gameVariables.GetDaynightTimer();     // timer = minutes * speed
								let daynightcycle = $gameVariables.GetDaynightCycle();     // cycle = hours
								let daynighthoursinday = $gameVariables.GetDaynightHoursinDay();   // 24

								oldseconds = seconds;
								daynighttimer = daynighttimer + 1;
								let daynightminutes = Math.floor(daynighttimer / daynightspeed);
								let daynighttimeover = daynighttimer - (daynightspeed * daynightminutes);
								let daynightseconds = Math.floor(daynighttimeover / daynightspeed * 60);
								if (daynightdebug == true) {
									let daynightseconds2 = daynightseconds;
									if (daynightseconds < 10) {
										daynightseconds2 = '0' + daynightseconds;
									}
									let hourvalue = '-';
									let hourset = 'Not set';
									if (daynightsavehours > 0) {
										hourvalue = $gameVariables.value(daynightsavehours);
										hourset = daynightsavehours
									}
									let minutevalue = '-';
									let minuteset = 'Not set';
									if (daynightsavemin > 0) {
										minutevalue = $gameVariables.value(daynightsavemin);
										minuteset = daynightsavemin
									}
									let secondvalue = '-';
									let secondset = 'Not set';
									if (daynightsavesec > 0) {
										secondvalue = $gameVariables.value(daynightsavesec);
										secondset = daynightsavesec
									}

									minutecounter = $gameVariables.value(daynightsavemin);
									secondcounter = $gameVariables.value(daynightsavesec);
									Graphics.Debug('Debug Daynight system', daynightcycle + ' ' + daynightminutes + ' ' + daynightseconds2 +
										'<br>' + 'Hours  -> Variable: ' + hourset + '  Value: ' + hourvalue +
										'<br>' + 'Minutes-> Variable: ' + minuteset + '  Value: ' + minutevalue +
										'<br>' + 'Seconds-> Variable: ' + secondset + '  Value: ' + secondvalue);

								}

								if (daynighttimer >= (daynightspeed * 60)) {
									daynightcycle = daynightcycle + 1;
									if (daynightcycle >= daynighthoursinday) daynightcycle = 0;
									daynighttimer = 0;
								}
								saveTime(daynightcycle, daynightminutes, daynightseconds);
								$gameVariables.SetDaynightTimer(daynighttimer);     // timer = minutes * speed
								$gameVariables.SetDaynightCycle(daynightcycle);     // cycle = hours
							}
						}

						// ********** OTHER LIGHTSOURCES **************

						for (let i = 0, len = event_note.length; i < len; i++) {
							let note = event_note[i];
							let evid = event_id[i];

							let note_args = note.split(" ");
							let note_command = note_args.shift().toLowerCase();


							if (note_command == "light" || note_command == "fire" || note_command == "flashlight") {

								let objectflicker = false;
								if (note_command == "fire") {
									objectflicker = true;
								}

								let light_radius = 1;
								let flashlength = 8;
								let flashwidth = 12;
								if (note_command == "flashlight") {
									flashlength = Number(note_args.shift());
									flashwidth = Number(note_args.shift());
									if (flashlength == 0) {
										flashlightlength = 8
									}
									if (flashwidth == 0) {
										flashlightlength = 12
									}
								} else {
									light_radius = note_args.shift();
								}
								// light radius
								if (light_radius >= 0) {

									// light color
									let colorvalue = note_args.shift();

									// Cycle colors


									if (colorvalue == 'cycle' && evid < 1000) {

										let cyclecolor0 = note_args.shift();
										let cyclecount0 = Number(note_args.shift());
										let cyclecolor1 = note_args.shift();
										let cyclecount1 = Number(note_args.shift());
										let cyclecolor2 = '#000000';
										let cyclecount2 = 0;
										let cyclecolor3 = '#000000';
										let cyclecount3 = 0;

										let morecycle = note_args.shift();
										if (typeof morecycle != 'undefined') {
											if (morecycle.substring(0, 1) == "#") {
												cyclecolor2 = morecycle;
												cyclecount2 = Number(note_args.shift());
												morecycle = note_args.shift();
												if (typeof morecycle != 'undefined') {
													if (morecycle.substring(0, 1) == "#") {
														cyclecolor3 = morecycle;
														cyclecount3 = Number(note_args.shift());

													} else {
														note_args.unshift(morecycle);
													}
												}
											} else {
												note_args.unshift(morecycle);
											}
										}

										let switch0 = '0';
										let switch1 = '0';
										let switch2 = '0';
										let switch3 = '0';

										let switches = note_args.shift();
										if (typeof switches != 'undefined') {
											if (switches.length == 7) {
												if (switches.substring(0, 3) == "SS:") {
													switch0 = switches.substring(3, 4);
													switch1 = switches.substring(4, 5);
													switch2 = switches.substring(5, 6);
													switch3 = switches.substring(6, 7);
												} else {
													note_args.unshift(switches);
												}
											} else {
												note_args.unshift(switches);
											}
										}

										// set cycle color
										switch (colorcycle_count[evid]) {
											case 0:
												colorvalue = cyclecolor0;
												break;
											case 1:
												colorvalue = cyclecolor1;
												break;
											case 2:
												colorvalue = cyclecolor2;
												break;
											case 3:
												colorvalue = cyclecolor3;
												break;
											default:
												colorvalue = '#FFFFFF';
										}

										// cycle timing
										//let datenow = new Date();
										//let seconds = Math.floor(datenow.getTime() / 100);
										cyclecolor_counter = cyclecolor_counter + 1;

										if (cyclecolor_counter > 10) {
											cyclecolor_counter = 0;

											//reset all switches
											if (switch0 != '0') {
												key = [map_id, evid, switch0];
												$gameSelfSwitches.setValue(key, false);
											}
											if (switch1 != '0') {
												key = [map_id, evid, switch1];
												$gameSelfSwitches.setValue(key, false);
											}
											if (switch2 != '0') {
												key = [map_id, evid, switch2];
												$gameSelfSwitches.setValue(key, false);
											}
											if (switch3 != '0') {
												key = [map_id, evid, switch3];
												$gameSelfSwitches.setValue(key, false);
											}


											if (colorcycle_count[evid] == 0) {
												colorcycle_timer[evid]++;

												if (colorcycle_timer[evid] > cyclecount0) {
													colorcycle_count[evid] = 1;
													colorcycle_timer[evid] = 0;
													if (switch1 != '0') {
														key = [map_id, evid, switch1];
														$gameSelfSwitches.setValue(key, true);
													}
												} else {
													if (switch0 != '0') {
														key = [map_id, evid, switch0];
														$gameSelfSwitches.setValue(key, true);
													}
												}

											}
											if (colorcycle_count[evid] == 1) {
												colorcycle_timer[evid]++;
												if (colorcycle_timer[evid] > cyclecount1) {
													colorcycle_count[evid] = 2;
													colorcycle_timer[evid] = 0;
													if (switch2 != '0') {
														key = [map_id, evid, switch2];
														$gameSelfSwitches.setValue(key, true);
													}
												} else {
													if (switch1 != '0') {
														key = [map_id, evid, switch1];
														$gameSelfSwitches.setValue(key, true);
													}
												}
											}
											if (colorcycle_count[evid] == 2) {
												colorcycle_timer[evid]++;
												if (colorcycle_timer[evid] > cyclecount2) {
													colorcycle_count[evid] = 3;
													colorcycle_timer[evid] = 0;
													if (switch3 != '0') {
														key = [map_id, evid, switch3];
														$gameSelfSwitches.setValue(key, true);
													}
												} else {
													if (switch2 != '0') {
														key = [map_id, evid, switch2];
														$gameSelfSwitches.setValue(key, true);
													}
												}
											}
											if (colorcycle_count[evid] == 3) {
												colorcycle_timer[evid]++;
												if (colorcycle_timer[evid] > cyclecount3) {
													colorcycle_count[evid] = 0;
													colorcycle_timer[evid] = 0;
													if (switch0 != '0') {
														key = [map_id, evid, switch0];
														$gameSelfSwitches.setValue(key, true);
													}
												} else {
													if (switch3 != '0') {
														key = [map_id, evid, switch3];
														$gameSelfSwitches.setValue(key, true);
													}
												}
											}
										}

									} else {
										let isValidColor = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(colorvalue);
										if (!isValidColor) {
											colorvalue = '#FFFFFF'
										}
									}

									// brightness and direction

									let brightness = 0.0;
									let direction = 0;
									let next_arg = note_args.shift();

									if (typeof next_arg != 'undefined') {
										let key = next_arg.substring(0, 1);
										if (key == 'b' || key == 'B') {
											brightness = Number(next_arg.substring(1)) / 100;
											next_arg = note_args.shift();
											if (typeof next_arg != 'undefined') {
												key = next_arg.substring(0, 1);
											}
										}
										if (key == 'd' || key == 'D') {
											direction = next_arg.substring(1);
											next_arg = note_args.shift();
										}
									}

									// conditional lighting
									let lightid = 0;
									if (typeof next_arg != 'undefined') {
										lightid = next_arg;
									}

									let state = true;
									if (lightid > 0) {
										state = false;

										let lightarray_id = $gameVariables.GetLightArrayId();
										let lightarray_state = $gameVariables.GetLightArrayState();
										let lightarray_color = $gameVariables.GetLightArrayColor();

										for (let j = 0, jlen = lightarray_id.length; j < jlen; j++) {
											if (lightarray_id[j] == lightid) {
												// idfound = true;
												state = lightarray_state[j];

												let newcolor = lightarray_color[j];

												if (newcolor != 'defaultcolor') {
													colorvalue = newcolor;
												}
											}
										}

										// Set kill switch to ON if the conditional light is deactivated,
										// or to OFF if it is active.
										if (killSwitchAuto && killswitch !== 'None') {
											key = [map_id, evid, killswitch];
											if ($gameSelfSwitches.value(key) === state) {
												$gameSelfSwitches.setValue(key, !state);
											}
										}
									}


									// kill switch
									if (killswitch !== 'None' && state) {
										key = [map_id, evid, killswitch];
										if ($gameSelfSwitches.value(key) === true) {
											state = false;
										}
									}


									// show light
									if (state == true) {

										let lpx = 0;
										let lpy = 0;
										let ldir = 0;
										if (event_moving[i] > 0) {
											lpx = $gameMap.events()[event_stacknumber[i]]._realX;
											lpy = $gameMap.events()[event_stacknumber[i]]._realY;
											ldir = $gameMap.events()[event_stacknumber[i]]._direction;

										} else {
											lpx = event_x[i];
											lpy = event_y[i];
											ldir = event_dir[i];
										}

										// moving lightsources
										let flashlight = false;
										if (note_command == "flashlight") {
											flashlight = true;

											let walking = event_moving[i];
											if (walking == false) {
												let tldir = Number(note_args.shift());
												if (!isNaN(tldir)) {
													if (tldir < 0 || ldir >= 5) {
														ldir = 4
													}
													if (tldir == 1) {
														ldir = 8
													}
													if (tldir == 2) {
														ldir = 6
													}
													if (tldir == 3) {
														ldir = 2
													}
													if (tldir == 4) {
														ldir = 4
													}
												}
											}


										}
										let lx1 = (pw / 2) + ((lpx - dx) * pw);
										let ly1 = (ph / 2) + ((lpy - dy) * ph);
										// paralaxloop does something weird with coordinates.. recalc needed

										if ($dataMap.scrollType === 2 || $dataMap.scrollType === 3) {
											if (dx - 10 > lpx) {
												let lxjump = $gameMap.width() - (dx - lpx);
												lx1 = (pw / 2) + (lxjump * pw);
											}
										}
										if ($dataMap.scrollType === 1 || $dataMap.scrollType === 3) {
											if (dy - 10 > lpy) {
												let lyjump = $gameMap.height() - (dy - lpy);
												ly1 = (ph / 2) + (lyjump * ph);
											}
										}

										let visible = true;
										if ($gameMap.useUltraMode7) {
											let position = UltraMode7.mapToScreen(lx1, ly1 + ph / 2);
											if ($gameMap.ultraMode7Fov > 0) {
												let z = position.z;
												if (z <= UltraMode7.NEAR_CLIP_Z && z >= UltraMode7.FAR_CLIP_Z) {
													visible = false;
												}
											}
											if (visible) {
												let scale = UltraMode7.mapToScreenScale(lx1, ly1);
												lx1 = position.x;
												ly1 = position.y -= ph / 2 * scale;
												light_radius *= scale;
											}
										}
										if (visible) {
											if (flashlight == true) {
												this._maskBitmap.radialgradientFillRect2(lx1, ly1, 0, light_radius, colorvalue, '#000000', ldir, flashlength, flashwidth);
											} else {
												this._maskBitmap.radialgradientFillRect(lx1, ly1, 0, light_radius, colorvalue, '#000000', objectflicker, brightness, direction);
											}
										}


									}



								}
							}
						}



						// *************************** TILE TAG *********************
						//glow/colorfade
						let glowdatenow = new Date();
						let glowseconds = Math.floor(glowdatenow.getTime() / 100);

						if (glowseconds > glow_oldseconds) {
							glow_oldseconds = glowseconds;
							tileglow = tileglow + glow_dir;

							if (tileglow > 120) {
								glow_dir = -1;
							}
							if (tileglow < 1) {
								glow_dir = 1;
							}
						}

						tile_lights = $gameVariables.GetLightTags();
						tile_blocks = $gameVariables.GetBlockTags();

						for (let i = 0, len = tile_lights.length; i < len; i++) {
							let tilestr = tile_lights[i];

							let tileargs = tilestr.split(";");
							let x = tileargs[0];
							let y = tileargs[1];
							let tile_type = tileargs[2];
							let tile_radius = tileargs[3];
							let tile_color = tileargs[4];
							let brightness = tileargs[5];

							let x1 = (pw / 2) + (x - dx) * pw;
							let y1 = (ph / 2) + (y - dy) * ph;

							if ($dataMap.scrollType === 2 || $dataMap.scrollType === 3) {
								if (dx - 5 > x) {
									let lxjump = $gameMap.width() - (dx - x);
									x1 = (pw / 2) + (lxjump * pw);
								}
							}
							if ($dataMap.scrollType === 1 || $dataMap.scrollType === 3) {
								if (dy - 5 > y) {
									let lyjump = $gameMap.height() - (dy - y);
									y1 = (ph / 2) + (lyjump * ph);
								}
							}

							if (tile_type == 3 || tile_type == 4) {
								this._maskBitmap.radialgradientFillRect(x1, y1, 0, tile_radius, tile_color, '#000000', false, brightness); // Light
							} else if (tile_type == 5 || tile_type == 6) {
								this._maskBitmap.radialgradientFillRect(x1, y1, 0, tile_radius, tile_color, '#000000', true, brightness);  // Fire
							} else {

								let r = hexToRgb(tile_color).r;
								let g = hexToRgb(tile_color).g;
								let b = hexToRgb(tile_color).b;


								r = Math.floor(r + (60 - tileglow));
								g = Math.floor(g + (60 - tileglow));
								b = Math.floor(b + (60 - tileglow));

								if (r < 0) {
									r = 0;
								}
								if (g < 0) {
									g = 0;
								}
								if (b < 0) {
									b = 0;
								}
								if (r > 255) {
									r = 255;
								}
								if (g > 255) {
									g = 255;
								}
								if (b > 255) {
									b = 255;
								}

								let newtile_color = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
								this._maskBitmap.radialgradientFillRect(x1, y1, 0, tile_radius, newtile_color, '#000000', false, brightness);
							}


						}



						ctx.globalCompositeOperation = "multiply";
						for (let i = 0, len = tile_blocks.length; i < len; i++) {
							let tilestr = tile_blocks[i];
							let tileargs = tilestr.split(";");

							let x = tileargs[0];
							let y = tileargs[1];
							let shape = tileargs[2];
							let xo1 = tileargs[3];
							let yo1 = tileargs[4];
							let xo2 = tileargs[5];
							let yo2 = tileargs[6];
							let tile_color = tileargs[7];


							let x1 = (x - dx) * pw;
							let y1 = (y - dy) * ph;

							if ($dataMap.scrollType === 2 || $dataMap.scrollType === 3) {
								if (dx - 5 > x) {
									let lxjump = $gameMap.width() - (dx - x);
									x1 = (lxjump * pw);
								}
							}
							if ($dataMap.scrollType === 1 || $dataMap.scrollType === 3) {
								if (dy - 5 > y) {
									let lyjump = $gameMap.height() - (dy - y);
									y1 = (lyjump * ph);
								}
							}
							if (shape == 0) {
								this._maskBitmap.FillRect(x1, y1, pw, ph, tile_color);
							}
							if (shape == 1) {
								x1 = x1 + Number(xo1);
								y1 = y1 + Number(yo1);
								this._maskBitmap.FillRect(x1, y1, Number(xo2), Number(yo2), tile_color);
							}
							if (shape == 2) {
								x1 = x1 + Number(xo1);
								y1 = y1 + Number(yo1);
								this._maskBitmap.FillCircle(x1, y1, Number(xo2), Number(yo2), tile_color);
							}
						}
						ctx.globalCompositeOperation = 'lighter';


						// *********************************** DAY NIGHT CYCLE FILTER **************************
						if ($$.daynightset) {

							let daynighttimer = $gameVariables.GetDaynightTimer();     // timer = minutes * speed
							let daynightcycle = $gameVariables.GetDaynightCycle();     // cycle = hours
							let daynighthoursinday = $gameVariables.GetDaynightHoursinDay();   // 24
							let daynightcolors = $gameVariables.GetDaynightColorArray();
							let r, g, b;
							let color1 = daynightcolors[daynightcycle].color;

							if (daynightspeed > 0) {
								let nextcolor = daynightcycle + 1;
								if (nextcolor >= daynighthoursinday) {
									nextcolor = 0;
								}
								let color2 = daynightcolors[nextcolor].color;
								let rgb = hexToRgb(color1);
								r = rgb.r;
								g = rgb.g;
								b = rgb.b;

								rgb = hexToRgb(color2);
								let r2 = rgb.r;
								let g2 = rgb.g;
								let b2 = rgb.b;

								let stepR = (r2 - r) / (60 * daynightspeed);
								let stepG = (g2 - g) / (60 * daynightspeed);
								let stepB = (b2 - b) / (60 * daynightspeed);

								r = Math.floor(r + (stepR * daynighttimer));
								g = Math.floor(g + (stepG * daynighttimer));
								b = Math.floor(b + (stepB * daynighttimer));
							}
							color1 = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

							this._maskBitmap.FillRect(0, 0, maxX + 20, maxY, color1);
						}
						// *********************************** TINT **************************
						else {
							let tint_value = $gameVariables.GetTint();
							let tint_target = $gameVariables.GetTintTarget();
							let tint_speed = $gameVariables.GetTintSpeed();


							if (Community_tint_target != Community_tint_target_old) {
								Community_tint_target_old = Community_tint_target;
								tint_target = Community_tint_target;
								$gameVariables.SetTintTarget(tint_target);
							}
							if (Community_tint_speed != Community_tint_speed_old) {
								Community_tint_speed_old = Community_tint_speed;
								tint_speed = Community_tint_speed;
								$gameVariables.SetTintSpeed(tint_speed);
							}
							let tcolor = tint_value;
							if (tint_value != tint_target) {

								let tintdatenow = new Date();
								let tintseconds = Math.floor(tintdatenow.getTime() / 10);
								if (tintseconds > tint_oldseconds) {
									tint_oldseconds = tintseconds;
									tint_timer++;
								}

								let r = hexToRgb(tint_value).r;
								let g = hexToRgb(tint_value).g;
								let b = hexToRgb(tint_value).b;

								let r2 = hexToRgb(tint_target).r;
								let g2 = hexToRgb(tint_target).g;
								let b2 = hexToRgb(tint_target).b;

								let stepR = (r2 - r) / (60 * tint_speed);
								let stepG = (g2 - g) / (60 * tint_speed);
								let stepB = (b2 - b) / (60 * tint_speed);

								let r3 = Math.floor(r + (stepR * tint_timer));
								let g3 = Math.floor(g + (stepG * tint_timer));
								let b3 = Math.floor(b + (stepB * tint_timer));
								if (r3 < 0) {
									r3 = 0
								}
								if (g3 < 0) {
									g3 = 0
								}
								if (b3 < 0) {
									b3 = 0
								}
								if (r3 > 255) {
									r3 = 255
								}
								if (g3 > 255) {
									g3 = 255
								}
								if (b3 > 255) {
									b3 = 255
								}
								let reddone = false;
								let greendone = false;
								let bluedone = false;
								if (stepR >= 0 && r3 >= r2) {
									reddone = true;
								}
								if (stepR <= 0 && r3 <= r2) {
									reddone = true;
								}
								if (stepG >= 0 && g3 >= g2) {
									greendone = true;
								}
								if (stepG <= 0 && g3 <= g2) {
									greendone = true;
								}
								if (stepB >= 0 && b3 >= b2) {
									bluedone = true;
								}
								if (stepB <= 0 && b3 <= b2) {
									bluedone = true;
								}
								if (reddone == true && bluedone == true && greendone == true) {
									$gameVariables.SetTint(tint_target);
								}
								tcolor = "#" + ((1 << 24) + (r3 << 16) + (g3 << 8) + b3).toString(16).slice(1);
							} else {
								tint_timer = 0;
							}
							this._maskBitmap.FillRect(-20, 0, maxX + 20, maxY, tcolor);
						}

						// reset drawmode to normal
						ctx.globalCompositeOperation = 'source-over';

					}
				}
			}
		}
	};

	/**
	 * @method _addSprite
	 * @private
	 */
	Lightmask.prototype._addSprite = function (x1, y1, selectedbitmap) {

		let sprite = new Sprite(this.viewport);
		sprite.bitmap = selectedbitmap;
		sprite.opacity = 255;
		sprite.blendMode = 2;
		sprite.x = x1;
		sprite.y = y1;
		this._sprites.push(sprite);
		this.addChild(sprite);
		sprite.rotation = 0;
		sprite.ax = 0;
		sprite.ay = 0;
		sprite.opacity = 255;
	};

	/**
	 * @method _removeSprite
	 * @private
	 */
	Lightmask.prototype._removeSprite = function () {
		this.removeChild(this._sprites.pop());
	};


	// *******************  NORMAL BOX SHAPE ***********************************

	Bitmap.prototype.FillRect = function (x1, y1, x2, y2, color1) {
		x1 = x1 + 20;
		//x2=x2+20;
		let context = this._context;
		context.save();
		context.fillStyle = color1;
		context.fillRect(x1, y1, x2, y2);
		context.restore();
		this._setDirty();
	};

	// *******************  CIRCLE/OVAL SHAPE ***********************************
	// from http://scienceprimer.com/draw-oval-html5-canvas
	Bitmap.prototype.FillCircle = function (centerX, centerY, xradius, yradius, color1) {
		centerX = centerX + 20;

		let context = this._context;
		context.save();
		context.fillStyle = color1;
		context.beginPath();
		let rotation = 0;
		let start_angle = 0;
		let end_angle = 2 * Math.PI;
		for (let i = start_angle * Math.PI; i < end_angle * Math.PI; i += 0.01) {
			xPos = centerX - (yradius * Math.sin(i)) * Math.sin(rotation * Math.PI) + (xradius * Math.cos(i)) * Math.cos(rotation * Math.PI);
			yPos = centerY + (xradius * Math.cos(i)) * Math.sin(rotation * Math.PI) + (yradius * Math.sin(i)) * Math.cos(rotation * Math.PI);

			if (i == 0) {
				context.moveTo(xPos, yPos);
			} else {
				context.lineTo(xPos, yPos);
			}
		}
		context.fill();
		context.closePath();
		context.restore();
		this._setDirty();
	};

	// *******************  NORMAL LIGHT SHAPE ***********************************
	// Fill gradient circle

	Bitmap.prototype.radialgradientFillRect = function (x1, y1, r1, r2, color1, color2, flicker, brightness, direction) {

		let isValidColor = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color1);
		if (!isValidColor) {
			color1 = '#000000'
		}
		let isValidColor2 = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color2);
		if (!isValidColor2) {
			color2 = '#000000'
		}

		x1 = x1 + 20;

		// clipping
		let nx1 = Number(x1);
		let ny1 = Number(y1);
		let nr2 = Number(r2);

		let clip = false;

		if (nx1 - nr2 > maxX) {
			clip = true;
		}
		if (ny1 - nr2 > maxY) {
			clip = true;
		}
		if (nx1 + nr2 < 0) {
			clip = true;
		}
		if (nx1 + nr2 < 0) {
			clip = true;
		}

		if (clip == false) {

			if (!brightness) {
				brightness = 0.0;
			}
			if (!direction) {
				direction = 0;
			}
			let context = this._context;
			let grad;
			let wait = Math.floor((Math.random() * 8) + 1);
			if (flicker == true && wait == 1) {
				let flickerradiusshift = $gameVariables.GetFireRadius();
				let flickercolorshift = $gameVariables.GetFireColorshift();
				let gradrnd = Math.floor((Math.random() * flickerradiusshift) + 1);
				let colorrnd = Math.floor((Math.random() * flickercolorshift) - (flickercolorshift / 2));

				let r = hexToRgb(color1).r;
				let g = hexToRgb(color1).g;
				let b = hexToRgb(color1).b;
				g = g + colorrnd;
				if (g < 0) {
					g = 0;
				}
				if (g > 255) {
					g = 255;
				}
				color1 = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
				r2 = r2 - gradrnd;
				if (r2 < 0) r2 = 0;
			}

			grad = context.createRadialGradient(x1, y1, r1, x1, y1, r2);
			if (brightness) {
				grad.addColorStop(0, '#FFFFFF');
			}
			grad.addColorStop(brightness, color1);

			grad.addColorStop(1, color2);

			context.save();
			context.fillStyle = grad;
			direction = Number(direction);
			let pw = $gameMap.tileWidth() / 2;
			let ph = $gameMap.tileHeight() / 2;
			switch (direction) {
				case 0:
					context.fillRect(x1 - r2, y1 - r2, r2 * 2, r2 * 2);
					break;
				case 1:
					context.fillRect(x1 - r2, y1 - ph, r2 * 2, r2 * 2);
					break;
				case 2:
					context.fillRect(x1 - r2, y1 - r2, r2 * 1 + pw, r2 * 2);
					break;
				case 3:
					context.fillRect(x1 - r2, y1 - r2, r2 * 2, r2 * 1 + ph);
					break;
				case 4:
					context.fillRect(x1 - pw, y1 - r2, r2 * 2, r2 * 2);
					break;
				case 5:
					context.fillRect(x1 - r2, y1 - ph, r2 * 1 + pw, r2 * 1 + ph);
					break;
				case 6:
					context.fillRect(x1 - r2, y1 - r2, r2 * 1 + pw, r2 * 1 + ph);
					break;
				case 7:
					context.fillRect(x1 - pw, y1 - r2, r2 * 1 + pw, r2 * 1 + ph);
					break;
				case 8:
					context.fillRect(x1 - pw, y1 - ph, r2 * 1 + pw, r2 * 1 + ph);
					break;
				case 9:
					context.fillRect(x1 - r2, y1 - ph, r2 * 2, r2 * 2);
					context.fillRect(x1 - r2, y1 - r2, r2 * 1 - pw, r2 * 1 - ph);
					break;
				case 10:
					context.fillRect(x1 - r2, y1 - r2, r2 * 2, r2 * 1 + ph);
					context.fillRect(x1 - r2, y1 + pw, r2 * 1 - pw, r2 * 1 - ph);
					break;
				case 11:
					context.fillRect(x1 - r2, y1 - r2, r2 * 2, r2 * 1 + ph);
					context.fillRect(x1 + pw, y1 + pw, r2 * 1 - pw, r2 * 1 - ph);
					break;
				case 12:
					context.fillRect(x1 - r2, y1 - ph, r2 * 2, r2 * 2);
					context.fillRect(x1 + pw, y1 - r2, r2 * 1 - pw, r2 * 1 - ph);
					break;
			}
			context.restore();
			this._setDirty();
		}
	};


	// ********************************** FLASHLIGHT *************************************
	// Fill gradient Cone

	Bitmap.prototype.radialgradientFillRect2 = function (x1, y1, r1, r2, color1, color2, direction, flashlength, flashwidth) {
		x1 = x1 + 20;

		let isValidColor = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color1);
		if (!isValidColor) {
			color1 = '#000000'
		}
		let isValidColor2 = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color2);
		if (!isValidColor2) {
			color2 = '#000000'
		}

		let context = this._context;
		let grad;

		// smal dim glove around player
		context.save();
		y1 = y1 - flashlightoffset;

		r1 = 1;
		r2 = 40;
		grad = context.createRadialGradient(x1, y1, r1, x1, y1, r2);
		grad.addColorStop(0, '#999999');
		grad.addColorStop(1, color2);

		context.fillStyle = grad;
		context.fillRect(x1 - r2, y1 - r2, r2 * 2, r2 * 2);

		// flashlight

		for (let cone = 0; cone < flashlength; cone++) {
			let flashlightdensity = $gameVariables.GetFlashlightDensity();
			r1 = cone * flashlightdensity;
			r2 = cone * flashwidth;

			switch (direction) {
				case 6:
					x1 = x1 + cone * 6;
					break;
				case 4:
					x1 = x1 - cone * 6;
					break;
				case 2:
					y1 = y1 + cone * 6;
					break;
				case 8:
					y1 = y1 - cone * 6;
					break;
			}


			grad = context.createRadialGradient(x1, y1, r1, x1, y1, r2);
			grad.addColorStop(0, color1);
			grad.addColorStop(1, color2);

			context.fillStyle = grad;
			context.fillRect(x1 - r2, y1 - r2, r2 * 2, r2 * 2);
		}
		context.fillStyle = grad;
		context.fillRect(x1 - r2, y1 - r2, r2 * 2, r2 * 2);

		context.restore();
		this._setDirty();
	};


	function hexToRgb(hex) {
		let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		result = result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
		return result;
	}

	// ALIASED Begin battle: prepare battle lighting

	let Community_Lighting_BattleManager_setup = BattleManager.setup;
	BattleManager.setup = function (troopId, canEscape, canLose) {
		$gameTemp._MapTint = '#FFFFFF';																		// By default, no darkness during battle
		if (!DataManager.isBattleTest() && !DataManager.isEventTest() && $gameMap.mapId() >= 0) {			// If we went there from a map...
			if ($gameVariables.GetStopScript() === false && $gameVariables.GetScriptActive() === true) {	// If the script is active...
				if (options_lighting_on && lightInBattle) {																	// If configuration autorise using lighting effects
					if (event_note.length > 0) {															// If there is lightsource on this map...
						$gameTemp._MapTint = $gameVariables.GetTint();										// ... Use the tint of the map.
					}
				}
				// Add daylight tint?
			}
		}
		Community_Lighting_BattleManager_setup.call(this, troopId, canEscape, canLose);
	};

	// ALIASED Scene_Battle initialisation: create the light mask.

	let Community_Lighting_Spriteset_Battle_createLowerLayer = Spriteset_Battle.prototype.createLowerLayer;
	Spriteset_Battle.prototype.createLowerLayer = function () {
		Community_Lighting_Spriteset_Battle_createLowerLayer.call(this);
		if (battleMaskPosition === 'Above') {
			this.createBattleLightmask();
		}
	};

	let Community_Lighting_Spriteset_Battle_createBattleback = Spriteset_Battle.prototype.createBattleback;
	Spriteset_Battle.prototype.createBattleback = function () {
		Community_Lighting_Spriteset_Battle_createBattleback.call(this);
		if (battleMaskPosition === 'Between') {
			this.createBattleLightmask();
		}
	};

	Spriteset_Battle.prototype.createBattleLightmask = function () {
		if ($gameVariables.GetStopScript() === false && $gameVariables.GetScriptActive()) {	// If the script is active
			if (lightInBattle) {															// If is active during battles.
				this._battleLightmask = new BattleLightmask();								// ... Create the light mask.
				if (battleMaskPosition === 'Above') {
					this.addChild(this._battleLightmask);
				} else if (battleMaskPosition === 'Between') {
					this._back2Sprite.addChild(this._battleLightmask);
				}
			}
		}
	};

	function BattleLightmask() {
		this.initialize.apply(this, arguments);
	};

	BattleLightmask.prototype = Object.create(PIXI.Container.prototype);
	BattleLightmask.prototype.constructor = BattleLightmask;

	BattleLightmask.prototype.initialize = function () {
		PIXI.Container.call(this);
		this._width = Graphics.width;
		this._height = Graphics.height;
		this._sprites = [];
		this._createBitmap();

		//Initialize the bitmap
		this._addSprite(-20, 0, this._maskBitmap);
		var redhex = $gameTemp._MapTint.substring(1, 3);
		var greenhex = $gameTemp._MapTint.substring(3, 5);
		var bluehex = $gameTemp._MapTint.substring(5);
		var red = parseInt(redhex, 16);
		var green = parseInt(greenhex, 16);
		var blue = parseInt(bluehex, 16);
		var color = red + green + blue;
		if (color < 200 && red < 66 && green < 66 && blue < 66) {
			$gameTemp._MapTint = '#666666' // Prevent the battle scene from being too dark.
		}
		$gameTemp._BattleTint = $$.daynightset ? $gameVariables.GetTintByTime() : $gameTemp._MapTint;
		this._maskBitmap.FillRect(-20, 0, maxX + 20, maxY, $gameTemp._BattleTint);
		$gameTemp._BattleTintSpeed = 0;
	};

	//@method _createBitmaps

	BattleLightmask.prototype._createBitmap = function () {
		this._maskBitmap = new Bitmap(maxX + 20, maxY);   // one big bitmap to fill the intire screen with black
		var canvas = this._maskBitmap.canvas;          // a bit larger then setting to take care of screenshakes
	};

	Bitmap.prototype.FillRect = function (x1, y1, x2, y2, color1) {
		x1 = x1 + 20;
		var context = this._context;
		context.save();
		context.fillStyle = color1;
		context.fillRect(x1, y1, x2, y2);
		context.restore();
		this._setDirty();
	};

	BattleLightmask.prototype.update = function () {
		var color1 = $gameTemp._BattleTint;
		if ($gameTemp._BattleTintSpeed > 0) {

			$gameTemp._BattleTintTimer += 1;

			var r = hexToRgb($gameTemp._BattleTintFade).r;
			var g = hexToRgb($gameTemp._BattleTintFade).g;
			var b = hexToRgb($gameTemp._BattleTintFade).b;

			var r2 = hexToRgb($gameTemp._BattleTint).r;
			var g2 = hexToRgb($gameTemp._BattleTint).g;
			var b2 = hexToRgb($gameTemp._BattleTint).b;

			var stepR = (r2 - r) / (60 * $gameTemp._BattleTintSpeed);
			var stepG = (g2 - g) / (60 * $gameTemp._BattleTintSpeed);
			var stepB = (b2 - b) / (60 * $gameTemp._BattleTintSpeed);

			var r3 = Math.floor(r + (stepR * $gameTemp._BattleTintTimer));
			var g3 = Math.floor(g + (stepG * $gameTemp._BattleTintTimer));
			var b3 = Math.floor(b + (stepB * $gameTemp._BattleTintTimer));
			if (r3 < 0) { r3 = 0 }
			if (g3 < 0) { g3 = 0 }
			if (b3 < 0) { b3 = 0 }
			if (r3 > 255) { r3 = 255 }
			if (g3 > 255) { g3 = 255 }
			if (b3 > 255) { b3 = 255 }
			var reddone = false;
			var greendone = false;
			var bluedone = false;
			if (stepR >= 0 && r3 >= r2) {
				reddone = true;
			}
			if (stepR <= 0 && r3 <= r2) {
				reddone = true;
			}
			if (stepG >= 0 && g3 >= g2) {
				greendone = true;
			}
			if (stepG <= 0 && g3 <= g2) {
				greendone = true;
			}
			if (stepB >= 0 && b3 >= b2) {
				bluedone = true;
			}
			if (stepB <= 0 && b3 <= b2) {
				bluedone = true;
			}
			if (reddone == true && bluedone == true && greendone == true) {
				$gameTemp._BattleTintFade = $gameTemp._BattleTint;
				$gameTemp._BattleTintSpeed = 0;
				$gameTemp._BattleTintTimer = 0;
			}
			color1 = "#" + ((1 << 24) + (r3 << 16) + (g3 << 8) + b3).toString(16).slice(1);
			$gameTemp._BattleTintFade = color1;
		}
		this._maskBitmap.FillRect(-20, 0, maxX + 20, maxY, color1);
	};

	/**
	 * @method _addSprite
	 * @private
	 */
	BattleLightmask.prototype._addSprite = function (x1, y1, selectedbitmap) {

		var sprite = new Sprite(this.viewport);
		sprite.bitmap = selectedbitmap;
		sprite.opacity = 255;
		sprite.blendMode = 2;
		sprite.x = x1;
		sprite.y = y1;
		this._sprites.push(sprite);
		this.addChild(sprite);
		sprite.rotation = 0;
		sprite.ax = 0;
		sprite.ay = 0
		sprite.opacity = 255;
	};

	/**
	 * @method _removeSprite
	 * @private
	 */
	BattleLightmask.prototype._removeSprite = function () {
		this.removeChild(this._sprites.pop());
	};

	// ALLIASED Move event location => reload map.

	let Alias_Game_Interpreter_command203 = Game_Interpreter.prototype.command203;
	Game_Interpreter.prototype.command203 = function () {
		Alias_Game_Interpreter_command203.call(this);
		$$.ReloadMapEvents();
		return true;
	};


	// ALIASED FROM RPG OBJECTS TO ADD LIGHTING TO CONFIG MENU

	ConfigManager.cLighting = true;

	Object.defineProperty(ConfigManager, 'cLighting', {
		get: function () {
			return options_lighting_on;
		},
		set: function (value) {
			options_lighting_on = value;
		},
		configurable: true
	});

	let Alias_ConfigManager_makeData = ConfigManager.makeData;
	ConfigManager.makeData = function () {
		let config = Alias_ConfigManager_makeData.call(this);
		config.cLighting = options_lighting_on;
		return config;
	};

	let Alias_ConfigManager_applyData = ConfigManager.applyData;
	ConfigManager.applyData = function (config) {
		Alias_ConfigManager_applyData.call(this, config);
		this.cLighting = this.readFlag2(config, 'cLighting');
	};

	let Window_Options_addGeneralOptions = Window_Options.prototype.addGeneralOptions;
	Window_Options.prototype.addGeneralOptions = function () {
		Window_Options_addGeneralOptions.call(this);
		if (optionText !== "") this.addCommand(optionText, 'cLighting');
	};

	ConfigManager.readFlag2 = function (config, name) {
		let value = config[name];
		if (value !== undefined) {
			return !!config[name];
		} else {
			return true;
		}
	};

	$$.ReloadMapEvents = function () {
		//**********************fill up new map-array *************************
		event_note = [];
		event_id = [];
		event_x = [];
		event_y = [];
		event_dir = [];
		event_moving = [];
		event_stacknumber = [];
		event_eventcount = $gameMap.events().length;

		for (let i = 0; i < event_eventcount; i++) {
			if ($gameMap.events()[i]) {
				if ($gameMap.events()[i].event()) {
					let note = getTag.call($gameMap.events()[i].event());

					let note_args = note.split(" ");
					let note_command = note_args.shift().toLowerCase();

					if (note_command == "light" || note_command == "fire" || note_command == "flashlight") {

						event_note.push(note);
						event_id.push($gameMap.events()[i]._eventId);
						event_x.push($gameMap.events()[i]._realX);
						event_y.push($gameMap.events()[i]._realY);
						event_dir.push($gameMap.events()[i]._direction);
						event_moving.push($gameMap.events()[i]._moveType || $gameMap.events()[i]._moveRouteForcing);
						event_stacknumber.push(i);

					}
					// else if (note_command == "daynight") daynightset = true;
				}
			}
		}
		// *********************************** DAY NIGHT Setting **************************
		$$.daynightset = false;
		let mapnote = getTag.call($dataMap);
		if (mapnote) {
			mapnote = mapnote.toLowerCase();
			if (mapnote.match(/^daynight/i)) {
				$$.daynightset = true;
				let dnspeed = mapnote.match(/\d+/);
				if (dnspeed) {
					daynightspeed = +dnspeed[0];
					if (daynightspeed < 1) daynightspeed = 5000;
					$gameVariables.SetDaynightSpeed(daynightspeed);
				}
			}
		}
	};


	$$.ReloadTagArea = function () {
		// *************************** TILE TAG LIGHTSOURCES *********

		// clear arrays
		tile_lights = [];
		tile_blocks = [];

		// refill arrays
		let tilearray = $gameVariables.GetTileArray();
		for (let i = 0, len = tilearray.length; i < len; i++) {

			let tilestr = tilearray[i];
			let tileargs = tilestr.split(";");
			let tile_type = tileargs[0];
			let tile_number = tileargs[1];
			let tile_on = tileargs[2];
			let tile_color = tileargs[3];
			let tile_radius = 0;
			let brightness = 0.0;
			let shape = 0;
			let xo1 = 0.0;
			let yo1 = 0.0;
			let xo2 = 0.0;
			let yo2 = 0.0;

			if (tile_type == 1 || tile_type == 2) {

				let b_arg = tileargs[4];
				if (typeof b_arg != 'undefined') {
					shape = b_arg;
				}
				b_arg = tileargs[5];
				if (typeof b_arg != 'undefined') {
					xo1 = b_arg;
				}
				b_arg = tileargs[6];
				if (typeof b_arg != 'undefined') {
					yo1 = b_arg;
				}
				b_arg = tileargs[7];
				if (typeof b_arg != 'undefined') {
					xo2 = b_arg;
				}
				b_arg = tileargs[8];
				if (typeof b_arg != 'undefined') {
					yo2 = b_arg;
				}


			} else {
				tile_radius = tileargs[4];
				let b_arg = tileargs[5];
				if (typeof b_arg != 'undefined') {
					let key = b_arg.substring(0, 1);
					if (key == 'b' || key == 'B') {
						brightness = Number(b_arg.substring(1)) / 100;
					}
				}
			}

			if (tile_on == 1) {

				if (tile_type >= 3) {
					// *************************** TILE TAG LIGHTSOURCES *********
					for (let y = 0, mapHeight = $dataMap.height; y < mapHeight; y++) {
						for (let x = 0, mapWidth = $dataMap.width; x < mapWidth; x++) {
							let tag = 0;
							if (tile_type == 3 || tile_type == 5 || tile_type == 7) {
								tag = $gameMap.terrainTag(x, y);
							}          // tile light
							if (tile_type == 4 || tile_type == 6 || tile_type == 8) {
								tag = $dataMap.data[(5 * $dataMap.height + y) * $dataMap.width + x];
							}  // region light
							if (tag == tile_number) {
								let tilecode = x + ";" + y + ";" + tile_type + ";" + tile_radius + ";" + tile_color + ";" + brightness;
								tile_lights.push(tilecode);
							}
						}
					}
				}


				// *************************** REDRAW MAPTILES FOR ROOFS ETC *********
				if (tile_type == 1 || tile_type == 2) {
					for (let y = 0, mapHeight = $dataMap.height; y < mapHeight; y++) {
						for (let x = 0, mapWidth = $dataMap.width; x < mapWidth; x++) {
							let tag = 0;
							if (tile_type == 1) {
								tag = $gameMap.terrainTag(x, y);
							}                  // tile block
							if (tile_type == 2) {
								tag = $dataMap.data[(5 * $dataMap.height + y) * $dataMap.width + x];
							}  // region block
							if (tag == tile_number) {
								let tilecode = x + ";" + y + ";" + shape + ";" + xo1 + ";" + yo1 + ";" + xo2 + ";" + yo2 + ";" + tile_color;
								tile_blocks.push(tilecode);
							}
						}
					}
				}
			}

		}
		$gameVariables.SetLightTags(tile_lights);
		$gameVariables.SetBlockTags(tile_blocks);
	};

	$$.flashlight = function (args) {
		if (args[0] == 'on') {

			let flashlightlength = $gameVariables.GetFlashlightLength();
			let flashlightwidth = $gameVariables.GetFlashlightWidth();
			let flashlightdensity = $gameVariables.GetFlashlightDensity();
			let playercolor = $gameVariables.GetPlayerColor();

			if (args.length >= 1) {
				flashlightlength = args[1];
			}
			if (args.length >= 2) {
				flashlightwidth = args[2];
			}
			if (args.length >= 3) {
				playercolor = args[3];
				let isValidPlayerColor = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(playercolor);
				if (!isValidPlayerColor) {
					playercolor = '#FFFFFF'
				}
			}
			if (args.length >= 4) {
				flashlightdensity = args[4]; // density
			}

			if (flashlightlength == 0 || isNaN(flashlightlength)) {
				flashlightlength = 8
			}
			if (flashlightwidth == 0 || isNaN(flashlightwidth)) {
				flashlightwidth = 12
			}
			if (flashlightdensity == 0 || isNaN(flashlightdensity)) {
				flashlightdensity = 3
			}

			$gameVariables.SetFlashlight(true);
			$gameVariables.SetPlayerColor(playercolor);
			$gameVariables.SetFlashlightWidth(flashlightwidth);
			$gameVariables.SetFlashlightLength(flashlightlength);
			$gameVariables.SetFlashlightDensity(flashlightdensity);

		}
		if (args[0] === 'off') {
			$gameVariables.SetFlashlight(false);
		}
	};

	$$.effectXy = function (args) {
		let x1 = args[0];
		if (x1.substring(0, 1) == '#') {
			x1 = $gameVariables.value(Number(x1.substring(1)));
		}
		let y1 = args[1];
		if (y1.substring(0, 1) == '#') {
			y1 = $gameVariables.value(Number(y1.substring(1)));
		}
		let radius = args[2];
		if (radius.substring(0, 1) == '#') {
			radius = $gameVariables.value(Number(radius.substring(1)));
		}
		let color = args[3];
		let time = args[4];
		if (time.substring(0, 1) == '#') {
			time = $gameVariables.value(Number(time.substring(1)));
		}
		let def = radius + "," + color + "," + time;
		if (args.length >= 6) {
			let command = args[5];
			let ctime = args[6];
			if (ctime.substring(0, 1) == '#') {
				ctime = $gameVariables.value(Number(ctime.substring(1)));
			}
			def = def + "," + command + "," + ctime;
		}
	};

	$$.effectOnEvent = function (args) {
		x1 = 0;
		y1 = 0;
		let evid = -1;
		for (let i = 0, len = $gameMap.events().length; i < len; i++) {
			if ($gameMap.events()[i]) {
				evid = $gameMap.events()[i]._eventId;
				if (evid == args[0]) {
					x1 = $gameMap.events()[i]._realX * $gameMap.tileWidth();
					y1 = $gameMap.events()[i]._realY * $gameMap.tileHeight();
				}
			}
		}
		// def = radius,color,duration(,keyword,speed)
		// 0. Radius
		// 1. Color
		// 2. Time in Frames
		// 3. Keyword (optional)   FADEIN FADEOUT FADEBOTH GROW SHRINK GROWSHRINK BIO
		// 4. Fade/Grow Speed in frames

		let radius = args[1];
		if (radius.substring(0, 1) == '#') {
			radius = $gameVariables.value(Number(radius.substring(1)));
		}
		let color = args[2];
		let time = args[3];
		if (time.substring(0, 1) == '#') {
			time = $gameVariables.value(Number(time.substring(1)));
		}
		let def = radius + "," + color + "," + time;
		if (args.length >= 5) {
			let command = args[4];
			let ctime = args[5];
			if (ctime.substring(0, 1) == '#') {
				ctime = $gameVariables.value(Number(ctime.substring(1)));
			}
			def = def + "," + command + "," + ctime;
		}
	};

	$$.fireLight = function (args) {
		//******************* Light radius 100 #FFFFFF ************************
		if (args[0] == 'radius') {
			let newradius = Number(args[1]);
			if (newradius >= 0) {
				$gameVariables.SetRadius(newradius);
				$gameVariables.SetRadiusTarget(newradius);

			}
			if (args.length > 2) {
				playercolor = args[2];
				let isValidPlayerColor = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(playercolor);
				if (!isValidPlayerColor) {
					playercolor = '#FFFFFF'
				}
				$gameVariables.SetPlayerColor(playercolor);
			}
			// player brightness
			if (args.length > 3) {
				let brightness = 0.0;
				let b_arg = args[3];
				if (typeof b_arg != 'undefined') {
					let key = b_arg.substring(0, 1);
					if (key == 'b' || key == 'B') {
						brightness = Number(b_arg.substring(1)) / 100;
						$gameVariables.SetPlayerBrightness(brightness);
					}
				}
			}
		}

		//******************* Light radiusgrow 100 #FFFFFF ************************
		if (args[0] === 'radiusgrow') {
			let newradius = Number(args[1]);
			if (newradius >= 0) {

				let lightgrow_value = $gameVariables.GetRadius();
				let lightgrow_target = newradius;
				let lightgrow_speed = 0.0;
				if (args.length >= 4) {
					if (player_radius > newradius) {
						//shrinking
						lightgrow_speed = (player_radius * 0.012) / Number(args[4]);
					} else {
						//growing
						lightgrow_speed = (newradius * 0.012) / Number(args[4]);
					}
				} else {
					lightgrow_speed = (Math.abs(newradius - player_radius)) / 500;
				}
				$gameVariables.SetRadius(lightgrow_value);
				$gameVariables.SetRadiusTarget(lightgrow_target);
				$gameVariables.SetRadiusSpeed(lightgrow_speed);
			}
			// player color
			if (args.length > 2) {
				playercolor = args[2];
				let isValidPlayerColor = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(playercolor);
				if (!isValidPlayerColor) {
					playercolor = '#FFFFFF'
				}
				$gameVariables.SetPlayerColor(playercolor);
			}
			// player brightness
			if (args.length > 3) {
				let brightness = 0.0;
				let b_arg = args[3];
				if (typeof b_arg != 'undefined') {
					let key = b_arg.substring(0, 1);
					if (key == 'b' || key == 'B') {
						brightness = Number(b_arg.substring(1)) / 100;
						$gameVariables.SetPlayerBrightness(brightness);
					}
				}
			}

		}

		// *********************** TURN SPECIFIC LIGHT ON *********************
		if (args[0] === 'on') {

			let lightarray_id = $gameVariables.GetLightArrayId();
			let lightarray_state = $gameVariables.GetLightArrayState();
			let lightarray_color = $gameVariables.GetLightArrayColor();

			let lightid = Number(args[1]);
			let idfound = false;
			for (let i = 0, len = lightarray_id.length; i < len; i++) {
				if (lightarray_id[i] == lightid) {
					idfound = true;
					lightarray_state[i] = true;
				}
			}
			if (idfound === false) {
				lightarray_id.push(lightid);
				lightarray_state.push(true);
				lightarray_color.push('defaultcolor');
			}
			$gameVariables.SetLightArrayId(lightarray_id);
			$gameVariables.SetLightArrayState(lightarray_state);
			$gameVariables.SetLightArrayColor(lightarray_color);
		}

		// *********************** TURN SPECIFIC LIGHT OFF *********************
		if (args[0] === 'off') {

			let lightarray_id = $gameVariables.GetLightArrayId();
			let lightarray_state = $gameVariables.GetLightArrayState();
			let lightarray_color = $gameVariables.GetLightArrayColor();

			let lightid = Number(args[1]);
			let idfound = false;
			for (let i = 0, len = lightarray_id.length; i < len; i++) {
				if (lightarray_id[i] == lightid) {
					idfound = true;
					lightarray_state[i] = false;
				}
			}
			if (idfound === false) {
				lightarray_id.push(lightid);
				lightarray_state.push(false);
				lightarray_color.push('defaultcolor');
			}
			$gameVariables.SetLightArrayId(lightarray_id);
			$gameVariables.SetLightArrayState(lightarray_state);
			$gameVariables.SetLightArrayColor(lightarray_color);
		}

		// *********************** SET COLOR *********************

		if (args[0] === 'color') {

			let newcolor = args[2];
			if (newcolor && newcolor.toLowerCase() === 'defaultcolor') {
				newcolor = 'defaultcolor';
			}

			let lightarray_id = $gameVariables.GetLightArrayId();
			let lightarray_state = $gameVariables.GetLightArrayState();
			let lightarray_color = $gameVariables.GetLightArrayColor();

			let lightid = Number(args[1]);
			idfound = false;
			for (let i = 0, len = lightarray_id.length; i < len; i++) {
				if (lightarray_id[i] == lightid) {
					idfound = true;
					lightarray_color[i] = newcolor;
				}
			}
			if (idfound === false) {
				lightarray_id.push(lightid);
				lightarray_state.push(false);
				lightarray_color.push(newcolor);
			}
			$gameVariables.SetLightArrayId(lightarray_id);
			$gameVariables.SetLightArrayState(lightarray_state);
			$gameVariables.SetLightArrayColor(lightarray_color);
		}


		// **************************** RESET ALL SWITCHES ***********************
		if (args[0] === 'switch' && args[1] === 'reset') {
			$gameVariables.SetLightArrayId([]);
			$gameVariables.SetLightArrayState([]);
			$gameVariables.SetLightArrayColor([]);
		}
	};

	$$.tile = function (args) {
		let tilearray = $gameVariables.GetTileArray();
		let tilenumber = Number(eval(args[0]));
		let tile_on = 0;
		if (args[1].toLowerCase() === 'on') {
			tile_on = 1;
		}
		let tilecolor = args[2];
		let isValidColor1 = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(tilecolor);
		if (!isValidColor1) {
			if (tiletype === 1 || tiletype === 2) {
				tilecolor = '#000000';
			} else {
				tilecolor = '#FFFFFF';
			}
		}

		let tileradius = 100;
		let tilebrightness = 0.0;
		let shape = 0;
		let x1 = 0;
		let y1 = 0;
		let x2 = 0;
		let y2 = 0;
		if (tiletype === 1 || tiletype === 2) {
			if (args.length > 3) {
				shape = args[3];
			}
			if (args.length > 4) {
				x1 = args[4];
			}
			if (args.length > 5) {
				y1 = args[5];
			}
			if (args.length > 6) {
				x2 = args[6];
			}
			if (args.length > 7) {
				y2 = args[7];
			}
		} else {
			if (args.length > 3) {
				tileradius = args[3];
			}
			if (args.length > 4) {
				tilebrightness = args[4];
			}
		}

		let tilefound = false;

		for (let i = 0, len = tilearray.length; i < len; i++) {
			let tilestr = tilearray[i];
			let tileargs = tilestr.split(";");
			if (tileargs[0] == tiletype && tileargs[1] == tilenumber) {
				tilefound = true;
				if (tiletype === 1 || tiletype === 2) {
					tilearray[i] = tiletype + ";" + tilenumber + ";" + tile_on + ";" + tilecolor + ";" + shape + ";" + x1 + ";" + y1 + ";" + x2 + ";" + y2;
				} else {
					tilearray[i] = tiletype + ";" + tilenumber + ";" + tile_on + ";" + tilecolor + ";" + tileradius + ";" + tilebrightness;
				}
			}
		}

		if (tilefound === false) {
			let tiletag = "";
			if (tiletype === 1 || tiletype === 2) {
				tiletag = tiletype + ";" + tilenumber + ";" + tile_on + ";" + tilecolor + ";" + shape + ";" + x1 + ";" + y1 + ";" + x2 + ";" + y2;
			} else {
				tiletag = tiletype + ";" + tilenumber + ";" + tile_on + ";" + tilecolor + ";" + tileradius + ";" + tilebrightness;
			}
			tilearray.push(tiletag);
		}
		$gameVariables.SetTileArray(tilearray);
		$$.ReloadTagArea();
	};

	$$.tint = function (args) {
		if (args[0] === 'set') {
			$gameVariables.SetTint(args[1]);
			$gameVariables.SetTintTarget(args[1]);
		}
		if (args[0] === 'fade') {
			$gameVariables.SetTintTarget(args[1]);
			$gameVariables.SetTintSpeed(args[2]);
		}
		else if (args[0] === "daylight") {
			let currentColor = $gameVariables.GetTintByTime();
			$gameVariables.SetTint(currentColor);
			$gameVariables.SetTintTarget(currentColor);
		}
	};

	$$.DayNight = function (args) {
		let daynightspeed = $gameVariables.GetDaynightSpeed();
		let daynighttimer = $gameVariables.GetDaynightTimer();     // timer = minutes * speed
		let daynightcycle = $gameVariables.GetDaynightCycle();     // cycle = hours
		let daynighthoursinday = $gameVariables.GetDaynightHoursinDay();   // 24
		//let daynightcolors = $gameVariables.GetDaynightColorArray();

		if (args[0] === 'speed') {
			daynightspeed = Number(args[1]);
			if (daynightspeed <= 0) {
				daynightspeed = 5000;
			}
			$gameVariables.SetDaynightSpeed(daynightspeed);
		}

		if (args[0] === 'add') {
			let houradd = Number(args[1]);
			let minuteadd = 0;
			if (args.length > 2) {
				minuteadd = Number(args[2]);
			}

			let daynightminutes = Math.floor(daynighttimer / daynightspeed);
			daynightminutes = daynightminutes + minuteadd;
			if (daynightminutes > 60) {
				daynightminutes = daynightminutes - 60;
				daynightcycle = daynightcycle + 1;
			}
			daynightcycle = daynightcycle + houradd;
			daynighttimer = daynightminutes * daynightspeed;

			if (daynightcycle < 0) daynightcycle = 0;
			if (daynightcycle >= daynighthoursinday) daynightcycle = daynightcycle - daynighthoursinday;
			saveTime(daynightcycle, daynightminutes);

			$gameVariables.SetDaynightTimer(daynighttimer);     // timer = minutes * speed
			$gameVariables.SetDaynightCycle(daynightcycle);     // cycle = hours

		}


		if (args[0] === 'hour') {
			daynightcycle = Number(args[1]);
			if (args.length > 2) {
				daynightminutes = Number(args[2]);
			} else {
				daynightminutes = 0;
			}
			daynighttimer = daynightminutes * daynightspeed;

			if (daynightcycle < 0) daynightcycle = 0;
			if (daynightcycle >= daynighthoursinday) daynightcycle = daynighthoursinday - 1;
			saveTime(daynightcycle, daynightminutes);

			$gameVariables.SetDaynightTimer(daynighttimer);     // timer = minutes * speed
			$gameVariables.SetDaynightCycle(daynightcycle);     // cycle = hours

		}

		if (args[0] === 'hoursinday') {

			let old_value = daynighthoursinday;
			daynighthoursinday = Number(args[1]);
			if (daynighthoursinday < 0) {
				daynighthoursinday = 0;
			}
			if (daynighthoursinday > old_value) {
				for (let i = old_value; i < daynighthoursinday; i++) {
					daynightcolors.push({ "color": "#ffffff", "isNight": false });
				}
			}
			$gameVariables.setDayNightColorArray(daynightcolors);
			$gameVariables.setDayNightHoursInDay(daynighthoursinday);
		}

		if (args[0] === 'debug') {
			daynightdebug = true;
		}


		if (args[0] === 'color') {

			let hour = Number(args[1]);
			if (hour < 0) {
				hour = 0;
			}
			if (hour >= daynighthoursinday) {
				hour = (daynighthoursinday - 1);
			}
			let hourcolor = args[2];
			let isValidColor = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(hourcolor);
			if (isValidColor) {
				daynightcolors[hour].color = hourcolor;
			}
			$gameVariables.SetDaynightColorArray(daynightcolors);
		}
	};




})(Community.Lighting);

Game_Variables.prototype.GetFirstRun = function () {
	if (typeof this._Community_Lighting_FirstRun == 'undefined') {
		this._Community_Lighting_FirstRun = true;
	}
	return this._Community_Lighting_FirstRun;
};
Game_Variables.prototype.SetFirstRun = function (value) {
	this._Community_Lighting_FirstRun = value;
};
Game_Variables.prototype.GetScriptActive = function () {
	if (typeof this._Community_Lighting_ScriptActive == 'undefined') {
		this._Community_Lighting_ScriptActive = true;
	}
	return this._Community_Lighting_ScriptActive;
};
Game_Variables.prototype.SetScriptActive = function (value) {
	this._Community_Lighting_ScriptActive = value;
};
Game_Variables.prototype.GetStopScript = function () {
	if (typeof this._Community_Lighting_StopScript == 'undefined') {
		this._Community_Lighting_StopScript = false;
	}
	return this._Community_Lighting_StopScript;
};
Game_Variables.prototype.SetStopScript = function (value) {
	this._Community_Lighting_StopScript = value;
};

Game_Variables.prototype.SetTint = function (value) {
	this._Community_Tint_Value = value;
};
Game_Variables.prototype.GetTint = function () {
	return this._Community_Tint_Value || '#000000';
};
Game_Variables.prototype.GetTintByTime = function () {
	let result = this.GetDaynightColorArray()[this.GetDaynightCycle()];
	return result ? (result.color || "#000000") : "#000000";
};
Game_Variables.prototype.SetTintTarget = function (value) {
	this._Community_TintTarget_Value = value;
};
Game_Variables.prototype.GetTintTarget = function () {
	return this._Community_TintTarget_Value || '#000000';
};
Game_Variables.prototype.SetTintSpeed = function (value) {
	this._Community_TintSpeed_Value = value;
};
Game_Variables.prototype.GetTintSpeed = function () {
	return this._Community_TintSpeed_Value || 60;
};

Game_Variables.prototype.SetFlashlight = function (value) {
	this._Community_Lighting_Flashlight = value;
};
Game_Variables.prototype.GetFlashlight = function () {
	return this._Community_Lighting_Flashlight || false;
};
Game_Variables.prototype.SetFlashlightDensity = function (value) {
	this._Community_Lighting_FlashlightDensity = value;
};
Game_Variables.prototype.GetFlashlightDensity = function () {
	return this._Community_Lighting_FlashlightDensity || 3;
};
Game_Variables.prototype.SetFlashlightLength = function (value) {
	this._Community_Lighting_FlashlightLength = value;
};
Game_Variables.prototype.GetFlashlightLength = function () {
	return this._Community_Lighting_FlashlightLength || 8;
};
Game_Variables.prototype.SetFlashlightWidth = function (value) {
	this._Community_Lighting_FlashlightWidth = value;
};
Game_Variables.prototype.GetFlashlightWidth = function () {
	return this._Community_Lighting_FlashlightWidth || 12;
};

Game_Variables.prototype.SetPlayerColor = function (value) {
	this._Community_Lighting_PlayerColor = value;
};
Game_Variables.prototype.GetPlayerColor = function () {
	return this._Community_Lighting_PlayerColor || '#FFFFFF';
};
Game_Variables.prototype.SetPlayerBrightness = function (value) {
	this._Community_Lighting_PlayerBrightness = value;
};
Game_Variables.prototype.GetPlayerBrightness = function (value) {
	this._Community_Lighting_PlayerBrightness = value || 0.0;
};
Game_Variables.prototype.SetRadius = function (value) {
	this._Community_Lighting_Radius = value;
};
Game_Variables.prototype.GetRadius = function () {
	if (this._Community_Lighting_Radius === undefined) {
		return 150;
	} else {
		return this._Community_Lighting_Radius;
	}
};
Game_Variables.prototype.SetRadiusTarget = function (value) {
	this._Community_Lighting_RadiusTarget = value;
};
Game_Variables.prototype.GetRadiusTarget = function () {
	if (this._Community_Lighting_RadiusTarget === undefined) {
		return 150;
	} else {
		return this._Community_Lighting_RadiusTarget;
	}
};
Game_Variables.prototype.SetRadiusSpeed = function (value) {
	this._Community_Lighting_RadiusSpeed = value;
};
Game_Variables.prototype.GetRadiusSpeed = function () {
	return this._Community_Lighting_RadiusSpeed || 0;
};

Game_Variables.prototype.SetDaynightColorArray = function (value) {
	this._Community_Lighting_DayNightColorArray = value;
};
Game_Variables.prototype.GetDaynightColorArray = function () {
	let result = this._Community_Lighting_DayNightColorArray || Community.Lighting.getDayNightList();
	if (!result) {
		result = ['#000000', '#000000', '#000000', '#000000',
			'#000000', '#000000', '#666666', '#AAAAAA',
			'#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF',
			'#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF',
			'#FFFFFF', '#FFFFFF', '#AAAAAA', '#666666',
			'#000000', '#000000', '#000000', '#000000'].map(x => x = { "color": x, "isNight": false });
		this._Community_Lighting_DayNightColorArray = result;
	}
	if (!this._Community_Lighting_DayNightColorArray) this.SetDaynightColorArray(result);
	return result;
};
Game_Variables.prototype.SetDaynightSpeed = function (value) {
	this._Community_Lighting_DaynightSpeed = value;
};
Game_Variables.prototype.GetDaynightSpeed = function () {
	return this._Community_Lighting_DaynightSpeed || 10;
};
Game_Variables.prototype.SetDaynightCycle = function (value) {
	this._Community_Lighting_DaynightCycle = value;
};
Game_Variables.prototype.GetDaynightCycle = function () {
	return this._Community_Lighting_DaynightCycle || 0;
};
Game_Variables.prototype.SetDaynightTimer = function (value) {
	this._Community_Lighting_DaynightTimer = value;
};
Game_Variables.prototype.GetDaynightTimer = function () {
	return this._Community_Lighting_DaynightTimer || 0;
};
Game_Variables.prototype.SetDaynightHoursinDay = function (value) {
	this._Community_Lighting_DaynightHoursinDay = value;
};
Game_Variables.prototype.GetDaynightHoursinDay = function () {
	return this._Community_Lighting_DaynightHoursinDay || 24;
};

Game_Variables.prototype.SetFireRadius = function (value) {
	this._Community_Lighting_FireRadius = value;
};
Game_Variables.prototype.GetFireRadius = function () {
	return this._Community_Lighting_FireRadius || 7;
};
Game_Variables.prototype.SetFireColorshift = function (value) {
	this._Community_Lighting_FireColorshift = value;
};
Game_Variables.prototype.GetFireColorshift = function () {
	return this._Community_Lighting_FireColorshift || 10;
};
Game_Variables.prototype.SetFire = function (value) {
	this._Community_Lighting_Fire = value;
};
Game_Variables.prototype.GetFire = function () {
	return this._Community_Lighting_Fire || false;
};

Game_Variables.prototype.SetLightArrayId = function (value) {
	this._Community_Lighting_LightArrayId = value;
};
Game_Variables.prototype.GetLightArrayId = function () {
	let default_LAI = [];
	return this._Community_Lighting_LightArrayId || default_LAI;
};
Game_Variables.prototype.SetLightArrayState = function (value) {
	this._Community_Lighting_LightArrayState = value;
};
Game_Variables.prototype.GetLightArrayState = function () {
	let default_LAS = [];
	return this._Community_Lighting_LightArrayState || default_LAS;
};
Game_Variables.prototype.SetLightArrayColor = function (value) {
	this._Community_Lighting_LightArrayColor = value;
};
Game_Variables.prototype.GetLightArrayColor = function () {
	let default_LAS = [];
	return this._Community_Lighting_LightArrayColor || default_LAS;
};

Game_Variables.prototype.SetTileArray = function (value) {
	this._Community_Lighting_TileArray = value;
};
Game_Variables.prototype.GetTileArray = function () {
	let default_TA = [];
	return this._Community_Lighting_TileArray || default_TA;
};
Game_Variables.prototype.SetLightTags = function (value) {
	this._Community_Lighting_LightTags = value;
};
Game_Variables.prototype.GetLightTags = function () {
	let default_TA = [];
	return this._Community_Lighting_LightTags || default_TA;
};
Game_Variables.prototype.SetBlockTags = function (value) {
	this._Community_Lighting_BlockTags = value;
};
Game_Variables.prototype.GetBlockTags = function () {
	let default_TA = [];
	return this._Community_Lighting_BlockTags || default_TA;
};

Community.Lighting.Spriteset_Map_prototype_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
Spriteset_Map.prototype.createLowerLayer = function () {
	Community.Lighting.Spriteset_Map_prototype_createLowerLayer.call(this);
	this.createLightmask();
};