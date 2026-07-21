# 一局 · 模组封面生图简报

统一画风后缀(每张 prompt 末尾追加):

> Chinese storybook illustration, warm dusk paper texture, soft watercolor and gouache, cinematic but gentle, no text, no watermark, no UI chrome

| id | path | size | prompt 要点 |
| --- | --- | --- | --- |
| lost-cat | public/modules/lost-cat/cover.webp | 1536x1024 | 小区暮色,绿化带与单元楼,一只橘白猫身影若隐若现 |
| elevator | public/modules/elevator/cover.webp | 1536x1024 | 故障电梯轿厢内应急灯,几个人影紧张等待 |
| blind-date | public/modules/blind-date/cover.webp | 1536x1024 | 中式餐厅相亲饭局,暖灯与略显尴尬的桌面 |
| chunyun | public/modules/chunyun/cover.webp | 1536x1024 | 春运夜晚手机抢票界面氛围(不要可读文字),窗外灯火 |
| plant-week | public/modules/plant-week/cover.webp | 1536x1024 | 阳台绿植与日历/日照,温馨居家一周照顾感 |

## 局内插图(M12)

路径约定:`public/modules/{id}/scenes/*.webp`。开场可用封面复用;`byEventId` 挂关键推进节点。

| 模组 | 关键场景文件 |
| --- | --- |
| lost-cat | opening / guard / greenbelt / garage / found |
| elevator | opening / alarm / rescue |
| blind-date | opening / toast |
| chunyun | opening / refresh / ticket |
| plant-week | opening / water / sun / healthy |
