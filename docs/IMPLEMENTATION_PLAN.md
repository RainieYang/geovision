# GeoVision 实施说明

更新日期：2026-09-09。项目目录：`D:/yangyi/user`。

## 1. 已确认的目标和边界

- 面向海外项目客户的英文个人技术品牌网站，重点展示 GIS、实时数据和信号可视化能力。
- 每周投入 10～15 小时，首版完成两个精简完整的真实 SDK Demo。
- 首页先显示媒体区域，素材未提供时留白；后续可替换图片或视频。地图交互由用户主动启动。
- 视觉参考图是布局与风格参考，不是功能验收清单，不将其中示意文字、虚构指标或项目当作真实资料。
- 名称统一为 GeoVision，不沿用第二张图中的 GeoSignal；维持仅英文，不复制参考图的中文标签。
- 此说明更新此前聊天计划。涉及版本、SDK 能力、性能验收和素材策略时，以本说明为准。

本轮完成源码、接口、示例和包元数据的静态核对；尚未运行浏览器 Demo、测量性能或验证生产部署。没有修改两个 SDK 源码，没有启动网站开发或发布。

## 2. SDK 核对结果

### 地图 SDK

源码：`D:/yangyi/map-engine`。

当前 package.json：`map-engine-3d@0.0.24`，ESM JavaScript 包，入口为 `src/index.js`，不是预构建 dist 入口。依赖中固定 Cesium `1.91.0`，另有 OpenLayers。

已在源码找到的能力：

| 网站需求 | 现有实现/入口 | 首版处理 |
| --- | --- | --- |
| 初始化、尺寸变化、销毁 | MapEngine 生命周期 | 页面薄封装，不重写地图引擎 |
| 批量设备更新 | setState / applyPatch | 初始化一次，后续每 200ms 批量 patch |
| 2D/3D | switchView | 直接接入，验证状态与选择保留 |
| 对象选择与定位 | object:click、设备选择、focusOnTarget / flyTo | 与 React 列表和详情同步 |
| 轨迹 | TrackLayerRuntime、appendTrackPoint | 保留选中设备的有界轨迹展示 |
| 历史回放 | ReplayEngine、loadReplay 等 | 能力已存在，首版仍不展开完整回放 UI |
| 无人机 3D 展示 | CesiumDevicePresentationAdapter | 已有模型/图标层级方案，首版无模型时用图标 |
| 贴地、遮挡、相机观察 | 对应 Cesium 适配模块 | 复用现有策略，实际场景单独验证 |

接入注意事项：

1. 给定源码目录未找到截图中的 `map-engine-3d-0.0.24.tgz`。开发阶段可从当前源码制作并验证项目本地包，不必等待原 tgz；生产构建固定验证后的包与校验值。
2. 当前包 files 仅包含 src。网页工程需要独立复制 Cesium 的 Workers、Assets、Widgets 等静态资源，并在加载地图模块前配置资源基础路径。不能假定安装 npm 包就自动得到 `/cesium/`。
3. 现有香港/离线预设会探测本地或当前主机 8080 端口服务，不能原样用于海外公开站点。网站使用独立显式地图配置；底图与地形服务是上线前必需资源。
4. 不沿用源码中的默认地图服务访问配置；网站使用独立配置，记录服务来源、署名和访问范围。配置资料不含密钥正文。
5. 当前包未声明 TypeScript types 入口。网站只对使用到的公共接口补薄类型声明，不为了网站重构整个 SDK。
6. 文档部分描述早于当前源码：Core 现已导入控件和绘制模块。接入时明确使用 `controls: false`，由网站实现统一英文工具栏；不能假设默认没有 SDK 控件。
7. 避免逐设备独立调用 applyPatch；当前方法还会获取状态并发出事件。按一个 tick 汇总更新，避免业务 UI 订阅全量高频状态。

证据位置：`package.json`、`src/index.js`、`src/core/MapEngine.js`、`src/application/presets.js`、`src/engine3d/CesiumMap.js`、`src/engine3d/CesiumDevicePresentationAdapter.js`、`src/track-layer/TrackLayerRuntime.js`、`UAV_3D_PRESENTATION.md`。

### 频谱 SDK

源码：`C:/Users/dapen/Documents/Codex/2026-08-19/new-chat-3`。

已找到并读取包内 package.json：

