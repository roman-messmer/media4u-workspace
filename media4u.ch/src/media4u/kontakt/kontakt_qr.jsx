// src/components/pages/kontakt_qr.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";
import "./kontakt_qr.css";

const KontaktQR = () => {
  const { t } = useTranslation();
  
  // Dynamische URL-Generierung, funktioniert auf Localhost und Live-Server
  const vcfUrl = `${window.location.origin}/Roman_Messmer.vcf?v=2`;
  const logoUrl = "/vcf_logo.jpg";

  return (
    <div className="kontakt__qr-section">
      <h2 className="kontakt__label">{t("kontakt_qr_label", "Kontakt speichern")}</h2>
      
      <div 
        className="kontakt__qr-wrapper" 
        role="img" 
        aria-label={t("kontakt_qr_alt", "QR-Code für vCard Download")}
      >
        <QRCodeSVG
          value={vcfUrl}
          size={240}
          level="H" 
          imageSettings={{
            src: logoUrl,
            height: 80,
            width: 80,
            excavate: true, 
          }}
        />
      </div>

      <a 
        className="kontakt__qr-btn" 
        href={vcfUrl} 
        download="Roman_Messmer.vcf"
      >
        {t("kontakt_qr_btn", "vCard direkt herunterladen")}
      </a>
    </div>
  );
};

export default KontaktQR;