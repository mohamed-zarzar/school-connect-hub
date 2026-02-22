import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface InfoItem {
  label: string;
  value: string;
  link?: string;
}

interface InfoCardProps {
  title: string;
  items?: InfoItem[];
  badges?: { label: string; link?: string }[];
}

export function InfoCard({ title, items, badges }: InfoCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items?.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{item.label}</span>
            {item.link ? <Link to={item.link} className="text-primary hover:underline">{item.value}</Link> : <span className="font-medium">{item.value}</span>}
          </div>
        ))}
        {badges && badges.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {badges.map((b, i) => (
              b.link ? (
                <Link key={i} to={b.link}><Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">{b.label}</Badge></Link>
              ) : (
                <Badge key={i} variant="secondary">{b.label}</Badge>
              )
            ))}
          </div>
        )}
        {(!items || items.length === 0) && (!badges || badges.length === 0) && (
          <p className="text-sm text-muted-foreground">No data available</p>
        )}
      </CardContent>
    </Card>
  );
}
