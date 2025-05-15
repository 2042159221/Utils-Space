'use client'; // 标记为客户端组件

import styles from './styles.module.css';
import React, { useState, ChangeEvent, useRef, useEffect, useCallback } from 'react';
// 移除了 selfieSegmentation, @tensorflow/tfjs-core, @tensorflow/tfjs-backend-webgl

interface PhotoSize {
  name: string;
  widthMm?: number;
  heightMm?: number;
  widthPx?: number;
  heightPx?: number;
  dpi?: number;
  note?: string;
}

/**
 * 应用亮度和对比度调整到 ImageData
 * @param imageData 原始 ImageData 对象
 * @param brightness 亮度调整值 (-100 到 100)
 * @param contrast 对比度调整值 (-100 到 100)
 * @returns 应用调整后的新 ImageData 对象
 */
const applyBrightnessAndContrast = (
  imageData: ImageData,
  brightness: number,
  contrast: number
): ImageData => {
  const pixels = imageData.data;
  const numPixels = pixels.length / 4;
  const adjustedPixels = new Uint8ClampedArray(pixels); // 创建一个新的 Uint8ClampedArray 来存储调整后的像素数据

  // 将亮度和对比度百分比转换为调整因子
  const brightnessFactor = brightness / 100; // -1 到 1
  const contrastFactor = contrast / 100; // -1 到 1

  // 对比度调整的公式通常涉及一个乘数。
  // 一个简单的线性调整公式：pixel = factor * (pixel - 128) + 128
  // factor = (259 * (contrast + 255)) / (255 * (259 - contrast))
  // 这里 contrast 是 -100 到 100，需要转换为 -255 到 255 的范围以匹配常见公式
  const contrastValue = contrastFactor * 255; // -255 到 255
  const contrastMultiplier = (259 * (contrastValue + 255)) / (255 * (259 - contrastValue));

  for (let i = 0; i < numPixels; i++) {
    const rIndex = i * 4;
    const gIndex = i * 4 + 1;
    const bIndex = i * 4 + 2;

    let r = pixels[rIndex];
    let g = pixels[gIndex];
    let b = pixels[bIndex];

    // 应用亮度调整 (简单的加法)
    r += brightnessFactor * 255;
    g += brightnessFactor * 255;
    b += brightnessFactor * 255;

    // 应用对比度调整
    // 将像素值范围从 [0, 255] 映射到 [-128, 127]，应用乘数，再映射回 [0, 255]
    r = contrastMultiplier * (r - 128) + 128;
    g = contrastMultiplier * (g - 128) + 128;
    b = contrastMultiplier * (b - 128) + 128;

    // 限制像素值在 0 到 255 之间
    adjustedPixels[rIndex] = Math.max(0, Math.min(255, r));
    adjustedPixels[gIndex] = Math.max(0, Math.min(255, g));
    adjustedPixels[bIndex] = Math.max(0, Math.min(255, b));

    // 保留 Alpha 通道
    adjustedPixels[i * 4 + 3] = pixels[i * 4 + 3];
  }

  // 创建新的 ImageData 对象并返回
  return new ImageData(adjustedPixels, imageData.width, imageData.height);
};


