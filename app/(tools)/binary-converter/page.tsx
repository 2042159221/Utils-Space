'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import styles from './styles.module.css';

// 定义进制类型
type Base = 2 | 8 | 10 | 16;

const BinaryConverterPage: React.FC = () => {
    // 状态管理
    const [inputValue, setInputValue] = useState<string>('');
    const [inputBase, setInputBase] = useState<Base>(10);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const [binaryResult, setBinaryResult] = useState<string>('-');
    const [octalResult, setOctalResult] = useState<string>('-');
    const [decimalResult, setDecimalResult] = useState<string>('-');
    const [hexResult, setHexResult] = useState<string>('-');

    // 输入框错误状态
    const [inputError, setInputError] = useState<boolean>(false);

    // 处理输入值变化
    const handleInputValueChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    // 处理输入进制变化
    const handleInputBaseChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setInputBase(parseInt(e.target.value, 10) as Base);
    };

    // 清除错误信息
    const clearError = () => {
        setErrorMessage('');
        setInputError(false);
    };

    // 重置结果
    const resetResults = () => {
        setBinaryResult('-');
        setOctalResult('-');
        setDecimalResult('-');
        setHexResult('-');
    };

    // 显示错误信息
    const displayError = (message: string) => {
        setErrorMessage(message);
        setInputError(true);
    };

    // 验证输入值
    const validateInput = (value: string, base: Base): boolean => {
        if (value === null || typeof value === 'undefined' || value === '') return true;

        let regex: RegExp;
        switch (base) {
            case 2:
                regex = /^[01]+$/;
                break;
            case 8:
                regex = /^[0-7]+$/;
                break;
            case 10:
                regex = /^\d+$/;
                break;
            case 16:
                const coreValue = value.toLowerCase().startsWith('0x') ? value.substring(2) : value;
                if (coreValue === '' && value.toLowerCase().startsWith('0x')) return true; // "0x" 本身认为是部分有效
                regex = /^[0-9a-fA-F]+$/;
                return regex.test(coreValue);
            default:
                return false;
        }
        return regex.test(value);
    };

    // 更新所有进制的结果
    const updateResultsState = (decimalValue: number) => {
        if (isNaN(decimalValue) || decimalValue < 0) {
            resetResults();
            if (!isNaN(decimalValue) && decimalValue < 0) {
                displayError("暂不支持负数转换。");
            }
            return;
        }
        setBinaryResult(decimalValue.toString(2));
        setOctalResult(decimalValue.toString(8));
        setDecimalResult(decimalValue.toString(10));
        setHexResult(decimalValue.toString(16).toUpperCase());
    };


    // 核心转换逻辑，当 inputValue 或 inputBase 变化时触发
    useEffect(() => {
        const value = inputValue.trim();
        const base = inputBase;

        clearError();

        if (value === "") {
            resetResults();
            return;
        }

        if (!validateInput(value, base)) {
            const baseTextMap = { 2: '二进制', 8: '八进制', 10: '十进制', 16: '十六进制' };
            displayError(`无效的${baseTextMap[base]}数字。`);
            resetResults();
            return;
        }

        let decimalValue: number;
        try {
            if (base === 10) {
                // 对于十进制，确保整个字符串都是数字
                if (!/^\d+$/.test(value)) {
                    throw new Error("Invalid decimal number string");
                }
            }
            decimalValue = parseInt(value, base);

            if (isNaN(decimalValue)) {
                // parseInt 可能会对某些无效输入（如 "0x" 单独输入给 parseInt(value, 16)）返回 NaN
                // 或者对于过大的数字，也可能表现不一致
                throw new Error("Conversion resulted in NaN or invalid number for base.");
            }
        } catch (error) {
            displayError(`无法将 "${value}" 从${base}进制转换。`);
            resetResults();
            return;
        }
        
        updateResultsState(decimalValue);

    }, [inputValue, inputBase]);

    // 复制到剪贴板功能
    const copyToClipboard = async (text: string, buttonId: string) => {
        if (text && text !== '-') {
            try {
                await navigator.clipboard.writeText(text);
                // 改变按钮文字提示复制成功
                const button = document.getElementById(buttonId);
                if (button) {
                    const originalText = button.textContent;
                    button.textContent = '已复制!';
                    setTimeout(() => {
                        button.textContent = originalText;
                    }, 1500);
                }
            } catch (err) {
                console.error('复制失败: ', err);
                alert('复制失败，请手动复制。');
            }
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.container}>
                <h1 className={styles.titleHeading}>进制转换器</h1>

            <div className={styles.inputGroup}>
                <label htmlFor="inputValue">输入数值:</label>
                <input
                    type="text"
                    id="inputValue"
                    placeholder="例如: 1010"
                    value={inputValue}
                    onChange={handleInputValueChange}
                    className={inputError ? styles.error : ''}
                />
                {errorMessage && <p id="errorMessage" className={styles.errorMessage}>{errorMessage}</p>}
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="inputBase">输入进制:</label>
                <select id="inputBase" value={inputBase} onChange={handleInputBaseChange}>
                    <option value="2">二进制 (Binary)</option>
                    <option value="8">八进制 (Octal)</option>
                    <option value="10">十进制 (Decimal)</option>
                    <option value="16">十六进制 (Hexadecimal)</option>
                </select>
            </div>

            <div className={styles.resultsPanel}>
                <div className={styles.resultItem}>
                    <span className={styles.baseName}>二进制:</span>
                    <span className={styles.value} id="binaryResultValue">{binaryResult}</span>
                    <button id="copyBinaryBtn" onClick={() => copyToClipboard(binaryResult, 'copyBinaryBtn')}>复制</button>
                </div>
                <div className={styles.resultItem}>
                    <span className={styles.baseName}>八进制:</span>
                    <span className={styles.value} id="octalResultValue">{octalResult}</span>
                    <button id="copyOctalBtn" onClick={() => copyToClipboard(octalResult, 'copyOctalBtn')}>复制</button>
                </div>
                <div className={styles.resultItem}>
                    <span className={styles.baseName}>十进制:</span>
                    <span className={styles.value} id="decimalResultValue">{decimalResult}</span>
                    <button id="copyDecimalBtn" onClick={() => copyToClipboard(decimalResult, 'copyDecimalBtn')}>复制</button>
                </div>
                <div className={styles.resultItem}>
                    <span className={styles.baseName}>十六进制:</span>
                    <span className={styles.value} id="hexResultValue">{hexResult}</span>
                    <button id="copyHexBtn" onClick={() => copyToClipboard(hexResult, 'copyHexBtn')}>复制</button>
                </div>
            </div>
            </div>
        </div>
    );
};

export default BinaryConverterPage;