import './globals.css';

export const metadata = {
  title: 'VoteSystem - Secure Digital Voting Platform',
  description: 'A secure and transparent digital voting platform for modern elections with role-based access for administrators, candidates, and voters.',
  keywords: 'voting, election, digital voting, secure voting, online voting, election platform',
  authors: [{ name: 'VoteSystem Team' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