export default function IdPhotoMakerPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null); // Ref for the final output canvas (used in onResults)
  const currentSizeDetailsRef = useRef<PhotoSize | null>(null); // Ref to store size details for onResults
  const outputFormatRef = useRef<'jpeg' | 'png'>('jpeg'); // Ref to store output format for onResults
  const selectedBgColorRef = useRef<string>(''); // Ref to store background color for onResults
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presetSizes: PhotoSize[] = [
    { name: '一寸 (25mm x 35mm)', widthMm: 25, heightMm: 35, dpi: 300 },
    { name: '二寸 (35mm x 45mm)', widthMm: 35, heightMm: 45, dpi: 300 },
    { name: '二寸 (35mm x 49mm)', widthMm: 35, heightMm: 49, dpi: 300 },
    { name: '小一寸 (22mm x 32mm)', widthMm: 22, heightMm: 32, dpi: 300 },
    { name: '小二寸 (33mm x 48mm)', widthMm: 33, heightMm: 48, dpi: 300 },
    { name: '大一寸 (33mm x 48mm)', widthMm: 33, heightMm: 48, dpi: 300 },
    { name: '护照 (33mm x 48mm)', widthMm: 33, heightMm: 48, dpi: 300 },
    { name: '身份证 (26mm x 32mm)', widthMm: 26, heightMm: 32, dpi: 300 },
    { name: '签证 (33mm x 48mm)', widthMm: 33, heightMm: 48, dpi: 300 },
    { name: '签证 (50mm x 50mm)', widthMm: 50, heightMm: 50, dpi: 300 },
    { name: '驾照 (21mm x 26mm)', widthMm: 21, heightMm: 26, dpi: 300 },
    { name: '美国签证 (2in x 2in)', widthMm: 50.8, heightMm: 50.8, dpi: 300, note: '600x600像素 @300DPI' }, // 保留原有美国签证尺寸
  ];

  const backgroundColors = [
    { name: '白色', value: '#FFFFFF' },
    { name: '蓝色', value: '#2E8DEF' },
    { name: '红色', value: '#D0021B' },
    { name: '灰色', value: '#CCCCCC' },
  ];

  const downloadResolutions = [
    { name: '标准分辨率 (300dpi)', value: 300 },
    { name: '高分辨率 (600dpi)', value: 600 },
  ];

  const [selectedSizeName, setSelectedSizeName] = useState<string>(presetSizes[0].name);
  const [selectedBgColor, setSelectedBgColor] = useState<string>(backgroundColors[0].value);
  const [customBgColor, setCustomBgColor] = useState<string>('#FFFFFF'); // 新增自定义背景颜色状态
  const [outputFormat, setOutputFormat] = useState<'jpeg' | 'png'>('jpeg');
  const [selectedDpi, setSelectedDpi] = useState<number>(downloadResolutions[0].value); // 新增下载分辨率状态
  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [showProcessedPreview, setShowProcessedPreview] = useState(false);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [cropSize, setCropSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number, y: number, initialCropX: number, initialCropY: number } | null>(null);
  const [isCropInitialized, setIsCropInitialized] = useState(false);
  const [scale, setScale] = useState<number>(1); // 新增：图片缩放比例，默认为1 (100%)
  const [brightness, setBrightness] = useState<number>(0); // 新增：亮度调整值 (-100 to 100)
  const [contrast, setContrast] = useState<number>(0); // 新增：对比度调整值 (-100 to 100)
  const [redrawTrigger, setRedrawTrigger] = useState(0); // 新增：用于触发canvas重绘的状态

  // Store necessary values in refs whenever they change, so onResults can access them
  useEffect(() => {
      // Find the selected size details based on the name
      const sizeDetails = presetSizes.find(s => s.name === selectedSizeName);
      // If a size is found, update its DPI based on the selectedDpi state
      if (sizeDetails) {
          currentSizeDetailsRef.current = { ...sizeDetails, dpi: selectedDpi };
      } else {
          currentSizeDetailsRef.current = null;
      }
  }, [selectedSizeName, presetSizes, selectedDpi]); // Add selectedDpi to dependencies

  useEffect(() => {
      outputFormatRef.current = outputFormat;
  }, [outputFormat]);

  useEffect(() => {
      // Use custom color if selected, otherwise use the value from the preset color radio buttons
      const newBgColor = selectedBgColor === 'custom' ? customBgColor : selectedBgColor;
      selectedBgColorRef.current = newBgColor;
      // 当背景颜色改变时，如果图片已加载，更新 redrawTrigger 状态以触发重绘
      if (previewUrl && imageRef.current && imageRef.current.complete) {
          setRedrawTrigger(prev => prev + 1);
      }
  }, [selectedBgColor, customBgColor, previewUrl]); // Depend on color states and previewUrl


  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const drawCropRectangle = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    bgColor: string
  ) => {
    // 将16进制颜色转为带透明度的rgba
    const hexToRgba = (hex: string, alpha: number = 0.4) => { // Default alpha to 0.4 for better visibility (more transparent)
      if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
        console.warn("Invalid hex color for hexToRgba, defaulting to semi-transparent black:", hex);
        return `rgba(0, 0, 0, ${alpha})`; // Default to black if hex is invalid
      }
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      if (isNaN(r) || isNaN(g) || isNaN(b)) {
        console.warn("Invalid hex color components for hexToRgba, defaulting to semi-transparent black:", hex);
        return `rgba(0, 0, 0, ${alpha})`; // Default to black if parsing fails
      }
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // 绘制半透明遮罩层，使用选定的背景颜色并增加透明度
    ctx.fillStyle = hexToRgba(bgColor);
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // 清除裁剪区域，使其透明，露出下方的图片和背景
    ctx.clearRect(x, y, width, height);

    // 绘制裁剪框边框
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.beginPath();
    ctx.moveTo(x, y + height / 3);
    ctx.lineTo(x + width, y + height / 3);
    ctx.moveTo(x, y + (2 * height) / 3);
    ctx.lineTo(x + width, y + (2 * height) / 3);
    ctx.moveTo(x + width / 3, y);
    ctx.lineTo(x + width / 3, y + height);
    ctx.moveTo(x + (2 * width) / 3, y);
    ctx.lineTo(x + (2 * width) / 3, y + height);
    ctx.stroke();
  }, []); // 依赖项为空，因为它现在通过参数接收动态值

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;

    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!image || !previewUrl) {
      clearCanvas();
      return;
    }

    const previewAreaElement = canvas.parentElement;
    let canvasMaxWidth = previewAreaElement?.clientWidth ? previewAreaElement.clientWidth : 300;
    const canvasMaxHeight = 400;

    // Adjust canvas size to fit preview area while maintaining aspect ratio
    let canvasDrawWidth = image.naturalWidth;
    let canvasDrawHeight = image.naturalHeight;
    const imgAspectRatio = image.naturalWidth / image.naturalHeight;

    if (canvasDrawWidth / canvasDrawHeight > canvasMaxWidth / canvasMaxHeight) {
      if (canvasDrawWidth > canvasMaxWidth) {
        canvasDrawWidth = canvasMaxWidth;
        canvasDrawHeight = canvasDrawWidth / imgAspectRatio;
      }
    } else {
      if (canvasDrawHeight > canvasMaxHeight) {
        canvasDrawHeight = canvasMaxHeight;
        canvasDrawWidth = canvasDrawHeight * imgAspectRatio;
      }
    }

    canvas.width = canvasDrawWidth;
    canvas.height = canvasDrawHeight;

    // Calculate scaled image dimensions and position
    const scaledWidth = image.naturalWidth * scale;
    const scaledHeight = image.naturalHeight * scale;
    const imageX = (canvas.width - scaledWidth) / 2;
    const imageY = (canvas.height - scaledHeight) / 2;

    // 1. Fill background color
    ctx.fillStyle = selectedBgColorRef.current; // Use ref for latest color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw the scaled image onto a temporary canvas to get ImageData
    const tempDrawCanvas = document.createElement('canvas');
    tempDrawCanvas.width = scaledWidth;
    tempDrawCanvas.height = scaledHeight;
    const tempDrawCtx = tempDrawCanvas.getContext('2d');

    if (!tempDrawCtx) {
        console.error("无法创建临时画布用于绘制缩放图片。");
        return;
    }

    tempDrawCtx.drawImage(image, 0, 0, scaledWidth, scaledHeight);

    // Get image data from the temporary canvas
    let imageData = tempDrawCtx.getImageData(0, 0, scaledWidth, scaledHeight);

    // Apply brightness and contrast adjustments
    if (brightness !== 0 || contrast !== 0) {
        imageData = applyBrightnessAndContrast(imageData, brightness, contrast);
    }

    // Put the adjusted image data back onto the main canvas
    ctx.putImageData(imageData, imageX, imageY);


    // Calculate crop box size based on canvas dimensions and aspect ratio
    const currentSizeDetails = presetSizes.find(s => s.name === selectedSizeName);
    if (!currentSizeDetails) return;

    let cropAspectRatio;
    if (currentSizeDetails.widthMm && currentSizeDetails.heightMm) {
      cropAspectRatio = currentSizeDetails.widthMm / currentSizeDetails.heightMm;
    } else if (currentSizeDetails.widthPx && currentSizeDetails.heightPx) {
      cropAspectRatio = currentSizeDetails.widthPx / currentSizeDetails.heightPx;
    } else {
      return;
    }

    const cropBoxScaleFactor = 0.9;
    let newCropWidth, newCropHeight;

    if (canvas.width / canvas.height > cropAspectRatio) {
      newCropHeight = canvas.height * cropBoxScaleFactor;
      newCropWidth = newCropHeight * cropAspectRatio;
    } else {
      newCropWidth = canvas.width * cropBoxScaleFactor;
      newCropHeight = newCropWidth / cropAspectRatio;
    }

    // Ensure crop box doesn't exceed canvas dimensions
    if (newCropWidth > canvas.width) {
        newCropWidth = canvas.width;
        newCropHeight = newCropWidth / cropAspectRatio;
    }
    if (newCropHeight > canvas.height) {
        newCropHeight = canvas.height;
        newCropWidth = newCropHeight * cropAspectRatio;
    }

    // Update crop size state if it changed
    if (cropSize.width !== newCropWidth || cropSize.height !== newCropHeight) {
        setCropSize({ width: newCropWidth, height: newCropHeight });
    }

    // Calculate crop position
    let currentCropX, currentCropY;
    if (!isDragging && !isCropInitialized) {
        // Initial position: center the crop box on the canvas
        currentCropX = (canvas.width - newCropWidth) / 2;
        currentCropY = (canvas.height - newCropHeight) / 2;
        setCropPosition({ x: currentCropX, y: currentCropY });
        setIsCropInitialized(true); // Mark as initialized
    } else if (isDragging) {
        // Position is updated by drag handler, clamp to canvas bounds
        currentCropX = Math.max(0, Math.min(cropPosition.x, canvas.width - newCropWidth));
        currentCropY = Math.max(0, Math.min(cropPosition.y, canvas.height - newCropHeight));
    } else {
        // Use existing crop position, clamp to canvas bounds
        currentCropX = Math.max(0, Math.min(cropPosition.x, canvas.width - cropSize.width));
        currentCropY = Math.max(0, Math.min(cropPosition.y, canvas.height - cropSize.height));
    }


    // 3. Draw the semi-transparent overlay and clear the crop area
    drawCropRectangle(ctx, currentCropX, currentCropY, newCropWidth, newCropHeight, selectedBgColorRef.current); // Pass selected background color ref

    // 4. Draw the image again inside the crop box with transparency
    ctx.save(); // Save the current canvas state (including globalAlpha = 1)
    ctx.globalAlpha = 0.3; // Set transparency for the image inside the crop box

    // Calculate source coordinates on the original image based on scaled image position and crop box
    const sourceX = (currentCropX - imageX) / scale;
    const sourceY = (currentCropY - imageY) / scale;
    const sourceWidth = newCropWidth / scale;
    const sourceHeight = newCropHeight / scale;

    // Ensure source coordinates and dimensions are within the bounds of the original image
    const clampedSourceX = Math.max(0, sourceX);
    const clampedSourceY = Math.max(0, sourceY);
    const clampedSourceWidth = Math.min(sourceWidth, image.naturalWidth - clampedSourceX);
    const clampedSourceHeight = Math.min(sourceHeight, image.naturalHeight - clampedSourceY);

    // Calculate destination coordinates and dimensions on the canvas
    // Need to adjust destination if source was clamped
    const clampedDestX = currentCropX + (clampedSourceX - sourceX) * scale;
    const clampedDestY = currentCropY + (clampedSourceY - sourceY) * scale;
    const clampedDestWidth = clampedSourceWidth * scale;
    const clampedDestHeight = clampedSourceHeight * scale;


    // Draw the cropped portion of the original image onto the cleared area
    ctx.drawImage(
        image,
        clampedSourceX, clampedSourceY, clampedSourceWidth, clampedSourceHeight, // Source
        clampedDestX, clampedDestY, clampedDestWidth, clampedDestHeight // Destination
    );

    ctx.restore(); // Restore the canvas state (globalAlpha back to 1)

    // Note: Drawing the image inside the crop box with transparency is handled by drawCropRectangle clearing the area.
    // The scaled image is already drawn underneath.

  }, [previewUrl, selectedSizeName, selectedBgColor, customBgColor, isDragging, cropPosition.x, cropPosition.y, drawCropRectangle, clearCanvas, cropSize.width, cropSize.height, scale]); // Add selectedBgColor and customBgColor to dependencies


  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    imageRef.current = null;
    setIsDragging(false);
    setDragStart(null);
    setIsCropInitialized(false); // 重置初始化状态
    setScale(1); // 重置缩放比例
    clearCanvas();

    const file = event.target.files?.[0];
    const inputElement = event.target as HTMLInputElement; // 类型断言

    if (!file) {
      if (inputElement) inputElement.value = ''; // 清空文件输入
      return;
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('文件格式不支持，请上传 JPG 或 PNG 格式的图片。');
      if (inputElement) inputElement.value = ''; // 清空文件输入
      return;
    }

    const maxSizeInBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setError(`文件过大，请上传小于 ${maxSizeInBytes / (1024 * 1024)}MB 的图片。`);
      if (inputElement) inputElement.value = ''; // 清空文件输入
      return;
    }

    processFile(file); // 使用新函数处理文件
  };

  const processFile = (file: File) => {
    setError(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    imageRef.current = null;
    setIsDragging(false);
    setDragStart(null);
    setIsCropInitialized(false); // 重置初始化状态
    setScale(1); // 重置缩放比例
    clearCanvas();

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('文件格式不支持，请上传 JPG 或 PNG 格式的图片。');
      return;
    }

    const maxSizeInBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setError(`文件过大，请上传小于 ${maxSizeInBytes / (1024 * 1024)}MB 的图片。`);
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      const newPreviewUrl = reader.result as string;

      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        setPreviewUrl(newPreviewUrl);
        console.log("Image loaded, previewUrl:", newPreviewUrl); // 添加日志

        const canvas = canvasRef.current;
        if (canvas) {
          console.log("Canvas width:", canvas.width, "height:", canvas.height); // 添加日志
          console.log("Image naturalWidth:", img.naturalWidth, "naturalHeight:", img.naturalHeight); // 添加日志
          drawCanvas(); // 手动调用 drawCanvas
        }
      };
      img.onerror = () => {
        setError("无法加载图片，请检查文件是否损坏或尝试其他图片。");
        setPreviewUrl(null);
        imageRef.current = null;
        clearCanvas();
      };
      img.src = newPreviewUrl;
    };
    reader.onerror = () => {
        setError("读取文件失败。");
        // 注意：在 processFile 内部无法直接访问原始的 event.target 来清空 input
        // 如果需要在这里清空，handleFileChange 需要传递 inputElement 给 processFile
        // 或者，在 handleFileChange 中，如果 processFile 抛出错误或返回失败状态，再清空
        clearCanvas();
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove(styles.dragOver);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    } else {
      setError("拖拽失败，未找到文件。");
    }
  }, [processFile]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add(styles.dragOver);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove(styles.dragOver);
  }, []);

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !previewUrl || !cropSize.width || !cropSize.height) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;

    if (
      canvasX >= cropPosition.x &&
      canvasX <= cropPosition.x + cropSize.width &&
      canvasY >= cropPosition.y &&
      canvasY <= cropPosition.y + cropSize.height
    ) {
      setIsDragging(true);
      setDragStart({
        x: clientX,
        y: clientY,
        initialCropX: cropPosition.x,
        initialCropY: cropPosition.y,
      });
      canvas.style.cursor = 'grabbing';
    }
  }, [previewUrl, cropPosition, cropSize]);

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    handleDragStart(event.clientX, event.clientY);
  }, [handleDragStart]);

  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
    if (event.touches.length === 1) {
      handleDragStart(event.touches[0].clientX, event.touches[0].clientY);
    }
  }, [handleDragStart]);

  useEffect(() => {
    if (previewUrl && imageRef.current && imageRef.current.complete) {
      drawCanvas();
    } else if (!previewUrl) {
      clearCanvas();
    }
  }, [previewUrl, selectedSizeName, drawCanvas, clearCanvas, scale, brightness, contrast, redrawTrigger]); // Add scale, brightness, contrast, and redrawTrigger to dependencies

  useEffect(() => {
    const handleResize = () => {
      if (previewUrl && imageRef.current && imageRef.current.complete) {
        setIsDragging(false);
        drawCanvas();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [previewUrl, drawCanvas, scale]); // Add scale to dependencies

  useEffect(() => {
    const handleDragMove = (clientX: number, clientY: number) => {
      if (!isDragging || !dragStart || !canvasRef.current || !cropSize.width || !cropSize.height) return;

      const dx = clientX - dragStart.x;
      const dy = clientY - dragStart.y;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      let newX = dragStart.initialCropX + dx * scaleX;
      let newY = dragStart.initialCropY + dy * scaleY;

      // Clamp crop position to stay within canvas bounds
      newX = Math.max(0, Math.min(newX, canvas.width - cropSize.width));
      newY = Math.max(0, Math.min(newY, canvas.height - cropSize.height));

      setCropPosition({ x: newX, y: newY });

      // Redraw canvas to show updated crop position
      const ctx = canvas.getContext('2d');
      const image = imageRef.current;
      if (ctx && image) {
         ctx.clearRect(0, 0, canvas.width, canvas.height);

         // Calculate scaled image dimensions and position
         const scaledWidth = image.naturalWidth * scale;
         const scaledHeight = image.naturalHeight * scale;
         const imageX = (canvas.width - scaledWidth) / 2;
         const imageY = (canvas.height - scaledHeight) / 2;

         // Fill background color
         ctx.fillStyle = selectedBgColorRef.current;
         ctx.fillRect(0, 0, canvas.width, canvas.height);

         // Draw the scaled image
         ctx.drawImage(image, imageX, imageY, scaledWidth, scaledHeight);

         // Draw the semi-transparent overlay and clear the crop area
         drawCropRectangle(ctx, newX, newY, cropSize.width, cropSize.height, selectedBgColorRef.current);
      }
    };

    const handleDragEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        setDragStart(null);
        if (canvasRef.current) {
          canvasRef.current.style.cursor = 'grab';
        }
      }
    };

    const mouseMoveListener = (event: MouseEvent) => handleDragMove(event.clientX, event.clientY);
    const touchMoveListener = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        handleDragMove(event.touches[0].clientX, event.touches[0].clientY);
        event.preventDefault();
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', mouseMoveListener);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('mouseleave', handleDragEnd);
      document.addEventListener('touchmove', touchMoveListener, { passive: false });
      document.addEventListener('touchend', handleDragEnd);
      document.addEventListener('touchcancel', handleDragEnd);
    }

    return () => {
      document.removeEventListener('mousemove', mouseMoveListener);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('mouseleave', handleDragEnd);
      document.removeEventListener('touchmove', touchMoveListener);
      document.removeEventListener('touchend', handleDragEnd);
      document.removeEventListener('touchcancel', handleDragEnd);
       if (canvasRef.current && previewUrl) {
          canvasRef.current.style.cursor = 'grab';
       } else if (canvasRef.current) {
          canvasRef.current.style.cursor = 'default';
       }
    };
  }, [isDragging, dragStart, cropSize, drawCropRectangle, selectedBgColorRef, scale]); // Add scale to dependencies

  // --- 辅助函数：获取裁剪后的图片 Base64 ---
  const getCroppedImageBase64 = (): string | null => {
    const image = imageRef.current;
    const canvas = canvasRef.current; // 预览画布

    if (!image || !canvas || !cropSize.width || !cropSize.height) {
      console.error("无法获取裁剪图片：原始图片、预览画布或裁剪尺寸未就绪。");
      return null;
    }

    // Create a temporary canvas to draw the scaled image with background
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width; // Same size as preview canvas
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    if (!tempCtx) {
        console.error("无法创建临时画布用于合成。");
        return null;
    }

    // 1. Fill background color on temp canvas
    tempCtx.fillStyle = selectedBgColorRef.current;
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // 2. Draw the scaled image onto the temp canvas
    const scaledWidth = image.naturalWidth * scale;
    const scaledHeight = image.naturalHeight * scale;
    const imageX = (tempCanvas.width - scaledWidth) / 2;
    const imageY = (tempCanvas.height - scaledHeight) / 2;
    tempCtx.drawImage(image, imageX, imageY, scaledWidth, scaledHeight);

    // Create the final output canvas with the size of the crop box
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = cropSize.width;
    outputCanvas.height = cropSize.height;
    const ctxOutput = outputCanvas.getContext('2d');

    if (!ctxOutput) {
      console.error("无法创建最终输出画布。");
      return null;
    }
    ctxOutput.imageSmoothingEnabled = true;
    ctxOutput.imageSmoothingQuality = 'high';


    // 3. Draw the cropped region from the temp canvas onto the output canvas
    // Source rectangle on tempCanvas: cropPosition.x, cropPosition.y, cropSize.width, cropSize.height
    // Destination rectangle on outputCanvas: 0, 0, cropSize.width, cropSize.height
    ctxOutput.drawImage(
        tempCanvas,
        cropPosition.x,
        cropPosition.y,
        cropSize.width,
        cropSize.height,
        0,
        0,
        cropSize.width,
        cropSize.height
    );

    // Get image data from the cropped area
    let croppedImageData = ctxOutput.getImageData(0, 0, cropSize.width, cropSize.height);

    // Apply brightness and contrast adjustments to the cropped image data
    if (brightness !== 0 || contrast !== 0) {
        croppedImageData = applyBrightnessAndContrast(croppedImageData, brightness, contrast);
    }

    // Put the adjusted image data back onto the output canvas
    ctxOutput.putImageData(croppedImageData, 0, 0);

    // Get base64 data from the output canvas
    const base64Data = outputCanvas.toDataURL('image/png').split(',')[1]; // Always use PNG for internal processing
    return base64Data;
  };


  // --- 处理并预览/下载函数 ---
  const handleDownload = async () => {
    const image = imageRef.current;
    const currentSizeDetails = currentSizeDetailsRef.current; // This ref now includes the selected DPI
    const finalSelectedBgColor = selectedBgColorRef.current;
    const finalOutputFormat = outputFormatRef.current;

    if (!image) {
      setError("请先上传图片。");
      return;
    }
    if (!currentSizeDetails || currentSizeDetails.dpi === undefined) {
      setError("请选择证件照规格和分辨率。");
      return;
    }
    if (!cropSize.width || !cropSize.height) {
        setProcessError("裁剪区域无效，请确保已正确加载图片并显示裁剪框。");
        return;
    }

    setError(null);
    setProcessError(null);
    setIsProcessing(true);
    setShowProcessedPreview(false); // 开始处理时先隐藏旧的预览

    try {
      console.log("开始裁剪图片...");
      const croppedImageBase64 = getCroppedImageBase64();
      if (!croppedImageBase64) {
        throw new Error("图片裁剪失败。");
      }
      console.log("图片裁剪完成，准备调用后端 API...");

      // 调用后端 API 路由
      const apiResponse = await fetch('/api/baidu-segmentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageDataBase64: croppedImageBase64 }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({ error: "未知后端 API 响应错误" }));
        throw new Error(`后端 API 请求失败: ${apiResponse.status} - ${errorData.error || JSON.stringify(errorData)}`);
      }

      const apiResult = await apiResponse.json();

      if (!apiResult.foreground) {
        throw new Error("后端 API 未返回有效的前景图数据。");
      }

      const foregroundBase64 = apiResult.foreground;
      console.log("后端 API 调用成功，获得前景图。");

      // --- 背景合成逻辑 ---
      let outputWidthPx: number, outputHeightPx: number;
      const inchesToMm = 25.4;

      // 根据选择的尺寸（毫米或像素）和 DPI 计算最终输出像素尺寸
      if (currentSizeDetails.widthMm && currentSizeDetails.heightMm && currentSizeDetails.dpi) {
        outputWidthPx = Math.round((currentSizeDetails.widthMm / inchesToMm) * currentSizeDetails.dpi);
        outputHeightPx = Math.round((currentSizeDetails.heightMm / inchesToMm) * currentSizeDetails.dpi);
      } else if (currentSizeDetails.widthPx && currentSizeDetails.heightPx) {
         // 如果规格本身就定义了像素尺寸，则直接使用，忽略 DPI 选择
         // 可以在 UI 上对这类规格禁用 DPI 选择，或者在这里给出提示
         console.warn(`规格 ${currentSizeDetails.name} 已定义像素尺寸，忽略 DPI 选择 (${currentSizeDetails.dpi} dpi)。`);
         outputWidthPx = currentSizeDetails.widthPx;
         outputHeightPx = currentSizeDetails.heightPx;
      } else {
        throw new Error("无法计算输出尺寸：规格信息不完整。");
      }

      console.log(`计算输出尺寸: ${outputWidthPx}px x ${outputHeightPx}px @ ${currentSizeDetails.dpi}dpi`);


      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = outputWidthPx;
      outputCanvas.height = outputHeightPx;
      const ctxOutput = outputCanvas.getContext('2d');
      if (!ctxOutput) {
        throw new Error("无法创建用于输出的画布。");
      }
      ctxOutput.imageSmoothingEnabled = true;
      ctxOutput.imageSmoothingQuality = 'high';

      // 1. 填充背景色
      ctxOutput.fillStyle = finalSelectedBgColor;
      ctxOutput.fillRect(0, 0, outputWidthPx, outputHeightPx);

      // 2. 绘制从百度 API 获取的前景图 (通过后端 API 获取)
      const foregroundImg = new Image();
      foregroundImg.onload = () => {
        // 将前景图绘制到输出画布上，并缩放以填满输出画布
        // 假设百度返回的前景图是裁剪区域的原始比例
        ctxOutput.drawImage(foregroundImg, 0, 0, outputWidthPx, outputHeightPx);

        const mimeType = `image/${finalOutputFormat}`;
        const quality = finalOutputFormat === 'jpeg' ? 0.9 : undefined; // PNG 不支持 quality 参数
        const dataUrl = outputCanvas.toDataURL(mimeType, quality);

        setProcessedImageUrl(dataUrl);
        setShowProcessedPreview(true);
        setIsProcessing(false);
      };
      foregroundImg.onerror = () => {
        throw new Error("加载后端返回的前景图失败。");
      };
      // 百度返回的是PNG格式的Base64
      foregroundImg.src = `data:image/png;base64,${foregroundBase64}`;

    } catch (e: any) {
      console.error("处理图片过程中发生错误:", e);
      setProcessError(`处理失败: ${e.message || '未知错误'}`);
      setIsProcessing(false);
    }
  };


  return (
    <div
      className={styles.container}
      data-testid="id-photo-maker-container"
    >
      <header className={styles.header}>
        <h1>证件照生成器</h1>
        <p className={styles.description}>
          轻松制作符合各种规格要求的专业证件照。
        </p>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.layoutContainer}>
          {/* 左侧区域：上传照片 */}
          <div className={styles.leftColumn}>
            <section
              className={styles.uploadSection}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <h2> 上传照片</h2>
              <p>点击下方按钮选择文件，或将 JPG/PNG 图片（最大 10MB）拖拽到此区域。</p>
              <div className={styles.uploadControls}>
                <label htmlFor="file-upload-input" className={styles.fileUploadButton}>
                  选择文件
                </label>
                <input
                  id="file-upload-input"
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleFileChange}
                  className={styles.fileInputHidden} // 隐藏原生input
                  key={selectedFile ? 'file-selected' : 'no-file'}
                />
                {selectedFile && <span className={styles.fileNameDisplay}>已选择: {selectedFile.name}</span>}
              </div>
              {error && <p className={styles.errorMessage}>{error}</p>}
            </section>
          </div>

          {/* 中间区域：预览、调整、规格、背景 */}
          <div className={styles.middleColumn}>
            <section className={styles.previewSection}>
              <h2> 预览与调整</h2> {/* 调整步骤编号 */}
              <div
                className={styles.previewArea}
                style={{ cursor: previewUrl ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
              >
                <canvas
                  ref={canvasRef}
                  className={styles.previewCanvas}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                ></canvas>
                {!previewUrl && <p className={styles.previewPlaceholder}>上传照片后在此预览</p>}
              </div>
              {/* 缩放控制 */}
              {previewUrl && (
                <div className={styles.settingItem} style={{ marginTop: '15px' }}>
                  <label htmlFor="scale-slider" className={styles.label}>缩放 ({Math.round(scale * 100)}%):</label>
                  <input
                    id="scale-slider"
                    type="range"
                    min="0.1" // 最小缩放比例
                    max="4"   // 最大缩放比例
                    step="0.01" // 步长
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className={styles.rangeSlider}
                  />
                </div>
              )}
              {/* 亮度调整控制 */}
              {previewUrl && (
                <div className={styles.settingItem} style={{ marginTop: '15px' }}>
                  <label htmlFor="brightness-slider" className={styles.label}>亮度 ({brightness}%):</label>
                  <input
                    id="brightness-slider"
                    type="range"
                    min="-100" // 最小亮度
                    max="100"   // 最大亮度
                    step="1" // 步长
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
                    className={styles.rangeSlider}
                  />
                </div>
              )}
              {/* 对比度调整控制 */}
              {previewUrl && (
                <div className={styles.settingItem} style={{ marginTop: '15px' }}>
                  <label htmlFor="contrast-slider" className={styles.label}>对比度 ({contrast}%):</label>
                  <input
                    id="contrast-slider"
                    type="range"
                    min="-100" // 最小对比度
                    max="100"   // 最大对比度
                    step="1" // 步长
                    value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value, 10))}
                    className={styles.rangeSlider}
                  />
                </div>
              )}
            </section>

            <section className={styles.settingsSection}>
              <h2> 选择规格与背景</h2> {/* 调整步骤编号 */}
              <div className={styles.settingItem}>
                <label htmlFor="size-select" className={styles.label}>选择规格:</label>
                <select
                  id="size-select"
                  value={selectedSizeName}
                  onChange={(e) => {
                      setSelectedSizeName(e.target.value);
                      setIsDragging(false);
                      setIsCropInitialized(false); // 尺寸改变时重置初始化状态
                  }}
                  className={styles.selectControl}
                >
                  {presetSizes.map(size => (
                    <option key={size.name} value={size.name}>
                      {size.name} {size.note ? `(${size.note})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.settingItem}>
                <label className={styles.label}>选择背景颜色:</label>
                <div className={styles.colorOptions}>
                  {backgroundColors.map(color => (
                    <label key={color.value} className={styles.colorOptionLabel} title={color.name}>
                      <input
                        type="radio"
                        name="bgcolor"
                        value={color.value}
                        checked={selectedBgColor === color.value}
                        onChange={(e) => setSelectedBgColor(e.target.value)}
                        className={styles.radioInput}
                      />
                      <span
                        className={styles.colorSwatch}
                        style={{ backgroundColor: color.value }}
                      ></span>
                    </label>
                  ))}
                   {/* 新增自定义颜色选项 */}
                   <label key="custom" className={styles.colorOptionLabel} title="自定义颜色">
                      <input
                        type="radio"
                        name="bgcolor"
                        value="custom"
                        checked={selectedBgColor === 'custom'}
                        onChange={(e) => setSelectedBgColor('custom')}
                        className={styles.radioInput}
                      />
                       <span
                        className={styles.colorSwatch}
                        style={{ backgroundColor: customBgColor }} // 显示当前自定义颜色
                      ></span>
                   </label>
                </div>
                 {/* 自定义颜色选择器 */}
                 {selectedBgColor === 'custom' && (
                    <div className={styles.customColorPicker}>
                        <label htmlFor="custom-color" className={styles.label}>选择自定义颜色:</label>
                        <input
                            id="custom-color"
                            type="color"
                            value={customBgColor}
                            onChange={(e) => setCustomBgColor(e.target.value)}
                            className={styles.colorInput}
                        />
                    </div>
                 )}
              </div>
            </section>
          </div>

          {/* 右侧区域：处理后预览和下载 */}
          <div className={styles.rightColumn}>
            <section className={styles.downloadSection}>
              <h2> 下载照片</h2> {/* 调整步骤编号 */}
               <div className={styles.settingItem}>
                <label htmlFor="resolution-select" className={styles.label}>选择分辨率:</label>
                <select
                  id="resolution-select"
                  value={selectedDpi}
                  onChange={(e) => setSelectedDpi(parseInt(e.target.value, 10))}
                  className={styles.selectControl}
                >
                  {downloadResolutions.map(res => (
                    <option key={res.value} value={res.value}>
                      {res.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.settingItem}>
                <label htmlFor="format-select" className={styles.label}>选择输出格式:</label>
                <select
                  id="format-select"
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value as 'jpeg' | 'png')}
                  className={styles.selectControl}
                >
                  <option value="jpeg">JPG</option>
                  <option value="png">PNG</option>
                </select>
              </div>
              {isProcessing && <p className={styles.processingMessage}>正在处理图片，请稍候...</p>}
              {processError && <p className={styles.errorMessage}>处理失败: {processError}</p>}

              {/* 按钮1: 处理并预览 */}
              <button
                type="button"
                disabled={!previewUrl || !cropSize.width || isProcessing}
                onClick={handleDownload}
                className={styles.downloadSectionButton}
              >
                {isProcessing ? '处理中...' : '处理并预览背景'}
              </button>

              {/* 处理后图片预览区域 */}
              {showProcessedPreview && processedImageUrl && (
                <div className={styles.processedPreviewArea}>
                  <h4>处理后预览:</h4>
                  <img src={processedImageUrl} alt="处理后的证件照预览" className={styles.processedPreviewImage} />
                  {/* 按钮2: 确认下载 */}
                  <button
                    type="button"
                    onClick={() => {
                      if (processedImageUrl && currentSizeDetailsRef.current) {
                        const link = document.createElement('a');
                        link.href = processedImageUrl;
                        // 更新下载文件名，包含尺寸、背景颜色和DPI
                        const sizeName = currentSizeDetailsRef.current.name.split(' ')[0];
                        const bgColorCode = selectedBgColorRef.current.replace('#', '');
                        const dpiValue = currentSizeDetailsRef.current.dpi; // 使用ref中的DPI
                        link.download = `证件照-${sizeName}-${bgColorCode}-${dpiValue}dpi.${outputFormatRef.current}`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      } else {
                        setProcessError("无法下载预览图片，数据丢失。");
                      }
                    }}
                    className={styles.downloadSectionButton}
                    style={{ marginTop: '10px' }}
                  >
                    确认下载此预览
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>工具集项目 &copy; 2024-2025</p>
      </footer>
    </div>
  );
}