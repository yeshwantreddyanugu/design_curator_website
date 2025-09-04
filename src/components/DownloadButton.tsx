import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { designApi } from "@/services/api";
import { toast } from "sonner";

interface DownloadButtonProps {
  designId: number;
  designName: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const DownloadButton = ({ 
  designId, 
  designName, 
  variant = "outline", 
  size = "sm",
  className = "",
  onClick 
}: DownloadButtonProps) => {
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onClick) {
      onClick(e);
    }
    
    try {
      const blob = await designApi.downloadDesign(designId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${designName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_design.zip`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Design downloaded successfully!");
    } catch (error) {
      console.error('Download failed:', error);
      toast.error("Download failed. Please try again.");
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      className={`flex items-center gap-2 ${className}`}
    >
      <Download className="w-4 h-4" />
      Download
    </Button>
  );
};

export default DownloadButton;