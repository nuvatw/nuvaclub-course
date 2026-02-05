import { HeroSection } from "@/components/home/HeroSection";
import { ProjectList } from "@/components/projects/ProjectList";
import { getProjects } from "./actions/projects";
import { getUserData } from "@/lib/auth";

export default async function Home() {
  const userData = await getUserData();
  const { user } = userData;

  // Only fetch projects if user is logged in
  const projects = user ? await getProjects() : [];

  // Not logged in: show only hero section
  if (!user) {
    return <HeroSection />;
  }

  // Logged in: show projects
  return (
    <div className="min-h-screen">
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            課程
          </h2>
          <ProjectList projects={projects} />
        </div>
      </section>
    </div>
  );
}
