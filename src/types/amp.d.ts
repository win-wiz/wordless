// AMP标签的TypeScript声明
declare namespace JSX {
  interface IntrinsicElements {
    'amp-auto-ads': {
      type: string;
      'data-ad-client': string;
    };
  }
} 