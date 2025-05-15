// app/(tools)/file-compressor/page.tsx
'use client';

import React, { useState, ChangeEvent, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import styles from './styles.module.css';

interface CompressedFileResult {
  id: string; // Unique ID for each file, useful for React keys and updates
  originalName: string;
  originalSize: number;
  compressedFile: File | null;
  compressedSize: number | null;
  previewUrl?: string;
  error?: string;
  isPdf?: boolean;
  status?: 'waiting' | 'compressing' | 'uploading' | 'processing' | 'completed' | 'failed';
}

type ImageCompressionOption = 'recommended' | 'highQuality' | 'highCompression';

const FileCompressorPage = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [compressionResults, setCompressionResults] = useState<CompressedFileResult[]>([]);
  const [isCompressingGlobal, setIsCompressingGlobal] = useState(false);
  const [imageOption, setImageOption] = useState<ImageCompressionOption>('recommended');

  // Effect to clean up blob URLs when component unmounts or results change
  useEffect(() => {
    return () => {
      compressionResults.forEach(result => {
        if (result.previewUrl) {
          URL.revokeObjectURL(result.previewUrl);
        }
      });
    };
  }, [compressionResults]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setSelectedFiles(filesArray);
      // Initialize results with original file info and 'waiting' status
      setCompressionResults(
        filesArray.map((file, index) => ({
          id: `${file.name}-${file.lastModified}-${index}`, // Create a somewhat unique ID
          originalName: file.name,
          originalSize: file.size,
          compressedFile: null,
          compressedSize: null,
          isPdf: file.type === 'application/pdf',
          status: 'waiting',
        }))
      );
    }
  };

  const handleImageOptionChange = (event: ChangeEvent<HTMLInputElement>) => {
    setImageOption(event.target.value as ImageCompressionOption);
  };

  const updateResultById = (id: string, newResult: Partial<CompressedFileResult>) => {
    setCompressionResults(prevResults =>
      prevResults.map(r => (r.id === id ? { ...r, ...newResult } : r))
    );
  };

  const handleCompress = async () => {
    if (selectedFiles.length === 0) return;

    setIsCompressingGlobal(true);
    // Reset status for all files before starting, keep original info
    setCompressionResults(prevResults =>
        prevResults.map(r => ({
            ...r, // Keep id, originalName, originalSize, isPdf
            status: 'waiting', // Reset status
            error: undefined,
            previewUrl: undefined,
            compressedSize: null,
            compressedFile: null,
        }))
    );


    for (const result of compressionResults) { // Iterate over the initial results array
      // Find the actual file object from selectedFiles.
      // This assumes that the order in selectedFiles matches the initial order of compressionResults,
      // or that originalName + originalSize is a unique enough identifier for this batch.
      const file = selectedFiles.find(f => f.name === result.originalName && f.size === result.originalSize && `${f.name}-${f.lastModified}` === result.id.substring(0, result.id.lastIndexOf('-')));


      if (!file) {
        updateResultById(result.id, { error: 'Original file not found for processing.', status: 'failed' });
        continue;
      }

      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';

      if (isImage) {
        updateResultById(result.id, { status: 'compressing' });
        try {
          let compressionOptions;
          switch (imageOption) {
            case 'highQuality':
              compressionOptions = { maxSizeMB: 2, maxWidthOrHeight: 1920, initialQuality: 0.9, useWebWorker: true };
              break;
            case 'highCompression':
              compressionOptions = { maxSizeMB: 0.5, maxWidthOrHeight: 1280, initialQuality: 0.6, useWebWorker: true };
              break;
            default: // recommended
              compressionOptions = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
              break;
          }
          const compressedImageFile = await imageCompression(file, compressionOptions);
          const previewUrl = URL.createObjectURL(compressedImageFile);
          updateResultById(result.id, {
            compressedFile: compressedImageFile,
            compressedSize: compressedImageFile.size,
            previewUrl: previewUrl,
            status: 'completed',
          });
        } catch (error) {
          console.error(`Error compressing image ${file.name}:`, error);
          updateResultById(result.id, {
            error: error instanceof Error ? error.message : 'Unknown image compression error',
            status: 'failed',
          });
        }
      } else if (isPdf) {
        updateResultById(result.id, { status: 'uploading' });
        const formData = new FormData();
        formData.append('file', file);

        try {
          const response = await fetch('/api/compress-pdf', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response from server', details: `Server responded with ${response.status}` }));
            throw new Error(errorData.details || errorData.error || `Server error: ${response.status}`);
          }
          updateResultById(result.id, { status: 'processing' });
          const blob = await response.blob();
          const compressedPdfFile = new File([blob], `compressed-${file.name}`, { type: 'application/pdf' });
          const previewUrl = URL.createObjectURL(blob);

          updateResultById(result.id, {
            compressedFile: compressedPdfFile,
            compressedSize: blob.size,
            previewUrl: previewUrl, // This will be the download link
            status: 'completed',
          });
        } catch (error) {
          console.error(`Error processing PDF ${file.name}:`, error);
          updateResultById(result.id, {
            error: error instanceof Error ? error.message : 'PDF processing failed',
            status: 'failed',
          });
        }
      } else {
        updateResultById(result.id, { error: 'Unsupported file type.', status: 'failed' });
      }
    }
    setIsCompressingGlobal(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>文件压缩工具</h1>
      <p className={styles.description}>上传 PDF, JPG/JPEG, 或 PNG 文件进行压缩。</p>

      <div className={styles.uploadArea}>
        <p>选择文件进行压缩:</p>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png"
          disabled={isCompressingGlobal}
        />
      </div>

      <div className={styles.optionsArea}>
        <h2>图片压缩选项</h2>
        <div className={styles.radioGroup}>
          {(['recommended', 'highQuality', 'highCompression'] as ImageCompressionOption[]).map(opt => (
            <label key={opt}>
              <input
                type="radio"
                name="imageOption"
                value={opt}
                checked={imageOption === opt}
                onChange={handleImageOptionChange}
                disabled={isCompressingGlobal}
              />
              {opt === 'recommended' && '推荐 (平衡)'}
              {opt === 'highQuality' && '高质量 (文件稍大)'}
              {opt === 'highCompression' && '高压缩 (文件较小)'}
            </label>
          ))}
        </div>
        <p className={styles.note}>PDF 文件将使用后端默认设置 (推荐) 进行压缩。</p>
      </div>

      <div className={styles.actionsArea}>
        <button
          onClick={handleCompress}
          disabled={selectedFiles.length === 0 || isCompressingGlobal}
        >
          {isCompressingGlobal ? '处理中...' : '开始压缩全部'}
        </button>
      </div>

      {compressionResults.length > 0 && (
        <div className={styles.resultsArea}>
          <h2>文件与压缩结果:</h2>
          <ul className={styles.resultsList}>
            {compressionResults.map((result) => (
              <li key={result.id} className={styles.resultItem}>
                <strong>{result.originalName}</strong> (原始大小: {(result.originalSize / 1024).toFixed(2)} KB)
                {result.status === 'waiting' && <p> - 等待处理...</p>}
                {result.status === 'uploading' && <p> - 上传中...</p>}
                {result.status === 'compressing' && <p> - 图片压缩中...</p>}
                {result.status === 'processing' && <p> - PDF处理中...</p>}
                {result.error && <p className={styles.errorText}>错误: {result.error}</p>}
                {result.status === 'completed' && result.compressedFile && result.compressedSize !== null && (
                  <div>
                    <p>
                      压缩后大小: {(result.compressedSize / 1024).toFixed(2)} KB
                      (压缩率: {((1 - result.compressedSize / result.originalSize) * 100).toFixed(2)}%)
                    </p>
                    {result.previewUrl && result.isPdf && (
                      <a
                        href={result.previewUrl}
                        download={`compressed-${result.originalName}`}
                        className={styles.downloadLink}
                      >
                        下载压缩PDF
                      </a>
                    )}
                    {result.previewUrl && !result.isPdf && result.compressedFile.type.startsWith('image/') && (
                      <>
                        <img src={result.previewUrl} alt={`Preview of ${result.originalName}`} className={styles.previewImage} />
                        <a
                          href={result.previewUrl}
                          download={result.compressedFile.name}
                          className={styles.downloadLink}
                          style={{ marginLeft: '10px' }}
                        >
                          下载压缩图片
                        </a>
                      </>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileCompressorPage;