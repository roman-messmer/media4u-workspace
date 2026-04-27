import React from 'react';
import { useTranslation } from 'react-i18next';
import "./beispiel_sms_textbild.css";

const Beispiel_Sms_Textbild = () => {
  const { t } = useTranslation();

        return (
                <figure className="beispiel_sms_textbild">
                    <div className="display deselect">
                        <div className="frame">

<pre className="zeilen zeilen4" style={{ gridColumn: "2 / span 1", gridRow: "2 / span 1" }}>{`            *>'ö)
     (ö'<     ) (
  ;-.) (     (  (".
_("""")__,/,/'-'.__`}</pre>

                        </div>
                    </div>

                    <figcaption>
                        <b className="vorschau_name">{t('beispiel.sms_textbild')}</b>
                    </figcaption>
                </figure>
        );
    };

export default Beispiel_Sms_Textbild;
