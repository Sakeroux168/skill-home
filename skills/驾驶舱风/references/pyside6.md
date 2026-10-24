# 驾驶舱风 · Qt 桌面(PySide6 / PyQt6)写法

完整的例子在 `E:\软件\百家号发布软件\企鹅号发布助手\gui\`:`theme.py`(主题)、`widgets.py`(大字区、卡片、圆环、胶囊、导航、开场动画)、`api_tab.py`(一整页怎么拼)。

## 目录

1. 起步:拷主题、套上
2. 控件靠名字拿样式(objectName / 动态属性)
3. 常用部件代码:repolish、大字区 Hero、问题卡片、分段按钮、圆环、状态胶囊、确认框、小问号、导航角标
4. 一页怎么拼
5. 坑(都踩过)

## 1. 起步

把 `assets/qt_theme.py` 和 `assets/icons/` 拷进项目(放一起),启动时:

```python
app = QApplication(sys.argv)
import qt_theme as TH
TH.apply(app, settings.get("theme", "浅色"))      # 换主题时再调一次,当场生效
```

`TH.cur()` 是当前这套颜色(dict),自己画的部件(圆环、胶囊、头像)**每次画的时候**从这拿,不要在构造时存下来,否则换主题不跟着变。

## 2. 控件靠名字拿样式

QSS 里已经写好了下面这些,控件 `setObjectName(...)` 就有样式:

| objectName | 是什么 |
|---|---|
| `primary` | 主按钮:实心蓝胶囊(一页只放一个) |
| `danger` | 危险按钮:实心红胶囊(停、现在发出去) |
| `pill` | 次要按钮:灰底胶囊;动态属性 `sel=true` 时橙字橙底 |
| `link` / `toggle` | 蓝字没框的按钮;`toggle` 可勾选,勾上时浅蓝底 |
| `cardBtn` | 问题卡片里的蓝字按钮 |
| `nav` | 左边导航(checkable) |
| `hero` | 大字区外框;动态属性 `open=false` 时没框、字更大、居中 |
| `heroBig` / `heroSub` / `heroMeta` | 大字(动态属性 `tone`= good/warn/bad)/ 下一步小字 / 上面一排小字 |
| `probCard` / `probTitle` | 问题卡片 / 卡片标题(`tone=done` 变灰) |
| `panel` / `stat` | 白色大块 / 统计卡片(`click=true` 时鼠标移上去变蓝边) |
| `seg` / `segBtn` | 分段按钮的底 / 每一段 |
| `search` | 圆角灰底搜索框 |
| `pageTitle` / `secTitle` / `muted` / `warnText` | 页标题 / 小节标题 / 说明字 / 红字警告 |
| `warnPill` / `hint` / `chip` | 橙色小标签 / 橙色提示条 / 灰色小胶囊 |
| `helpDot` | 小「?」 |
| `navBadge` | 导航角标 |
| `sidebar` / `brand` / `brandSub` | 左栏 / 软件名 / 副标题 |

动态属性改了要「repolish」一下样式才会刷新(见下)。

## 3. 常用部件

### repolish(改了动态属性后让样式重新套)

```python
def repolish(w, **props):
    changed = False
    for k, v in props.items():
        if w.property(k) != v:
            w.setProperty(k, v)
            changed = True
    if changed:
        w.style().unpolish(w)
        w.style().polish(w)
        w.update()
