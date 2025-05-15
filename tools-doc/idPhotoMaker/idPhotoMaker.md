# 证件照生成器 - 开发者与部署者指南

本文档详细说明了证件照生成工具的技术实现细节、依赖项以及部署注意事项，旨在帮助开发者理解代码结构和功能，并指导部署者正确配置运行环境。

## 1. 工具概述

证件照生成器是一个基于 Next.js 14 (App Router) 的 Web 工具，允许用户上传照片，选择证件照规格和背景颜色，进行简单的裁剪调整，并通过调用后端 API 实现背景替换，最终生成符合要求的证件照图片供下载。

## 2. 技术实现细节

### 2.1 前端 (`app/(tools)/id-photo-maker/page.tsx`)

前端主要负责用户界面交互、文件上传、图片预览与裁剪、规格与背景选择以及与后端 API 的通信。

-   **文件处理**: 使用标准的 HTML Input (`type="file"`) 接收用户上传的图片文件 (JPG/PNG)。进行基本的文件类型和大小 (`最大10MB`) 校验。
-   **预览与裁剪**: 利用 HTML Canvas API (`canvasRef`) 绘制上传的图片。根据用户选择的证件照规格 (`selectedSizeName`) 计算并绘制一个可拖拽的裁剪框 (`cropPosition`, `cropSize`)。裁剪框的宽高比与所选规格保持一致。拖拽逻辑 (`handleDragStart`, `handleDragMove`, `handleDragEnd`) 实现了裁剪框在图片区域内的移动限制。
-   **规格与背景**: 预设了多种常见证件照规格 (`presetSizes`)，包含物理尺寸 (毫米) 和推荐 DPI。用户选择规格后，会影响裁剪框的宽高比和最终输出图片的像素尺寸。背景颜色 (`backgroundColors`, `selectedBgColor`) 选择会影响预览画布上裁剪框外部区域的半透明遮罩颜色，并在最终生成图片时作为背景填充色。
-   **与后端交互**: 当用户点击“处理并预览背景”按钮 (`handleDownload`) 时，前端会：
    1.  使用 Canvas API (`getCroppedImageBase64`) 将用户在预览区裁剪的图片区域按原始图片比例导出为 Base64 格式的 PNG 数据。
    2.  将 Base64 数据通过 POST 请求发送到后端 API 路由 `/api/baidu-segmentation`。
-   **结果处理**: 接收后端 API 返回的带有透明背景的前景图 Base64 数据 (`apiResult.foreground`)。在客户端创建一个新的 Canvas (`outputCanvas`)，根据所选规格计算出最终输出图片的精确像素尺寸。首先在新 Canvas 上填充用户选择的背景颜色 (`finalSelectedBgColor`)，然后将后端返回的前景图绘制在其上，最终生成带有新背景的证件照图片 URL (`processedImageUrl`) 用于预览和下载。

### 2.2 后端 API (`app/api/baidu-segmentation/route.ts`)

后端 API 路由 `/api/baidu-segmentation` 负责接收前端发送的裁剪图片数据，调用第三方服务进行背景移除，并将处理后的前景图数据返回给前端。

-   **API 功能**: 接收前端 POST 请求中的 JSON 数据，其中包含 `imageDataBase64` 字段，即裁剪图片的 Base64 字符串。
-   **核心依赖**: **调用百度 AI 开放平台的图像分割 API** 来实现自动抠图（背景移除）。代码中通过 `fetch` 请求调用百度 API。
-   **处理流程**:
    1.  从请求体中解析出 `imageDataBase64`。
    2.  构建调用百度图像分割 API 的请求参数，包括 `access_token` 和 `image` (Base64 数据)。
    3.  发送请求到百度 API。
    4.  处理百度 API 的响应。如果成功，解析出前景图的 Base64 数据。
    5.  将前景图 Base64 数据作为 JSON 响应返回给前端。
-   **错误处理**: 捕获文件接收、调用百度 API 或处理响应过程中可能出现的错误，并返回带有错误信息的 JSON 响应给前端。

## 3. 依赖与配置

### 3.1 百度 AI 开放平台

证件照生成器的背景移除功能强依赖于百度 AI 开放平台的图像分割 API。您需要：

1.  访问 [百度 AI 开放平台](https://ai.baidu.com/) 并注册账号。
2.  创建应用，获取 **API Key (AK)** 和 **Secret Key (SK)**。
3.  确保您的应用已开通图像分割服务。

### 3.2 环境变量配置

为了安全地使用百度 API Key 和 Secret Key，您需要在项目根目录下创建或修改 `.env.local` 文件，并添加以下环境变量：

```dotenv
BAIDU_API_KEY=您的百度API Key
BAIDU_SECRET_KEY=您的百度Secret Key
```

请将 `您的百度API Key` 和 `您的百度Secret Key` 替换为您在百度 AI 开放平台获取的实际密钥。

### 3.3 其他依赖

前端使用了 `react` 和 `next` 框架，以及 CSS Modules (`styles.module.css`) 进行样式管理。没有额外的第三方前端图像处理库用于背景移除，该功能完全依赖后端百度 API。

## 4. 部署说明

-   确保您的部署环境支持运行 Next.js 应用程序。
-   在部署环境中配置 `BAIDU_API_KEY` 和 `BAIDU_SECRET_KEY` 环境变量。具体的配置方式取决于您使用的部署平台（例如 Vercel, Netlify, Docker 等）。
-   确保部署环境能够正常访问百度 AI 开放平台的 API 服务。

## 5. 代码结构

-   `app/(tools)/id-photo-maker/page.tsx`: 证件照生成器的前端页面组件，包含 UI 渲染和客户端逻辑。
-   `app/(tools)/id-photo-maker/styles.module.css`: 页面组件的样式文件。
-   `app/api/baidu-segmentation/route.ts`: 处理百度抠图 API 调用的后端 API 路由。

## 6. 潜在改进与待办

-   [ ] 优化裁剪框的交互和视觉提示。
-   [ ] 增加更多照片调整功能（如亮度、对比度、旋转）。
-   [ ] 增加对更多证件照规格的支持。
-   [ ] 优化背景合成效果，特别是边缘处理。
-   [ ] 考虑增加批量处理功能。
-   [ ] 增加更详细的错误处理和用户反馈。
-   [ ] 优化大图片处理的性能。