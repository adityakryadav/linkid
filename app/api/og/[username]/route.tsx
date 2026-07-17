import { ImageResponse } from 'next/og';
import { resolveUserByUsername } from "@/lib/userLookup";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const resolved = await resolveUserByUsername(username);

    if (!resolved || !resolved.user) {
      return new Response("User not found", { status: 404 });
    }

    const user = resolved.user;
    const canonicalUsername = resolved.canonicalUsername ?? username;

    const linksCount = user.links?.length || 0;
    const platforms = user.links?.slice(0, 3).map(l => l.platform) || [];

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #1e293b 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1e293b 2%, transparent 0%)',
            backgroundSize: '100px 100px',
            color: '#fff',
            fontFamily: 'sans-serif',
            padding: '40px 60px',
            position: 'relative',
          }}
        >
          {/* Main card box */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'rgba(30, 41, 59, 0.7)',
              border: '2px solid #334155',
              borderRadius: '24px',
              padding: '40px',
              width: '90%',
              maxWidth: '900px',
              alignItems: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Top avatar + profile section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px', width: '100%' }}>
              {user.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={user.image}
                  alt="Avatar"
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    border: '4px solid #38bdf8',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    backgroundColor: '#38bdf8',
                    color: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    fontWeight: 'bold',
                  }}
                >
                  {canonicalUsername.slice(0, 2).toUpperCase()}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ fontSize: '42px', fontWeight: 'bold', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name || canonicalUsername}
                </div>
                <div style={{ fontSize: '24px', color: '#38bdf8', marginTop: '4px' }}>
                  @{canonicalUsername}
                </div>
              </div>
            </div>

            {/* User Bio */}
            {user.bio ? (
              <div
                style={{
                  fontSize: '24px',
                  color: '#94a3b8',
                  marginTop: '30px',
                  lineHeight: '1.5',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                {user.bio.length > 140 ? `${user.bio.slice(0, 140)}...` : user.bio}
              </div>
            ) : null}

            {/* Links and features block */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                marginTop: '40px',
                paddingTop: '30px',
                borderTop: '1px solid #334155',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '22px' }}>🔗</span>
                <span style={{ fontSize: '22px', color: '#e2e8f0', fontWeight: '500' }}>
                  {linksCount} Active Link{linksCount !== 1 ? 's' : ''}
                </span>
              </div>

              {platforms.length > 0 ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontSize: '18px' }}>Featuring:</span>
                  {platforms.map((plat, idx) => (
                    <span
                      key={idx}
                      style={{
                        backgroundColor: '#0f172a',
                        padding: '6px 14px',
                        borderRadius: '12px',
                        border: '1px solid #1e293b',
                        fontSize: '16px',
                        color: '#38bdf8',
                        textTransform: 'capitalize',
                      }}
                    >
                      {plat}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {/* LinkID Watermark branding */}
          <div
            style={{
              position: 'absolute',
              bottom: '25px',
              right: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#38bdf8', letterSpacing: '2px' }}>
              LinkID
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("Failed to generate OG image:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
