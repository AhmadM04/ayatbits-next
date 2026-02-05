import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 512,
  height: 512,
}

export const contentType = 'image/png'

export default function Icon512() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 300,
          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 112,
          color: 'white',
          fontWeight: 'bold',
          fontFamily: 'Arial',
        }}
      >
        أ
      </div>
    ),
    {
      ...size,
    }
  )
}

