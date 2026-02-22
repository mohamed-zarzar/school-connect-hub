import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

interface DetailHeaderProps {
  title: string;
  subtitle?: string;
  backTo: string;
  showQR?: boolean;
  qrValue?: string;
  photo?: string;
}

export function DetailHeader({ title, subtitle, backTo, showQR, qrValue, photo }: DetailHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(backTo)}><ArrowLeft className="h-5 w-5" /></Button>
        {photo && <img src={photo} alt={title} className="h-16 w-16 rounded-full object-cover border-2 border-primary/20" />}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </div>
      {showQR && qrValue && (
        <div className="bg-card p-3 rounded-lg border">
          <QRCodeSVG value={qrValue} size={96} />
          <p className="text-xs text-muted-foreground text-center mt-1">Scan to view</p>
        </div>
      )}
    </div>
  );
}
