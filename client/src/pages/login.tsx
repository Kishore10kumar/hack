import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Eye, User, Phone, Mail, Camera, Upload, PhoneCall } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/user-context";
import { useToast } from "@/hooks/use-toast";

interface FormState {
  name: string;
  phone: string;
  secondaryPhone: string;
  email: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  secondaryPhone?: string;
  email?: string;
}

export default function Login() {
  const { setUser } = useUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({ name: "", phone: "", secondaryPhone: "", email: "" });
  const [photo, setPhoto] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Exactly 10 digits after stripping all non-digit characters
  const isValidPhone = (val: string) => val.replace(/\D/g, '').length === 10;

  // Strict email: local@domain.tld
  // - local part: 2+ chars (letters, digits, dots, underscores, hyphens)
  // - domain name: 2+ chars before the last dot
  // - TLD: 2+ letters only (com, in, org, net, etc.)
  const isValidEmail = (val: string): boolean => {
    const trimmed = val.trim().toLowerCase();
    const re = /^[a-z0-9][a-z0-9._+\-]{1,}@[a-z0-9][a-z0-9\-]*\.[a-z]{2,}$/;
    if (!re.test(trimmed)) return false;
    const atIdx = trimmed.lastIndexOf('@');
    const domain = trimmed.substring(atIdx + 1);
    const dotIdx = domain.lastIndexOf('.');
    const domainName = domain.substring(0, dotIdx);
    const tld = domain.substring(dotIdx + 1);
    return domainName.length >= 2 && tld.length >= 2;
  };

  const validate = (f: FormState): FormErrors => {
    const errs: FormErrors = {};
    if (!f.name.trim()) {
      errs.name = "Full name is required";
    }
    if (!f.phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (!isValidPhone(f.phone)) {
      errs.phone = "Enter a valid 10-digit phone number (e.g. 98765 43210)";
    }
    if (!f.secondaryPhone.trim()) {
      errs.secondaryPhone = "Emergency contact number is required";
    } else if (!isValidPhone(f.secondaryPhone)) {
      errs.secondaryPhone = "Enter a valid 10-digit phone number";
    }
    if (!f.email.trim()) {
      errs.email = "Email address is required";
    } else if (!isValidEmail(f.email)) {
      errs.email = "Enter a valid email (e.g. kishore@gmail.com)";
    }
    return errs;
  };

  const setField = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = { ...form, [field]: e.target.value };
    setForm(updated);
    if (submitted) {
      setErrors(validate(updated));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setTimeout(() => {
      setUser({
        name: form.name.trim(),
        phone: form.phone.trim(),
        secondaryPhone: form.secondaryPhone.trim(),
        email: form.email.trim(),
        photo,
      });
      toast({ title: `Welcome, ${form.name.trim()}!`, description: "Drive safe. FatigueWatch is monitoring you." });
      setLocation("/dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
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
            <p className="text-sm text-muted-foreground text-center">All fields are required to start monitoring</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} noValidate className="space-y-5">

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
                  {photo ? "Change Photo" : "Upload Photo"}
                </Button>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Kishore Kumar"
                  value={form.name}
                  onChange={setField("name")}
                  className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.name && <p className="text-xs text-destructive font-medium">{errors.name}</p>}
              </div>

              {/* Primary Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Your Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={form.phone}
                  onChange={setField("phone")}
                  className={errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.phone && <p className="text-xs text-destructive font-medium">{errors.phone}</p>}
              </div>

              {/* Secondary / Emergency Contact */}
              <div className="space-y-1.5">
                <Label htmlFor="secondaryPhone" className="flex items-center gap-1.5">
                  <PhoneCall className="h-3.5 w-3.5" /> Emergency Contact Number <span className="text-destructive">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">Family member or trusted contact — alerted during emergencies</p>
                <Input
                  id="secondaryPhone"
                  type="tel"
                  placeholder="e.g. +91 98765 00000"
                  value={form.secondaryPhone}
                  onChange={setField("secondaryPhone")}
                  className={errors.secondaryPhone ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.secondaryPhone && <p className="text-xs text-destructive font-medium">{errors.secondaryPhone}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. kishore@example.com"
                  value={form.email}
                  onChange={setField("email")}
                  className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.email && <p className="text-xs text-destructive font-medium">{errors.email}</p>}
              </div>

              {submitted && Object.keys(errors).length > 0 && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive font-medium">
                  Please fill in all required fields correctly before continuing.
                </div>
              )}

              <Button type="submit" className="w-full py-5 text-base font-semibold" disabled={loading}>
                {loading ? "Starting session..." : "Start Monitoring"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Your data stays on this device only. Nothing is sent to external servers.
        </p>
      </div>
    </div>
  );
}
