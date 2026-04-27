import React from 'react';
import { Helmet } from 'react-helmet';

function SEO({ title, description, keywords, lang = "de" }) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <html lang={lang} />
    </Helmet>
  );
}

export default SEO;
