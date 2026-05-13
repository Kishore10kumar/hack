import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Eye, User, Phone, Mail, Camera, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/user-context";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { setUser } = useUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [photo, setPhoto] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs: Partial<typeof form> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    else if (!/^\+?[\d\s\-()]{7,}$/.test(form.phone.trim()))
      errs.phone = "Enter a valid phone number";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      errs.email = "Enter a valid email address";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setUser({ name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim(), photo });
      toast({ title: `Welcome, ${form.name.trim()}!`, description: "Drive safe. FatigueWatch is monitoring you." });
      setLocation("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center space-x-2">
            <div className="bg-primary/10 rounded-full p-3">
              <Eye className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">FatigueWatch</h1>
          <p className="text-muted-foreground text-sm">Driver Drowsiness Detection System</p>
        </div>

        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center">Driver Sign In</CardTitle>
            <p className="text-sm text-muted-foreground text-center">Enter your details to start monitoring</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Photo Upload */}
              <div className="flex flex-col items-center space-y-3">
                <div
                  className="w-24 h-24 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden bg-muted"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {photo ? (
                    <img src={photo} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="flex flex-col items-center space-y-1 text-muted-foreground">
                      <Camera className="h-6 w-6" />
                      <span className="text-xs">Photo</span>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Upload Photo
                </Button>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. John Mitchell"
                  value={form.name}
                  onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(x => ({ ...x, name: undefined })); }}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g. +1 555 123 4567"
                  value={form.phone}
                  onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); setErrors(x => ({ ...x, phone: undefined })); }}
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={form.email}
                  onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(x => ({ ...x, email: undefined })); }}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <Button type="submit" className="w-full py-5 text-base" disabled={loading}>
                {loading ? "Starting session..." : "Start Monitoring"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Your data stays on this device. No data is sent to external servers.
        </p>
      </div>
    </div>
  );
}
