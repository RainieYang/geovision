# 本地地图联调

GeoVision 项目：`D:/yangyi/user`。

## 启动

保留现有地图服务（`http://localhost:8080`）运行，在 GeoVision 项目根目录执行：

```powershell
pnpm dev:local-map
```

打开 `http://127.0.0.1:4175/demos/geospatial`。

`http://localhost:5174` 是引擎自身的演示页面。GeoVision 直接加载引擎源码和 8080 上的数据服务，不需要通过这个页面转发。

## 配置

本机配置保存在未提交的 `.env.local-map.local`：

```dotenv
MAP_ENGINE_SOURCE_DIR=D:/yangyi/map-engine
VITE_LOCAL_MAP_SERVICE_URL=http://localhost:8080
```

仅 `dev:local-map` 使用这些设置。常规 `pnpm dev` 和 `pnpm build` 继续使用项目内的 SDK 包及原有公开底图配置。线上网站没有改成访问 localhost。

## 已接入

- 参考 `D:/yangyi/xldemo/src/map/MapEngineAdapter.js` 的香港区域、深色底图以及视图保持配置。
- 源码入口使用 `src/compat/LegacyMapEngine.js`，与参考项目 `MapEngine.create()` 返回的实现一致；通过构造选项显式配置服务，不启用默认服务探测与外部底图回退。
- 二维：`/data/china-ethiopia.json` 中声明的 MVT 数据、分区域层级覆盖及 `/styles/military.json` 深色样式。该样式名称来自现有服务。
- 三维：`/MapServer/mbtiles/xianggang_map/{x}/{y}/{z}`，全局概览与香港区域详细影像叠加。
- 地形：`/DemServer/pak/xianggang_terrain` 的 quantized-mesh 数据。
- 本地模拟设备中心为香港，保留 170 个设备、选择、定位、筛选、暂停和实时遥测。
- 补充图层组的瓦片错误监听，并修正切换后对已销毁渲染器的事件清理。

没有修改 map-engine 或 xldemo 项目源码；没有接入参考项目的业务后端。

## 后期迁移

将地图服务部署到外网 HTTPS 地址，保持矢量、样式、影像和地形接口一致。检查 TileJSON 返回的 tiles 及 zoom_coverage 中的 URL 也指向外网，配置跨域访问和必要的鉴权。

当前源码联调开关有意仅在开发环境生效。正式发布时，需要将验证后的引擎版本打包到网站、把本地适配提升为正式服务配置，并完成外网验证后发布。
