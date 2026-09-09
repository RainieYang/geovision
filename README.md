# GeoVision

英文个人技术品牌网站，包含真实 Map Engine 和 Signal Visualization SDK Demo。

## 本地运行

需要 Node.js 22.12+（本次使用本机 Node 与 pnpm 11.5.2）。

```powershell
cd D:\yangyi\user
pnpm install --frozen-lockfile
pnpm dev
```

打开 http://127.0.0.1:4173 。常用命令：

```powershell
pnpm test       # 模拟数据与有界历史测试
pnpm lint       # 静态检查
pnpm build      # 类型检查、生产构建、7 个路由预渲染
pnpm preview    # 本地检查生产构建，先停止 dev 以释放 4173
pnpm check:release # 检查正式公开上线必需的个人信息
```

`check:release` 当前会报告缺少显示名和邮箱，这是用户选择暂不填写的预期状态，不影响开发或私有预览。

## 已实现

- Home、Demos、Projects、About、Contact，以及地图、频谱两个独立工作区。
- Map Engine 0.0.24：170 个模拟对象、5Hz 更新、类型筛选、选择与定位、2D/3D、暂停、近 5 分钟有界历史和选中对象轨迹。
- Signal Visualization 1.2.0：2,048 点频谱、600 行瀑布图、30Hz 模拟输入、三个场景、Current/Max Hold、峰值、参数应用、清空和频率视图联动。
- 品牌页面预渲染，SDK 按需加载；手机端 Demo 显示桌面体验提示，不创建 SDK。
- 所有图片/视频通过内容配置替换。个人联系方式保持空值，页面不显示虚构资料。

模拟源生成的是频域数据，不执行 FFT，不连接设备；地图默认 OpenStreetMap 底图与 ellipsoid 地形。地图需要网络且应遵守服务方使用政策，大规模公开流量前应配置适合流量的底图服务。

## 配置与维护

- [素材和个人信息替换](docs/CONTENT_GUIDE.md)
- [SDK 包来源与最小修订](vendor/README.md)
- [验证记录与后续上线项](docs/QA_REPORT.md)
- [批准的实施计划](docs/IMPLEMENTATION_PLAN.md)，保留为实施前的历史基线。

源码内容在 `src/content/`，模拟器在 `src/runtime/`，地图薄适配在 `src/integrations/map/`。`public/media/` 存放后续素材，浏览器 URL 使用 `/media/文件名`。

`vendor/` 的 tgz 与锁文件是正常安装的唯一 SDK 来源，不需要上游仓库。`scripts/prepare-vendor.mjs` 仅用于原开发机器有意重新制作修订包；重新制作后需更新锁文件、SHA-256 记录并重验。

分析事件仅写入当前浏览器会话的最多 100 条记录，并派发 `geovision:analytics` CustomEvent。没有第三方分析服务、跨用户统计或外发网络请求；可在确认分析服务后接入。

## 部署

`pnpm build` 产物为 `dist/`，可使用静态托管。保留所有路由目录和 `cesium/` 资源，404 回退到 `404.html`。修改域名时先在 `.env.local` 设置 `VITE_SITE_URL` 后重建，以更新 canonical、Open Graph 与 sitemap。

所有 `VITE_*` 都会进入浏览器构建，禁止填入私密服务端密钥。本项目没有后端、账号系统、上传接口或联系表单服务。公开发布前配置真实联系方式、确认案例公开范围、素材授权与底图方案，并完成 QA 文档中的剩余专项验证。
