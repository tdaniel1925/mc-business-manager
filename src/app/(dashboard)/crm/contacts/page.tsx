"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Contact,
  Plus,
  Search,
  Phone,
  Mail,
  Building2,
  MoreHorizontal,
  Filter,
  Download,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ContactData {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  contactType: string;
  businessName: string | null;
  title: string | null;
  source: string | null;
  leadScore: number | null;
  status: string;
  createdAt: string;
  _count?: {
    activities: number;
    tasks: number;
    deals: number;
  };
}

const contactTypeColors: Record<string, string> = {
  BUSINESS_OWNER: "bg-primary/20 text-primary",
  GUARANTOR: "bg-purple-500/20 text-purple-500",
  ACCOUNTANT: "bg-blue-500/20 text-blue-500",
  ATTORNEY: "bg-indigo-500/20 text-indigo-500",
  BROKER: "bg-orange-500/20 text-orange-500",
  REFERRAL_SOURCE: "bg-green-500/20 text-green-500",
  VENDOR: "bg-yellow-500/20 text-yellow-500",
  EMPLOYEE: "bg-cyan-500/20 text-cyan-500",
  OTHER: "bg-gray-500/20 text-gray-500",
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-success/20 text-success",
  INACTIVE: "bg-muted text-muted-foreground",
  DO_NOT_CONTACT: "bg-destructive/20 text-destructive",
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/crm/contacts");
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      search === "" ||
      `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      contact.email?.toLowerCase().includes(search.toLowerCase()) ||
      contact.phone?.includes(search) ||
      contact.businessName?.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === "all" || contact.contactType === typeFilter;

    return matchesSearch && matchesType;
  });

  const contactTypes = [
    "all",
    "BUSINESS_OWNER",
    "GUARANTOR",
    "BROKER",
    "ACCOUNTANT",
    "ATTORNEY",
    "REFERRAL_SOURCE",
    "VENDOR",
    "EMPLOYEE",
    "OTHER",
  ];

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Contacts"
        subtitle="Manage all your CRM contacts"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Link href="/crm/contacts/new">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </Link>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, phone, or company..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="h-10 px-3 rounded-md border bg-background text-sm"
                >
                  {contactTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === "all" ? "All Types" : type.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", count: contacts.length, color: "text-foreground" },
            {
              label: "Business Owners",
              count: contacts.filter((c) => c.contactType === "BUSINESS_OWNER").length,
              color: "text-primary",
            },
            {
              label: "Brokers",
              count: contacts.filter((c) => c.contactType === "BROKER").length,
              color: "text-orange-500",
            },
            {
              label: "Active",
              count: contacts.filter((c) => c.status === "ACTIVE").length,
              color: "text-success",
            },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-4 pb-4">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contacts List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Contact className="w-5 h-5" />
              Contacts ({filteredContacts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading contacts...
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Contact className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                {contacts.length === 0 ? (
                  <>
                    <p>No contacts yet</p>
                    <Link
                      href="/crm/contacts/new"
                      className="text-primary hover:text-primary/80 text-sm mt-2 inline-block"
                    >
                      Add your first contact
                    </Link>
                  </>
                ) : (
                  <p>No contacts match your search</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Contact
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Company
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Contact Info
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Score
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((contact) => (
                      <tr
                        key={contact.id}
                        className="border-b hover:bg-accent/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <Link
                            href={`/crm/contacts/${contact.id}`}
                            className="flex items-center gap-3"
                          >
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-medium text-primary">
                                {contact.firstName?.[0] || ""}
                                {contact.lastName?.[0] || ""}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground hover:text-primary">
                                {contact.firstName} {contact.lastName}
                              </p>
                              {contact.title && (
                                <p className="text-sm text-muted-foreground">
                                  {contact.title}
                                </p>
                              )}
                            </div>
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              contactTypeColors[contact.contactType] || "bg-gray-500/20 text-gray-500"
                            }`}
                          >
                            {contact.contactType.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {contact.businessName ? (
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{contact.businessName}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            {contact.email && (
                              <a
                                href={`mailto:${contact.email}`}
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                              >
                                <Mail className="w-3 h-3" />
                                {contact.email}
                              </a>
                            )}
                            {contact.phone && (
                              <a
                                href={`tel:${contact.phone}`}
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                              >
                                <Phone className="w-3 h-3" />
                                {contact.phone}
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              statusColors[contact.status] || "bg-gray-500/20 text-gray-500"
                            }`}
                          >
                            {contact.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {contact.leadScore !== null ? (
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${contact.leadScore}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {contact.leadScore}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Link href={`/crm/contacts/${contact.id}`}>
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </Link>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