```

### 大字区 Hero

```python
class Hero(QFrame):
    """一句大字 + 一行下一步 + 按钮。open=False:明细收起,大字居中、更大;open=True:缩成一条卡片,按钮在右。
    h.meta(上面一排:日期下拉、刷新…)/ h.acts(按钮那排)是 QHBoxLayout,自己往里加。"""
    BIG = (52, 26)

    def __init__(self, open_=False, parent=None):
        super().__init__(parent)
        self.setObjectName("hero")
        self._meta_w, self._acts_w = QWidget(), QWidget()
        self.meta, self.acts = QHBoxLayout(self._meta_w), QHBoxLayout(self._acts_w)
        for l in (self.meta, self.acts):
            l.setContentsMargins(0, 0, 0, 0)
            l.setSpacing(8)
        self.big, self.sub = QLabel(""), QLabel("")
        self.big.setObjectName("heroBig")
        self.sub.setObjectName("heroSub")
        self.grid = QGridLayout(self)
        self._open = None
        self.set_open(open_, animate=False)

    def set(self, big, sub="", tone=""):
        self.big.setText(big)
        self.sub.setText(sub)
        self.sub.setVisible(bool(sub))
        repolish(self.big, tone=tone)          # good 绿 / warn 橙 / bad 红 / "" 黑

    def set_open(self, on, animate=True):
        if self._open == on:
            return
        self._open = on
        for w in (self._meta_w, self.big, self.sub, self._acts_w):
            self.grid.removeWidget(w)
        L, C, R, V = Qt.AlignLeft, Qt.AlignHCenter, Qt.AlignRight, Qt.AlignVCenter
        if on:                                   # 一条卡片:字在左、按钮在右
            self.grid.setContentsMargins(20, 14, 20, 14)
            self.grid.addWidget(self._meta_w, 0, 0, L | V)
            self.grid.addWidget(self.big, 1, 0, L | V)
            self.grid.addWidget(self.sub, 2, 0, L | V)
            self.grid.addWidget(self._acts_w, 0, 1, 3, 1, R | V)
            self.sub.setAlignment(L)
        else:                                    # 居中、大字、按钮在下
            self.grid.setContentsMargins(20, 26, 20, 18)
            self.grid.addWidget(self._meta_w, 0, 0, C)
            self.grid.addWidget(self.big, 1, 0, C)
            self.grid.addWidget(self.sub, 2, 0, C)
            self.grid.addWidget(self._acts_w, 3, 0, C)
            self.sub.setAlignment(C)
            self._acts_w.setContentsMargins(0, 18, 0, 0)
        repolish(self, open="true" if on else "false")
        start, end = (self.BIG[0], self.BIG[1]) if on else (self.BIG[1], self.BIG[0])   # 收起 52px ↔ 展开 26px
        if animate:                              # 字号跟着动,不要「啪」一下跳
            anim = QVariantAnimation(self, startValue=float(start), endValue=float(end), duration=320,
                                     easingCurve=QEasingCurve.OutCubic)
            anim.valueChanged.connect(lambda px: self.big.setStyleSheet(f"font-size:{int(px)}px;"))
            anim.start(QAbstractAnimation.DeleteWhenStopped)
        else:
            self.big.setStyleSheet(f"font-size:{end}px;")
```

页面上:收起时 Hero + 三张问题卡片放进一个最宽 920px 的中间栏,上下用弹性空白把它们托到页面中间偏上;点「﹀ 看每个号的明细(12 条)」→ `hero.set_open(True)`、列表淡入。

### 问题卡片

```python
class ProbCard(QFrame):
    """图标 + 一句话 + 处理按钮。set("8 条横屏 / 偏方", "warn") / set("没有横屏 / 偏方", "done") / set("横屏:还没查", "")。"""
    def __init__(self, glyph, title, buttons):
        super().__init__()
        self.setObjectName("probCard")
        self.setCursor(Qt.PointingHandCursor)
        h = QHBoxLayout(self); h.setContentsMargins(16, 14, 16, 14); h.setSpacing(14)
        self.icon = QLabel(glyph); self.icon.setFixedSize(40, 40); self.icon.setAlignment(Qt.AlignCenter)
        h.addWidget(self.icon)
        v = QVBoxLayout(); v.setSpacing(1)
        self.title = QLabel(title); self.title.setObjectName("probTitle"); v.addWidget(self.title)
        row = QHBoxLayout(); row.setSpacing(14)
        for b in buttons:
            b.setObjectName("cardBtn"); row.addWidget(b)
        row.addStretch(1); v.addLayout(row); h.addLayout(v, 1)
        sh = QGraphicsDropShadowEffect(self); sh.setBlurRadius(28); sh.setOffset(0, 4); sh.setColor(QColor(16, 24, 40, 18))
        self.setGraphicsEffect(sh)
        self.buttons = buttons

    def set(self, title, tone=""):
        t = TH.cur()
        self.title.setText(title)
        repolish(self.title, tone=tone)
        col, bg = (t["ok"], t["ok_bg"]) if tone == "done" else (t["orange"], t["warn_bg"]) if tone == "warn" else (t["acc"], t["acc_bg"])
        self.icon.setStyleSheet(f"background:{bg};color:{col};border-radius:12px;font-family:'Segoe MDL2 Assets';font-size:18px;")

    def mouseReleaseEvent(self, e):                # 点卡片空白 = 点第一个按钮
        if self.buttons and self.buttons[0].isEnabled():
            self.buttons[0].click()
