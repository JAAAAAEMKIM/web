"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

interface NavbarProps {
  className?: string
}

const NavLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
]

export function Navbar({ className }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Desktop Navigation - Fixed Sidebar */}
      <div className={cn(
        "hidden lg:flex fixed left-0 top-0 z-50 h-full w-64 flex-col border-r bg-background px-6 py-8",
        className
      )}>
        {/* Profile Section */}
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src="https://avatars.githubusercontent.com/u/43107046?v=4" alt="Profile" />
            <AvatarFallback>JK</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="text-xl font-semibold">Jaemin Kim</h2>
            <p className="text-sm text-muted-foreground">Web Developer</p>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Navigation Links */}
        <nav className="flex-1">
          <div className="space-y-4">
            {NavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        <Separator className="mb-6" />

        {/* Dark Mode Toggle */}
        <div className="mt-auto">
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between pl-4 pr-[6px] w-full">
            <Link href="/blog" className="font-semibold">
              JAAAAAEMKIM
            </Link>
            
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-4 mt-6">
                  {NavLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </header>
      </div>
    </>
  )
}