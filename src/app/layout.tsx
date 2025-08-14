import './globals.css';
import { IBM_Plex_Serif } from 'next/font/google';
import { StickyHeader } from '../components/StickyHeader';

const plex = IBM_Plex_Serif({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-plex' });

export const metadata = {
  title: 'AI Portfolio Pro',
  description: 'Showcase of advanced AI products for Real Estate and E-commerce'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plex.variable}>
      <body>
  <StickyHeader />
        <main style={{maxWidth:960, margin:'24px auto', padding:'0 16px'}}>
          {children}
        </main>
      </body>
    </html>
  );
}
