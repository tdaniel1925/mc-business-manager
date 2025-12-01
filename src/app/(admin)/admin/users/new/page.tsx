"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Select,
} from "@/components/ui";
import { ArrowLeft, User, Shield, Building2 } from "lucide-react";
import Link from "next/link";

interface Company {
  id: string;
  name: string;
}

export default function NewUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userType = searchParams.get("type") || "company";
  const preselectedCompanyId = searchParams.get("companyId");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isPlatformUser, setIsPlatformUser] = useState(userType === "platform");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    companyId: preselectedCompanyId || "",
    companyRole: "SALES",
    platformRole: "PLATFORM_ADMIN",
  });

  useEffect(() => {
    // Fetch companies for dropdown
    fetch("/api/admin/companies")
      .then((res) => res.json())
      .then((data) => setCompanies(data.companies || []))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        ...(isPlatformUser
          ? { platformRole: formData.platformRole }
          : {
              companyId: formData.companyId || undefined,
              companyRole: formData.companyRole,
            }),
      };

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create user");
      }

      router.push("/admin/users");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Add User"
        subtitle="Create a new platform or company user"
        action={
          <Link href="/admin/users">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          {/* User Type Toggle */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsPlatformUser(false)}
                  className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                    !isPlatformUser
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Building2
                    className={`w-8 h-8 mx-auto mb-2 ${
                      !isPlatformUser ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
                  <p className="font-medium">Company User</p>
                  <p className="text-sm text-gray-500">
                    User belongs to a client company
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPlatformUser(true)}
                  className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                    isPlatformUser
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Shield
                    className={`w-8 h-8 mx-auto mb-2 ${
                      isPlatformUser ? "text-indigo-600" : "text-gray-400"
                    }`}
                  />
                  <p className="font-medium">Platform Admin</p>
                  <p className="text-sm text-gray-500">
                    SaaS platform administrator
                  </p>
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Full Name *"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="Email *"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Password *"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    minLength={8}
                    required
                  />
                  <Input
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                {isPlatformUser ? (
                  <Select
                    label="Platform Role *"
                    value={formData.platformRole}
                    onChange={(e) =>
                      setFormData({ ...formData, platformRole: e.target.value })
                    }
                    options={[
                      { value: "SUPER_ADMIN", label: "Super Admin" },
                      { value: "PLATFORM_ADMIN", label: "Platform Admin" },
                      { value: "PLATFORM_SUPPORT", label: "Support" },
                    ]}
                  />
                ) : (
                  <>
                    <Select
                      label="Company"
                      value={formData.companyId}
                      onChange={(e) =>
                        setFormData({ ...formData, companyId: e.target.value })
                      }
                      options={[
                        { value: "", label: "Select a company..." },
                        ...companies.map((c) => ({
                          value: c.id,
                          label: c.name,
                        })),
                      ]}
                    />

                    <Select
                      label="Company Role *"
                      value={formData.companyRole}
                      onChange={(e) =>
                        setFormData({ ...formData, companyRole: e.target.value })
                      }
                      options={[
                        { value: "COMPANY_OWNER", label: "Company Owner" },
                        { value: "COMPANY_ADMIN", label: "Company Admin" },
                        { value: "MANAGER", label: "Manager" },
                        { value: "UNDERWRITER", label: "Underwriter" },
                        { value: "SALES", label: "Sales" },
                        { value: "COLLECTIONS", label: "Collections" },
                        { value: "COMPLIANCE", label: "Compliance" },
                        { value: "VIEWER", label: "Viewer (Read-only)" },
                      ]}
                    />
                  </>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Link href="/admin/users">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" loading={loading}>
                    Create User
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
