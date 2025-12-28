import { useState } from 'react'

interface VinylRecord {
  id: number
  title: string
  artist: string
  coverUrl: string
  vinylColor?: string // default black, can be colored vinyl
}

const sampleVinyls: VinylRecord[] = [
  { id: 1, title: 'Dark Side of the Moon', artist: 'Pink Floyd', coverUrl: 'https://upload.wikimedia.org/wikipedia/en/3/3b/Dark_Side_of_the_Moon.png', vinylColor: '#1a1a1a' },
  { id: 2, title: 'Abbey Road', artist: 'The Beatles', coverUrl: 'https://upload.wikimedia.org/wikipedia/en/4/42/Beatles_-_Abbey_Road.jpg', vinylColor: '#1a1a1a' },
  { id: 3, title: 'Thriller', artist: 'Michael Jackson', coverUrl: 'https://upload.wikimedia.org/wikipedia/en/5/55/Michael_Jackson_-_Thriller.png', vinylColor: '#1a1a1a' },
  { id: 4, title: 'Random Access Memories', artist: 'Daft Punk', coverUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a7/Random_Access_Memories.jpg', vinylColor: '#d4a853' },
  { id: 5, title: 'The Wall', artist: 'Pink Floyd', coverUrl: 'https://upload.wikimedia.org/wikipedia/en/1/13/PinkFloydWallCoverOriginalNoText.jpg', vinylColor: '#1a1a1a' },
  { id: 6, title: 'Kind of Blue', artist: 'Miles Davis', coverUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9c/MilesDavisKindofBlue.jpg', vinylColor: '#3498db' },
]

export function VinylShelf({ vinyls = sampleVinyls }: { vinyls?: VinylRecord[] }) {
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  return (
    <div style={styles.shelf}>
      {vinyls.map((vinyl, index) => (
        <div
          key={vinyl.id}
          style={{
            ...styles.vinylSlot,
            zIndex: hoveredId === vinyl.id ? 100 : vinyls.length - index,
          }}
          onMouseEnter={() => setHoveredId(vinyl.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <div
            style={{
              ...styles.vinylCase,
              transform: hoveredId === vinyl.id
                ? 'perspective(2000px) rotateX(-5deg) rotateY(-25deg) translateY(-20px) translateX(10px)'
                : 'perspective(2000px) rotateX(-38deg) rotateY(-40deg)',
              transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Spine */}
            <div style={styles.spine}>
              <div style={styles.spineLabel}>
                <span style={styles.spineTitleText}>{vinyl.title}</span>
              </div>
            </div>

            {/* Cover */}
            <div style={styles.cover}>
              <img
                src={vinyl.coverUrl}
                alt={vinyl.title}
                style={styles.coverImage}
              />
              {/* Highlight effect */}
              <div style={styles.coverHighlight} />
              {/* Light reflection */}
              <div style={styles.coverLight} />
            </div>

            {/* Vinyl disc peeking out */}
            <div
              style={{
                ...styles.vinylDisc,
                transform: hoveredId === vinyl.id
                  ? 'translateX(60px) rotate(15deg)'
                  : 'translateX(0px) rotate(0deg)',
                transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <div
                style={{
                  ...styles.vinylInner,
                  background: `radial-gradient(circle at 50% 50%,
                    ${vinyl.vinylColor || '#1a1a1a'} 0%,
                    ${vinyl.vinylColor || '#1a1a1a'} 15%,
                    #0a0a0a 16%,
                    #1a1a1a 17%,
                    #0a0a0a 35%,
                    #1a1a1a 36%,
                    #0a0a0a 55%,
                    #1a1a1a 56%,
                    #0a0a0a 75%,
                    #1a1a1a 76%,
                    #0a0a0a 95%,
                    ${vinyl.vinylColor || '#1a1a1a'} 100%
                  )`,
                }}
              >
                {/* Center label */}
                <div style={styles.vinylLabel}>
                  <span style={styles.labelText}>{vinyl.artist}</span>
                </div>
              </div>
              {/* Vinyl shine */}
              <div style={styles.vinylShine} />
            </div>

            {/* Top edge */}
            <div style={styles.topEdge} />
          </div>

          {/* Info on hover */}
          <div
            style={{
              ...styles.vinylInfo,
              opacity: hoveredId === vinyl.id ? 1 : 0,
              transform: hoveredId === vinyl.id ? 'translateY(0)' : 'translateY(10px)',
            }}
          >
            <div style={styles.vinylTitle}>{vinyl.title}</div>
            <div style={styles.vinylArtist}>{vinyl.artist}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  shelf: {
    display: 'flex',
    gap: 8,
    padding: '40px 20px',
    perspective: '2000px',
    perspectiveOrigin: '50% 50%',
  },
  vinylSlot: {
    position: 'relative',
    cursor: 'pointer',
  },
  vinylCase: {
    position: 'relative',
    width: 190,
    height: 240,
    transformStyle: 'preserve-3d',
    transformOrigin: '0% 100%',
  },
  spine: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 21,
    height: '100%',
    background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)',
    transformStyle: 'preserve-3d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    filter: 'brightness(0.75)',
  },
  spineLabel: {
    transform: 'rotate(-90deg)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    width: 200,
    textAlign: 'center',
  },
  spineTitleText: {
    color: '#d4a853',
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  cover: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    transform: 'translateZ(-100px) rotateY(90deg)',
    transformOrigin: 'left center',
    overflow: 'hidden',
    borderRadius: 2,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  coverHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 20,
    height: '100%',
    background: 'linear-gradient(90deg, rgba(255,255,255,0.84) 0%, rgba(201,201,201,0.4) 100%)',
    pointerEvents: 'none',
  },
  coverLight: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 150,
    height: 150,
    background: 'linear-gradient(rgba(219,217,217,0.4) 1%, rgb(138,138,138) 100%)',
    filter: 'blur(2px)',
    transform: 'translate(-50%, -50%) rotate(122deg)',
    opacity: 0.3,
    pointerEvents: 'none',
  },
  vinylDisc: {
    position: 'absolute',
    right: -40,
    top: '50%',
    width: 180,
    height: 180,
    marginTop: -90,
    borderRadius: '50%',
    transformStyle: 'preserve-3d',
    zIndex: -1,
  },
  vinylInner: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
  },
  vinylLabel: {
    width: 60,
    height: 60,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #d4a853 0%, #b8923d 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
  },
  labelText: {
    color: '#1a1a1a',
    fontSize: 7,
    fontWeight: 700,
    textAlign: 'center',
    maxWidth: 50,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  vinylShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
    pointerEvents: 'none',
  },
  topEdge: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: 21,
    background: 'linear-gradient(90deg, #2a2a2a 0%, #3a3a3a 50%, #2a2a2a 100%)',
    transform: 'translateZ(-100px) rotateX(90deg)',
    transformOrigin: 'top center',
  },
  vinylInfo: {
    position: 'absolute',
    bottom: -50,
    left: 0,
    width: 190,
    textAlign: 'center',
    transition: 'all 0.3s ease',
  },
  vinylTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 2,
  },
  vinylArtist: {
    color: '#d4a853',
    fontSize: 10,
    fontWeight: 400,
  },
}
