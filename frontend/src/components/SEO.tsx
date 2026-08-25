import { Helmet } from 'react-helmet-async';

type Props = { title?: string; description?: string; canonical?: string; jsonLd?: Record<string, unknown> };

export default function SEO({ title, description, canonical, jsonLd }: Props) {
  const site = 'https://nyayaconnect.in';
  const fullTitle = title ? `${title} | NyayaConnect` : 'NyayaConnect — Premium Legal Services Platform';
  const desc = description ?? 'Connect with verified lawyers across India. Book consultations, manage documents, track cases.';
  const url = canonical ? `${site}${canonical}` : site;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
