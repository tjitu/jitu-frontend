import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AdminUserResponse } from "@/modules/AdminUserModule/interface";
import { Coins, User, Mail, Calendar } from "lucide-react";

interface UserInfoCardProps {
  user: AdminUserResponse;
}

export const UserInfoCard: React.FC<UserInfoCardProps> = ({ user }) => {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle>Profil User</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
            <Badge variant="outline" className="mt-1">
              {user.role}
            </Badge>
          </div>
        </div>

        <div className="grid gap-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              Email
            </div>
            <span className="font-medium">{user.email}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Coins className="h-4 w-4 text-yellow-500" />
              Saldo Coin
            </div>
            <span className="font-bold text-yellow-600 font-mono">{user.tokenBalance} coin</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              Target
            </div>
            <span className="font-medium">{user.target || "-"}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Bergabung
            </div>
            <span className="font-medium">
              {new Date(user.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
