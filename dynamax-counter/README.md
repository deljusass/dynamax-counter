# ✨ 极巨大冒险计数器 · PWA 版

宝可梦 剑/盾 · 冠之雪原 · 极巨大冒险刷闪计数器。纯前端、单页、可离线、可「安装」成手机/电脑上的独立 App。

## 文件说明

| 文件 | 作用 | 能不能删 |
| --- | --- | --- |
| `index.html` | 计数器本体（v4 + PWA 接入） | 不能 |
| `manifest.json` | PWA 清单：名字、图标、全屏方式、主题色 | 不能 |
| `sw.js` | Service Worker：离线缓存 + 图标缓存 | 不能（删了就只能在线用） |
| `icon.svg` | 应用图标（矢量，Chrome/Edge 直接可用） | 不能 |
| `icon-maskable.svg` | 安卓自适应图标（满幅版） | 不能 |
| `icon-gen.html` | 一键生成 3 个 PNG 图标的小工具 | 生成完可删 |
| `icon-192.png` 等 | 由 `icon-gen.html` 生成（可选） | 生成后建议留着 |

> PNG 图标不是必需：现代 Chrome / Edge 能直接读 SVG 图标完成安装。生成 PNG 主要是为了让 iOS 主屏图标、以及部分老版本浏览器也好看。

## 一、本地先看一眼

直接双击 `index.html` 就能用——计数、统计、导出导入都正常。

只是 `file://` 协议下浏览器不允许注册 Service Worker，所以「离线」和「安装」不生效。想要完整功能，用下面任意一种 HTTP(S) 方式。

## 二、花 30 秒上线（推荐 Netlify Drop）

1. 打开 <https://app.netlify.com/drop>
2. 把 **整个 `dynamax-counter` 文件夹**拖进页面（不是单个 html）
3. 等几秒，拿到 `https://xxxx.netlify.app` 这样的网址
4. 手机、电脑都打开这个网址

不想注册也行，Netlify Drop 允许匿名部署（后续想改可以登录认领）。

### 备选：GitHub Pages

1. 新建仓库，把本文件夹里所有文件传到仓库根目录
2. Settings → Pages → Source 选 `main` / `/ (root)` → Save
3. 一两分钟后访问 `https://<用户名>.github.io/<仓库名>/`

### 备选：自己有服务器

把整个文件夹丢进任意静态目录即可，**必须走 https://**（或 localhost），否则 Service Worker 不注册。

## 三、安装成 App

**iPhone / iPad（Safari）**
打开网址 → 底部「分享」→「添加到主屏幕」→ 命名 → 添加。之后从主屏打开就是全屏，没有地址栏。

**Android（Chrome / Edge）**
打开网址 → 右上角菜单 →「安装应用」/「添加到主屏幕」。

**电脑（Chrome / Edge）**
打开网址 → 地址栏右侧的安装图标（小显示器 / 加号）→ 安装。会以独立窗口运行，有自己的任务栏图标。

**Mac（Safari 17+）**
菜单栏 文件 → 添加到程序坞。

## 四、图标（可选，建议做一次）

1. 双击打开 `icon-gen.html`
2. 点「生成并下载 3 个图标」，允许浏览器下载多个文件
3. 把下载到的 `icon-192.png`、`icon-512.png`、`icon-512-maskable.png` 放进 `dynamax-counter` 文件夹（和 `index.html` 同级，文件名别改）
4. 重新上传 / 刷新页面，安装后图标就是精灵球 + 金闪

## 五、更新版本

改完 `index.html` 重新上传即可。为了让大家拿到新版本，记得把 `sw.js` 顶部的版本号改一下：

```js
const CACHE = 'dynamax-counter-v6';       // v5 → v6
const IMG_CACHE = 'dynamax-counter-img-v6';
```

旧缓存会在下次打开时自动清掉。

## 六、数据在哪、怎么备份

- 数据存在浏览器 `localStorage`（主存储 + 一份备份 key），只在本机、本浏览器里。
- 首页 →「统计」→「📤 导出备份」会下载一个 JSON，里面包含所有计数、获取记录、设置。
- 换手机 / 清浏览器数据前先导出，新设备「📥 导入备份」恢复。
- 卸载 PWA 一般不会删数据，但「清除浏览器数据」会。

## 七、这一版相对 v4 的改动

功能全部保留（可视化选择器、最近 chip、长按连计数、里程碑、音效震动、统计页、导出导入、三态主题、双备份），只做了 PWA 接入和几处小修：

1. 加 `manifest.json` + `sw.js`，可安装、可离线；宝可梦图标也进缓存，断网时立绘仍在
2. `<head>` 补 manifest / icon / apple-touch-icon / mobile-web-app-capable
3. 全面屏安全区适配（`env(safe-area-inset-*)`），刘海机和底部手势条不压内容
4. 长按跨过多个里程碑时，提示改为报「跨到的最高档」，不再只报第一档
5. `load()` 里去掉重复分支，导入/读取逻辑保持一致
6. Service Worker 只预缓存真实存在的文件，缺图标也不会安装失败

## 八、已知限制

- 宝可梦立绘走 `raw.githubusercontent.com`（PokeAPI 官方 artwork）。第一次打开需要联网，之后进缓存可离线。
- 首次打开若网络较慢，立绘会先显示占位「?」，加载完自动替换。
- 局域网 IP（如 `http://192.168.1.5:8000`）下 Service Worker 不生效，属于浏览器安全策略，不是 bug。
