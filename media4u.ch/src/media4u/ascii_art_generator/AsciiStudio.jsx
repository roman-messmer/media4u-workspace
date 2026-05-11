import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Settings, Type, Image as ImageIcon, Copy, Download, RefreshCw, Sun, Zap, Activity, Grid, Sliders, Type as TypeIcon, Smartphone, Monitor, Palette, Crop as CropIcon, PanelLeftClose, PanelLeftOpen, Menu, Globe, FileImage, FileCode, Droplets, X, Check, Move, Clipboard } from 'lucide-react';

import { ASCII_RAMPS, FONTS, LANGUAGES, BASE_TRANSLATION, TRANSLATIONS } from './asciiConstants';
import CropEditor from './CropEditor';
import './AsciiStudio.css'; 

export default function AsciiStudio() {
  const [imageSrc, setImageSrc] = useState(null);
  const [asciiArt, setAsciiArt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [lang, setLang] = useState('de');
  const [errorMsg, setErrorMsg] = useState("");
  
  const t = TRANSLATIONS[lang] || BASE_TRANSLATION; 

  const [crop, setCrop] = useState({ x: 0, y: 0, width: 1, height: 1 });
  const [tempCrop, setTempCrop] = useState({ x: 0, y: 0, width: 1, height: 1 });

  const [config, setConfig] = useState({
    resolution: 120, 
    mode: 'fitWidth', 
    contrast: 1.0, 
    brightness: 0, 
    exposure: 1.0, 
    sharpness: 0, 
    noiseReduction: 0, 
    inverted: false,
    fontSize: 10,
    lineHeight: 0.6, 
    letterSpacing: 0,
    charSet: ASCII_RAMPS.standard,
    textColor: '#000000', 
    backgroundColor: '#ffffff',
    fontKey: 'system' 
  });

  const canvasRef = useRef(null);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setShowSidebar(false);
    }
  }, []);

  useEffect(() => {
    const font = FONTS[config.fontKey];
    if (font?.googleFontUrl) {
      const linkId = `font-${config.fontKey}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.href = font.googleFontUrl;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    }
  }, [config.fontKey]);

  const processFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
        setCrop({ x: 0, y: 0, width: 1, height: 1 }); 
        setTempCrop({ x: 0, y: 0, width: 1, height: 1 });
        if (window.innerWidth < 1024) setShowSidebar(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e) => {
    processFile(e.target.files[0]);
  };

  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          processFile(items[i].getAsFile());
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const applySmoothing = (data, width, height, factor) => {
    if (factor <= 0) return data;
    const w = width; const h = height;
    const output = new Uint8ClampedArray(data.length);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dstOff = (y * w + x) * 4;
        let rSum = 0, gSum = 0, bSum = 0, count = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const ny = y + ky; const nx = x + kx;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const off = (ny * w + nx) * 4;
              rSum += data[off]; gSum += data[off + 1]; bSum += data[off + 2];
              count++;
            }
          }
        }
        output[dstOff] = data[dstOff] * (1 - factor) + (rSum / count) * factor;     
        output[dstOff + 1] = data[dstOff + 1] * (1 - factor) + (gSum / count) * factor; 
        output[dstOff + 2] = data[dstOff + 2] * (1 - factor) + (bSum / count) * factor; 
        output[dstOff + 3] = 255; 
      }
    }
    return output;
  };

  const applySharpening = (data, width, height, factor) => {
    if (factor <= 0) return data;
    const w = width; const h = height;
    const output = new Float32Array(data.length); 
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dstOff = (y * w + x) * 4;
        for (let c = 0; c < 3; c++) { 
          const val = data[dstOff + c];
          const up = y > 0 ? data[((y - 1) * w + x) * 4 + c] : val;
          const down = y < h - 1 ? data[((y + 1) * w + x) * 4 + c] : val;
          const left = x > 0 ? data[(y * w + (x - 1)) * 4 + c] : val;
          const right = x < w - 1 ? data[(y * w + (x + 1)) * 4 + c] : val;
          const sharpVal = (5 * val) - (up + down + left + right);
          output[dstOff + c] = val + (sharpVal - val) * factor;
        }
        output[dstOff + 3] = 255; 
      }
    }
    const result = new Uint8ClampedArray(data.length);
    for (let i = 0; i < output.length; i++) result[i] = output[i];
    return result;
  };

  const generateAscii = useCallback(() => {
    if (!imageSrc || !canvasRef.current) return;
    setIsProcessing(true);

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const sx = img.naturalWidth * crop.x;
      const sy = img.naturalHeight * crop.y;
      const sWidth = img.naturalWidth * crop.width;
      const sHeight = img.naturalHeight * crop.height;
      const ratio = sHeight / sWidth;
      let targetWidth, targetHeight;

      if (config.mode === 'fitWidth') {
        targetWidth = config.resolution;
        targetHeight = Math.floor(targetWidth * ratio * config.lineHeight);
      } else {
        targetHeight = config.resolution;
        targetWidth = Math.floor(targetHeight / (ratio * config.lineHeight));
      }
      
      targetWidth = Math.max(1, targetWidth);
      targetHeight = Math.max(1, targetHeight);

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

      let imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      let data = imageData.data;

      if (config.noiseReduction > 0) data = applySmoothing(data, targetWidth, targetHeight, config.noiseReduction);
      if (config.sharpness > 0) data = applySharpening(data, targetWidth, targetHeight, config.sharpness);

      let asciiStr = "";
      const chars = config.inverted ? config.charSet.split("").reverse().join("") : config.charSet;
      const charLen = chars.length;
      const contrastFactor = (259 * (config.contrast * 255 + 255)) / (255 * (259 - (config.contrast * 255)));

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i]; let g = data[i+1]; let b = data[i+2];
        r = r * config.exposure; g = g * config.exposure; b = b * config.exposure;
        r = contrastFactor * (r - 128) + 128 + config.brightness;
        g = contrastFactor * (g - 128) + 128 + config.brightness;
        b = contrastFactor * (b - 128) + 128 + config.brightness;
        r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
        const gray = (0.2126 * r + 0.7152 * g + 0.0722 * b);
        const charIndex = Math.floor((gray / 255) * (charLen - 1));
        const char = chars[charIndex] || chars[charLen - 1];
        asciiStr += char;
        if (((i / 4) + 1) % targetWidth === 0) asciiStr += "\n";
      }

      setAsciiArt(asciiStr);
      setIsProcessing(false);
    };
  }, [imageSrc, config, crop]);

  useEffect(() => {
    const timer = setTimeout(() => { generateAscii(); }, 50);
    return () => clearTimeout(timer);
  }, [generateAscii]);

  const copyToClipboard = () => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = asciiArt;
      textArea.style.position = "fixed"; 
      textArea.style.left = "-9999px"; 
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    } catch (err) {
      setErrorMsg("Kopieren fehlgeschlagen.");
    }
  };

  const downloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([asciiArt], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "ascii-art.txt";
    document.body.appendChild(element);
    element.click();
  };

  const downloadJpg = () => {
    if (!asciiArt) return;
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const font = FONTS[config.fontKey];
      const fontSize = config.fontSize;
      const lineHeight = fontSize * config.lineHeight;
      const letterSpacing = config.letterSpacing;
      const lines = asciiArt.split('\n');
      const fontFamily = font.family.split(',')[0].replace(/"/g, '') || 'monospace';
      const fontString = `${fontSize}px ${fontFamily}`;

      ctx.font = fontString;
      if ('letterSpacing' in ctx) ctx.letterSpacing = `${letterSpacing}px`;

      let maxLineWidth = 0;
      lines.slice(0, 500).forEach(line => {
        const metrics = ctx.measureText(line);
        if (metrics.width > maxLineWidth) maxLineWidth = metrics.width;
      });
      if (maxLineWidth === 0) maxLineWidth = fontSize * 0.6 * lines[0].length; 
      
      const padding = 40;
      const canvasWidth = Math.ceil(maxLineWidth) + (padding * 2);
      const canvasHeight = Math.ceil(lines.length * lineHeight) + (padding * 2);

      if (canvasWidth * canvasHeight > 100000000) {
          setErrorMsg("Bild zu groß für Export. Bitte Auflösung reduzieren.");
          return;
      }

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.font = fontString;
      ctx.fillStyle = config.textColor;
      ctx.textBaseline = 'top';
      if ('letterSpacing' in ctx) ctx.letterSpacing = `${letterSpacing}px`;

      lines.forEach((line, i) => ctx.fillText(line, padding, padding + (i * lineHeight)));

      canvas.toBlob((blob) => {
        if (!blob) {
          setErrorMsg("Fehler beim Export.");
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `ascii-art-${Date.now()}.jpg`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(url); }, 100);
      }, 'image/jpeg', 0.95);
    } catch (e) { setErrorMsg("Export fehlgeschlagen."); }
  };

  const downloadHtml = () => {
    const font = FONTS[config.fontKey];
    const htmlContent = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t.export_title}</title>
    ${font.googleFontUrl ? `<link href="${font.googleFontUrl}" rel="stylesheet">` : ''}
    <style>
        body { margin: 0; padding: 2rem; background-color: ${config.backgroundColor}; color: ${config.textColor}; display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; overflow: auto; }
        pre { font-family: ${font.family}; font-size: ${config.fontSize}px; line-height: ${config.fontSize * config.lineHeight}px; letter-spacing: ${config.letterSpacing}px; white-space: pre; text-align: left; display: inline-block; }
    </style>
</head>
<body><pre>${asciiArt}</pre></body></html>`;
    const element = document.createElement("a");
    const file = new Blob([htmlContent], {type: 'text/html'});
    element.href = URL.createObjectURL(file);
    element.download = "ascii-art.html";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="ascii-studio">
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Mobile Overlay */}
      <div 
        className={`ascii-overlay ${showSidebar ? 'ascii-overlay--visible' : ''}`}
        onClick={() => setShowSidebar(false)}
      />

      {isCropping && imageSrc && (
        <CropEditor 
          imageSrc={imageSrc} 
          crop={tempCrop} 
          onChange={setTempCrop} 
          onComplete={() => { setCrop(tempCrop); setIsCropping(false); }} 
          onCancel={() => setIsCropping(false)} 
          t={t}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`ascii-sidebar ${showSidebar ? 'ascii-sidebar--open' : ''}`}>
        <div className="ascii-sidebar__header">
          <div className="ascii-sidebar__title-wrapper">
            <h1 className="ascii-sidebar__title">{t.app_title}</h1>
            <p className="ascii-sidebar__subtitle">{t.app_subtitle}</p>
          </div>
          <button className="ascii-sidebar__close-mobile" onClick={() => setShowSidebar(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="ascii-sidebar__content custom-scrollbar">
          
          <div className="ascii-controls__section">
             <h3 className="ascii-controls__title"><Globe className="w-3 h-3" /> {t.lang_label}</h3>
             <select value={lang} onChange={(e) => setLang(e.target.value)} className="ascii-select">
                {Object.keys(LANGUAGES).map(code => (
                  <option key={code} value={code}>{LANGUAGES[code]}</option>
                ))}
             </select>
          </div>

          <div className="ascii-controls__section">
            <label className="ascii-upload-box">
              <Upload className="w-8 h-8 mb-2" />
              <span className="text-sm">{t.upload_title}</span>
              <span className="text-xs opacity-50 mt-1">{t.upload_sub}</span>
              <input type="file" className="ascii-upload-box__input" accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>

          <div className="ascii-controls__section">
            <h3 className="ascii-controls__title"><Palette className="w-3 h-3" /> {t.colors_title}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="ascii-controls__group">
                <label className="ascii-controls__sublabel">{t.col_text}</label>
                <div className="flex items-center gap-2 bg-slate-900 p-1 rounded border border-slate-700">
                  <input type="color" value={config.textColor} onChange={(e) => setConfig({...config, textColor: e.target.value})} className="w-6 h-6 rounded cursor-pointer border-none bg-transparent p-0"/>
                  <span className="text-[10px] font-mono text-slate-500 truncate">{config.textColor}</span>
                </div>
              </div>
              <div className="ascii-controls__group">
                <label className="ascii-controls__sublabel">{t.col_bg}</label>
                <div className="flex items-center gap-2 bg-slate-900 p-1 rounded border border-slate-700">
                  <input type="color" value={config.backgroundColor} onChange={(e) => setConfig({...config, backgroundColor: e.target.value})} className="w-6 h-6 rounded cursor-pointer border-none bg-transparent p-0"/>
                  <span className="text-[10px] font-mono text-slate-500 truncate">{config.backgroundColor}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="ascii-controls__section">
            <h3 className="ascii-controls__title"><Grid className="w-3 h-3" /> {t.layout_title}</h3>
            
            <div className="ascii-controls__group">
              <label className="ascii-controls__sublabel">{t.font_label}</label>
              <select value={config.fontKey} onChange={(e) => setConfig({...config, fontKey: e.target.value})} className="ascii-select">
                {Object.entries(FONTS).map(([key, font]) => (
                  <option key={key} value={key}>{font.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setConfig({...config, mode: 'fitWidth'})} className={`ascii-button text-xs ${config.mode === 'fitWidth' ? 'ascii-button--primary' : ''}`}><Monitor className="w-3 h-3" /> {t.btn_width}</button>
              <button onClick={() => setConfig({...config, mode: 'fitHeight'})} className={`ascii-button text-xs ${config.mode === 'fitHeight' ? 'ascii-button--primary' : ''}`}><Smartphone className="w-3 h-3" /> {t.btn_height}</button>
            </div>

            {[
              { label: config.mode === 'fitWidth' ? t.lbl_cols : t.lbl_rows, val: config.resolution, min: 20, max: 1200, step: 2, key: 'resolution' },
              { label: t.lbl_fontsize, val: config.fontSize, min: 2, max: 24, step: 1, key: 'fontSize', unit: 'px' },
              { label: t.lbl_lineheight, val: config.lineHeight, min: 0.3, max: 1.0, step: 0.05, key: 'lineHeight' },
              { label: t.lbl_spacing, val: config.letterSpacing, min: -2, max: 10, step: 0.5, key: 'letterSpacing', unit: 'px' }
            ].map(c => (
              <div key={c.key} className="ascii-controls__group">
                <div className="ascii-controls__label"><span>{c.label}</span><span className="ascii-controls__value">{c.val}{c.unit || ''}</span></div>
                <input type="range" min={c.min} max={c.max} step={c.step} value={c.val} onChange={(e) => setConfig({...config, [c.key]: parseFloat(e.target.value)})} className="ascii-input-range"/>
              </div>
            ))}
          </div>

          <div className="ascii-controls__section">
            <h3 className="ascii-controls__title"><Sliders className="w-3 h-3" /> {t.adj_title}</h3>
            {[
              { label: t.adj_contrast, icon: Sun, val: config.contrast, min: 0, max: 3, step: 0.1, key: 'contrast' },
              { label: t.adj_brightness, icon: Zap, val: config.brightness, min: -100, max: 100, step: 5, key: 'brightness' },
              { label: t.adj_sharpness, icon: Activity, val: config.sharpness, min: 0, max: 2, step: 0.1, key: 'sharpness' },
              { label: t.adj_denoise, icon: Droplets, val: config.noiseReduction, min: 0, max: 1, step: 0.05, key: 'noiseReduction' },
              { label: t.adj_exposure, icon: ImageIcon, val: config.exposure, min: 0.1, max: 3, step: 0.1, key: 'exposure' }
            ].map(c => (
              <div key={c.key} className="ascii-controls__group">
                <div className="ascii-controls__label"><span className="flex items-center gap-1"><c.icon className="w-3 h-3"/> {c.label}</span><span className="ascii-controls__value">{c.val.toFixed(c.step < 1 ? 1 : 0)}</span></div>
                <input type="range" min={c.min} max={c.max} step={c.step} value={c.val} onChange={(e) => setConfig({...config, [c.key]: parseFloat(e.target.value)})} className="ascii-input-range"/>
              </div>
            ))}
            
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" id="inverted" checked={config.inverted} onChange={(e) => setConfig({...config, inverted: e.target.checked})} className="accent-emerald-500 w-4 h-4 rounded"/>
              <label htmlFor="inverted" className="ascii-controls__checkbox-label">{t.lbl_invert}</label>
            </div>
          </div>

          <div className="ascii-controls__section pb-8">
            <h3 className="ascii-controls__title"><Type className="w-3 h-3" /> {t.char_title}</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(ASCII_RAMPS).map((key) => (
                <button key={key} onClick={() => setConfig({...config, charSet: ASCII_RAMPS[key]})} className={`ascii-button text-xs ${config.charSet === ASCII_RAMPS[key] ? 'ascii-button--primary' : ''}`}>
                  {t[`btn_char_${key}`] || key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
            <textarea 
              value={config.charSet} 
              onChange={(e) => setConfig({...config, charSet: e.target.value})} 
              className="w-full h-20 bg-slate-900 border border-slate-700 rounded p-2 text-xs font-mono text-slate-300 focus:border-emerald-500 outline-none resize-none mt-2" 
              placeholder={t.char_placeholder}
            />
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <main className="ascii-main" style={{ backgroundColor: config.backgroundColor, transition: 'margin-left 0.3s' }}>
        <div className="ascii-toolbar">
          <div className="ascii-toolbar__left">
            <button onClick={() => setShowSidebar(!showSidebar)} className="ascii-button ascii-button--icon-only border-none hover:text-emerald-400">
              {showSidebar ? <PanelLeftClose className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            {!imageSrc && <span className="text-sm text-slate-400 hide-on-mobile">{t.status_wait}</span>}
            {imageSrc && <div className="ascii-toolbar__status"><div className="ascii-toolbar__status-dot"></div> {t.status_ready}</div>}
          </div>
          
          <div className="ascii-toolbar__right">
            {imageSrc && (
              <button onClick={() => setIsCropping(true)} className="ascii-button hide-on-mobile" title={t.btn_crop}>
                <CropIcon className="w-4 h-4" /> <span>{t.btn_crop}</span>
              </button>
            )}
            {imageSrc && (
               <button onClick={() => setIsCropping(true)} className="ascii-button ascii-button--icon-only show-on-mobile" title={t.btn_crop}>
                <CropIcon className="w-4 h-4" />
              </button>
            )}

            <button onClick={copyToClipboard} disabled={!asciiArt} className="ascii-button" title={t.btn_copy}>
              <Copy className="w-4 h-4" /> <span className="hide-on-mobile">{t.btn_copy}</span>
            </button>
            
            <button onClick={downloadJpg} disabled={!asciiArt} className="ascii-button" title="Download JPG">
              <FileImage className="w-4 h-4" /> <span className="hide-on-mobile">JPG</span>
            </button>

            <button onClick={downloadHtml} disabled={!asciiArt} className="ascii-button" title="Download HTML">
              <FileCode className="w-4 h-4" /> <span className="hide-on-mobile">HTML</span>
            </button>
            
            <button onClick={downloadTxt} disabled={!asciiArt} className="ascii-button" title="Download TXT">
              <Download className="w-4 h-4" /> <span className="hide-on-mobile">TXT</span>
            </button>
          </div>
        </div>

        <div className="ascii-preview custom-scrollbar">
          <div className="ascii-preview__content">
            {asciiArt ? (
              <pre 
                className="ascii-preview__pre"
                style={{ 
                  fontSize: `${config.fontSize}px`, 
                  lineHeight: `${config.fontSize * config.lineHeight}px`,
                  letterSpacing: `${config.letterSpacing}px`,
                  fontFamily: FONTS[config.fontKey].family,
                  color: config.textColor
                }}
              >
                {asciiArt}
              </pre>
            ) : (
              <div className="ascii-preview__empty">
                <TypeIcon className="w-16 h-16 opacity-20 mb-4" />
                <p className="text-lg font-medium">{t.empty_title}</p>
                <p className="text-sm opacity-60 mt-1">{t.empty_sub}</p>
              </div>
            )}
          </div>
          
          {imageSrc && !isCropping && (
            <div className="ascii-preview__overlay hide-on-mobile">
              <img src={imageSrc} alt="Original" />
            </div>
          )}
        </div>

        {isProcessing && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin" />
          </div>
        )}

        {/* Error Message Modal */}
        {errorMsg && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
            <div className="bg-slate-800 border border-red-500/50 rounded-lg p-6 max-w-sm w-full shadow-2xl">
              <h3 className="text-red-400 font-bold mb-2 text-lg">Hinweis</h3>
              <p className="text-white mb-6 text-sm">{errorMsg}</p>
              <div className="flex justify-end">
                <button onClick={() => setErrorMsg("")} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded text-sm transition-colors">
                  Schließen
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}