```

### 分段按钮「全部 / 要处理 / 能发 / 已发」

```python
class Segmented(QFrame):
    changed = Signal(str)
    def __init__(self, items):                  # [("all", "全部"), ("bad", "要处理"), …]
        super().__init__(); self.setObjectName("seg")
        h = QHBoxLayout(self); h.setContentsMargins(3, 3, 3, 3); h.setSpacing(2)
        self.group = QButtonGroup(self); self.btns = {}
        for k, text in items:
            b = QPushButton(text); b.setObjectName("segBtn"); b.setCheckable(True)
            b.clicked.connect(lambda _=False, k=k: self.changed.emit(k))
            self.group.addButton(b); h.addWidget(b); self.btns[k] = b
        self.btns[items[0][0]].setChecked(True)
    def set_text(self, k, text): self.btns[k].setText(text)      # 「要处理 3」数字跟着变
```

### 圆环

```python
class Ring(QWidget):
    def __init__(self, size=60, width=7, colkey="acc"):
        super().__init__(); self.setFixedSize(size, size); self._w, self._v, self.colkey = width, 0.0, colkey
    def set_value(self, v, animate=True):        # 0~1;变的时候转过去(QVariantAnimation 1100ms,同上)
        self._v = max(0.0, min(1.0, v)); self.update()
    def paintEvent(self, _):
        t = TH.cur(); p = QPainter(self); p.setRenderHint(QPainter.Antialiasing)
        r = QRectF(self._w / 2 + 1, self._w / 2 + 1, self.width() - self._w - 2, self.height() - self._w - 2)
        pen = QPen(QColor(t["track"]), self._w); pen.setCapStyle(Qt.RoundCap); p.setPen(pen); p.drawArc(r, 0, 360 * 16)
        if self._v > 0:
            pen.setColor(QColor(t[self.colkey])); p.setPen(pen); p.drawArc(r, 90 * 16, -int(360 * 16 * self._v))
```

### 状态胶囊(列表里画)

用 `QStyledItemDelegate` 在状态那一列画胶囊,不用整行刷颜色:

```python
def tone_of(s):
    s = (s or "").strip()
    if s.startswith(("没发成", "失败", "出错")): return "bad"
    if s.startswith(("要处理", "不确定", "结果不明", "还差", "多发", "跳过")): return "warn"
    if s.startswith(("已发", "发完", "够了")): return "ok"
    if s.startswith(("能发", "正在", "摆好", "排队")): return "acc"
    return "plain" if s else ""

def draw_pill(p, x, cy, text, tone, max_w):
    t = TH.cur()
    bg, fg = {"bad": ("bad_bg", "bad"), "warn": ("warn_bg", "warn"), "ok": ("ok_bg", "ok"),
              "acc": ("acc_bg", "acc"), "plain": ("soft", "tx2")}[tone]
    f = QFont(p.font()); f.setPixelSize(12); f.setBold(True); p.setFont(f)
    w = min(max_w, QFontMetrics(f).horizontalAdvance(text) + 18)
    r = QRectF(x, cy - 11, w, 22)
    p.setPen(Qt.NoPen); p.setBrush(QColor(t[bg])); p.drawRoundedRect(r, 11, 11)
    p.setPen(QColor(t[fg])); p.drawText(r, Qt.AlignCenter, text)
    return w
```

组那一行(号 / 人):圆形首字头像(28px,底色见 tokens.md,不用红橙)+ 名字粗体 + 「N 条」灰字 + 状态胶囊 + 小进度条「3/20」。

### 确认框(防手滑)

```python
def ask(parent, title, text, yes, no="先不", default_no=False, head="", danger=False):
    """中文动词按钮。会真发 / 真删的:default_no=True(回车 = 先不)、danger=True(真做的按钮是红的)、
    head = 第一行红字加粗写后果。"""
    box = QMessageBox(QMessageBox.Question, title, text, QMessageBox.NoButton, parent)
    if head:
        box.setTextFormat(Qt.RichText)
        box.setText(f'<p style="color:{TH.cur()["danger"]};font-weight:bold">{html.escape(head)}</p>'
                    + html.escape(text).replace("\n", "<br>"))
    b_yes = box.addButton(yes, QMessageBox.YesRole)
    if danger:
        b_yes.setObjectName("danger")
    b_no = box.addButton(no, QMessageBox.NoRole)
    box.setDefaultButton(b_no if default_no else b_yes)
    box.setEscapeButton(b_no)
    box.exec()
    return box.clickedButton() is b_yes

