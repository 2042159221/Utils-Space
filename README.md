# 工具集项目

本项目是一个包含多种实用小工具的集合，旨在为用户提供便捷、高效的在线服务。

## 项目目标

- 提供一系列简单易用的在线工具。
- 持续集成用户反馈，优化现有工具并开发新工具。
- 保持代码的简洁性和可维护性，方便初学者学习和贡献。

## 已有工具

对应的文档文件夹存放于：`tools-doc/`

### 1. 进制转换器

- **位置**: [`tools/binaryConverter/`](tools/binaryConverter/)
- **说明**: 一个简单的在线工具，用于在二进制、八进制、十进制和十六进制之间进行实时转换。
- **详情**: 请参考 [`tools-doc/binaryConverter/toBinary.md`](tools-doc/binaryConverter/toBinary.md)

### 2. 文件压缩器

- **位置**: [`tools/fileCompressor/`](tools/fileCompressor/)
- **说明**: 一款在线工具，用于压缩各种类型的文件，以减少存储空间和加快传输速度。
- **详情**: 请参考 [`tools-doc/fileCompressor/fileCompressor.md`](tools-doc/fileCompressor/fileCompressor.md)

### 3. 证件照生成器

- **位置**: [`tools/idPhotoMaker/`](tools/idPhotoMaker/)
- **说明**: 一款在线工具，用于帮助用户快速制作符合各种规格要求的证件照片。
- **详情**: 请参考 [`tools-doc/idPhotoMaker/idPhotoMaker.md`](tools-doc/idPhotoMaker/idPhotoMaker.md)

## 未来计划

- 更多实用工具...

## 如何贡献

(待补充)

## 技术栈

- **前端**:
    - Next.js 14 (App Router)
    - React
    - TypeScript
    - HTML, CSS, JavaScript (原生)
- **后端**:
    - Node.js (用于 Next.js API Routes)
    - **依赖**:
        - 文件压缩: Ghostscript (用于 PDF 压缩)
        - 证件照生成: 百度 AI 开放平台 API (用于背景移除)

