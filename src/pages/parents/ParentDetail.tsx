import { useParams } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { DetailHeader } from "@/components/shared/DetailHeader";
import { InfoCard } from "@/components/shared/InfoCard";

export default function ParentDetail() {
  const { id } = useParams<{ id: string }>();
  const { parents, students } = useData();
  const parent = parents.find(p => p.id === id);
  if (!parent) return <p className="text-muted-foreground">Parent not found</p>;

  const childItems = parent.studentRelations.map(sr => {
    const student = students.find(s => s.id === sr.studentId);
    return student ? { label: sr.relation, value: `${student.firstName} ${student.lastName}`, link: `/students/${student.id}` } : null;
  }).filter(Boolean) as { label: string; value: string; link: string }[];

  return (
    <div className="space-y-6">
      <DetailHeader title={`${parent.firstName} ${parent.lastName}`} subtitle={`ID: ${parent.id}`} backTo="/parents" />
      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard title="Basic Info" items={[
          { label: "First Name", value: parent.firstName },
          { label: "Last Name", value: parent.lastName },
          { label: "ID", value: parent.id },
        ]} />
        <InfoCard title="Children" items={childItems} />
      </div>
    </div>
  );
}
