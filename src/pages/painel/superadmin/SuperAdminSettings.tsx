import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Save, Settings, AlertTriangle } from 'lucide-react';

interface GlobalSetting {
  id: string;
  key: string;
  value: any;
  description: string | null;
}

export default function SuperAdminSettings() {
  const [settings, setSettings] = useState<GlobalSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [localValues, setLocalValues] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('global_settings')
        .select('*')
        .order('key');

      if (error) throw error;

      setSettings(data || []);
      
      // Initialize local values
      const values: Record<string, any> = {};
      data?.forEach(s => {
        values[s.key] = s.value;
      });
      setLocalValues(values);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (key: string, value: any) => {
    setLocalValues(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      for (const setting of settings) {
        const newValue = localValues[setting.key];
        if (newValue !== setting.value) {
          const { error } = await supabase
            .from('global_settings')
            .update({ value: newValue })
            .eq('key', setting.key);

          if (error) throw error;
        }
      }

      toast.success('Configurações salvas com sucesso');
      fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const getSettingLabel = (key: string) => {
    const labels: Record<string, string> = {
      platform_name: 'Nome da Plataforma',
      platform_fee_percentage: 'Taxa da Plataforma (%)',
      min_order_value: 'Pedido Mínimo Padrão (R$)',
      points_per_real: 'Pontos por Real Gasto',
      points_value: 'Valor do Ponto (R$)',
      maintenance_mode: 'Modo Manutenção',
    };
    return labels[key] || key;
  };

  const renderSettingInput = (setting: GlobalSetting) => {
    const value = localValues[setting.key];

    // Boolean settings
    if (typeof value === 'boolean' || value === 'true' || value === 'false') {
      const boolValue = value === true || value === 'true';
      return (
        <Switch
          checked={boolValue}
          onCheckedChange={(checked) => handleValueChange(setting.key, checked)}
        />
      );
    }

    // Numeric settings
    if (typeof value === 'number' || !isNaN(Number(value))) {
      return (
        <Input
          type="number"
          step="0.01"
          value={value}
          onChange={(e) => handleValueChange(setting.key, e.target.value)}
          className="max-w-xs"
        />
      );
    }

    // String settings
    return (
      <Input
        value={String(value).replace(/"/g, '')}
        onChange={(e) => handleValueChange(setting.key, `"${e.target.value}"`)}
        className="max-w-xs"
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isMaintenanceMode = localValues.maintenance_mode === true || localValues.maintenance_mode === 'true';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Configurações Globais</h1>
          <p className="text-muted-foreground">Configure parâmetros gerais da plataforma</p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      {isMaintenanceMode && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                Modo de manutenção ativo
              </p>
              <p className="text-sm text-muted-foreground">
                A plataforma está em modo de manutenção
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações
          </CardTitle>
          <CardDescription>
            Ajuste os parâmetros globais da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {settings.map((setting) => (
            <div
              key={setting.key}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 border-b border-border last:border-0"
            >
              <div>
                <Label className="text-foreground font-medium">
                  {getSettingLabel(setting.key)}
                </Label>
                {setting.description && (
                  <p className="text-sm text-muted-foreground">{setting.description}</p>
                )}
              </div>
              {renderSettingInput(setting)}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
