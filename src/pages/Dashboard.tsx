import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/contexts/DataContext";
import { GraduationCap, BookOpen, UserCog, Users, School, Layers } from "lucide-react";
import { Link } from "react-router-dom";

const StatCard = ({ title, count, icon: Icon, to, color }: { title: string; count: number; icon: any; to: string; color: string }) => (
  <Link to={to}>
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{count}</div>
      </CardContent>
    </Card>
  </Link>
);

export default function Dashboard() {
  const { students, teachers, managers, parents, classes, levels, subjects } = useData();

  const stats = [
    { title: "Students", count: students.length, icon: GraduationCap, to: "/students", color: "bg-primary/10 text-primary" },
    { title: "Teachers", count: teachers.length, icon: BookOpen, to: "/teachers", color: "bg-accent/10 text-accent" },
    { title: "Managers", count: managers.length, icon: UserCog, to: "/managers", color: "bg-success/10 text-success" },
    { title: "Parents", count: parents.length, icon: Users, to: "/parents", color: "bg-info/10 text-info" },
    { title: "Classes", count: classes.length, icon: School, to: "/classes", color: "bg-warning/10 text-warning" },
    { title: "Levels", count: levels.length, icon: Layers, to: "/levels", color: "bg-destructive/10 text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your school management system</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map(s => <StatCard key={s.title} {...s} />)}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recent Students</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {students.slice(0, 5).map(s => (
                <Link key={s.id} to={`/students/${s.id}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <span className="font-medium">{s.firstName} {s.lastName}</span>
                  <span className="text-sm text-muted-foreground">{s.id}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Subjects ({subjects.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {subjects.map(s => (
                <Link key={s.id} to={`/subjects/${s.id}`} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20">
                  {s.name}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
