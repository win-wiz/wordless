import { memo, useEffect } from 'react';

/**
 * Enhanced safe ads component.
 * Combines auto ads with manual sidebar ads in a Google-friendly layout.
 */
const EnhancedSafeAds = memo(function EnhancedSafeAds() {
  useEffect(() => {
    // This component is disabled. AdSense now lives in layout.tsx.
    console.log('EnhancedSafeAds is disabled. AdSense configuration has moved to layout.tsx.');
  }, []);

  return (
    <>
      {/* Manual sidebar ad, shown only on larger screens. */}
      <div className="hidden xl:block fixed right-4 top-20 z-10">
        <ins 
          className="adsbygoogle"
          style={{ 
            display: 'block',
            width: '300px',
            height: '250px'
          }}
          data-ad-client="ca-pub-1939625526338391"
          data-ad-slot="1234567890"  // Replace with your real ad slot ID.
          data-ad-format="auto"
        />
      </div>

      {/* Manual bottom ad for mobile layouts. */}
      <div className="block xl:hidden sticky bottom-0 bg-white p-2 border-t z-10">
        <ins 
          className="adsbygoogle"
          style={{ 
            display: 'block',
            width: '100%',
            height: '60px'
          }}
          data-ad-client="ca-pub-1939625526338391"
          data-ad-slot="0987654321"  // Replace with your real ad slot ID.
          data-ad-format="auto"
        />
      </div>
    </>
  );
});

export default EnhancedSafeAds; 
