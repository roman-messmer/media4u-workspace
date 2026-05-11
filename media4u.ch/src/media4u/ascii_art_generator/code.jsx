import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Settings, Type, Image as ImageIcon, Copy, Download, RefreshCw, Sun, Zap, Activity, Grid, Sliders, Type as TypeIcon, Smartphone, Monitor, Palette, Crop as CropIcon, Check, X, Move, FileCode, Clipboard, FileImage, Droplets, PanelLeftClose, PanelLeftOpen, Menu, Globe } from 'lucide-react';

/* --- KONFIGURATION & HELPER --- */

const ASCII_RAMPS = {
  standard: "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ",
  simple: "@%#*+=-:. ",
};

const FONTS = {
  system: { name: 'System Mono', family: '"Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", monospace' },
  courier: { name: 'Courier New', family: '"Courier New", Courier, monospace' },
  consolas: { name: 'Consolas', family: '"Consolas", "Monaco", monospace' },
  fira: { name: 'Fira Code', family: '"Fira Code", monospace', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500&display=swap' },
  roboto: { name: 'Roboto Mono', family: '"Roboto Mono", monospace', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300;400;500&display=swap' },
  vt323: { name: 'VT323 (Retro)', family: '"VT323", monospace', googleFontUrl: 'https://fonts.googleapis.com/css2?family=VT323&display=swap' },
  jetbrains: { name: 'JetBrains Mono', family: '"JetBrains Mono", monospace', googleFontUrl: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400&display=swap' },
};

/* --- SPRACHDEFINITIONEN --- */
const LANGUAGES = {
  de: "Deutsch", en: "English", fr: "Français", it: "Italiano", es: "Español", pt: "Português",
  ru: "Русский", ja: "日本語", ko: "한국어", zh: "中文", nl: "Nederlands", vi: "Tiếng Việt",
  th: "ไทย", sv: "Svenska", pl: "Polski", cs: "Čeština", hu: "Magyar", ro: "Română",
  bg: "Български", fil: "Filipino", id: "Bahasa Indonesia", ms: "Bahasa Melayu", hi: "हिन्दी", tr: "Türkçe"
};

const BASE_TRANSLATION = {
    app_title: "ASCII Art Generator", app_subtitle: "Created by MEDIA4U.CH", lang_label: "Languages",
    upload_title: "Upload Image", upload_sub: "Drag & Drop or Ctrl+V",
    colors_title: "Colors", col_text: "Text", col_bg: "Background",
    layout_title: "Grid & Layout", font_label: "Font Family",
    btn_width: "Fit Width", btn_height: "Fit Height",
    lbl_cols: "Columns", lbl_rows: "Rows", lbl_fontsize: "Font Size", lbl_lineheight: "Line Height", lbl_spacing: "Letter Spacing",
    adj_title: "Adjustments", adj_contrast: "Contrast", adj_brightness: "Brightness", adj_sharpness: "Sharpness", adj_denoise: "Denoise", adj_exposure: "Exposure",
    lbl_invert: "Inverted", char_title: "Character Set", char_placeholder: "Custom characters...",
    btn_char_standard: "Standard", btn_char_simple: "Simple",
    crop_title: "Select Crop Area", btn_cancel: "Cancel", btn_done: "Done",
    status_ready: "Ready", status_wait: "Upload image to start",
    empty_title: "Waiting for image...", empty_sub: "Upload an image on the left.",
    btn_crop: "Crop", btn_copy: "Copy", export_title: "ASCII Art Export"
};

const TRANSLATIONS = {
  en: BASE_TRANSLATION,
  de: { ...BASE_TRANSLATION, app_title: "ASCII-Art Generator", app_subtitle: "Erstellt von MEDIA4U.CH", lang_label: "Sprache", upload_title: "Bild hochladen", upload_sub: "Drag & Drop oder Strg+V", colors_title: "Farben", col_text: "Text", col_bg: "Hintergrund", layout_title: "Grid & Layout", font_label: "Schriftart", btn_width: "Breite Fix", btn_height: "Höhe Fix", lbl_cols: "Spalten", lbl_rows: "Zeilen", lbl_fontsize: "Schriftgröße", lbl_lineheight: "Zeilenhöhe", lbl_spacing: "Zeichenabstand", adj_title: "Anpassungen", adj_contrast: "Kontrast", adj_brightness: "Helligkeit", adj_sharpness: "Schärfe", adj_denoise: "Rauschreduktion", adj_exposure: "Belichtung", lbl_invert: "Invertiert", char_title: "Zeichenwahl", char_placeholder: "Eigene Zeichen...", btn_char_standard: "Standard", btn_char_simple: "Einfach", crop_title: "Ausschnitt wählen", btn_cancel: "Abbrechen", btn_done: "Fertig", status_ready: "Bereit", status_wait: "Bild hochladen zum Starten", empty_title: "Warte auf Bildmaterial...", empty_sub: "Lade links ein Bild hoch.", btn_crop: "Zuschneiden", btn_copy: "Kopieren" },
  fr: { ...BASE_TRANSLATION, lang_label: "Langue", upload_title: "Télécharger", upload_sub: "Glisser-déposer ou Ctrl+V", colors_title: "Couleurs", col_text: "Texte", col_bg: "Fond", layout_title: "Grille & Mise en page", font_label: "Police", btn_width: "Largeur Fixe", btn_height: "Hauteur Fixe", lbl_cols: "Colonnes", lbl_rows: "Lignes", lbl_fontsize: "Taille Police", lbl_lineheight: "Hauteur Ligne", lbl_spacing: "Espacement", adj_title: "Réglages", adj_contrast: "Contraste", adj_brightness: "Luminosité", adj_sharpness: "Netteté", adj_denoise: "Réduction Bruit", adj_exposure: "Exposition", lbl_invert: "Inverser", char_title: "Jeux de caractères", char_placeholder: "Caractères personnalisés...", btn_char_standard: "Standard", btn_char_simple: "Simple", crop_title: "Rogner l'image", btn_cancel: "Annuler", btn_done: "Terminé", status_ready: "Prêt", status_wait: "Télécharger pour commencer", empty_title: "En attente d'image...", empty_sub: "Chargez une image à gauche.", btn_crop: "Rogner", btn_copy: "Copier", export_title: "Export Art ASCII" },
  it: { ...BASE_TRANSLATION, lang_label: "Lingua", upload_title: "Carica Immagine", upload_sub: "Trascina o Ctrl+V", colors_title: "Colori", col_text: "Testo", col_bg: "Sfondo", layout_title: "Griglia & Layout", font_label: "Font", btn_width: "Lagh. Fissa", btn_height: "Alt. Fissa", lbl_cols: "Colonne", lbl_rows: "Righe", lbl_fontsize: "Dim. Font", lbl_lineheight: "Interlinea", lbl_spacing: "Spaziatura", adj_title: "Regolazioni", adj_contrast: "Contrasto", adj_brightness: "Luminosità", adj_sharpness: "Nitidezza", adj_denoise: "Riduzione Rumore", adj_exposure: "Esposizione", lbl_invert: "Inverti", char_title: "Set Caratteri", char_placeholder: "Caratteri personalizzati...", btn_char_standard: "Standard", btn_char_simple: "Semplice", crop_title: "Ritaglia Immagine", btn_cancel: "Annulla", btn_done: "Fatto", status_ready: "Pronto", status_wait: "Carica immagine per iniziare", empty_title: "In attesa...", empty_sub: "Carica un'immagine a sinistra.", btn_crop: "Ritaglia", btn_copy: "Copia", export_title: "Esporta Arte ASCII" },
  es: { ...BASE_TRANSLATION, lang_label: "Idioma", upload_title: "Subir Imagen", upload_sub: "Arrastrar o Ctrl+V", colors_title: "Colores", col_text: "Texto", col_bg: "Fondo", layout_title: "Cuadrícula y Diseño", font_label: "Fuente", btn_width: "Ancho Fijo", btn_height: "Alto Fijo", lbl_cols: "Columnas", lbl_rows: "Filas", lbl_fontsize: "Tamaño Fuente", lbl_lineheight: "Altura Línea", lbl_spacing: "Espaciado", adj_title: "Ajustes", adj_contrast: "Contraste", adj_brightness: "Brillo", adj_sharpness: "Nitidez", adj_denoise: "Reducción Ruido", adj_exposure: "Exposición", lbl_invert: "Invertir", char_title: "Caracteres", char_placeholder: "Caracteres personalizados...", btn_char_standard: "Estándar", btn_char_simple: "Simple", crop_title: "Recortar Imagen", btn_cancel: "Cancelar", btn_done: "Hecho", status_ready: "Listo", status_wait: "Sube una imagen para empezar", empty_title: "Esperando imagen...", empty_sub: "Sube una imagen a la izquierda.", btn_crop: "Recortar", btn_copy: "Copiar", export_title: "Exportar Arte ASCII" },
  pt: { ...BASE_TRANSLATION, lang_label: "Idioma", upload_title: "Carregar Imagem", upload_sub: "Arrastar ou Ctrl+V", colors_title: "Cores", col_text: "Texto", col_bg: "Fundo", layout_title: "Grade e Layout", font_label: "Fonte", btn_width: "Largura Fixa", btn_height: "Altura Fixa", lbl_cols: "Colunas", lbl_rows: "Linhas", lbl_fontsize: "Tam. Fonte", lbl_lineheight: "Alt. Linha", lbl_spacing: "Espaçamento", adj_title: "Ajustes", adj_contrast: "Contraste", adj_brightness: "Brilho", adj_sharpness: "Nitidez", adj_denoise: "Redução Ruído", adj_exposure: "Exposição", lbl_invert: "Inverter", char_title: "Caracteres", char_placeholder: "Caracteres personalizados...", btn_char_standard: "Padrão", btn_char_simple: "Simples", crop_title: "Cortar Imagem", btn_cancel: "Cancelar", btn_done: "Concluído", status_ready: "Pronto", status_wait: "Carregue uma imagem", empty_title: "Aguardando imagem...", empty_sub: "Carregue uma imagem à esquerda.", btn_crop: "Cortar", btn_copy: "Copiar", export_title: "Exportar Arte ASCII" },
  ru: { ...BASE_TRANSLATION, lang_label: "Язык", upload_title: "Загрузить", upload_sub: "Перетащите или Ctrl+V", colors_title: "Цвета", col_text: "Текст", col_bg: "Фон", layout_title: "Макет", font_label: "Шрифт", btn_width: "По ширине", btn_height: "По высоте", lbl_cols: "Столбцы", lbl_rows: "Строки", lbl_fontsize: "Размер", lbl_lineheight: "Высота строки", lbl_spacing: "Интервал", adj_title: "Настройки", adj_contrast: "Контраст", adj_brightness: "Яркость", adj_sharpness: "Резкость", adj_denoise: "Шум", adj_exposure: "Экспозиция", lbl_invert: "Инверсия", char_title: "Символы", char_placeholder: "Свои символы...", btn_char_standard: "Стандарт", btn_char_simple: "Простой", crop_title: "Обрезка", btn_cancel: "Отмена", btn_done: "Готово", status_ready: "Готово", status_wait: "Загрузите изображение", empty_title: "Жду изображение...", empty_sub: "Загрузите изображение слева.", btn_crop: "Обрезка", btn_copy: "Копировать", export_title: "Экспорт ASCII Art" },
  ja: { ...BASE_TRANSLATION, lang_label: "言語", upload_title: "画像アップロード", upload_sub: "ドラッグ＆ドロップ / Ctrl+V", colors_title: "色", col_text: "テキスト", col_bg: "背景", layout_title: "レイアウト", font_label: "フォント", btn_width: "幅に合わせる", btn_height: "高さに合わせる", lbl_cols: "列", lbl_rows: "行", lbl_fontsize: "文字サイズ", lbl_lineheight: "行間", lbl_spacing: "文字間隔", adj_title: "調整", adj_contrast: "コントラスト", adj_brightness: "明るさ", adj_sharpness: "シャープネス", adj_denoise: "ノイズ除去", adj_exposure: "露出", lbl_invert: "反転", char_title: "文字セット", char_placeholder: "カスタム文字...", btn_char_standard: "標準", btn_char_simple: "シンプル", crop_title: "切り抜き", btn_cancel: "キャンセル", btn_done: "完了", status_ready: "完了", status_wait: "画像をアップロード", empty_title: "画像待ち...", empty_sub: "左側で画像をアップロードしてください。", btn_crop: "トリミング", btn_copy: "コピー", export_title: "ASCIIアートのエクスポート" },
  ko: { ...BASE_TRANSLATION, lang_label: "언어", upload_title: "이미지 업로드", upload_sub: "드래그 앤 드롭 / Ctrl+V", colors_title: "색상", col_text: "텍스트", col_bg: "배경", layout_title: "레이아웃", font_label: "글꼴", btn_width: "너비 맞춤", btn_height: "높이 맞춤", lbl_cols: "열", lbl_rows: "행", lbl_fontsize: "글꼴 크기", lbl_lineheight: "줄 높이", lbl_spacing: "자간", adj_title: "조정", adj_contrast: "대비", adj_brightness: "밝기", adj_sharpness: "선명도", adj_denoise: "노이즈 제거", adj_exposure: "노출", lbl_invert: "반전", char_title: "문자 세트", char_placeholder: "사용자 지정 문자...", btn_char_standard: "표준", btn_char_simple: "간단", crop_title: "자르기", btn_cancel: "취소", btn_done: "완료", status_ready: "준비", status_wait: "이미지 업로드", empty_title: "이미지 대기 중...", empty_sub: "왼쪽에서 이미지를 업로드하세요.", btn_crop: "자르기", btn_copy: "복사", export_title: "ASCII 아트 내보내기" },
  zh: { ...BASE_TRANSLATION, lang_label: "语言", upload_title: "上传图片", upload_sub: "拖放或 Ctrl+V", colors_title: "颜色", col_text: "文本", col_bg: "背景", layout_title: "布局", font_label: "字体", btn_width: "适应宽度", btn_height: "适应高度", lbl_cols: "列", lbl_rows: "行", lbl_fontsize: "字体大小", lbl_lineheight: "行高", lbl_spacing: "字间距", adj_title: "调整", adj_contrast: "对比度", adj_brightness: "亮度", adj_sharpness: "清晰度", adj_denoise: "降噪", adj_exposure: "曝光", lbl_invert: "反转", char_title: "字符集", char_placeholder: "自定义字符...", btn_char_standard: "标准", btn_char_simple: "简单", crop_title: "裁剪图片", btn_cancel: "取消", btn_done: "完成", status_ready: "就绪", status_wait: "上传图片开始", empty_title: "等待图片...", empty_sub: "请在左侧上传图片。", btn_crop: "裁剪", btn_copy: "复制", export_title: "导出 ASCII 艺术" },
  nl: { ...BASE_TRANSLATION, lang_label: "Taal", upload_title: "Afbeelding uploaden", upload_sub: "Slepen of Ctrl+V", colors_title: "Kleuren", col_text: "Tekst", col_bg: "Achtergrond", layout_title: "Raster & Lay-out", font_label: "Lettertype", btn_width: "Breedte", btn_height: "Hoogte", lbl_cols: "Kolommen", lbl_rows: "Rijen", lbl_fontsize: "Tekstgrootte", lbl_lineheight: "Regelhoogte", lbl_spacing: "Spatiëring", adj_title: "Aanpassingen", adj_contrast: "Contrast", adj_brightness: "Helderheid", adj_sharpness: "Scherpte", adj_denoise: "Ruisreductie", adj_exposure: "Belichting", lbl_invert: "Omkeren", char_title: "Tekenset", char_placeholder: "Eigen tekens...", btn_char_standard: "Standaard", btn_char_simple: "Eenvoudig", crop_title: "Uitsnijden", btn_cancel: "Annuleren", btn_done: "Klaar", status_ready: "Klaar", status_wait: "Upload afbeelding", empty_title: "Wachten op afbeelding...", empty_sub: "Upload links een afbeelding.", btn_crop: "Bijsnijden", btn_copy: "Kopiëren", export_title: "ASCII Kunst Exporteren" },
  vi: { ...BASE_TRANSLATION, lang_label: "Ngôn ngữ", upload_title: "Tải ảnh lên", upload_sub: "Kéo thả hoặc Ctrl+V", colors_title: "Màu sắc", col_text: "Văn bản", col_bg: "Nền", layout_title: "Bố cục", font_label: "Phông chữ", btn_width: "Vừa Chiều Rộng", btn_height: "Vừa Chiều Cao", lbl_cols: "Cột", lbl_rows: "Hàng", lbl_fontsize: "Cỡ chữ", lbl_lineheight: "Chiều cao dòng", lbl_spacing: "Khoảng cách", adj_title: "Điều chỉnh", adj_contrast: "Độ tương phản", adj_brightness: "Độ sáng", adj_sharpness: "Độ sắc nét", adj_denoise: "Giảm nhiễu", adj_exposure: "Phơi sáng", lbl_invert: "Đảo ngược", char_title: "Bộ ký tự", char_placeholder: "Ký tự tùy chỉnh...", btn_char_standard: "Tiêu chuẩn", btn_char_simple: "Đơn giản", crop_title: "Cắt ảnh", btn_cancel: "Hủy", btn_done: "Xong", status_ready: "Sẵn sàng", status_wait: "Tải ảnh để bắt đầu", empty_title: "Đang chờ ảnh...", empty_sub: "Tải ảnh lên ở bên trái.", btn_crop: "Cắt", btn_copy: "Sao chép", export_title: "Xuất ASCII Art" },
  th: { ...BASE_TRANSLATION, lang_label: "ภาษา", upload_title: "อัปโหลดรูปภาพ", upload_sub: "ลากและวางหรือ Ctrl+V", colors_title: "สี", col_text: "ข้อความ", col_bg: "พื้นหลัง", layout_title: "เค้าโครง", font_label: "แบบอักษร", btn_width: "พอดีความกว้าง", btn_height: "พอดีความสูง", lbl_cols: "คอลัมน์", lbl_rows: "แถว", lbl_fontsize: "ขนาดอักษร", lbl_lineheight: "ความสูงบรรทัด", lbl_spacing: "ระยะห่าง", adj_title: "การปรับแต่ง", adj_contrast: "ความคมชัด", adj_brightness: "ความสว่าง", adj_sharpness: "ความชัด", adj_denoise: "ลดจุดรบกวน", adj_exposure: "การเปิดรับแสง", lbl_invert: "กลับสี", char_title: "ชุดตัวอักษร", char_placeholder: "ตัวอักษรที่กำหนดเอง...", btn_char_standard: "มาตรฐาน", btn_char_simple: "เรียบง่าย", crop_title: "ตัดภาพ", btn_cancel: "ยกเลิก", btn_done: "เสร็จสิ้น", status_ready: "พร้อม", status_wait: "อัปโหลดเพื่อเริ่ม", empty_title: "รอรูปภาพ...", empty_sub: "อัปโหลดรูปภาพทางซ้าย", btn_crop: "ตัด", btn_copy: "คัดลอก", export_title: "ส่งออกศิลปะ ASCII" },
  sv: { ...BASE_TRANSLATION, lang_label: "Språk", upload_title: "Ladda upp bild", upload_sub: "Dra & släpp eller Ctrl+V", colors_title: "Färger", col_text: "Text", col_bg: "Bakgrund", layout_title: "Layout", font_label: "Typsnitt", btn_width: "Anpassa Bredd", btn_height: "Anpassa Höjd", lbl_cols: "Kolumner", lbl_rows: "Rader", lbl_fontsize: "Teckenstorlek", lbl_lineheight: "Radhöjd", lbl_spacing: "Teckenavstånd", adj_title: "Justeringar", adj_contrast: "Kontrast", adj_brightness: "Ljusstyrka", adj_sharpness: "Skärpa", adj_denoise: "Brusreducering", adj_exposure: "Exponering", lbl_invert: "Invertera", char_title: "Teckenuppsättning", char_placeholder: "Egna tecken...", btn_char_standard: "Standard", btn_char_simple: "Enkel", crop_title: "Beskär bild", btn_cancel: "Avbryt", btn_done: "Klart", status_ready: "Redo", status_wait: "Ladda upp för att starta", empty_title: "Väntar på bild...", empty_sub: "Ladda upp en bild till vänster.", btn_crop: "Beskär", btn_copy: "Kopiera", export_title: "Exportera ASCII-konst" },
  pl: { ...BASE_TRANSLATION, lang_label: "Język", upload_title: "Prześlij obraz", upload_sub: "Przeciągnij lub Ctrl+V", colors_title: "Kolory", col_text: "Tekst", col_bg: "Tło", layout_title: "Układ", font_label: "Czcionka", btn_width: "Dopasuj szer.", btn_height: "Dopasuj wys.", lbl_cols: "Kolumny", lbl_rows: "Wiersze", lbl_fontsize: "Rozmiar czcionki", lbl_lineheight: "Wysokość linii", lbl_spacing: "Odstępy", adj_title: "Dostosowania", adj_contrast: "Kontrast", adj_brightness: "Jasność", adj_sharpness: "Ostrość", adj_denoise: "Redukcja szumów", adj_exposure: "Ekspozycja", lbl_invert: "Odwróć", char_title: "Zestaw znaków", char_placeholder: "Własne znaki...", btn_char_standard: "Standard", btn_char_simple: "Prosty", crop_title: "Kadruj", btn_cancel: "Anuluj", btn_done: "Gotowe", status_ready: "Gotowy", status_wait: "Prześlij obraz", empty_title: "Czekam na obraz...", empty_sub: "Prześlij obraz po lewej.", btn_crop: "Kadruj", btn_copy: "Kopiuj", export_title: "Eksportuj ASCII Art" },
  cs: { ...BASE_TRANSLATION, lang_label: "Jazyk", upload_title: "Nahrát obrázek", upload_sub: "Přetáhni nebo Ctrl+V", colors_title: "Barvy", col_text: "Text", col_bg: "Pozadí", layout_title: "Rozložení", font_label: "Písmo", btn_width: "Přizpůsobit šířku", btn_height: "Přizpůsobit výšku", lbl_cols: "Sloupce", lbl_rows: "Řádky", lbl_fontsize: "Velikost písma", lbl_lineheight: "Výška řádku", lbl_spacing: "Rozestupy", adj_title: "Úpravy", adj_contrast: "Kontrast", adj_brightness: "Jas", adj_sharpness: "Ostrost", adj_denoise: "Redukce šumu", adj_exposure: "Expozice", lbl_invert: "Invertovat", char_title: "Znaky", char_placeholder: "Vlastní znaky...", btn_char_standard: "Standardní", btn_char_simple: "Jednoduché", crop_title: "Oříznout", btn_cancel: "Zrušit", btn_done: "Hotovo", status_ready: "Připraven", status_wait: "Nahrajte obrázek", empty_title: "Čekám na obrázek...", empty_sub: "Nahrajte obrázek vlevo.", btn_crop: "Oříznout", btn_copy: "Kopírovat", export_title: "Exportovat ASCII Art" },
  hu: { ...BASE_TRANSLATION, lang_label: "Nyelv", upload_title: "Kép feltöltése", upload_sub: "Húzd ide vagy Ctrl+V", colors_title: "Színek", col_text: "Szöveg", col_bg: "Háttér", layout_title: "Elrendezés", font_label: "Betűtípus", btn_width: "Szélességhez", btn_height: "Magassághoz", lbl_cols: "Oszlopok", lbl_rows: "Sorok", lbl_fontsize: "Betűméret", lbl_lineheight: "Sormagasság", lbl_spacing: "Betűköz", adj_title: "Beállítások", adj_contrast: "Kontraszt", adj_brightness: "Fényerő", adj_sharpness: "Élesség", adj_denoise: "Zajcsökkentés", adj_exposure: "Expozíció", lbl_invert: "Invertálás", char_title: "Karakterkészlet", char_placeholder: "Saját karakterek...", btn_char_standard: "Standard", btn_char_simple: "Egyszerű", crop_title: "Képvágás", btn_cancel: "Mégse", btn_done: "Kész", status_ready: "Kész", status_wait: "Tölts fel képet", empty_title: "Képre várva...", empty_sub: "Tölts fel egy képet balra.", btn_crop: "Vágás", btn_copy: "Másolás", export_title: "ASCII Art Exportálás" },
  ro: { ...BASE_TRANSLATION, lang_label: "Limbă", upload_title: "Încarcă imagine", upload_sub: "Trage sau Ctrl+V", colors_title: "Culori", col_text: "Text", col_bg: "Fundal", layout_title: "Aspect", font_label: "Font", btn_width: "Lățime fixă", btn_height: "Înălțime fixă", lbl_cols: "Coloane", lbl_rows: "Rânduri", lbl_fontsize: "Mărime font", lbl_lineheight: "Înălțime rând", lbl_spacing: "Spațiere", adj_title: "Ajustări", adj_contrast: "Contrast", adj_brightness: "Luminozitate", adj_sharpness: "Claritate", adj_denoise: "Reducere zgomot", adj_exposure: "Expunere", lbl_invert: "Inversare", char_title: "Set caractere", char_placeholder: "Caractere proprii...", btn_char_standard: "Standard", btn_char_simple: "Simplu", crop_title: "Decupare", btn_cancel: "Anulare", btn_done: "Gata", status_ready: "Gata", status_wait: "Încarcă o imagine", empty_title: "Aștept imagine...", empty_sub: "Încarcă o imagine în stânga.", btn_crop: "Decupare", btn_copy: "Copiere", export_title: "Export Artă ASCII" },
  bg: { ...BASE_TRANSLATION, lang_label: "Език", upload_title: "Качване", upload_sub: "Плъзнете или Ctrl+V", colors_title: "Цветове", col_text: "Текст", col_bg: "Фон", layout_title: "Оформление", font_label: "Шрифт", btn_width: "По ширина", btn_height: "По височина", lbl_cols: "Колони", lbl_rows: "Редове", lbl_fontsize: "Размер шрифт", lbl_lineheight: "Височина ред", lbl_spacing: "Разстояние", adj_title: "Настройки", adj_contrast: "Контраст", adj_brightness: "Яркост", adj_sharpness: "Острота", adj_denoise: "Шум", adj_exposure: "Експозиция", lbl_invert: "Обръщане", char_title: "Символы", char_placeholder: "Собствени символи...", btn_char_standard: "Стандарт", btn_char_simple: "Прост", crop_title: "Изрязване", btn_cancel: "Отказ", btn_done: "Готово", status_ready: "Готово", status_wait: "Качете изображение", empty_title: "Чакам изображение...", empty_sub: "Качете изображение вляво.", btn_crop: "Изрязване", btn_copy: "Копиране", export_title: "Експорт на ASCII Art" },
  fil: { ...BASE_TRANSLATION, lang_label: "Wika", upload_title: "I-upload ang Larawan", upload_sub: "I-drag o Ctrl+V", colors_title: "Mga Kulay", col_text: "Teksto", col_bg: "Background", layout_title: "Layout", font_label: "Font", btn_width: "Lapad", btn_height: "Taas", lbl_cols: "Mga Haligi", lbl_rows: "Mga Hilera", lbl_fontsize: "Laki ng Font", lbl_lineheight: "Taas ng Linya", lbl_spacing: "Puwang", adj_title: "Pagsasaayos", adj_contrast: "Kontrast", adj_brightness: "Liwanag", adj_sharpness: "Kataliman", adj_denoise: "Bawasan ang Ingay", adj_exposure: "Exposure", lbl_invert: "Baligtarin", char_title: "Mga Karakter", char_placeholder: "Pasadyang karakter...", btn_char_standard: "Karaniwan", btn_char_simple: "Simple", crop_title: "I-crop", btn_cancel: "Kanselahin", btn_done: "Tapos na", status_ready: "Handa na", status_wait: "Mag-upload para magsimula", empty_title: "Naghihintay...", empty_sub: "Mag-upload ng larawan sa kaliwa.", btn_crop: "I-crop", btn_copy: "Kopyahin", export_title: "I-export ang ASCII Art" },
  id: { ...BASE_TRANSLATION, lang_label: "Bahasa", upload_title: "Unggah Gambar", upload_sub: "Seret atau Ctrl+V", colors_title: "Warna", col_text: "Teks", col_bg: "Latar", layout_title: "Tata Letak", font_label: "Font", btn_width: "Lebar Pas", btn_height: "Tinggi Pas", lbl_cols: "Kolom", lbl_rows: "Baris", lbl_fontsize: "Ukuran Font", lbl_lineheight: "Tinggi Baris", lbl_spacing: "Jarak", adj_title: "Penyesuaian", adj_contrast: "Kontras", adj_brightness: "Kecerahan", adj_sharpness: "Ketajaman", adj_denoise: "Kurangi Noise", adj_exposure: "Eksposur", lbl_invert: "Balikkan", char_title: "Karakter", char_placeholder: "Karakter kustom...", btn_char_standard: "Standar", btn_char_simple: "Sederhana", crop_title: "Potong", btn_cancel: "Batal", btn_done: "Selesai", status_ready: "Siap", status_wait: "Unggah gambar", empty_title: "Menunggu gambar...", empty_sub: "Unggah gambar di kiri.", btn_crop: "Potong", btn_copy: "Salin", export_title: "Ekspor Seni ASCII" },
  ms: { ...BASE_TRANSLATION, lang_label: "Bahasa", upload_title: "Muat Naik Gambar", upload_sub: "Seret atau Ctrl+V", colors_title: "Warna", col_text: "Teks", col_bg: "Latar Belakang", layout_title: "Susun Atur", font_label: "Font", btn_width: "Lebar Tetap", btn_height: "Tinggi Tetap", lbl_cols: "Lajur", lbl_rows: "Baris", lbl_fontsize: "Saiz Font", lbl_lineheight: "Tinggi Baris", lbl_spacing: "Jarak", adj_title: "Pelarasan", adj_contrast: "Kontras", adj_brightness: "Kecerahan", adj_sharpness: "Ketajaman", adj_denoise: "Kurangkan Hingar", adj_exposure: "Pendedahan", lbl_invert: "Terbalikkan", char_title: "Set Aksara", char_placeholder: "Aksara tersuai...", btn_char_standard: "Standard", btn_char_simple: "Mudah", crop_title: "Potong", btn_cancel: "Batal", btn_done: "Selesai", status_ready: "Sedia", status_wait: "Muat naik gambar", empty_title: "Menunggu gambar...", empty_sub: "Muat naik gambar di sebelah kiri.", btn_crop: "Potong", btn_copy: "Salin", export_title: "Eksport Seni ASCII" },
  hi: { ...BASE_TRANSLATION, lang_label: "भाषा", upload_title: "छवि अपलोड करें", upload_sub: "ड्रैग और ड्रॉप या Ctrl+V", colors_title: "रंग", col_text: "टेक्स्ट", col_bg: "पृष्ठभूमि", layout_title: "लेआउट", font_label: "फ़ॉन्ट", btn_width: "चौड़ाई फिट", btn_height: "ऊंचाई फिट", lbl_cols: "कॉलम", lbl_rows: "पंक्तियाँ", lbl_fontsize: "फ़ॉन्ट आकार", lbl_lineheight: "लाइन ऊंचाई", lbl_spacing: "अक्षर रिक्ति", adj_title: "समायोजन", adj_contrast: "कंट्रास्ट", adj_brightness: "चमक", adj_sharpness: "तीक्ष्णता", adj_denoise: "शोर कम करें", adj_exposure: "एक्सपोज़र", lbl_invert: "उलटें", char_title: "वर्ण सेट", char_placeholder: "कस्टम वर्ण...", btn_char_standard: "मानक", btn_char_simple: "सरल", crop_title: "फसल", btn_cancel: "रद्द करें", btn_done: "हो गया", status_ready: "तैयार", status_wait: "छवि अपलोड करें", empty_title: "छवि की प्रतीक्षा है...", empty_sub: "बाईं ओर छवि अपलोड करें।", btn_crop: "काटें", btn_copy: "कॉपी करें", export_title: "ASCII कला निर्यात" },
  tr: { ...BASE_TRANSLATION, lang_label: "Dil", upload_title: "Resim Yükle", upload_sub: "Sürükle bırak veya Ctrl+V", colors_title: "Renkler", col_text: "Metin", col_bg: "Arka Plan", layout_title: "Düzen", font_label: "Yazı Tipi", btn_width: "Genişliğe Sığdır", btn_height: "Yüksekliğe Sığdır", lbl_cols: "Sütunlar", lbl_rows: "Satırlar", lbl_fontsize: "Yazı Boyutu", lbl_lineheight: "Satır Yüksekliği", lbl_spacing: "Harf Aralığı", adj_title: "Ayarlar", adj_contrast: "Kontrast", adj_brightness: "Parlaklık", adj_sharpness: "Keskinlik", adj_denoise: "Gürültü Azaltma", adj_exposure: "Pozlama", lbl_invert: "Ters Çevir", char_title: "Karakter Seti", char_placeholder: "Özel karakterler...", btn_char_standard: "Standart", btn_char_simple: "Basit", crop_title: "Kırp", btn_cancel: "İptal", btn_done: "Tamam", status_ready: "Hazır", status_wait: "Başlamak için resim yükle", empty_title: "Resim bekleniyor...", empty_sub: "Soldan bir resim yükleyin.", btn_crop: "Kırp", btn_copy: "Kopyala", export_title: "ASCII Sanatını Dışa Aktar" }
};

/* --- CSS STYLES (BEM) --- */
const styles = `
  :root {
    --color-bg-dark: #020617;
    --color-bg-panel: #0f172a;
    --color-border: #1e293b;
    --color-text-main: #f8fafc;
    --color-text-muted: #94a3b8;
    --color-primary: #10b981;
    --color-primary-hover: #059669;
    --color-accent: #3b82f6;
    --font-ui: system-ui, -apple-system, sans-serif;
    --header-height: 64px;
  }

  * { box-sizing: border-box; }

  body, html { 
    margin: 0; padding: 0; height: 100%; 
    font-family: var(--font-ui); 
    background: var(--color-bg-dark); 
    color: var(--color-text-main);
    overflow: hidden; 
  }

  .ascii-studio { display: flex; flex-direction: column; height: 100vh; height: 100dvh; overflow: hidden; position: relative; width: 100%; }

  .ascii-sidebar {
    position: fixed; top: 0; left: 0; bottom: 0; width: 280px; 
    background-color: var(--color-bg-panel); border-right: 1px solid var(--color-border);
    z-index: 50; transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex; flex-direction: column; height: 100%; box-shadow: 4px 0 15px rgba(0,0,0,0.3);
  }
  .ascii-sidebar--open { transform: translateX(0); }

  .ascii-sidebar__header {
    height: var(--header-height); padding: 0 1.5rem; border-bottom: 1px solid var(--color-border);
    display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
  }
  .ascii-sidebar__title-wrapper { display: flex; flex-direction: column; }
  .ascii-sidebar__title { font-size: 1.1rem; font-weight: 700; color: var(--color-primary); display: flex; align-items: center; gap: 0.5rem; margin: 0; }
  .ascii-sidebar__subtitle { font-size: 0.7rem; color: var(--color-text-muted); margin-top: 0.1rem; }
  .ascii-sidebar__close-mobile { background: transparent; border: none; color: var(--color-text-muted); padding: 0.5rem; cursor: pointer; display: flex; }
  
  @media (min-width: 1024px) { .ascii-sidebar__close-mobile { display: none; } }

  .ascii-sidebar__content { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 1.5rem; display: flex; flex-direction: column; gap: 2rem; }

  .ascii-main { flex: 1; display: flex; flex-direction: column; height: 100%; position: relative; background-color: var(--color-bg-dark); min-width: 0; }

  @media (min-width: 1024px) {
    .ascii-studio { flex-direction: row; }
    .ascii-sidebar { position: relative; transform: none; width: 0; opacity: 0; border-right: none; box-shadow: none; transition: width 0.3s ease, opacity 0.2s ease; overflow: hidden; }
    .ascii-sidebar--open { width: 320px; opacity: 1; border-right: 1px solid var(--color-border); }
    .ascii-sidebar__content, .ascii-sidebar__header { min-width: 320px; }
  }

  .ascii-overlay { position: fixed; inset: 0; background: transparent; z-index: 40; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
  .ascii-overlay--visible { opacity: 1; pointer-events: auto; }
  @media (min-width: 1024px) { .ascii-overlay { display: none; } }

  .ascii-toolbar {
    height: var(--header-height); border-bottom: 1px solid rgba(255,255,255,0.1);
    display: flex; align-items: center; justify-content: space-between; padding: 0 1rem;
    background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(8px); z-index: 30; flex-shrink: 0; width: 100%;
  }
  .ascii-toolbar__left, .ascii-toolbar__right { display: flex; align-items: center; gap: 0.5rem; }
  .ascii-toolbar__right { overflow-x: auto; padding-right: 0.5rem; -ms-overflow-style: none; scrollbar-width: none; }
  .ascii-toolbar__right::-webkit-scrollbar { display: none; }

  .ascii-toolbar__status { font-size: 0.8rem; color: var(--color-primary); display: flex; align-items: center; gap: 0.4rem; white-space: nowrap; }
  .ascii-toolbar__status-dot { width: 6px; height: 6px; background-color: var(--color-primary); border-radius: 50%; animation: pulse 2s infinite; }
  @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

  .ascii-button {
    display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.5rem 0.75rem;
    border-radius: 0.375rem; font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: all 0.2s;
    background: transparent; border: 1px solid var(--color-border); color: var(--color-text-main); white-space: nowrap; user-select: none;
  }
  .ascii-button:hover:not(:disabled) { background: var(--color-border); color: white; }
  .ascii-button--primary { background: var(--color-primary); border-color: var(--color-primary); color: white; }
  .ascii-button--primary:hover:not(:disabled) { background: var(--color-primary-hover); border-color: var(--color-primary-hover); }
  .ascii-button--icon-only { padding: 0.5rem; }
  .ascii-button:disabled { opacity: 0.5; cursor: not-allowed; }

  .ascii-select {
    width: 100%; bg-slate-900; border: 1px solid var(--color-border); color: var(--color-text-main);
    font-size: 0.75rem; padding: 0.4rem; border-radius: 0.375rem; background: var(--color-bg-panel);
    outline: none; cursor: pointer;
  }
  .ascii-select:focus { border-color: var(--color-primary); }

  .ascii-preview { flex: 1; overflow: auto; position: relative; display: flex; }
  .ascii-preview__content { margin: auto; padding: 2rem; min-width: min-content; min-height: min-content; }
  .ascii-preview__pre { margin: 0; font-variant-ligatures: none; }
  .ascii-preview__empty { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--color-text-muted); text-align: center; padding: 1rem; }
  .ascii-preview__overlay { position: absolute; top: 5rem; right: 1.5rem; width: 120px; border: 2px solid rgba(255,255,255,0.2); border-radius: 0.5rem; overflow: hidden; opacity: 0.4; transition: opacity 0.3s; background: black; z-index: 20; pointer-events: auto; }
  .ascii-preview__overlay:hover { opacity: 1; }
  .ascii-preview__overlay img { width: 100%; display: block; }

  .ascii-controls__section { display: flex; flex-direction: column; gap: 1rem; }
  .ascii-controls__title { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; color: var(--color-text-main); display: flex; align-items: center; gap: 0.5rem; margin: 0; }
  .ascii-controls__group { display: flex; flex-direction: column; gap: 0.25rem; }
  .ascii-controls__label { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--color-text-main); }
  .ascii-controls__sublabel { font-size: 0.75rem; margin-bottom: 0.25rem; display: block; color: var(--color-text-main); }
  .ascii-controls__checkbox-label { font-size: 0.875rem; cursor: pointer; user-select: none; color: var(--color-text-main); }
  .ascii-controls__value { font-family: monospace; color: var(--color-primary); }

  .ascii-input-range { width: 100%; height: 4px; background: var(--color-border); border-radius: 2px; appearance: none; cursor: pointer; display: block; }
  .ascii-input-range::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; background: var(--color-primary); border-radius: 50%; cursor: pointer; transition: transform 0.1s; }
  .ascii-input-range::-webkit-slider-thumb:hover { transform: scale(1.1); }

  .ascii-upload-box { width: 100%; height: 8rem; border: 2px dashed var(--color-border); border-radius: 0.5rem; background: rgba(15, 23, 42, 0.5); display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--color-text-muted); cursor: pointer; transition: all 0.2s; }
  .ascii-upload-box:hover { border-color: var(--color-primary); background: rgba(15, 23, 42, 0.8); color: var(--color-primary); }
  .ascii-upload-box__input { display: none; }

  .hidden { display: none; }
  .hide-on-mobile { display: none; }
  @media (min-width: 640px) { .hide-on-mobile { display: inline; } }
  .show-on-mobile { display: inline-flex; }
  @media (min-width: 640px) { .show-on-mobile { display: none; } }
  
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--color-text-muted); }

  .crop-editor { position: fixed; inset: 0; background: var(--color-bg-dark); z-index: 100; display: flex; flex-direction: column; }
  .crop-editor__area { flex: 1; padding: 2rem; display: flex; align-items: center; justify-content: center; overflow: hidden; user-select: none; }
`;

/* --- CROP EDITOR COMPONENT --- */
const CropEditor = ({ imageSrc, crop, onChange, onComplete, onCancel, t }) => {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeHandle, setActiveHandle] = useState(null);

  useEffect(() => {
    if (!crop) {
      onChange({ x: 0, y: 0, width: 1, height: 1 });
    }
  }, []);

  const getClientPos = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const handleMouseDown = (e, handle) => {
    e.preventDefault();
    setIsDragging(true);
    setActiveHandle(handle);
    const pos = getClientPos(e);
    setDragStart(pos);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !imgRef.current) return;
    
    const pos = getClientPos(e);
    const dxPx = pos.x - dragStart.x;
    const dyPx = pos.y - dragStart.y;
    
    const rect = imgRef.current.getBoundingClientRect();
    const dx = dxPx / rect.width;
    const dy = dyPx / rect.height;

    let newCrop = { ...crop };

    if (activeHandle === 'move') {
      newCrop.x = Math.max(0, Math.min(1 - newCrop.width, newCrop.x + dx));
      newCrop.y = Math.max(0, Math.min(1 - newCrop.height, newCrop.y + dy));
    } else {
      if (activeHandle === 'se') {
        newCrop.width = Math.max(0.1, Math.min(1 - newCrop.x, newCrop.width + dx));
        newCrop.height = Math.max(0.1, Math.min(1 - newCrop.y, newCrop.height + dy));
      } else if (activeHandle === 'sw') {
        const maxX = newCrop.x + newCrop.width;
        newCrop.x = Math.max(0, Math.min(maxX - 0.1, newCrop.x + dx));
        newCrop.width = maxX - newCrop.x;
        newCrop.height = Math.max(0.1, Math.min(1 - newCrop.y, newCrop.height + dy));
      } else if (activeHandle === 'nw') {
        const maxX = newCrop.x + newCrop.width;
        const maxY = newCrop.y + newCrop.height;
        newCrop.x = Math.max(0, Math.min(maxX - 0.1, newCrop.x + dx));
        newCrop.y = Math.max(0, Math.min(maxY - 0.1, newCrop.y + dy));
        newCrop.width = maxX - newCrop.x;
        newCrop.height = maxY - newCrop.y;
      } else if (activeHandle === 'ne') {
        const maxY = newCrop.y + newCrop.height;
        newCrop.y = Math.max(0, Math.min(maxY - 0.1, newCrop.y + dy));
        newCrop.width = Math.max(0.1, Math.min(1 - newCrop.x, newCrop.width + dx));
        newCrop.height = maxY - newCrop.y;
      }
    }

    onChange(newCrop);
    setDragStart(pos);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setActiveHandle(null);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, dragStart, crop]);

  const s = (val) => `${val * 100}%`;

  return (
    <div className="crop-editor">
      <div className="ascii-toolbar">
        <div className="ascii-toolbar__left">
          <span className="text-white font-medium">{t.crop_title}</span>
        </div>
        <div className="ascii-toolbar__right">
          <button onClick={onCancel} className="ascii-button">
            <X className="w-4 h-4"/> {t.btn_cancel}
          </button>
          <button onClick={onComplete} className="ascii-button ascii-button--primary">
            <Check className="w-4 h-4"/> {t.btn_done}
          </button>
        </div>
      </div>

      <div className="crop-editor__area" ref={containerRef}>
         <div style={{ position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <img ref={imgRef} src={imageSrc} alt="Crop Target" style={{ maxHeight: '80vh', maxWidth: '100%', objectFit: 'contain', pointerEvents: 'none', display: 'block' }}/>
            <div
              style={{
                position: 'absolute',
                border: '2px solid var(--color-primary)',
                cursor: 'move',
                left: s(crop.x), top: s(crop.y), width: s(crop.width), height: s(crop.height),
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)'
              }}
              onMouseDown={(e) => handleMouseDown(e, 'move')}
              onTouchStart={(e) => handleMouseDown(e, 'move')}
            >
              <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr 1fr', pointerEvents: 'none', opacity: 0.3 }}>
                <div style={{ borderRight: '1px solid white', gridRow: '1 / span 3' }}></div>
                <div style={{ borderRight: '1px solid white', gridRow: '1 / span 3' }}></div>
                <div style={{ borderBottom: '1px solid white', gridColumn: '1 / span 3', gridRow: '1', position: 'relative', top: '100%' }}></div>
                <div style={{ borderBottom: '1px solid white', gridColumn: '1 / span 3', gridRow: '2', position: 'relative', top: '100%' }}></div>
              </div>
              
              {[
                { pos: '-top-1.5 -left-1.5', cursor: 'nw-resize', type: 'nw' },
                { pos: '-top-1.5 -right-1.5', cursor: 'ne-resize', type: 'ne' },
                { pos: '-bottom-1.5 -left-1.5', cursor: 'sw-resize', type: 'sw' },
                { pos: '-bottom-1.5 -right-1.5', cursor: 'se-resize', type: 'se' }
              ].map(h => (
                <div 
                  key={h.type}
                  className={`absolute ${h.pos} w-4 h-4 bg-emerald-500 border border-white rounded-full shadow`}
                  style={{ cursor: h.cursor }}
                  onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, h.type); }}
                  onTouchStart={(e) => { e.stopPropagation(); handleMouseDown(e, h.type); }}
                />
              ))}
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                 <Move className="w-8 h-8 text-white/50" />
              </div>
            </div>
         </div>
      </div>
    </div>
  );
};

