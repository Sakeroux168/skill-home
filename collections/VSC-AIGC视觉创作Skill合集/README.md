# VSC AIGC 视觉创作 Skill 合集

## 一句话用途

一套面向 AIGC 生图、角色摄影、稀有风格探索、旅行 Vlog、图片归档等任务的 Skill 合集，并提供 `$vsc` 统一入口自动选择合适 Skill。

## 来源

- **上游仓库**：`vibeshotclub/vsc-skills`
- **收藏时上游 commit**：`fcee81beb62a0907b206e62b269195dbd9aac4c3`
- **收藏日期**：2026-09-11
- **说明**：收藏时未在上游仓库根目录发现 LICENSE 文件，因此这里不复制整仓源码，只记录来源、版本和用途；需要使用时直接 clone 上游仓库。

## 里面有什么

| Skill | 用途 |
| --- | --- |
| `vsc` | 总入口，根据当前需求自动选择一个合适的 VSC Skill 并执行 |
| `character-candid-photography` | 成年角色真人 COS / 二次元的遮挡观察、长焦、手机快拍等抓拍提示词 |
| `rare-style-explorer` | 从 620 条稀有视觉亚风格中为主体组合生图提示词 |
| `shan-ze-school` | 山海经、异兽、东方神怪、工笔水墨奇幻方向 |
| `summer-boyfriend-pov` | 成年人物夏季泳装、伴侣 / 朋友视角的自然抓拍单图 |
| `vibeshot-candid-photography` | 真实生活感、偶然抓拍感、非常规机位的人像摄影提示词 |
| `virtual-couple-travel-vlog` | 虚拟情侣旅行照片墙、角色卡、视频提示词和最终 Vlog 工作流 |
| `codex-image-to-eagle` | 把 Codex 生成图片连同提示词、标签等归档到 Eagle |

## 怎么用

最简单的理解：

1. 整个仓库可以 clone 到本地。
2. 想用哪个 Skill，就把对应目录放进 Codex 的 Skills 目录。
3. 全部安装后，可以直接使用 `$vsc` 描述想做的作品，让它自动选择一个合适的 Skill。
4. 也可以直接调用具体 Skill，例如 `$rare-style-explorer`。

## 对我们的价值

当前先作为 **AIGC 视觉创作 Skill 参考库** 收藏。未来做角色、漫剧、连续视觉资产、图生视频工作流时，可按需要拆出其中的设计思路或单独使用某个 Skill。

## 更新检查

以后检查更新时，将这里记录的：

`fcee81beb62a0907b206e62b269195dbd9aac4c3`

与上游 `main` 最新 commit 比较即可。

如果不同，就说明收藏之后上游又有更新。
