"use client";

// app/(tools)/json-tool/page.tsx
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import jsonParser from 'json-parser';
import styles from './styles.module.css';

// 使用 dynamic import 动态加载 ReactJsonView，并禁用 SSR
const ReactJsonView = dynamic(() => import('react-json-view'), { ssr: false });

const JsonToolPage: React.FC = () => {
  const [jsonInput, setJsonInput] = useState('{\n  "name": "示例",\n  "version": 1.0,\n  "data": [\n    {\n      "id": 1,\n      "value": "你好"\n    },\n    {\n      "id": 2,\n      "value": "世界"\n    }\n  ]\n}'); // 添加默认 JSON 示例
  const [validationResult, setValidationResult] = useState('');
  const [formattedJson, setFormattedJson] = useState('');
  const [compressedJson, setCompressedJson] = useState('');
  const [visualizationData, setVisualizationData] = useState<object | null>(null);
  const [activeTab, setActiveTab] = useState<'validation' | 'formatted' | 'visualization'>('validation');
  const [indent, setIndent] = useState<string | number>(2); // 默认缩进为2个空格

  // 实时校验 JSON
  useEffect(() => {
    if (jsonInput.trim() === '') {
      setValidationResult('');
      setFormattedJson('');
      setCompressedJson('');
      setVisualizationData(null);
      return;
    }

    try {
      jsonParser.parse(jsonInput);
      setValidationResult('JSON 语法正确！');
      const parsedJson = JSON.parse(jsonInput);
      setFormattedJson(JSON.stringify(parsedJson, null, indent));
      setCompressedJson(JSON.stringify(parsedJson));
      setVisualizationData(parsedJson);
    } catch (e: any) {
      setValidationResult(`JSON 语法错误：\n${e.message}`);
      setFormattedJson('');
      setCompressedJson('');
      setVisualizationData(null);
    }
  }, [jsonInput, indent]);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(event.target.value);
  };

  const handleIndentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setIndent(value === 'tab' ? '\t' : parseInt(value, 10));
  };

  const handleFormat = () => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      setFormattedJson(JSON.stringify(parsedJson, null, indent));
      setActiveTab('formatted');
    } catch (e: any) {
      setFormattedJson(`格式化失败：\n${e.message}`);
      setActiveTab('formatted');
    }
  };

  const handleCompress = () => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      setCompressedJson(JSON.stringify(parsedJson));
      setActiveTab('formatted'); // 压缩结果也显示在格式化Tab
    } catch (e: any) {
      setCompressedJson(`压缩失败：\n${e.message}`);
      setActiveTab('formatted');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>JSON 工具</h1>
      <div className={styles.content}>
        <div className={styles.leftPanel}>
          <h2>输入 JSON</h2>
          <textarea
            className={styles.jsonInput}
            value={jsonInput}
            onChange={handleInputChange}
            placeholder="在这里输入 JSON 字符串..."
          />
          <div className={styles.controls}>
            <button onClick={handleFormat}>格式化</button>
            <button onClick={handleCompress}>压缩</button>
            <label htmlFor="indent">缩进:</label>
            <select id="indent" value={indent} onChange={handleIndentChange}>
              <option value={2}>2 个空格</option>
              <option value={4}>4 个空格</option>
              <option value="tab">Tab</option>
            </select>
          </div>
        </div>
        <div className={styles.rightPanel}>
          <div className={styles.tabs}>
            <button
              className={activeTab === 'validation' ? styles.activeTab : ''}
              onClick={() => setActiveTab('validation')}
            >
              校验结果
            </button>
            <button
              className={activeTab === 'formatted' ? styles.activeTab : ''}
              onClick={() => setActiveTab('formatted')}
            >
              格式化/压缩输出
            </button>
            <button
              className={activeTab === 'visualization' ? styles.activeTab : ''}
              onClick={() => setActiveTab('visualization')}
              disabled={!visualizationData} // 没有合法JSON数据时禁用可视化Tab
            >
              可视化
            </button>
          </div>
          <div className={styles.tabContent}>
            {activeTab === 'validation' && (
              <div className={styles.validationOutput}>
                <div className={styles.outputHeader}>
                  <h3>校验结果</h3>
                  {validationResult && (
                    <button onClick={() => copyToClipboard(validationResult)} className={styles.copyButton}>复制</button>
                  )}
                </div>
                <pre>{validationResult}</pre>
              </div>
            )}
            {activeTab === 'formatted' && (
              <div className={styles.formattedOutput}>
                 <div className={styles.outputHeader}>
                  <h3>格式化/压缩输出</h3>
                  {(formattedJson || compressedJson) && (
                     <button onClick={() => copyToClipboard(formattedJson || compressedJson)} className={styles.copyButton}>复制</button>
                  )}
                </div>
                <pre>{jsonInput.trim() === '' ? '' : (formattedJson || compressedJson)}</pre>
              </div>
            )}
            {activeTab === 'visualization' && visualizationData && (
              <div className={styles.visualizationOutput}>
                <ReactJsonView src={visualizationData} enableClipboard={false} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 复制到剪贴板的函数
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    // 可以添加一些用户反馈，例如提示消息
    console.log('内容已复制到剪贴板');
  }).catch(err => {
    console.error('复制失败:', err);
  });
};

export default JsonToolPage;