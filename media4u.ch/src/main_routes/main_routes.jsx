// src/main_routes/main_routes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import SmsTextbild from "../sms_textbild/sms_textbild"
import Textbild2 from "../textbild2/textbild2"
import AsciiFilm from "../ascii_art_film/ascii_art_film";
import MEDIA4U from "../media4u/media4u/media4u";
import "../css/main_routes.css"

const Content = () => {
  return (
    <main>
      <Routes>
        <Route path="/" element={<MEDIA4U />} />
        <Route path="sms_textbild" element={<SmsTextbild />} />
        <Route path="textbild2" element={<Textbild2 />} />
        <Route path="ascii_art_film" element={<AsciiFilm />} />
        {/* Weitere Routen können hier hinzugefügt werden */}
      </Routes>
    </main>
  );
};

export default Content;
