import { useParams } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { DetailHeader } from "@/components/shared/DetailHeader";
import { InfoCard } from "@/components/shared/InfoCard";

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const { students, levels, classes, parents } = useData();
  const student = students.find(s => s.id === id);
  if (!student) return <p className="text-muted-foreground">Student not found</p>;

  const level = levels.find(l => l.id === student.levelId);
  const cls = classes.find(c => c.id === student.classId);
  const studentParents = student.parentRelations.map(pr => {
    const parent = parents.find(p => p.id === pr.parentId);
    return parent ? { label: pr.relation, value: `${parent.firstName} ${parent.lastName}`, link: `/parents/${parent.id}` } : null;
  }).filter(Boolean) as { label: string; value: string; link: string }[];

  const url = window.location.href;

  return (
    <div className="space-y-6">
      <DetailHeader title={`${student.firstName} ${student.lastName}`} subtitle={`ID: ${student.id}`} backTo="/students" showQR qrValue={url} photo={student.photo} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <InfoCard title="Basic Info" items={[
          { label: "First Name", value: student.firstName },
          { label: "Last Name", value: student.lastName },
          { label: "ID", value: student.id },
        ]} />
        <InfoCard title="Academic" items={[
          { label: "Level", value: level?.name || "-", link: level ? `/levels/${level.id}` : undefined },
          { label: "Class", value: cls ? `Class ${cls.classNumber}` : "-", link: cls ? `/classes/${cls.id}` : undefined },
        ]} />
        <InfoCard title="Parents" items={studentParents} />
      </div>
    </div>
  );
}
