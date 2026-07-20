// 找猫模组叙述模板池。每个 templateKey 对应一条中文叙述,narrator(M3 实现)
// 从 EventCard.templateKeys 里随机选一条,避免同一事件反复触发时文案一模一样。
export const lostCatTemplates: Record<string, string> = {
  "ask-guard-1": "门卫老周想了想:「傍晚是有只猫从这边窜过去,好像往绿化带那头跑了。」",
  "ask-guard-2": "老周搓着手:「刚巡逻回来,瞥见一只猫尾巴钻进了绿化带,你去那边看看?」",
  "ask-guard-repeat-1": "老周摆摆手:「我刚才都说了,好像往绿化带去了。」",
  "ask-guard-repeat-2": "老周还是那句话:「往绿化带那边找找看吧。」",

  "search-greenbelt-1": "草丛里有一串新鲜的小脚印,旁边还沾着几根猫毛,像是刚经过不久。",
  "search-greenbelt-2": "拨开草丛,你听见细碎的响动,还有个褪色的铃铛半埋在土里——是年糕的。",
  "search-greenbelt-repeat-1": "草丛里翻了一圈,没再找到新的东西。",
  "search-greenbelt-repeat-2": "还是老样子,没有新线索了。",

  "talk-aunt-1": "陈阿姨遛娃回来,想了想说:「好像看见一只猫钻进车库那边的铁门缝了。」",
  "talk-aunt-2": "陈阿姨拍拍孩子:「刚才这猫从快递柜那边过去的,你去那边瞅瞅。」",
  "talk-aunt-repeat-1": "陈阿姨笑笑:「我知道的都说了呀。」",
  "talk-aunt-repeat-2": "陈阿姨摇摇头:「没有新消息啦。」",

  "search-office-flashlight-1": "物业亭里没人,桌上一支手电正好没上锁,你顺手拿了。",
  "search-office-flashlight-2": "值班室的手电就搁在窗口边,你拿起来试了试,还挺亮。",
  "office-repeat-1": "物业亭里没什么新东西了。",
  "office-repeat-2": "桌上除了手电,没别的了。",

  "talk-courier-1": "快递员小吴想了想:「刚才好像听见箱子那边有动静,你去快递柜那边瞧瞧?」",
  "talk-courier-2": "小吴指了指快递柜:「放件的时候好像有只猫钻进那边的纸箱了。」",
  "talk-courier-repeat-1": "小吴摊手:「我知道的都说了。」",
  "talk-courier-repeat-2": "小吴笑了笑:「还是那句话,去快递柜那边看看。」",

  "search-garage-with-flashlight-1": "手电照进车库角落,你听见一声细弱的「喵」,心一下子提了起来。",
  "search-garage-with-flashlight-2": "光柱扫过墙角,一双圆眼睛在暗处亮了一下——就是这附近了。",
  "garage-repeat-1": "车库角落已经照过了,没有更多动静。",
  "garage-repeat-2": "还是听得见那声若有若无的「喵」,但看不清具体在哪。",

  "use-box-1": "纸箱轻轻一动,年糕从里面探出头,冲你「喵」了一声,像是等你等了很久。",
  "use-box-2": "你掀开纸箱盖,年糕蜷在里面,看见你便慢悠悠地站起来蹭了蹭手。",

  // 移动到达文案:按地点给一条画面感,不是每次移动都一样枯燥。
  "arrive-unit-entrance-1": "你回到单元楼下,晚风里还带着点白天的暖意。",
  "arrive-greenbelt-1": "你走进绿化带,草丛在暮色里影影绰绰。",
  "arrive-garage-1": "你站到地下车库入口,里面黑黢黢的,一时看不清。",
  "arrive-office-1": "你来到物业亭,玻璃窗里透出一点灯光。",
  "arrive-lockers-1": "你走到快递柜旁,几个纸箱堆在墙角。",

  // 拒绝文案:前置条件不满足时的针对性叙述,比统一一句"时机未到"更有代入感。
  "garage-dark-rejected-1": "车库里黑漆漆的,什么都看不清,你在门口犹豫了一下。",
  "finish-rejected-1": "年糕好像还没真的找到,现在带它回家似乎有点太早了。",

  // finish 成功:引擎把它当 triggered 处理,但它不是一张 EventCard——
  // 结局页(EndingScreen)另有更完整的重逢文案,这里只是叙事日志里
  // 收尾的最后一句,不需要重复太多。
  "finish-success-1": "你把年糕抱进怀里,转身往家走去。",
  "finish-success-2": "年糕在你怀里安静下来,你们一起往家的方向走。",

  // 通用兜底:没有更具体文案时使用。
  "generic-unknown-1": "你想了想,一时没想好要怎么做。",
  "generic-unknown-2": "这个念头一闪而过,你还是决定先看看眼下的情况。",
  "generic-noop-1": "看了看四周,这里好像用不上这招。",
  "generic-noop-2": "你试了试,但这里似乎没什么反应。",
  "generic-rejected-1": "现在似乎还不是时候。",
};
