// 找猫模组叙述模板池。每个 templateKey 对应一条中文叙述,narrator(M3 实现)
// 从 EventCard.templateKeys 里随机选一条,避免同一事件反复触发时文案一模一样。
export const lostCatTemplates: Record<string, string> = {
  "ask-guard-1": "门卫老周想了想:「傍晚是有只猫从这边窜过去,好像往绿化带那头跑了。」",
  "ask-guard-2": "老周搓着手:「刚巡逻回来,瞥见一只猫尾巴钻进了绿化带,你去那边看看?」",
  "ask-guard-repeat-1": "老周摆摆手:「我刚才都说了,好像往绿化带去了。」",
  "ask-guard-repeat-2": "老周还是那句话:「往绿化带那边找找看吧。」",

  "search-greenbelt-1": "草丛里有一串新鲜的小脚印,旁边还沾着几根猫毛,像是刚经过不久。",
  "search-greenbelt-2": "拨开草丛,你听见细碎的响动,还有个褪色的铃铛半埋在土里——是年糕的。",

  "talk-aunt-1": "陈阿姨遛娃回来,想了想说:「好像看见一只猫钻进车库那边的铁门缝了。」",
  "talk-aunt-2": "陈阿姨拍拍孩子:「刚才这猫从快递柜那边过去的,你去那边瞅瞅。」",
  "talk-aunt-repeat-1": "陈阿姨笑笑:「我知道的都说了呀。」",
  "talk-aunt-repeat-2": "陈阿姨摇摇头:「没有新消息啦。」",

  "search-office-flashlight-1": "物业亭里没人,桌上一支手电正好没上锁,你顺手拿了。",
  "search-office-flashlight-2": "值班室的手电就搁在窗口边,你拿起来试了试,还挺亮。",

  "talk-courier-1": "快递员小吴想了想:「刚才好像听见箱子那边有动静,你去快递柜那边瞧瞧?」",
  "talk-courier-2": "小吴指了指快递柜:「放件的时候好像有只猫钻进那边的纸箱了。」",
  "talk-courier-repeat-1": "小吴摊手:「我知道的都说了。」",
  "talk-courier-repeat-2": "小吴笑了笑:「还是那句话,去快递柜那边看看。」",

  "search-garage-with-flashlight-1": "手电照进车库角落,你听见一声细弱的「喵」,心一下子提了起来。",
  "search-garage-with-flashlight-2": "光柱扫过墙角,一双圆眼睛在暗处亮了一下——就是这附近了。",

  "use-box-1": "纸箱轻轻一动,年糕从里面探出头,冲你「喵」了一声,像是等你等了很久。",
  "use-box-2": "你掀开纸箱盖,年糕蜷在里面,看见你便慢悠悠地站起来蹭了蹭手。",
};
