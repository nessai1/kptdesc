/**
 * Fonts for the exported report, inlined as data URLs so the standalone HTML file
 * prints identically with no network and no local font installation.
 * Only the weights the report actually uses are embedded (~78 KB of woff2).
 */
import loraCyrillic600 from '@fontsource/lora/files/lora-cyrillic-600-normal.woff2?inline'
import loraLatin600 from '@fontsource/lora/files/lora-latin-600-normal.woff2?inline'
import manropeCyrillic400 from '@fontsource/manrope/files/manrope-cyrillic-400-normal.woff2?inline'
import manropeCyrillic700 from '@fontsource/manrope/files/manrope-cyrillic-700-normal.woff2?inline'
import manropeLatin400 from '@fontsource/manrope/files/manrope-latin-400-normal.woff2?inline'
import manropeLatin700 from '@fontsource/manrope/files/manrope-latin-700-normal.woff2?inline'

const CYRILLIC_RANGE = 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116'
const LATIN_RANGE =
  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'

function face(family: string, weight: number, url: string, range: string): string {
  return `@font-face {
  font-family: '${family}';
  font-style: normal;
  font-weight: ${weight};
  font-display: swap;
  src: url(${url}) format('woff2');
  unicode-range: ${range};
}`
}

export const REPORT_FONT_FACES = [
  face('Lora', 600, loraCyrillic600, CYRILLIC_RANGE),
  face('Lora', 600, loraLatin600, LATIN_RANGE),
  face('Manrope', 400, manropeCyrillic400, CYRILLIC_RANGE),
  face('Manrope', 400, manropeLatin400, LATIN_RANGE),
  face('Manrope', 700, manropeCyrillic700, CYRILLIC_RANGE),
  face('Manrope', 700, manropeLatin700, LATIN_RANGE),
].join('\n')
