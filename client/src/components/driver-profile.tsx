import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Coffee, Bell, ChevronDown, ChevronUp, Phone, Mail, User, LogOut } from "lucide-react";
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
  const [messageSent, setMessageSent] = useState(false);

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
    setEmergencyActive(true);
    await playAlertSound('emergency');
    setMessageSent(true);
    toast({
      variant: "destructive",
      title: "🚨 Emergency Alert Activated",
      description: user
        ? `Emergency notification sent to ${user.email} and ${user.phone}. Please pull over safely.`
        : "Emergency services have been notified. Please pull over safely.",
    });
    setTimeout(() => { setEmergencyActive(false); setMessageSent(false); }, 8000);
  };

  const handleBreak = () => {
    playAlertSound('notification');
    if (onBreakTaken) onBreakTaken();
    toast({
      title: "☕ Taking a Break",
      description: "Break recorded. Rest for at least 15 minutes before continuing.",
    });
  };

  const handleAlertContact = () => {
    playAlertSound('warning');
    toast({
      title: "📱 Alert Sent",
      description: user
        ? `Fatigue alert sent to ${user.email} and ${user.phone}.`
        : "Fatigue alert sent to your registered contact.",
    });
  };

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const safetyScore = Math.max(0, 100 - alertCount * 5);

  return (
    <div className="space-y-4">
      <Card data-testid="driver-profile">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Current Driver</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground h-8 px-2">
              <LogOut className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Sign Out</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Driver info */}
          <div className="flex items-center space-x-4 mb-4">
            {user?.photo ? (
              <img
                src={user.photo}
                alt="Driver profile photo"
                className="w-16 h-16 rounded-full object-cover border-2 border-border"
                data-testid="driver-photo"
              />
            ) : (
              <div className="w-16 h-16 rounded-full border-2 border-border bg-muted flex items-center justify-center">
                <User className="h-7 w-7 text-muted-foreground" />
              </div>
            )}
            <div>
              <h4 className="font-medium text-foreground" data-testid="driver-name">
                {user?.name || "Driver"}
              </h4>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {user?.phone || "—"}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span className="truncate max-w-[160px]">{user?.email || "—"}</span>
              </p>
            </div>
          </div>

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
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span data-testid="driver-phone">{user?.phone || "—"}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
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
                    <span className="text-foreground" data-testid="fatigue-alerts">{alertCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Safety Score</span>
                    <span className={`font-medium ${safetyScore >= 80 ? 'text-safe' : safetyScore >= 50 ? 'text-warning' : 'text-critical'}`}>
                      {safetyScore}/100
                    </span>
                  </div>
                </div>
              </div>

              {messageSent && (
                <div className="rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-xs text-destructive">
                  🚨 Emergency notification sent to {user?.email} and {user?.phone}
                </div>
              )}
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
              className="w-full py-3"
              onClick={handleEmergencyAlert}
              disabled={emergencyActive}
              data-testid="button-emergency"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              {emergencyActive ? "🚨 Emergency Active..." : "Emergency Alert"}
            </Button>
            <Button
              className="w-full py-2 bg-warning text-black hover:bg-warning/90"
              onClick={handleBreak}
              data-testid="button-break"
            >
              <Coffee className="h-4 w-4 mr-2" />
              Take a Break
            </Button>
            <Button
              variant="secondary"
              className="w-full py-2"
              onClick={handleAlertContact}
              data-testid="button-alert-contact"
            >
              <Bell className="h-4 w-4 mr-2" />
              Alert My Contact
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
