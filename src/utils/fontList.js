// Danh sách font cho phép (dưới 400KB, dựa trên file thực tế trong public/fonts)
export const fontList = [
    { name: "Arial", file: "ARIAL.TTF", size: 1012 * 1024},
  { name: "Bernard MT Condensed", file: "BERNHC.TTF", size: 69 * 1024 },
  { name: "Arial Narrow Italic", file: "ARIALNI.TTF", size: 177 * 1024 },
  { name: "Arial Narrow Bold Italic", file: "ARIALNBI.TTF", size: 176 * 1024 },
  { name: "Arial Narrow Bold", file: "ARIALNB.TTF", size: 177 * 1024 },
  { name: "Arial Narrow", file: "ARIALN.TTF", size: 172 * 1024 },
  { name: "Agency FB Regular", file: "AGENCYR.TTF", size: 58 * 1024 },
  { name: "Algerian", file: "ALGER.TTF", size: 75 * 1024 },
  { name: "Agency FB Bold", file: "AGENCYB.TTF", size: 59 * 1024 },
  { name: "ARLRDBD", file: "ARLRDBD.TTF", size: 44 * 1024 },
  { name: "Verdana", file: "VERDANA.TTF", size: 238 * 1024 },
  { name: "Verdana Bold", file: "VERDANAB.TTF", size: 206 * 1024 },
  { name: "Verdana Italic", file: "VERDANAI.TTF", size: 218 * 1024 },
  { name: "Verdana Bold Italic", file: "VERDANAZ.TTF", size: 224 * 1024 },
  { name: "Georgia", file: "GEORGIA.TTF", size: 215 * 1024 },
  { name: "Georgia Bold", file: "GEORGIAB.TTF", size: 203 * 1024 },
  { name: "Georgia Italic", file: "GEORGIAI.TTF", size: 204 * 1024 },
  { name: "Georgia Bold Italic", file: "GEORGIAZ.TTF", size: 207 * 1024 },
  { name: "Bahnschrift", file: "BAHNSCHRIFT.TTF", size: 363 * 1024 },
  { name: "Arial Black", file: "ARIBLK.TTF", size: 164 * 1024 },
  { name: "Arial Italic", file: "ARIALI.TTF", size: 701 * 1024, hidden: true }, // Ẩn font lớn
  { name: "Arial Bold Italic", file: "ARIALBI.TTF", size: 704 * 1024, hidden: true },
  { name: "Arial Bold", file: "ARIALBD.TTF", size: 958 * 1024, hidden: true },
  { name: "Tahoma", file: "TAHOMA.TTF", size: 917 * 1024, hidden: true },
  { name: "Tahoma Bold", file: "TAHOMABD.TTF", size: 848 * 1024, hidden: true },
  { name: "Times New Roman", file: "TIMES.TTF", size: 1120 * 1024, hidden: true },
  { name: "Times Bold", file: "TIMESBD.TTF", size: 1120 * 1024, hidden: true },
  { name: "Times Italic", file: "TIMESI.TTF", size: 918 * 1024, hidden: true },
  { name: "Times Bold Italic", file: "TIMESBI.TTF", size: 861 * 1024, hidden: true },
];

// Khi render dropdown, chỉ show font không có hidden: true
export const visibleFontList = fontList.filter(f => !f.hidden); 