- `outputs/signal-visualization-core-1.2.0.tgz` → `@signal-visualization/core@1.2.0`。
- `outputs/signal-visualization-react-1.2.0.tgz` → `@signal-visualization/react@1.2.0`。
- React 包声明支持 React `>=18 <20`，Core `>=1.0.0 <2.0.0`。

截图中的 `signal-visualization-core-1.2.0-sample-tooltip.tgz` 未在给定目录找到。当前源码已有 sample tooltip 逻辑，但这不证明标准 tgz 与截图中的修订包相同。实施时比较包内实现与当前源码，只采用一份经过验收的固定包，不混用同版本不同内容。

| 网站需求 | 已有能力 | 首版处理 |
| --- | --- | --- |
| 频谱、瀑布图 | Core 和 React 组件 | 直接集成 |
| 星座图、波形 | 已有图表实现 | 首版暂不新增页面或面板 |
| Current、Max Hold、Average | SpectrumTraceProcessor | 首版展示 Current、Max Hold |
| 峰值、标记、选频段测量 | SignalChart 公共 API | 首版峰值；选频段测量后续开放 |
| 频谱/瀑布图联动 | SignalChartLinkGroup | 首版联动频率视图与十字光标 |
| 瀑布图冻结与历史查询 | 公共 handle 方法 | 暂停与清除；完整历史分析后置 |
| 性能统计 | getPerformanceStats | 展示 Data FPS、Render FPS、CPU 绘制提交耗时 |
| 二进制输入 | binary 子入口和 WebSocket 示例 | 能力可作为案例素材，首版不部署实时服务 |

接入注意事项：

1. React 层已有生命周期适配，无需再造另一套图表组件。频谱通过 handle 获取 Core 实例后 setData；瀑布图使用 appendData 命令流。
2. 不照搬演示项目里通过 React state 持续更新频谱帧的写法；网站把高频更新放入独立运行时，面板数据约每秒刷新一次。
3. 频谱输入数组在提交帧完成前按 SDK 所有权约定管理；不在未完成消费时随意改写已经提交的数组。瀑布图只使用一条命令数据路径，避免 props 和 appendData 重复输入同一帧。
4. 源码 TooltipOverlay 中存在硬编码中文“频率”“功率”。全英文站必须处理这个差异：对最终采用包验证文字；确有中文时制作单独、可追溯的最小英文修订包，不直接修改源仓库或 node_modules。可配置文字优先走配置。
5. SDK 没有实现 FFT 计算。首版输入是模拟的频域功率数据，案例不得宣称完成了浏览器实时 IQ→FFT 信号处理。
6. p95RenderTimeMs 来自 JavaScript 绘制调用前后计时，不能标为 GPU 执行耗时、网络延迟或端到端延迟。

证据位置：两个 package.json、`packages/core/src/index.ts`、`packages/core/src/api/SignalChart.ts`、`packages/core/src/core/RenderLoop.ts`、`packages/core/src/core/Engine.ts`、`packages/core/src/types/performance.ts`、`packages/core/src/overlay/TooltipOverlay.ts`、`packages/react/src/types.ts`、`examples/react-dashboard/src/main.tsx`。

## 3. 两张参考图的使用方式

归档在 `docs/references/`，只作为设计资料，不直接当作官网背景或真实 Demo 截图使用。

- 第一张：提取深色背景、青蓝强调、左文右图首屏、细边框和专业数据面板风格。
- 第二张：采用首页、Demo 入口、地图工作区、频谱工作区的独立页面结构。
- 首页保持纵向阅读节奏，不把项目、关于、联系压缩成一排密集小面板。
- 地图 Demo：左设备列表、中地图、右详情/遥测；首版底部放状态与模拟控制，不出现未实现的历史回放时间轴。
- 频谱 Demo：顶部参数，主区上下频谱/瀑布图，右侧测量和显示控制。
- 蓝青色用于操作、选中和数据重点；不添加参考图里的大量轨道线、告警红圈、强光和未经实现的功能。
- 首页明确个人开发服务属性，不直接采用参考图中的 “Monitoring Platform” 产品化标题。

网站主标题：`Real-time GIS & Signal Visualization for the Web`。

导航：Home、Demos、Projects、About、Contact。主 CTA：Explore Demos；次 CTA：Discuss a Project。空 Blog、搜索、Download CV 不显示。

## 4. 页面与首版功能

路由：`/`、`/demos`、`/demos/geospatial`、`/demos/spectrum`、`/projects`、`/about`、`/contact`。

### 品牌页面

首页结构：Hero → 四项能力 → 两个 Demo → 两个项目 → About 摘要 → Contact。

