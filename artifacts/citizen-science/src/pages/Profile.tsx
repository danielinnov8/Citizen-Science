import React from "react";
import { useLocation } from "wouter";
import { LogOut, Trash2, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { storage } from "@/lib/storage";
import { DEVICES } from "@/lib/devices";

export function Profile() {
  const [, setLocation] = useLocation();
  const { user, signOut } = useAuth();
  const [connected, setConnected] = React.useState<Record<string, boolean>>({});

  const toggleDevice = (id: string) => {
    setConnected((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  
  let prefs = { interests: [], experience: "Beginner" };
  try {
    const raw = localStorage.getItem("cs_preferences");
    if (raw) prefs = JSON.parse(raw);
  } catch (e) {}

  const handleSignOut = async () => {
    await signOut();
    setLocation("/");
  };

  const handleReset = async () => {
    storage.clearAll();
    await signOut();
    setLocation("/");
  };

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-3xl font-serif tracking-tight mb-2">Profile</h1>
        <p className="text-[#64748B]">Manage your account and preferences.</p>
      </div>

      <Card className="shadow-sm border-[#E2E8F0] mb-8 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-100 to-indigo-50 h-32" />
        <CardContent className="p-6 relative pb-8">
          <Avatar className="h-24 w-24 border-4 border-white absolute -top-12 shadow-sm">
            <AvatarFallback className="bg-blue-600 text-white text-2xl font-bold">
              {user?.initials || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="mt-14">
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <p className="text-[#64748B] mb-6">{user?.email}</p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => void handleSignOut()}>
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-[#E2E8F0] mb-8">
        <CardContent className="p-6 space-y-6">
          <h3 className="font-semibold text-lg border-b border-[#E2E8F0] pb-2">Learning Preferences</h3>
          
          <div>
            <div className="text-sm font-medium text-[#64748B] mb-2">Experience Level</div>
            <div className="font-medium">{prefs.experience || "Beginner"}</div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-[#64748B] mb-2">Interests</div>
            <div className="flex flex-wrap gap-2">
              {prefs.interests && prefs.interests.length > 0 ? (
                prefs.interests.map((i: string) => (
                  <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">{i}</span>
                ))
              ) : (
                <span className="text-sm">No interests selected.</span>
              )}
            </div>
          </div>
          
          <Button variant="link" className="px-0 text-blue-600">Retake Onboarding Survey</Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-[#E2E8F0] mb-8">
        <CardContent className="p-6 space-y-1">
          <div className="border-b border-[#E2E8F0] pb-3 mb-4">
            <h3 className="font-semibold text-lg">Connected Devices</h3>
            <p className="text-sm text-[#64748B] mt-1">
              Sync biometric data from your wearables into your experiments and notebook. This is a preview — connections aren't live yet.
            </p>
          </div>
          <div className="divide-y divide-[#E2E8F0]">
            {DEVICES.map((device) => {
              const isConnected = !!connected[device.id];
              return (
                <div key={device.id} className="flex items-center gap-4 py-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${device.accent}`}>
                    <device.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm leading-tight">{device.name}</div>
                    <div className="text-xs text-[#64748B] line-clamp-1">{device.description}</div>
                  </div>
                  <Button
                    variant={isConnected ? "outline" : "default"}
                    size="sm"
                    aria-pressed={isConnected}
                    onClick={() => toggleDevice(device.id)}
                  >
                    {isConnected ? (
                      <>
                        <Check className="mr-1.5 h-4 w-4 text-green-600" /> Connected
                      </>
                    ) : (
                      <>
                        <Plus className="mr-1.5 h-4 w-4" /> Connect
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-red-200 bg-red-50/30">
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg text-red-900 mb-2">Danger Zone</h3>
          <p className="text-sm text-red-700 mb-6">Resetting prototype data will delete all your notebook entries, started experiments, and preferences from localStorage.</p>
          <Button variant="destructive" onClick={() => void handleReset()}>
            <Trash2 className="mr-2 h-4 w-4" /> Reset Prototype Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
