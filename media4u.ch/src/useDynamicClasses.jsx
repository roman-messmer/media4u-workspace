import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function useDynamicClasses() {
  const location = useLocation();

  useEffect(() => {
    console.log("Aktuelle Route:", location.pathname); // Debugging

    // Elemente abrufen
    const header = document.querySelector(".wrapper_header");
    const navSub = document.querySelector(".wrapper_nav_sub");
    const footer = document.querySelector(".wrapper_footer");

    // Falls eines der Elemente nicht existiert, Funktion beenden
    if (!header || !navSub || !footer) {
      console.warn("Ein oder mehrere Elemente nicht gefunden!");
      return;
    }

    // Alle möglichen Hintergrund-Klassen entfernen
    const classesToRemove = [
      "header_bg_media4u",
      "header_bg_sms_textbild",
      "header_bg_textbild2",
      "header_bg_matrix",
      "bg_media4u",
      "bg_sms_textbild",
      "bg_textbild2",
      "bg_ascii_art_film"
    ];

    [header, navSub, footer].forEach((element) =>
      element.classList.remove(...classesToRemove)
    );

    // Hintergrundklassen für die jeweiligen Seiten setzen
    if (location.pathname.startsWith("/media4u")) {
      header.classList.add("header_bg_media4u");
      navSub.classList.add("bg_media4u");
      footer.classList.add("bg_media4u");
    } else if (location.pathname.startsWith("/sms_textbild")) {
      header.classList.add("header_bg_sms_textbild");
      navSub.classList.add("bg_sms_textbild");
      footer.classList.add("bg_sms_textbild");
    } else if (location.pathname.startsWith("/textbild2")) {
      header.classList.add("header_bg_textbild2");
      navSub.classList.add("bg_textbild2");
      footer.classList.add("bg_textbild2");
    } else if (location.pathname.startsWith("/ascii_art_film")) {
      header.classList.add("header_bg_matrix");
      navSub.classList.add("bg_ascii_art_film");
      footer.classList.add("bg_ascii_art_film");
    }

    console.log("Neue Klassen gesetzt:", {
      header: header.classList,
      navSub: navSub.classList,
      footer: footer.classList
    });

  }, [location]);
}

export default useDynamicClasses;