项目只展示 Map Engine / Real-time Geospatial Monitoring 与 RF Visualization SDK 两个有来源的案例，不复制参考图的数字孪生项目。案例按问题、贡献、方法、结果组织，未测性能不写成已证实成绩。

### 地图 Demo

- 170 个模拟对象：50 UAV、100 Vehicle、20 Sensor，5Hz 批量更新。
- 类型过滤、列表与地图选择同步、定位、2D/3D、Home、暂停/恢复。
- 全部对象的最近 5 分钟数据在应用有界缓冲保存；仅选中设备绘制轨迹和遥测曲线，按当前会话积累。
- 默认图标，不依赖 GLB。已有 LOD 可在素材齐全后接入，不在首版重新开发。
- 显示对象数、实际更新率、测量后的帧率；始终标记 `Simulated Data`。
- SDK 有回放能力，但首版不增加回放录制、时间轴、速度和状态切换的完整测试范围。

### 频谱 Demo

- Spectrum + Waterfall，2,048 点，30Hz 模拟输入。
- Current、Max Hold、峰值、中心频率、Span、显示幅度范围、暂停/恢复、清除。
- 单信号、多信号、间歇干扰三个可重置场景。
- 频率视图与十字光标联动；输入单位为 Hz，UI 可显示 MHz/GHz。
- 更改中心频率/Span 后更新坐标与模拟数据，清理不再属于当前频率网格的瀑布图历史和 Hold 数据。
- 不展示无处理实现的 RBW、Detector，不把随机曲线称为真实采集。

## 5. 素材占位与替换约定

所有媒体统一通过媒体配置映射读取，页面不写死文件名。预留 id：hero、geospatial-cover、spectrum-cover、map-project、signal-project、about、social-default。

每项支持 type（image/video）、src、poster、alt、aspectRatio、objectPosition。无 src 时不输出 img/video，不请求空 URL，不出现浏览器破图；使用同尺寸的深色留白容器。开发说明放在材料清单里，不把实现术语写进产品文案。

| 位置 | 当前处理 | 后续替换材料 |
| --- | --- | --- |
| 首页 Hero 右侧 | 保留深色留白与启动轻量场景入口 | 地图场景图，建议保留 2560×1440 原稿；或短视频及 poster |
| 两张 Demo 封面 | 16:9 留白，标题/说明/启动按钮保留 | 每个 Demo 一张真实截图，建议 1600×900 |
| 两张项目封面 | 16:9 留白 | 可复用 Demo 截图 |
| About 视觉 | 4:5 留白，移动端未提供时收起 | 个人照或可公开工作环境图 |
| 视频区 | 有媒体时显示，没有时不制造空播放按钮 | MP4/WebM 与封面，内容表达完整但不依赖声音 |
| 社交分享图 | 开发后生成文字品牌版即可 | 建议 1200×630；可后续换真实截图 |

图片与视频可以暂缺；实际地图和频谱 Demo 的 canvas 不能用留白代替已完成验收。地图资源失败时明确显示失败/降级状态，不能用概念图假装运行成功。

暂不需要准备：通用科技背景、付费地球素材、大量 3D 模型、完整宣传片、定制 Logo。

仍需补充但不阻塞页面开发：英文显示名、真实个人经历、可用邮箱、GitHub/LinkedIn 地址、两个案例的个人贡献。开发中集中留空配置，不在发布版保留虚构邮箱或履历。

上线前必需：公开可访问的底图/地形方案、正式联系信息、域名与托管配置、素材与项目内容的公开范围。仅地图地形可做明确的 ellipsoid 降级，但正式 Demo 必须有可读底图。

## 6. 工程接入方式

在当前目录新建独立网站工程，不移动两个 SDK 仓库。

首版使用单个 React + Vite + TypeScript 应用，pnpm 管理依赖；React Router 管理路由，Tailwind/CSS 统一视觉。已有 SDK 独立维护，不再创建空的 map-core、spectrum、waterfall 等 workspace 包。UI 简单状态用 React，高频数据走 runtime。

建议结构：

```text
D:/yangyi/user/
  docs/
    IMPLEMENTATION_PLAN.md
    references/
  src/
    pages/
    components/
    integrations/map/
    integrations/signal/
    runtime/
    content/
  public/media/
  vendor/map-engine/
  vendor/signal-visualization/
```

其中 src、public 和 vendor 在实施阶段创建，本轮只保存文档与参考资料。

