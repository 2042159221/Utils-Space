'use client';

import React, { useState, useRef } from 'react';
import styles from './styles.module.css'; // 引入 CSS Module

// 图片拼接工具页面
const ImageStitcherPage = () => {
  // 状态变量用于存储用户选择的图片文件
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  // 状态变量用于存储拼接方向 ('horizontal' 或 'vertical')
  const [stitchDirection, setStitchDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  // Ref 用于获取 Canvas 元素的引用
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // 状态变量用于存储处理后的图片对象数组
  const [processedImages, setProcessedImages] = useState<HTMLImageElement[]>([]);
  // 状态变量用于控制下载按钮的可用性
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // 处理文件选择事件
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // 获取用户选择的文件列表 (现在只选择一个文件)
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFile = files[0];
      // 将新文件添加到现有文件列表中
      setSelectedFiles(prevFiles => [...prevFiles, newFile]);
      // 清空之前处理过的图片和 Canvas (选择新文件时清空预览)
      setProcessedImages([]);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    }
  };

  // 处理拼接方向选择事件
  const handleDirectionChange = (direction: 'horizontal' | 'vertical') => {
    setStitchDirection(direction);
    // 方向改变后重新处理图片和绘制 Canvas
    if (processedImages.length > 0) {
      processAndDrawImages(processedImages, direction);
    }
  };

  // 处理图片并绘制到 Canvas
  const processAndDrawImages = async (images: HTMLImageElement[], direction: 'horizontal' | 'vertical') => {
    setIsProcessing(true);
    const canvas = canvasRef.current;
    if (!canvas) {
      setIsProcessing(false);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    // 清空 Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let totalWidth = 0;
    let totalHeight = 0;
    let scaledImages: { img: HTMLImageElement; width: number; height: number }[] = [];

    // 智能尺寸调整：计算基准尺寸并缩放图片
    if (direction === 'horizontal') {
      // 横向拼接：找到最小高度作为基准
      const minHeight = Math.min(...images.map(img => img.height));
      scaledImages = images.map(img => {
        const scale = minHeight / img.height;
        const scaledWidth = img.width * scale;
        totalWidth += scaledWidth;
        return { img, width: scaledWidth, height: minHeight };
      });
      totalHeight = minHeight;
    } else {
      // 纵向拼接：找到最小宽度作为基准
      const minWidth = Math.min(...images.map(img => img.width));
      scaledImages = images.map(img => {
        const scale = minWidth / img.width;
        const scaledHeight = img.height * scale;
        totalHeight += scaledHeight;
        return { img, width: minWidth, height: scaledHeight };
      });
      totalWidth = minWidth;
    }

    // 设置 Canvas 的尺寸
    canvas.width = totalWidth;
    canvas.height = totalHeight;

    let currentX = 0;
    let currentY = 0;

    // 在 Canvas 上绘制图片
    scaledImages.forEach(({ img, width, height }) => {
      ctx.drawImage(img, currentX, currentY, width, height);
      if (direction === 'horizontal') {
        currentX += width;
      } else {
        currentY += height;
      }
    });

    setIsProcessing(false);
  };

  // 加载图片文件
  const loadImages = async (files: File[]) => {
    setIsProcessing(true);
    const imagePromises = files.map(file => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = e.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    try {
      // 等待所有图片加载完成
      const loadedImages = await Promise.all(imagePromises);
      setProcessedImages(loadedImages);
      // 图片加载完成后进行拼接和绘制
      processAndDrawImages(loadedImages, stitchDirection);
    } catch (error) {
      console.error('图片加载失败:', error);
      alert('图片加载失败，请检查文件是否有效。');
      setIsProcessing(false);
    }
  };

  // 处理开始拼接按钮点击事件
  const handleStitchClick = () => {
    if (selectedFiles.length === 0) {
      alert('请先选择图片文件。');
      return;
    }
    loadImages(selectedFiles);
  };

  // 处理下载按钮点击事件
  const handleDownloadClick = () => {
    const canvas = canvasRef.current;
    if (!canvas || processedImages.length === 0) {
      alert('没有可下载的图片。');
      return;
    }

    // 将 Canvas 内容转换为图片数据 URL
    const dataURL = canvas.toDataURL('image/png'); // 可以选择 'image/jpeg'

    // 创建一个下载链接
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'stitched-image.png'; // 设置下载文件名
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>在线图片拼接工具</h1>

      {/* 图片上传 */}
      <div className={styles.section}>
        <label className={styles.label}>
          选择图片文件:
          <input type="file" accept="image/*" onChange={handleFileChange} className={styles.fileInput} />
        </label>
        {selectedFiles.length > 0 && (
          <p className={styles.fileCount}>已选择 {selectedFiles.length} 个文件</p>
        )}
      </div>

      {/* 拼接方向选择 */}
      <div className={styles.section}>
        <label className={styles.label}>拼接方向:</label>
        <div className={styles.directionOptions}>
          <label>
            <input
              type="radio"
              value="horizontal"
              checked={stitchDirection === 'horizontal'}
              onChange={() => handleDirectionChange('horizontal')}
            />
            横向拼接
          </label>
          <label>
            <input
              type="radio"
              value="vertical"
              checked={stitchDirection === 'vertical'}
              onChange={() => handleDirectionChange('vertical')}
            />
            纵向拼接
          </label>
        </div>
      </div>

      {/* 拼接按钮 */}
      <div className={styles.section}>
        <button onClick={handleStitchClick} disabled={selectedFiles.length === 0 || isProcessing} className={styles.button}>
          {isProcessing ? '处理中...' : '开始拼接'}
        </button>
      </div>

      {/* 实时预览区域 */}
      <div className={styles.previewContainer}>
        <h2 className={styles.previewTitle}>预览</h2>
        {/* Canvas 元素用于绘制拼接结果 */}
        <canvas ref={canvasRef} className={styles.canvas}>
          您的浏览器不支持 Canvas。
        </canvas>
      </div>

      {/* 下载按钮 */}
      <div className={styles.section}>
        <button onClick={handleDownloadClick} disabled={processedImages.length === 0 || isProcessing} className={styles.downloadButton}>
          下载拼接结果
        </button>
      </div >
    </div >
  );
};

export default ImageStitcherPage;