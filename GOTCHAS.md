# 项目踩坑记录

## 1. ResizeObserver + clientWidth 导致移动端预览抖动

**现象**：Via 浏览器（Android 轻量浏览器）上简历预览持续抖动，多页时不抖，单页时抖。

**根因**：ResizeObserver 回调中用 `container.clientWidth` 计算缩放比例。`clientWidth` 排除 scrollbar 宽度，当 `zoom` 改变内容高度导致 scrollbar 出现/消失时，`clientWidth` 变化（差约 15-17px），重新触发 ResizeObserver → scale 变化 → zoom 变化 → scrollbar 状态变化 → 循环。多页时 scrollbar 始终存在所以不抖。

**修复**：用 `container.offsetWidth` 代替 `container.clientWidth`。`offsetWidth` 包含 scrollbar 宽度，不受 scrollbar 出现/消失影响。

**文件**：`src/components/preview/resume-preview.tsx` ResizeObserver 回调

**教训**：涉及缩放/布局尺寸计算时，优先用 `offsetWidth`（含 scrollbar）而非 `clientWidth`（排除 scrollbar），避免 scrollbar 状态变化引发反馈循环。

## 2. LAN IP 无法访问 Next.js 开发服务器

**现象**：通过 `192.168.x.x:3000` 在手机上访问 Next.js dev server 时页面白屏/无法加载，localhost 正常。

**根因**：Next.js dev server 默认只允许 `localhost` 访问 HMR websocket。LAN IP 被视为不安全来源，websocket 连接被拒绝，导致页面无法 hydrate。

**修复**：`next.config.ts` 中配置 `allowedDevOrigins`，自动检测本机 LAN IP 并加入白名单。

**文件**：`next.config.ts`

**教训**：Next.js dev server 需要显式配置 LAN IP 白名单才能从其他设备访问。生产环境不受影响。

## 3. Via 浏览器广告拦截导致预览空白

**现象**：Via 浏览器上简历预览区域完全空白，夸克浏览器正常。

**根因**：Via 内置广告拦截器误拦截了预览相关的请求或资源。

**修复**：在 Via 设置中关闭广告拦截（用户手动操作，非代码问题）。
