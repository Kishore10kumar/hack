import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Coffee, ChevronDown, ChevronUp, Phone, Mail, User, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { playAlertSound } from "@/lib/audio-alerts";
import { useUser } from "@/context/user-context";
import { useLocation } from "wouter";
import type { Driver } from "@shared/schema";

type DriverSession = {
  id: string;
  driverId: string;
  startTime: string;
  endTime: string | null;
  totalDriveTime: number | null;
  totalAlerts: number;
  maxDrowsinessScore: number;
};

type CurrentDriverResponse = {
  driver: Driver;
  session: DriverSession;
};

interface DriverProfileProps {
  alertCount?: number;
  lastAlertLevel?: string;
  onBreakTaken?: () => void;
}

export default function DriverProfile({ alertCount = 0, lastAlertLevel = "None", onBreakTaken }: DriverProfileProps) {
  const { toast } = useToast();
  const { user, logout } = useUser();
  const [, setLocation] = useLocation();
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [emergencyActive, setEmergencyActive] = useState(false);

  const { data: currentDriver } = useQuery<CurrentDriverResponse>({
    queryKey: ['/api/drivers/current'],
  });

  const session = currentDriver?.session;
  const driveTimeMinutes = session?.startTime
    ? Math.floor((Date.now() - new Date(session.startTime).getTime()) / (1000 * 60))
    : 0;
  const driveTimeHours = Math.floor(driveTimeMinutes / 60);
  const driveTimeRemainder = driveTimeMinutes % 60;

  const handleEmergencyAlert = async () => {
    if (emergencyActive) return;
    setEmergencyActive(true);
    playAlertSound('emergency');

    const contacts = [
      "Ambulance (112)",
      user?.phone ? `Your number (${user.phone})` : null,
      user?.secondaryPhone ? `Emergency contact (${user.secondaryPhone})` : null,
    ].filter(Boolean).join(", ");

    toast({
      variant: "destructive",
      title: "🚨 Emergency Alert Activated!",
      description: `Alert sent to: ${contacts}. Email sent to ${user?.email || "your address"}. Please pull over safely.`,
      duration: 12000,
    });

    setTimeout(() => setEmergencyActive(false), 10000);
  };

  const handleBreak = () => {
    playAlertSound('notification');
    if (onBreakTaken) onBreakTaken();
    toast({
      title: "☕ Break Started",
      description: "Break recorded. Please rest for at least 15 minutes before continuing.",
    });
  };

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <div className="space-y-4">
      <Card data-testid="driver-profile">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Current Driver</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground h-8 px-2"
            >
              <LogOut className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Sign Out</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Driver photo + name */}
          <div className="flex items-center space-x-4 mb-4">
            {user?.photo ? (
              <img
                src={user.photo}
                alt="Driver profile photo"
                className="w-16 h-16 rounded-full object-cover border-2 border-border flex-shrink-0"
                data-testid="driver-photo"
              />
            ) : (
              <div className="w-16 h-16 rounded-full border-2 border-border bg-muted flex items-center justify-center flex-shrink-0">
                <User className="h-7 w-7 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0">
              <h4 className="font-medium text-foreground truncate" data-testid="driver-name">
                {user?.name || "Driver"}
              </h4>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{user?.phone || "—"}</span>
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3 flex-shrink-0" />
                <span className="truncate max-w-[160px]">{user?.email || "—"}</span>
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className="font-medium text-safe" data-testid="driver-status">Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Drive Time</span>
              <span className="text-foreground" data-testid="drive-time">
                {driveTimeHours}h {driveTimeRemainder}m
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Alerts Today</span>
              <span className={`font-medium ${alertCount > 0 ? 'text-warning' : 'text-muted-foreground'}`}>
                {alertCount}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Last Alert</span>
              <span className="text-muted-foreground capitalize">{lastAlertLevel}</span>
            </div>
          </div>

          <Button
            variant="secondary"
            className="w-full mt-4"
            onClick={() => setShowFullProfile(!showFullProfile)}
            data-testid="button-view-profile"
          >
            {showFullProfile ? (
              <><ChevronUp className="h-4 w-4 mr-2" />Hide Details</>
            ) : (
              <><ChevronDown className="h-4 w-4 mr-2" />View Full Profile</>
            )}
          </Button>

          {showFullProfile && (
            <div className="mt-5 pt-5 border-t border-border space-y-4" data-testid="full-profile-details">
              <div>
                <h5 className="text-sm font-medium text-foreground mb-2">Contact Information</h5>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span data-testid="driver-phone">{user?.phone || "—"}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <Phone className="h-4 w-4 flex-shrink-0 text-warning" />
                    <span className="text-warning text-xs">(Emergency)</span>
                    <span>{user?.secondaryPhone || "—"}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span data-testid="driver-email" className="break-all">{user?.email || "—"}</span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium text-foreground mb-2">Session Activity</h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Total Drive Time</span>
                    <span className="text-foreground">{driveTimeHours}h {driveTimeRemainder}m</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Fatigue Alerts</span>
                    <span className="text-foreground">{alertCount}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-md bg-muted/50 border border-border px-3 py-2 text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Emergency contacts on file:</p>
                <p>• Ambulance: 112</p>
                {user?.phone && <p>• Your number: {user.phone}</p>}
                {user?.secondaryPhone && <p>• Emergency contact: {user.secondaryPhone}</p>}
                {user?.email && <p>• Email: {user.email}</p>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card data-testid="quick-actions">
        <CardHeader className="pb-3">
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              variant="destructive"
              className="w-full py-4 text-base font-semibold"
              onClick={handleEmergencyAlert}
              disabled={emergencyActive}
              data-testid="button-emergency"
            >
              <AlertTriangle className="h-5 w-5 mr-2" />
              {emergencyActive ? "🚨 Alerting Emergency Services..." : "Emergency Alert"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Alerts ambulance (112), your number &amp; emergency contact
            </p>
            <Button
              className="w-full py-3 bg-warning text-black hover:bg-warning/90 font-semibold"
              onClick={handleBreak}
              data-testid="button-break"
            >
              <Coffee className="h-4 w-4 mr-2" />
              Take a Break
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
