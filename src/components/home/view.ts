import { masks } from '../../config/theme';

export const mBauhaus =
  'mask-image: ' + masks.bauhaus + '; -webkit-mask-image: ' + masks.bauhaus + ';';
export const mAlmohade =
  'mask-image: ' + masks.almohade + '; -webkit-mask-image: ' + masks.almohade + ';';

export function narrowMask(direction: 'right' | 'left') {
  const mask = 'linear-gradient(to ' + direction + ', rgba(0,0,0,0.5) 0%, transparent 45%)';
  return 'mask-image: ' + mask + '; -webkit-mask-image: ' + mask + ';';
}
