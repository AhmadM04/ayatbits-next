'use client';

import Lottie from 'lottie-react';
import { CSSProperties } from 'react';

interface LottieLoaderProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
  animationData?: any;
  loop?: boolean;
}

/**
 * A beautiful Quran/Book loading animation with green theme
 */
export function QuranLoader({ size = 120, className = '', style = {} }: Omit<LottieLoaderProps, 'animationData'>) {
  // Inline simple book/quran animation data optimized for the green theme
  const bookAnimationData = {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 60,
    w: 200,
    h: 200,
    nm: "Quran Loading",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Book",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { 
            a: 1, 
            k: [
              { t: 0, s: [0], e: [5] },
              { t: 30, s: [5], e: [0] },
              { t: 60, s: [0] }
            ]
          },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { 
            a: 1, 
            k: [
              { t: 0, s: [100, 100], e: [105, 105] },
              { t: 30, s: [105, 105], e: [100, 100] },
              { t: 60, s: [100, 100] }
            ]
          }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "rc",
                d: 1,
                s: { a: 0, k: [80, 100] },
                p: { a: 0, k: [0, 0] },
                r: { a: 0, k: 8 }
              },
              {
                ty: "fl",
                c: { a: 0, k: [0.086, 0.639, 0.290, 1] }, // Green color
                o: { a: 0, k: 100 }
              },
              { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
            ]
          }
        ],
        ip: 0,
        op: 60,
        st: 0
      },
      {
        ddd: 0,
        ind: 2,
        ty: 4,
        nm: "Shine",
        sr: 1,
        ks: {
          o: { 
            a: 1, 
            k: [
              { t: 0, s: [0], e: [100] },
              { t: 15, s: [100], e: [0] },
              { t: 30, s: [0], e: [100] },
              { t: 45, s: [100], e: [0] },
              { t: 60, s: [0] }
            ]
          },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [100, 80, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "sr",
                sy: 1,
                d: 1,
                pt: { a: 0, k: 4 },
                p: { a: 0, k: [0, 0] },
                r: { a: 0, k: 0 },
                ir: { a: 0, k: 3 },
                is: { a: 0, k: 0 },
                or: { a: 0, k: 8 },
                os: { a: 0, k: 0 }
              },
              {
                ty: "fl",
                c: { a: 0, k: [1, 1, 1, 1] },
                o: { a: 0, k: 100 }
              },
              { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
            ]
          }
        ],
        ip: 0,
        op: 60,
        st: 0
      }
    ]
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`} style={{ width: size, height: size, ...style }}>
      <Lottie
        animationData={bookAnimationData}
        loop={true}
        style={{ width: size, height: size }}
      />
    </div>
  );
}

/**
 * Success checkmark animation with Islamic-themed particles
 */
export function SuccessAnimation({ size = 120, className = '', style = {}, loop = false }: Omit<LottieLoaderProps, 'animationData'>) {
  const successAnimationData = {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 45,
    w: 200,
    h: 200,
    nm: "Success Check",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Circle",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { 
            a: 1, 
            k: [
              { t: 0, s: [0, 0], e: [110, 110], o: { x: 0.42, y: 0 }, i: { x: 0.58, y: 1 } },
              { t: 15, s: [110, 110], e: [100, 100] },
              { t: 20, s: [100, 100] }
            ]
          }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "el",
                d: 1,
                s: { a: 0, k: [80, 80] },
                p: { a: 0, k: [0, 0] }
              },
              {
                ty: "fl",
                c: { a: 0, k: [0.086, 0.639, 0.290, 1] }, // Green
                o: { a: 0, k: 100 }
              },
              { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
            ]
          }
        ],
        ip: 0,
        op: 45,
        st: 0
      },
      {
        ddd: 0,
        ind: 2,
        ty: 4,
        nm: "Check",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "sh",
                ks: {
                  a: 1,
                  k: [
                    {
                      t: 10,
                      s: [{ i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]], v: [[-20, 0], [-20, 0]], c: false }],
                      e: [{ i: [[0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0]], v: [[-20, 0], [-10, 10], [20, -15]], c: false }]
                    },
                    { t: 25 }
                  ]
                }
              },
              {
                ty: "st",
                c: { a: 0, k: [1, 1, 1, 1] }, // White
                o: { a: 0, k: 100 },
                w: { a: 0, k: 6 },
                lc: 2,
                lj: 2
              },
              { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
            ]
          }
        ],
        ip: 10,
        op: 45,
        st: 0
      },
      // Sparkles
      {
        ddd: 0,
        ind: 3,
        ty: 4,
        nm: "Sparkle 1",
        sr: 1,
        ks: {
          o: { 
            a: 1, 
            k: [
              { t: 20, s: [0], e: [100] },
              { t: 25, s: [100], e: [0] },
              { t: 35, s: [0] }
            ]
          },
          r: { a: 1, k: [{ t: 20, s: [0], e: [180] }, { t: 35 }] },
          p: { 
            a: 1, 
            k: [
              { t: 20, s: [100, 100], e: [70, 70] },
              { t: 35, s: [70, 70] }
            ]
          },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "sr",
                sy: 1,
                d: 1,
                pt: { a: 0, k: 4 },
                p: { a: 0, k: [0, 0] },
                r: { a: 0, k: 0 },
                ir: { a: 0, k: 2 },
                is: { a: 0, k: 0 },
                or: { a: 0, k: 6 },
                os: { a: 0, k: 0 }
              },
              {
                ty: "fl",
                c: { a: 0, k: [1, 0.843, 0, 1] }, // Gold
                o: { a: 0, k: 100 }
              },
              { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
            ]
          }
        ],
        ip: 20,
        op: 45,
        st: 0
      },
      {
        ddd: 0,
        ind: 4,
        ty: 4,
        nm: "Sparkle 2",
        sr: 1,
        ks: {
          o: { 
            a: 1, 
            k: [
              { t: 22, s: [0], e: [100] },
              { t: 27, s: [100], e: [0] },
              { t: 37, s: [0] }
            ]
          },
          r: { a: 1, k: [{ t: 22, s: [0], e: [180] }, { t: 37 }] },
          p: { 
            a: 1, 
            k: [
              { t: 22, s: [100, 100], e: [130, 70] },
              { t: 37, s: [130, 70] }
            ]
          },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [80, 80, 100] }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "sr",
                sy: 1,
                d: 1,
                pt: { a: 0, k: 4 },
                p: { a: 0, k: [0, 0] },
                r: { a: 0, k: 0 },
                ir: { a: 0, k: 2 },
                is: { a: 0, k: 0 },
                or: { a: 0, k: 5 },
                os: { a: 0, k: 0 }
              },
              {
                ty: "fl",
                c: { a: 0, k: [1, 0.843, 0, 1] },
                o: { a: 0, k: 100 }
              },
              { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
            ]
          }
        ],
        ip: 22,
        op: 45,
        st: 0
      },
      {
        ddd: 0,
        ind: 5,
        ty: 4,
        nm: "Sparkle 3",
        sr: 1,
        ks: {
          o: { 
            a: 1, 
            k: [
              { t: 24, s: [0], e: [100] },
              { t: 29, s: [100], e: [0] },
              { t: 39, s: [0] }
            ]
          },
          r: { a: 1, k: [{ t: 24, s: [0], e: [180] }, { t: 39 }] },
          p: { 
            a: 1, 
            k: [
              { t: 24, s: [100, 100], e: [130, 130] },
              { t: 39, s: [130, 130] }
            ]
          },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [70, 70, 100] }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "sr",
                sy: 1,
                d: 1,
                pt: { a: 0, k: 4 },
                p: { a: 0, k: [0, 0] },
                r: { a: 0, k: 0 },
                ir: { a: 0, k: 2 },
                is: { a: 0, k: 0 },
                or: { a: 0, k: 5 },
                os: { a: 0, k: 0 }
              },
              {
                ty: "fl",
                c: { a: 0, k: [1, 0.843, 0, 1] },
                o: { a: 0, k: 100 }
              },
              { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
            ]
          }
        ],
        ip: 24,
        op: 45,
        st: 0
      }
    ]
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`} style={{ width: size, height: size, ...style }}>
      <Lottie
        animationData={successAnimationData}
        loop={loop}
        style={{ width: size, height: size }}
      />
    </div>
  );
}