- 使用相对 vendor 路径固定已验证 tgz，不让正式构建依赖 D 盘或个人工作目录绝对路径。
- 第一轮 React 使用 19 主版本，具体补丁版由安装锁文件固定；不升级 SDK 内 Cesium 版本。
- 首页只在主动启动后动态导入地图模块，两个 Demo 分路由加载；品牌页面内容在构建时预渲染。
- 地图通过 adapter 隔离 JS 包类型和事件；图表直接复用官方 React adapter。
- 创建实例、数据定时器、观察器与 LinkGroup 均限定页面生命周期，卸载和失败清理覆盖 StrictMode。
- 首版数据本地生成，不新增 Node WebSocket 常驻服务。真实二进制传输示例作为后续独立任务。
- 不因依赖截图中存在 antd 就自动采用后台风格组件；网站视觉以参考稿和 PRD 为准。

## 7. 性能与验证修订

前一版对两个 Demo 统一设置渲染 FPS ≥45 不适用于当前频谱 SDK，此条取消。

频谱使用 dirty/on-demand 渲染：30Hz 输入下约 30 次实际绘制是合理行为；暂停后无变化时无需持续绘制。不得为了数字达到 60/120 而制造空绘制。

在固定笔记本、浏览器、DPR、1280×720 Demo 工作区、60Hz 显示器条件下执行：

1. 地图：170 对象/5Hz，记录渲染帧率和操作表现；暖机后连续 60 秒动态场景以中位 FPS ≥45 为目标，该数值是待验证目标而非当前能力结论。
2. 频谱：2,048 点/30Hz，暖机后采样 60 秒；实际提交平均 27～33 帧/秒，持续丢弃率不高于 5%，JS 绘制调用 p95 不超过一帧 33.3ms 预算作为首版目标。交互产生额外绘制时，Render FPS 可以高于 Data FPS，不要求相等。
3. 分开显示 Data FPS 与 Render FPS；渲染计时不能命名为 GPU Latency。调试时可查看 GPU 资源计数，不能把数量命名为显存大小。
4. 暂停后的统计按采样区间计算并标示 Paused，避免 SDK 窗口统计短时保留上次结果造成误读。
5. 两个 Demo 各持续 20 分钟，进入/离开 10 次，检查计时器、canvas、订阅、GPU 对象是否回收，有界轨迹/历史不持续增长。
6. 覆盖地图资源不可达、WebGL2 不可用、容器 resize、浏览器后台再返回、StrictMode 初始化与卸载。
7. 布局检查 1920、1440、1280、390 像素宽；移动端介绍和联系可用，复杂 Demo 以桌面提示与预览替代。
8. 验证工具提示、内置状态、按钮均为英文；没有素材时无破图、无空播放控件。

不以截图、源码实现或 SDK README 中旧测试结论代替本网站实际测试。

## 8. 里程碑与工时

维持此前 80～110 小时总估算，包含 12～18 小时缓冲。SDK 能力充足减少了底层开发，但版本对齐、资源部署、英文细节和视觉集成仍需要时间，尚无依据直接承诺缩短到几天。

| 阶段 | 工时 | 完成条件 |
| --- | --- | --- |
| M0 接入验证 | 8～12h | 固定包版本；跑通两个最小页面；确认地图资源、英文提示与资源加载方式 |
| M1 网站与占位 | 16～20h | 英文五类品牌页面、响应式、媒体配置与占位；对应核心视觉稿 |
| M2 地图 Demo | 18～24h | 170 对象、选择/定位、轨迹/遥测、状态、首页轻量入口 |
| M3 频谱 Demo | 14～20h | 频谱/瀑布图、三种场景、参数联动、标记与性能面板 |
| M4 上线准备 | 12～16h | 案例、联系、SEO、预渲染、生产构建与浏览器验收 |
| 缓冲 | 12～18h | 包差异、资源服务、兼容性和视觉迭代 |

每周 10～15 小时，建议预留 8～12 个自然周。先完成一个可演示闭环，再补素材；回放、星座图和 AI 不挤入首版。

## 9. 下一次实施的明确起点

从 M0 开始：在 `D:/yangyi/user` 初始化网站，固定并验证 SDK 包，制作两个最小集成页。接入通过后再进入 M1 的完整布局，避免先写大量页面后才发现包或地图资源问题。

本轮仅完成上述资料与规划落盘。没有创建网站源码，没有安装依赖，没有修改 SDK，没有部署或发送任何外部消息。
