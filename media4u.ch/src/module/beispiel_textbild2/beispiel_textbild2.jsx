import React from 'react';
import { useTranslation } from 'react-i18next';
import './beispiel_textbild2.css';

const Beispiel_Textbild2 = () => {
  const { t } = useTranslation();

        return (
                <figure className="beispiel_textbild2">
                    <div className="display deselect">
                        <div className="frame">
                        
                        <pre className="zeilen zeilen2 center" style={{ gridColumn: "64 / span 1", gridRow: "36 / span 1", color: "rgb(0, 0, 0)" }}>{`_______________________________
_|___|___|___|___|___|___|___|_
___|___|___|___|___|___|___|___`}</pre>
<pre className="zeilen zeilen2" style={{ gridColumn: "32 / span 1", gridRow: "20 / span 1", color: "rgb(0, 0, 0)" }}>{` sSs
('o')
 >-<`}</pre>
<pre className="zeilen zeilen2" style={{ gridColumn: "72 / span 1", gridRow: "20 / span 1", color: "rgb(0, 0, 0)" }}>{`  sSs
 c' 3)
  >-<`}</pre>
<pre className="zeilen zeilen2" style={{ gridColumn: "42 / span 1", gridRow: "20 / span 1", color: "rgb(0, 0, 0)" }}>{`3`}</pre>
<pre className="zeilen zeilen2 spiegeln_drehen_0" style={{ gridColumn: "22 / span 1", gridRow: "20 / span 1", color: "rgb(0, 0, 0)" }}>{`3`}</pre>
<pre className="zeilen zeilen2" style={{ gridColumn: "81 / span 1", gridRow: "14 / span 1", color: "rgb(0, 0, 0)" }}>{`s`}</pre>
<pre className="zeilen zeilen2 spiegeln_drehen_0" style={{ gridColumn: "25 / span 1", gridRow: "14 / span 1", color: "rgb(0, 0, 0)" }}>{`s`}</pre>
<pre className="zeilen zeilen2" style={{ gridColumn: "39 / span 1", gridRow: "14 / span 1", color: "rgb(0, 0, 0)" }}>{`s`}</pre>
<pre className="zeilen zeilen2" style={{ gridColumn: "52 / span 1", gridRow: "6 / span 1", color: "rgb(0, 0, 0)" }}>{` .----.
 '.__.'`}</pre>
<pre className="zeilen zeilen2 drehen_40" style={{ gridColumn: "44 / span 1", gridRow: "13 / span 1", color: "rgb(0, 0, 0)" }}>{`V`}</pre>
<pre className="zeilen zeilen2" style={{ gridColumn: "32 / span 1", gridRow: "30 / span 1", color: "rgb(0, 0, 0)" }}>{`OOO   OOO`}</pre>

                        </div>
                    </div>

                    <figcaption>
                        <a className="vorschau_name">{t('beispiel.textbild2')}</a>
                    </figcaption>
                </figure>
        );
    };

export default Beispiel_Textbild2;
