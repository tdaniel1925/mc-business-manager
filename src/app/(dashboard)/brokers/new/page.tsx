"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import {
  Button,
  Input,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";

export default function NewBrokerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    tier: "STANDARD",
    commissionRate: "0.10",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/brokers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          commissionRate: parseFloat(formData.commissionRate),
        }),
      });

      if (res.ok) {
        const broker = await res.json();
        router.push(`/brokers/${broker.id}`);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create broker");
      }
    } catch (error) {
      console.error("Failed to create broker:", error);
      alert("Failed to create broker");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Add Broker"
        subtitle="Add a new broker/ISO partner"
        action={
          <Link href="/brokers">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Brokers
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 overflow-auto">
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Broker Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Company Name *"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
              <Input
                label="Contact Name *"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                required
              />
              <Input
                label="Email *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Input
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
              />
              <Select
                label="Tier"
                name="tier"
                options={[
                  { value: "STANDARD", label: "Standard (10%)" },
                  { value: "PREFERRED", label: "Preferred (12%)" },
                  { value: "PREMIUM", label: "Premium (15%)" },
                ]}
                value={formData.tier}
                onChange={handleChange}
              />
              <Input
                label="Commission Rate"
                name="commissionRate"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={formData.commissionRate}
                onChange={handleChange}
                hint="As decimal (e.g., 0.10 = 10%)"
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" loading={loading}>
              Add Broker
            </Button>
            <Link href="/brokers">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
