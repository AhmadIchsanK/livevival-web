export const metadata = {
  title: 'Livevival - Esports Live Score',
  description: 'Real-time MLBB esports scores and game statistics',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#0f172a' }}>
        {children}
      </body>
    </html>
  );
}
