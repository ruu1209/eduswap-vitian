import { Link } from 'react-router-dom';
import { ArrowRight, FileText, BookMarked, MessagesSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/utils/constants';

const pillars = [
  { icon: FileText, title: 'Share notes', body: 'Upload handwritten notes, PDFs and assignments your peers can actually use.' },
  { icon: BookMarked, title: 'Trade books', body: 'Buy, sell and reserve used academic books without leaving campus.' },
  { icon: MessagesSquare, title: 'Talk it out', body: 'Message sellers directly to ask questions and negotiate a fair price.' },
];

export function HomePage() {
  return (
    <div className="space-y-20 pb-12">
      <section className="mx-auto max-w-6xl pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              For verified college students
            </p>
            <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
              The campus library that <span className="text-primary">runs on trust</span>.
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              EduSwap is where students swap notes, resell textbooks and pass down the resources that
              got them through the semester — verified by college email, priced by peers.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" asChild>
                <Link to={ROUTES.SIGNUP}>
                  Join with your college email <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to={ROUTES.RESOURCES}>Browse resources</Link>
              </Button>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="bg-white border border-border rounded-3xl p-3 shadow-sm">
              <img
                src="/students.png"
                alt="VIT students collaborating"
                className="w-full aspect-[4/3] object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        {pillars.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-lg border border-border bg-card p-6">
            <Icon className="mb-4 h-6 w-6 text-primary" />
            <h3 className="mb-2 font-display text-xl font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
