declare const __OWEB_APP_ORIGIN__: string;
declare const __OWEB_API_BASE__: string;
declare const __OWEB_PRODUCT_BUILD__: boolean;

const fallbackOrigin = 'https://oweb.one';

export const OWEB_APP_ORIGIN =
  typeof __OWEB_APP_ORIGIN__ !== 'undefined' && __OWEB_APP_ORIGIN__
    ? __OWEB_APP_ORIGIN__
    : fallbackOrigin;

export const OWEB_API_BASE =
  typeof __OWEB_API_BASE__ !== 'undefined' && __OWEB_API_BASE__
    ? __OWEB_API_BASE__
    : `${OWEB_APP_ORIGIN}/api/extension/v1`;

export const OWEB_PRODUCT_BUILD =
  typeof __OWEB_PRODUCT_BUILD__ !== 'undefined' ? Boolean(__OWEB_PRODUCT_BUILD__) : true;