/**
 * Sparkle/shine animation for achievements and special moments
 */
export function SparkleAnimation({ size = 60, className = '', style = {}, loop = true }: Omit<LottieLoaderProps, 'animationData'>) {
  const sparkleData = {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 40,
    w: 100,
    h: 100,
    nm: "Sparkle",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Star 1",
        sr: 1,
        ks: {
          o: { 
            a: 1, 
            k: [
              { t: 0, s: [0], e: [100] },
              { t: 10, s: [100], e: [0] },
              { t: 20, s: [0] }
            ]
          },
          r: { a: 1, k: [{ t: 0, s: [0], e: [360] }, { t: 40 }] },
          p: { a: 0, k: [50, 50, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { 
            a: 1, 
            k: [
              { t: 0, s: [0, 0], e: [120, 120] },
              { t: 10, s: [120, 120], e: [150, 150] },
              { t: 20, s: [150, 150] }
            ]
          }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "sr",
                sy: 1,
                d: 1,
                pt: { a: 0, k: 4 },
                p: { a: 0, k: [0, 0] },
                r: { a: 0, k: 0 },
                ir: { a: 0, k: 3 },
                is: { a: 0, k: 0 },
                or: { a: 0, k: 10 },
                os: { a: 0, k: 0 }
              },
              {
                ty: "fl",
                c: { a: 0, k: [0.086, 0.639, 0.290, 1] }, // Green
                o: { a: 0, k: 100 }
              },
              { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
            ]
          }
        ],
        ip: 0,
        op: 40,
        st: 0
      },
      {
        ddd: 0,
        ind: 2,
        ty: 4,
        nm: "Star 2",
        sr: 1,
        ks: {
          o: { 
            a: 1, 
            k: [
              { t: 5, s: [0], e: [100] },
              { t: 15, s: [100], e: [0] },
              { t: 25, s: [0] }
            ]
          },
          r: { a: 1, k: [{ t: 0, s: [45], e: [405] }, { t: 40 }] },
          p: { a: 0, k: [50, 50, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { 
            a: 1, 
            k: [
              { t: 5, s: [0, 0], e: [100, 100] },
              { t: 15, s: [100, 100], e: [130, 130] },
              { t: 25, s: [130, 130] }
            ]
          }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "sr",
                sy: 1,
                d: 1,
                pt: { a: 0, k: 4 },
                p: { a: 0, k: [0, 0] },
                r: { a: 0, k: 0 },
                ir: { a: 0, k: 3 },
                is: { a: 0, k: 0 },
                or: { a: 0, k: 8 },
                os: { a: 0, k: 0 }
              },
              {
                ty: "fl",
                c: { a: 0, k: [0.565, 0.933, 0.565, 1] }, // Light Green
                o: { a: 0, k: 100 }
              },
              { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
            ]
          }
        ],
        ip: 5,
        op: 40,
        st: 0
      }
    ]
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`} style={{ width: size, height: size, ...style }}>
      <Lottie
        animationData={sparkleData}
        loop={loop}
        style={{ width: size, height: size }}
      />
    </div>
  );
}

/**
 * Trophy/Achievement animation for milestones
 */
export function TrophyAnimation({ size = 100, className = '', style = {}, loop = false }: Omit<LottieLoaderProps, 'animationData'>) {
  const trophyData = {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 50,
    w: 200,
    h: 200,
    nm: "Trophy",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Trophy Base",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: { 
            a: 1, 
            k: [
              { t: 0, s: [100, 140], e: [100, 110] },
              { t: 20, s: [100, 110], e: [100, 105] },
              { t: 30, s: [100, 105] }
            ]
          },
          a: { a: 0, k: [0, 0, 0] },
          s: { 
            a: 1, 
            k: [
              { t: 0, s: [0, 0], e: [110, 110] },
              { t: 20, s: [110, 110], e: [100, 100] },
              { t: 30, s: [100, 100] }
            ]
          }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "rc",
                d: 1,
                s: { a: 0, k: [50, 15] },
                p: { a: 0, k: [0, 0] },
                r: { a: 0, k: 3 }
              },
              {
                ty: "fl",
                c: { a: 0, k: [1, 0.843, 0, 1] }, // Gold
                o: { a: 0, k: 100 }
              },
              { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
            ]
          }
        ],
        ip: 0,
        op: 50,
        st: 0
      },
      {
        ddd: 0,
        ind: 2,
        ty: 4,
        nm: "Trophy Cup",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { 
            a: 1, 
            k: [
              { t: 20, s: [0], e: [-5] },
              { t: 25, s: [-5], e: [5] },
              { t: 30, s: [5], e: [0] },
              { t: 35, s: [0] }
            ]
          },
          p: { 
            a: 1, 
            k: [
              { t: 0, s: [100, 140], e: [100, 90] },
              { t: 15, s: [100, 90], e: [100, 85] },
              { t: 25, s: [100, 85] }
            ]
          },
          a: { a: 0, k: [0, 0, 0] },
          s: { 
            a: 1, 
            k: [
              { t: 0, s: [0, 0], e: [110, 110] },
              { t: 15, s: [110, 110], e: [100, 100] },
              { t: 25, s: [100, 100] }
            ]
          }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "el",
                d: 1,
                s: { a: 0, k: [60, 70] },
                p: { a: 0, k: [0, 0] }
              },
              {
                ty: "fl",
                c: { a: 0, k: [1, 0.843, 0, 1] }, // Gold
                o: { a: 0, k: 100 }
              },
              { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
            ]
          }
        ],
        ip: 0,
        op: 50,
        st: 0
      },
      {
        ddd: 0,
        ind: 3,
        ty: 4,
        nm: "Shine Left",
        sr: 1,
        ks: {
          o: { 
            a: 1, 
            k: [
              { t: 15, s: [0], e: [100] },
              { t: 25, s: [100], e: [0] },
              { t: 35, s: [0] }
            ]
          },
          r: { a: 0, k: 0 },
          p: { 
            a: 1, 
            k: [
              { t: 15, s: [80, 80], e: [60, 60] },
              { t: 35, s: [60, 60] }
            ]
          },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "sr",
                sy: 1,
                d: 1,
                pt: { a: 0, k: 4 },
                p: { a: 0, k: [0, 0] },
                r: { a: 0, k: 0 },
                ir: { a: 0, k: 2 },
                is: { a: 0, k: 0 },
                or: { a: 0, k: 8 },
                os: { a: 0, k: 0 }
              },
              {
                ty: "fl",
                c: { a: 0, k: [1, 1, 1, 1] },
                o: { a: 0, k: 100 }
              },
              { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
            ]
          }
        ],
        ip: 15,
        op: 50,
        st: 0
      },
      {
        ddd: 0,
        ind: 4,
        ty: 4,
        nm: "Shine Right",
        sr: 1,
        ks: {
          o: { 
            a: 1, 
            k: [
              { t: 17, s: [0], e: [100] },
              { t: 27, s: [100], e: [0] },
              { t: 37, s: [0] }
            ]
          },
          r: { a: 0, k: 0 },
          p: { 
            a: 1, 
            k: [
              { t: 17, s: [120, 80], e: [140, 60] },
              { t: 37, s: [140, 60] }
            ]
          },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "sr",
                sy: 1,
                d: 1,
                pt: { a: 0, k: 4 },
                p: { a: 0, k: [0, 0] },
                r: { a: 0, k: 0 },
                ir: { a: 0, k: 2 },
                is: { a: 0, k: 0 },
                or: { a: 0, k: 6 },
                os: { a: 0, k: 0 }
              },
              {
                ty: "fl",
                c: { a: 0, k: [1, 1, 1, 1] },
                o: { a: 0, k: 100 }
              },
              { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
            ]
          }
        ],
        ip: 17,
        op: 50,
        st: 0
      },
      {
        ddd: 0,
        ind: 5,
        ty: 4,
        nm: "Green Accent",
        sr: 1,
        ks: {
          o: { 
            a: 1, 
            k: [
              { t: 10, s: [0], e: [100] },
              { t: 20, s: [100] }
            ]
          },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [100, 90, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { 
            a: 1, 
            k: [
              { t: 10, s: [0, 0], e: [100, 100] },
              { t: 20, s: [100, 100] }
            ]
          }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "el",
                d: 1,
                s: { a: 0, k: [30, 35] },
                p: { a: 0, k: [0, 0] }
              },
              {
                ty: "fl",
                c: { a: 0, k: [0.086, 0.639, 0.290, 1] }, // Green
                o: { a: 0, k: 100 }
              },
              { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
            ]
          }
        ],
        ip: 10,
        op: 50,
        st: 0
      }
    ]
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`} style={{ width: size, height: size, ...style }}>
      <Lottie
        animationData={trophyData}
        loop={loop}
        style={{ width: size, height: size }}
      />
    </div>
  );
}

