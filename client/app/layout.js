export const metadata = {
  title: 'MELODIX',
  description: 'Streaming de música',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
        <head>
          <style>
            {`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap')`};
          </style>
        </head>
      <body style={{ margin: '0px',padding: '0px' }}>{children}</body>
      </html>
  )
}
