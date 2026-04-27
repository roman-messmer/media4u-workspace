import DOMPurify from 'dompurify';

export const sanitizeHtml = (html = '') => {
  const purified = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ALLOWED_URI_REGEXP: /^https?:/i,
    ADD_ATTR: ['target', 'rel'],
  });

  const tpl = document.createElement('template');
  tpl.innerHTML = purified;

  tpl.content.querySelectorAll('a[href]').forEach((a) => {
    try {
      const u = new URL(a.getAttribute('href'), window.location.origin);
      if (/^https?:$/i.test(u.protocol)) {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
      } else {
        a.removeAttribute('href');
      }
    } catch {
      a.removeAttribute('href');
    }
  });

  return tpl.innerHTML;
};