/**
 * Prayer/Dua hands animation for spiritual moments
 */
export function PrayerAnimation({ size = 100, className = '', style = {}, loop = true }: Omit<LottieLoaderProps, 'animationData'>) {
  const prayerData = {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 60,
    w: 200,
    h: 200,
    nm: "Prayer",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Glow",
        sr: 1,
        ks: {
          o: { 
            a: 1, 
            k: [
              { t: 0, s: [30], e: [60] },
              { t: 30, s: [60], e: [30] },
              { t: 60, s: [30] }
            ]
          },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { 
            a: 1, 
            k: [
              { t: 0, s: [100, 100], e: [110, 110] },
              { t: 30, s: [110, 110], e: [100, 100] },
              { t: 60, s: [100, 100] }
            ]
          }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "el",
                d: 1,
                s: { a: 0, k: [100, 100] },
                p: { a: 0, k: [0, 0] }
              },
              {
                ty: "fl",
                c: { a: 0, k: [0.086, 0.639, 0.290, 1] }, // Green
                o: { a: 0, k: 100 }
              },
              { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
            ]
          }
        ],
        ip: 0,
        op: 60,
        st: 0,
        bm: 0
      },
      {
        ddd: 0,
        ind: 2,
        ty: 4,
        nm: "Light Rays",
        sr: 1,
        ks: {
          o: { 
            a: 1, 
            k: [
              { t: 0, s: [0], e: [40] },
              { t: 15, s: [40], e: [0] },
              { t: 30, s: [0], e: [40] },
              { t: 45, s: [40], e: [0] },
              { t: 60, s: [0] }
            ]
          },
          r: { a: 1, k: [{ t: 0, s: [0], e: [180] }, { t: 60 }] },
          p: { 
            a: 1, 
            k: [
              { t: 0, s: [100, 100], e: [100, 80] },
              { t: 30, s: [100, 80], e: [100, 100] },
              { t: 60, s: [100, 100] }
            ]
          },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "sr",
                sy: 1,
                d: 1,
                pt: { a: 0, k: 8 },
                p: { a: 0, k: [0, 0] },
                r: { a: 0, k: 0 },
                ir: { a: 0, k: 20 },
                is: { a: 0, k: 0 },
                or: { a: 0, k: 40 },
                os: { a: 0, k: 0 }
              },
              {
                ty: "fl",
                c: { a: 0, k: [1, 0.843, 0, 1] }, // Gold
                o: { a: 0, k: 100 }
              },
              { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
            ]
          }
        ],
        ip: 0,
        op: 60,
        st: 0
      }
    ]
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`} style={{ width: size, height: size, ...style }}>
      <Lottie
        animationData={prayerData}
        loop={loop}
        style={{ width: size, height: size }}
      />
    </div>
  );
}

