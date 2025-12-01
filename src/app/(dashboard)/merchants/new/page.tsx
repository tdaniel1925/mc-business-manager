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
import { ArrowLeft, Building2, User } from "lucide-react";
import Link from "next/link";

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

export default function NewMerchantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    legalName: "",
    dbaName: "",
    ein: "",
    businessType: "LLC",
    phone: "",
    email: "",
    website: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    monthlyRevenue: "",
    timeInBusiness: "",
    industryCode: "",
    ownerFirstName: "",
    ownerLastName: "",
    ownerEmail: "",
    ownerPhone: "",
    ownerOwnership: "100",
    ownerFicoScore: "",
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
      const res = await fetch("/api/merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          monthlyRevenue: formData.monthlyRevenue
            ? parseFloat(formData.monthlyRevenue)
            : undefined,
          timeInBusiness: formData.timeInBusiness
            ? parseInt(formData.timeInBusiness)
            : undefined,
          ownerOwnership: formData.ownerOwnership
            ? parseFloat(formData.ownerOwnership)
            : undefined,
          ownerFicoScore: formData.ownerFicoScore
            ? parseInt(formData.ownerFicoScore)
            : undefined,
        }),
      });

      if (res.ok) {
        const merchant = await res.json();
        router.push(`/merchants/${merchant.id}`);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create merchant");
      }
    } catch (error) {
      console.error("Failed to create merchant:", error);
      alert("Failed to create merchant");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title="New Merchant"
        subtitle="Add a new merchant to the system"
        action={
          <Link href="/merchants">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Merchants
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 overflow-auto">
        <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Legal Business Name *"
                name="legalName"
                value={formData.legalName}
                onChange={handleChange}
                required
              />
              <Input
                label="DBA Name"
                name="dbaName"
                value={formData.dbaName}
                onChange={handleChange}
              />
              <Input
                label="EIN"
                name="ein"
                placeholder="XX-XXXXXXX"
                value={formData.ein}
                onChange={handleChange}
              />
              <Select
                label="Business Type *"
                name="businessType"
                options={[
                  { value: "SOLE_PROPRIETORSHIP", label: "Sole Proprietorship" },
                  { value: "LLC", label: "LLC" },
                  { value: "CORPORATION", label: "Corporation" },
                  { value: "PARTNERSHIP", label: "Partnership" },
                  { value: "NONPROFIT", label: "Nonprofit" },
                  { value: "OTHER", label: "Other" },
                ]}
                value={formData.businessType}
                onChange={handleChange}
              />
              <Input
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
              <Input
                label="Website"
                name="website"
                type="url"
                placeholder="https://"
                value={formData.website}
                onChange={handleChange}
              />
              <Input
                label="Industry Code (SIC/NAICS)"
                name="industryCode"
                value={formData.industryCode}
                onChange={handleChange}
              />
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle>Business Address</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Street Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <Input
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="State"
                  name="state"
                  options={US_STATES}
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Select state"
                />
                <Input
                  label="ZIP Code"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Monthly Revenue"
                name="monthlyRevenue"
                type="number"
                min="0"
                step="100"
                placeholder="50000"
                value={formData.monthlyRevenue}
                onChange={handleChange}
              />
              <Input
                label="Time in Business (months)"
                name="timeInBusiness"
                type="number"
                min="0"
                placeholder="24"
                value={formData.timeInBusiness}
                onChange={handleChange}
              />
            </CardContent>
          </Card>

          {/* Primary Owner */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Primary Owner
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="ownerFirstName"
                value={formData.ownerFirstName}
                onChange={handleChange}
              />
              <Input
                label="Last Name"
                name="ownerLastName"
                value={formData.ownerLastName}
                onChange={handleChange}
              />
              <Input
                label="Email"
                name="ownerEmail"
                type="email"
                value={formData.ownerEmail}
                onChange={handleChange}
              />
              <Input
                label="Phone"
                name="ownerPhone"
                type="tel"
                value={formData.ownerPhone}
                onChange={handleChange}
              />
              <Input
                label="Ownership %"
                name="ownerOwnership"
                type="number"
                min="0"
                max="100"
                value={formData.ownerOwnership}
                onChange={handleChange}
              />
              <Input
                label="FICO Score"
                name="ownerFicoScore"
                type="number"
                min="300"
                max="850"
                value={formData.ownerFicoScore}
                onChange={handleChange}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" loading={loading}>
              Create Merchant
            </Button>
            <Link href="/merchants">
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
