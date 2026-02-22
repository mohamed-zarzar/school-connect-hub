import { useParams } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { DetailHeader } from "@/components/shared/DetailHeader";
import { InfoCard } from "@/components/shared/InfoCard";

export default function ManagerDetail() {
  const { id } = useParams<{ id: string }>();
  const { managers, classes, levels } = useData();
  const manager = managers.find(m => m.id === id);
  if (!manager) return <p className="text-muted-foreground">Manager not found</p>;

  const getClass = (cid: string) => classes.find(c => c.id === cid);
  const getLevel = (lid: string) => levels.find(l => l.id === lid);

  const classBadges = manager.classIds.map(cid => {
    const cls = getClass(cid);
    const lvl = cls ? getLevel(cls.levelId) : null;
    return { label: `${lvl?.name || ""} - Class ${cls?.classNumber || "?"}`, link: `/classes/${cid}` };
  });

  return (
    <div className="space-y-6">
      <DetailHeader title={`${manager.firstName} ${manager.lastName}`} subtitle={`ID: ${manager.id}`} backTo="/managers" showQR qrValue={window.location.href} photo={manager.photo} />
      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard title="Basic Info" items={[
          { label: "First Name", value: manager.firstName },
          { label: "Last Name", value: manager.lastName },
          { label: "ID", value: manager.id },
        ]} />
        <InfoCard title="Assigned Classes" badges={classBadges} />
      </div>
    </div>
  );
}