# ask(self, "现在发布", "7 个号一共 52 条 …", "现在发出去", "先不发", default_no=True, danger=True,
#     head="现在马上发出去(不是定时),发了只能去后台删")
```

### 小问号

```python
HELP = {"偏方": "偏方 = 画面不是标准竖屏 9:16(比如 3:4、正方形)…"}
def help_dot(key):
    lab = QLabel("?"); lab.setObjectName("helpDot"); lab.setFixedSize(16, 16)
    lab.setAlignment(Qt.AlignCenter); lab.setCursor(Qt.WhatsThisCursor); lab.setToolTip(HELP.get(key, key))
    return lab
```

### 导航角标(数字变两位时变宽)

```python
def set_badge(lab, text):
    lab.setText(text)
    f = QFont(lab.font()); f.setPixelSize(11); f.setBold(True)
    lab.setFixedWidth(max(18, QFontMetrics(f).horizontalAdvance(text) + 12))
    lab.setVisible(bool(text))
```

### 选中了东西时主按钮变色改字

```python
sel = self.selected_rows()
self.b_pub.setText(f"只发选中的 {n} 条" if sel else f"现在发布 {n} 条")
repolish(self.b_pub, sel=bool(sel))            # QSS: QPushButton#primary[sel="true"] 橙色
self.b_unsel.setVisible(bool(sel))              # 旁边一个 pill:「× 取消选中」,点了 clearSelection()
# 切页签 / 清空搜索 / 改完一条标题 → self.tree.clearSelection()
```

## 4. 一页怎么拼

```
QWidget (page)
├─ Hero(open=False)           meta: 日期下拉 + 刷新(link) + 提示(link);acts: pill「到点…」 … 间隔 28px … primary「现在发布 N 条」+ danger「停」(干活时才出来)
├─ 三张 ProbCard(一排,间距 12)
├─ link「﹀ 看每个号的明细(N 条)」
└─ 明细(默认藏):Segmented + 小问号 + toggle「只看没发完的」… 搜索框(search)+ pill「更多 ▾」
   └─ QTreeWidget(分组 + 胶囊代理)
   └─ 底下一行:绿字「没选:管全部 N 条」/ 选中时浅蓝底「只管选中的…」+ 展开日志(link)
```

数据一变就算一遍:大字、卡片、分段数字、按钮字、角标一起更新(写一个 `_update_sum()` 统一刷)。

## 5. 坑(都踩过)

- **圆角比高度的一半还大,Qt 就画成直角**。胶囊按钮要配 `min-height`,保证「高度 ≥ 圆角 × 2」(主按钮 padding 9 + min-height 20 → 圆角 19;收起时 padding 12 + min-height 24 → 圆角 25)。
- **`QFrame#xxx` 的规则会套到同名的 QLabel 上**(QLabel 是 QFrame 的子类)。框和标签别用同一个 objectName。
- **颜色别写死在控件的 setStyleSheet 里**:换主题时它不变,深色下变成白底白字。写进主题 QSS;非写不可的,换主题后重刷一遍(开个 `retheme()`)。
- 改了动态属性(tone / open / sel)要 `repolish`,不然样式不刷新。
- 离屏截图(QT_QPA_PLATFORM=offscreen)中文和图标是方块:`QFontDatabase.addApplicationFont` 加载 `msyh.ttc`、`msyhbd.ttc`、`segmdl2.ttf`。
- `✕ ⚠` 这类符号有的字体没有,会显示成方块;用 `×`,警告用颜色和字说,别靠符号。
- 删控件用 `deleteLater()` 前先 `hide()`,不然重画时新旧两行会叠在一起。
- 小屏(1366×768,可用高度 ~728):弹窗按 `screen().availableGeometry()` 开,别写死 760 高。
- 设置窗口:路径框后面的提示放到框下面一行,别夹在框和「选…」之间把窗口撑宽;关掉横向滚动条;各组标签宽度一致。
- 左栏数字角标要跟字宽变,两位数会被切成「1(」。
