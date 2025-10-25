import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Github, Linkedin, Mail, MapPin, Calendar } from "lucide-react"

export default function AboutPage() {
  const skills = [
    "React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", 
    "Prisma", "Tailwind CSS", "Git", "Docker", "AWS"
  ]

  const experience = [
    {
      title: "Senior Software Developer",
      company: "Tech Company Inc.",
      period: "2022 - Present",
      description: "Leading frontend development and architecture decisions for modern web applications."
    },
    {
      title: "Full Stack Developer",
      company: "Startup Co.",
      period: "2020 - 2022",
      description: "Built scalable web applications using React, Node.js, and cloud technologies."
    }
  ]

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-32 w-32">
                <AvatarImage src="https://avatars.githubusercontent.com/u/43107046?v=4" alt="Profile Picture" />
                <AvatarFallback className="text-2xl">JK</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">Jaemin Kim</h1>
                <p className="text-xl text-muted-foreground mb-4">
                  Web Developer
                </p>

                <p className="text-muted-foreground mb-4"><em>Work In Progress...⚒️</em></p>
                <p className="text-muted-foreground mb-4">
                  Passionate about creating beautiful, functional web applications 
                  and sharing knowledge through writing. I love working with modern 
                  technologies and building solutions that make a difference.
                </p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>San Francisco, CA</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Available for opportunities</span>
                  </div>
                </div>
                
                <div className="flex justify-center md:justify-start gap-4 mt-6">
                  <a 
                    href="mailto:your.email@example.com" 
                    className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </a>
                  <a 
                    href="https://github.com/yourusername" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                  <a 
                    href="https://linkedin.com/in/yourusername" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Section */}
        <Card>
          <CardHeader>
            <CardTitle>Skills & Technologies</CardTitle>
            <CardDescription>
              Technologies I work with and enjoy using
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Experience Section */}
        <Card>
          <CardHeader>
            <CardTitle>Work Experience</CardTitle>
            <CardDescription>
              My professional journey in software development
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {experience.map((job, index) => (
              <div key={index}>
                {index > 0 && <Separator className="mb-6" />}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <h3 className="font-semibold">{job.title}</h3>
                    <Badge variant="outline">{job.period}</Badge>
                  </div>
                  <p className="text-muted-foreground font-medium mb-2">
                    {job.company}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {job.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* About This Blog */}
        <Card>
          <CardHeader>
            <CardTitle>About This Blog</CardTitle>
            <CardDescription>
              What you'll find here and why I write
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>
              This blog is my space to share thoughts, experiences, and learnings 
              from my journey as a software developer. You'll find posts about:
            </p>
            <ul>
              <li>Web development tutorials and best practices</li>
              <li>Insights from working with modern frameworks and tools</li>
              <li>Problem-solving approaches and lessons learned</li>
              <li>Industry trends and emerging technologies</li>
              <li>Personal projects and experiments</li>
            </ul>
            <p>
              I believe in learning by doing and sharing knowledge with the community. 
              If you have questions or want to discuss any of the topics I write about, 
              feel free to reach out!
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}