/* --- MAIN APP COMPONENT --- */
export default function App() {
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

  // Initial Responsive Check
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setShowSidebar(false);
    }
  }, []);

  // Font Loading
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
    <>
      <style>{styles}</style>
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
            {/* Mobile Close Button */}
            <button className="ascii-sidebar__close-mobile" onClick={() => setShowSidebar(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="ascii-sidebar__content custom-scrollbar">
            
            {/* SPRACHEN (NEU) */}
            <div className="ascii-controls__section">
               <h3 className="ascii-controls__title"><Globe className="w-3 h-3" /> {t.lang_label}</h3>
               <select 
                  value={lang} 
                  onChange={(e) => setLang(e.target.value)} 
                  className="ascii-select"
               >
                  {Object.keys(LANGUAGES).map(code => (
                    <option key={code} value={code}>{LANGUAGES[code]}</option>
                  ))}
               </select>
            </div>

            {/* UPLOAD */}
            <div className="ascii-controls__section">
              <label className="ascii-upload-box">
                <Upload className="w-8 h-8 mb-2" />
                <span className="text-sm">{t.upload_title}</span>
                <span className="text-xs opacity-50 mt-1">{t.upload_sub}</span>
                <input type="file" className="ascii-upload-box__input" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>

            {/* FARBEN */}
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

            {/* LAYOUT */}
            <div className="ascii-controls__section">
              <h3 className="ascii-controls__title"><Grid className="w-3 h-3" /> {t.layout_title}</h3>
              
              <div className="ascii-controls__group">
                <label className="ascii-controls__sublabel">{t.font_label}</label>
                <select 
                  value={config.fontKey}
                  onChange={(e) => setConfig({...config, fontKey: e.target.value})}
                  className="ascii-select"
                >
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

            {/* ANPASSUNGEN */}
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

            {/* ZEICHENWAHL */}
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
    </>
  );
}