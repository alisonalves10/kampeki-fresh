import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AddressManager } from '@/components/AddressManager';
import { PointsHistory } from '@/components/PointsHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Award } from 'lucide-react';

const Profile = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Minha Conta</h1>
        
        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Nome:</span>
                <p className="font-medium">{profile?.name || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Email:</span>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Telefone:</span>
                <p className="font-medium">{profile?.phone || 'Não informado'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Points */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Programa de Pontos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-primary">{profile?.points || 0}</p>
                <p className="text-muted-foreground">pontos disponíveis</p>
              </div>
            </CardContent>
          </Card>

          {/* Points History */}
          <PointsHistory />

          {/* Addresses */}
          <AddressManager />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
