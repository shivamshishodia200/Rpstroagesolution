import sanitizeHtml from 'sanitize-html';

/**
 * Enterprise Production-Grade HTML & Rich-Text Content Sanitizer
 * Replaces fragile regex sanitization with strict allowlist validation.
 * Defends against stored and reflected XSS, dangerous protocols, and malformed HTML.
 */

const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'b', 'i', 'strong', 'em', 'strike', 's', 'u', 'code', 'pre',
  'hr', 'br', 'ul', 'ol', 'li', 'blockquote',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  'a', 'img', 'span', 'div',
];

const ALLOWED_ATTRIBUTES = {
  a: ['href', 'name', 'target', 'rel', 'title', 'class'],
  img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading', 'class'],
  '*': ['class', 'id', 'data-*'],
};

const ALLOWED_SCHEMES = ['http', 'https', 'mailto', 'tel'];

export const sanitizeHtmlContent = (htmlString) => {
  if (typeof htmlString !== 'string') return '';
  if (!htmlString.trim()) return '';

  return sanitizeHtml(htmlString, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ALLOWED_SCHEMES,
    allowedSchemesByTag: {
      a: ['http', 'https', 'mailto', 'tel'],
      img: ['http', 'https', 'data'],
    },
    transformTags: {
      a: (tagName, attribs) => {
        // Enforce safe link attributes for external targets
        if (attribs.href && attribs.href.startsWith('http')) {
          return {
            tagName: 'a',
            attribs: {
              ...attribs,
              rel: 'noopener noreferrer',
            },
          };
        }
        return { tagName: 'a', attribs };
      },
    },
    disallowedTagsMode: 'discard',
  }).trim();
};

export const sanitizePlainText = (text) => {
  if (typeof text !== 'string') return '';
  // Strip all HTML tags completely
  return sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
};
