import { Navbar } from "@/components/navbar"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Desktop: Add left margin for sidebar, Mobile: No margin */}
      <main className="lg:ml-64">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}