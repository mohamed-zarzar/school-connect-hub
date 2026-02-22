import { useParams } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { DetailHeader } from "@/components/shared/DetailHeader";
import { InfoCard } from "@/components/shared/InfoCard";

export default function LevelDetail() {
  const { id } = useParams<{ id: string }>();
  const { levels, classes, students, subjects } = useData();
  const level = levels.find(l => l.id === id);
  if (!level) return <p className="text-muted-foreground">Level not found</p>;

  const levelClasses = classes.filter(c => c.levelId === id);
  const levelStudents = students.filter(s => s.levelId === id);
  const levelSubjects = level.subjectIds.map(sid => subjects.find(s => s.id === sid)).filter(Boolean);

  return (
    <div className="space-y-6">
      <DetailHeader title={level.name} subtitle={`ID: ${level.id}`} backTo="/levels" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <InfoCard title="Info" items={[
          { label: "Name", value: level.name },
          { label: "Number of Classes", value: String(level.numberOfClasses) },
          { label: "Actual Classes", value: String(levelClasses.length) },
        ]} />
        <InfoCard title={`Classes (${levelClasses.length})`} badges={levelClasses.map(c => ({ label: `Class ${c.classNumber}`, link: `/classes/${c.id}` }))} />
        <InfoCard title={`Students (${levelStudents.length})`} badges={levelStudents.map(s => ({ label: `${s.firstName} ${s.lastName}`, link: `/students/${s.id}` }))} />
        <InfoCard title="Subjects" badges={levelSubjects.map(s => ({ label: s!.name, link: `/subjects/${s!.id}` }))} />
      </div>
    </div>
  );
}
