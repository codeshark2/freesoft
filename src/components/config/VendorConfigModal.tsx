import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, Loader2, CheckCircle2 } from 'lucide-react';
import { VendorConfig, ConfigField } from '@/lib/vendors/types';
import { saveVendorConfig, getVendorConfig, VendorConfigData } from '@/lib/storage/apiKeyStorage';
import { notifyVendorConfigChange } from '@/hooks/useVendorConfig';

interface VendorConfigModalProps {
  vendor: VendorConfig | null;
  open: boolean;
  onClose: () => void;
}

export const VendorConfigModal = ({ vendor, open, onClose }: VendorConfigModalProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  useEffect(() => {
    if (vendor && open) {
      const existing = getVendorConfig(vendor.id);
      if (existing) {
        setFormData(existing as Record<string, string>);
      } else {
        const initial: Record<string, string> = {};
        vendor.configFields.forEach((field) => {
          initial[field.key] = '';
        });
        setFormData(initial);
      }
      setTestSuccess(false);
    }
  }, [vendor, open]);

  const handleFieldChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setTestSuccess(false);
  };

  const isFormValid = () => {
    if (!vendor) return false;
    return vendor.configFields
      .filter((f) => f.required)
      .every((f) => formData[f.key]?.trim().length > 0);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    // Simulating API test - in real implementation, this would test the actual API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsTesting(false);
    setTestSuccess(true);
  };

  const handleSave = () => {
    if (!vendor || !isFormValid()) return;
    saveVendorConfig(vendor.id, formData as VendorConfigData);
    notifyVendorConfigChange();
    onClose();
  };

  const renderField = (field: ConfigField) => {
    if (field.type === 'select' && field.options) {
      return (
        <Select value={formData[field.key] || ''} onValueChange={(value) => handleFieldChange(field.key, value)}>
          <SelectTrigger className="bg-muted border-border">
            <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        type={field.type === 'password' ? 'password' : 'text'}
        value={formData[field.key] || ''}
        onChange={(e) => handleFieldChange(field.key, e.target.value)}
        placeholder={field.placeholder}
        className="bg-muted border-border"
      />
    );
  };

  if (!vendor) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            Configure {vendor.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">{vendor.description}</p>

          {vendor.configFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key} className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {renderField(field)}
            </div>
          ))}

          <a
            href={vendor.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Get your API key from {vendor.name}
          </a>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="border-border">
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={!isFormValid() || isTesting}
            className="border-border"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : testSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2 text-accent" />
                Connected
              </>
            ) : (
              'Test Connection'
            )}
          </Button>
          <Button onClick={handleSave} disabled={!isFormValid()} className="bg-primary text-primary-foreground">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
