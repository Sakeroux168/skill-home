# 驾驶舱风 · 网页写法

把 `assets/web_theme.css` 放进项目引入就行(纯 CSS,不依赖框架;React / Vue 里一样用这些类名)。颜色都是 CSS 变量(`var(--acc)` …),换主题只要改 `<html data-theme="dark">`。

## 页面骨架

```html
<div class="shell">
  <aside class="sidebar">
    <div class="brand"><span class="logo">➤</span>软件名</div>
    <div class="brand-sub">一句话副标题</div>
    <a class="nav on">今天</a>
    <a class="nav">页面一 <span class="badge">12</span></a>
    <a class="nav" style="margin-top:auto">设置</a>
    <div class="muted" style="padding-left:12px">第 3 版</div>
  </aside>

  <main class="page">
    <div class="center-col">
      <section class="hero" id="hero">
        <div class="meta">要发哪天的:<select class="search"><option>10.24(今天)</option></select>
          <button class="btn-link">刷新</button></div>
        <div class="big">7 条可以发了</div>
        <div class="sub">还有 3 条有点小问题,处理好能多发 3 条</div>
        <div class="acts">
          <button class="btn-pill">到点自动发…</button>
          <span style="width:28px"></span>
          <button class="btn-primary" id="go">现在发布 7 条</button>
        </div>
      </section>

      <div class="cards">
        <div class="prob-card done"><span class="ic">✓</span><div><div class="t">没有横屏 / 偏方</div><button class="act">转标准竖屏</button></div></div>
        <div class="prob-card warn"><span class="ic">!</span><div><div class="t">3 条标题要整理</div><button class="act">整理标题</button></div></div>
        <div class="prob-card idle"><span class="ic">▦</span><div><div class="t">水印:还没查</div><button class="act">检查</button></div></div>
      </div>
      <p style="text-align:center"><button class="btn-link" id="more">﹀ 看每个号的明细(12 条)</button></p>
    </div>

    <section id="detail" hidden>
      <div style="display:flex;gap:8px;align-items:center">
        <div class="seg"><button class="on">全部 12</button><button>要处理 3</button><button>能发 7</button><button>已发 2</button></div>
        <span class="help" title="要处理 = 还有问题、现在不会发的;鼠标放在那一格上看为什么">?</span>
        <button class="btn-toggle">只看没发完的号</button>
        <input class="search" placeholder="搜标题…(Ctrl+F)" style="margin-left:auto">
      </div>
      <table class="list">…分组行 tr.group(头像 + 名字 + 胶囊 + 小进度条),做完的 tr.done 沉到最下面…</table>
    </section>
  </main>
</div>
```

展开明细:`hero.classList.add("open")`、`detail.hidden = false`,大字从 52px 缩到 26px(CSS 里已经有过渡)。

## 状态胶囊

```js
function toneOf(s) {
  if (/^(没发成|失败|出错)/.test(s)) return "bad";
  if (/^(要处理|不确定|结果不明|还差|多发|跳过)/.test(s)) return "warn";
  if (/^(已发|发完|够了)/.test(s)) return "ok";
  if (/^(能发|正在|摆好|排队)/.test(s)) return "acc";
  return "";
}
// <span class="pill ${toneOf(text)}">${text}</span>
```

## 圆环(SVG)

```html
<svg width="60" height="60" viewBox="0 0 60 60">
  <circle cx="30" cy="30" r="26" fill="none" stroke="var(--track)" stroke-width="7"/>
  <circle cx="30" cy="30" r="26" fill="none" stroke="var(--acc)" stroke-width="7" stroke-linecap="round"
          stroke-dasharray="163.4" stroke-dashoffset="calc(163.4 * (1 - var(--p)))"
          transform="rotate(-90 30 30)" style="--p:.62; transition: stroke-dashoffset 1.1s"/>
</svg>
```

(163.4 = 2πr;`--p` 填 0~1。)

## 确认框:会真发 / 真删的,回车 = 先不

```js
function ask({title, head, text, yes, no = "先不", danger = false}) {
  return new Promise(ok => {
    const d = document.createElement("dialog");
    d.className = "confirm";
    d.innerHTML = `<h3 style="margin:0 0 6px">${title}</h3>${head ? `<p class="head">${head}</p>` : ""}
      <p style="white-space:pre-line;margin:0">${text}</p>
      <div class="row"><button class="btn" data-v="0">${no}</button>
      <button class="${danger ? "btn-danger" : "btn-primary"}" data-v="1">${yes}</button></div>`;
    document.body.append(d);
    d.querySelector('[data-v="0"]').autofocus = true;          // 回车 = 先不
    d.addEventListener("click", e => { const v = e.target.dataset?.v; if (v) { d.close(); d.remove(); ok(v === "1"); } });
    d.addEventListener("cancel", () => { d.remove(); ok(false); });   // Esc = 先不
    d.showModal();
  });
}
// await ask({title: "现在发布", head: "现在马上发出去(不是定时),发了只能去后台删",
//            text: "7 个号一共 52 条…", yes: "现在发出去", no: "先不发", danger: true})
```

## 选中了东西

```js
const n = selected.length;
go.textContent = n ? `只发选中的 ${n} 条` : `现在发布 ${total} 条`;
go.classList.toggle("sel", n > 0);
unsel.hidden = !n;                       // <button class="btn-pill sel" id="unsel">× 取消选中</button>
```

## 网页上要注意

- 字号最小 12px;说明字用 `--mu`,不要再淡。
- 动画 200~400ms、`cubic-bezier(.2,.7,.2,1)`;数字变化可以滚动(从旧数滚到新数)。
- 手机宽度:左栏收起、大字缩到 36px、按钮换行。
- 图标用一套线性图标(比如 Tabler / Lucide 的 outline),别混 emoji。
