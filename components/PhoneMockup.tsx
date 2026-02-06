import Image from 'next/image';

interface PhoneMockupProps {
  imageSrc: string;
  alt: string;
}

export function PhoneMockup({ imageSrc, alt }: PhoneMockupProps) {
  return (
    <div className="relative mx-auto" style={{ width: '300px', height: '650px' }}>
      {/* iPhone 14 Pro Max Frame */}
      <div className="absolute inset-0 rounded-[3.5rem] border-[10px] border-gray-900 bg-gray-900 shadow-2xl">
        {/* Screen - no notch overlay since screenshots already include the phone UI */}
        <div className="relative w-full h-full bg-black rounded-[3rem] overflow-hidden">
          <Image
            src={imageSrc}
            alt={alt}
            fill
            className="object-contain"
            sizes="300px"
          />
        </div>
        
        {/* Power Button */}
        <div className="absolute right-[-4px] top-[120px] w-1 h-20 bg-gray-900 rounded-l" />
        
        {/* Volume Buttons */}
        <div className="absolute left-[-4px] top-[100px] w-1 h-12 bg-gray-900 rounded-r" />
        <div className="absolute left-[-4px] top-[140px] w-1 h-12 bg-gray-900 rounded-r" />
      </div>
    </div>
  );
}

