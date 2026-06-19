import '../styles/globals.css'
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/lib/language-context"

export const metadata = {
  title: "Idle Screen",
  description: "Tu pantalla secundaria perfecta",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.jpg",
    apple: "/icon.jpg",
  },
  openGraph: {
    title: "Idle Screen",
    description: "Tu pantalla secundaria perfecta con reloj, calendario y widgets útiles",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "Comfy Homescreen Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Idle Screen",
    description: "Tu pantalla secundaria perfecta",
    images: ["/logo.jpg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Idle Screen",
  },
  formatDetection: {
    telephone: false,
  },
  generator: 'v0.app'
}

export const viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon.jpg" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`font-sans antialiased`}>
        <LanguageProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}