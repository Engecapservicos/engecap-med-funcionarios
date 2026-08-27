export const metadata = { title: 'Engecap M.O.' };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: 'Inter, system-ui, sans-serif', background: '#eef1f6' }}>
        {children}
      </body>
    </html>
  );
}
