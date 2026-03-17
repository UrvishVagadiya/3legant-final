"use client";
import React, { useState, useEffect } from "react";
import CheckoutStepper from "@/components/sections/CheckoutStepper";
import ContactInfo from "@/components/checkout/ContactInfo";
import ShippingSection from "@/components/checkout/ShippingSection";
import BillingSection from "@/components/checkout/BillingSection";
import PaymentSection from "@/components/checkout/PaymentSection";
import OrderSummary from "@/components/checkout/OrderSummary";
import { SavedAddress } from "@/components/checkout/SavedAddressSelector";
import { useCartStore } from "@/store/cartStore";
import { useIsMounted } from "@/hooks/useIsMounted";
import { getShippingCost } from "@/utils/getShippingCost";
import { useCheckout, validateCheckoutForm } from "@/hooks/useCheckout";
import { createClient } from "@/utils/supabase/client";
import { F, billingKeys, initialForm, applyAddr } from "@/utils/checkoutForm";

export default function Checkout() {
  const { items: cartItems, updateQuantity, shippingMethod } = useCartStore();
  const isMounted = useIsMounted();
  const [useDifferentBilling, setUseDifferentBilling] = useState(false);
  const [savedShipping, setSavedShipping] = useState<SavedAddress[]>([]);
  const [savedBilling, setSavedBilling] = useState<SavedAddress[]>([]);
  const [selShippingId, setSelShippingId] = useState("new");
  const [selBillingId, setSelBillingId] = useState("new");
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = cartItems.reduce(
    (a, i) => a + Number(i.price) * i.quantity,
    0,
  );
  const shippingCost = getShippingCost(shippingMethod);
  const checkout = useCheckout(cartItems, subtotal, shippingCost);
  const discount = checkout.couponDiscount;
  const total = subtotal + shippingCost - discount;

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) return;
      setFormData((p) => ({ ...p, email: u.user.email || p.email }));
      const { data } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", u.user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });
      if (!data?.length) return;
      const ship = data.filter((a: SavedAddress) => a.type === "shipping");
      const bill = data.filter((a: SavedAddress) => a.type === "billing");
      setSavedShipping(ship);
      setSavedBilling(bill);
      const ds = ship.find((a: SavedAddress) => a.is_default) || ship[0];
      if (ds) {
        setSelShippingId(ds.id);
        setFormData((p) => ({ ...p, ...applyAddr(ds, false) }));
      }
      const db = bill.find((a: SavedAddress) => a.is_default) || bill[0];
      if (db) {
        setSelBillingId(db.id);
        setFormData((p) => ({ ...p, ...applyAddr(db, true) }));
      }
    })();
  }, []);

  const handleSelect = (id: string, type: "shipping" | "billing") => {
    const b = type === "billing";
    (b ? setSelBillingId : setSelShippingId)(id);
    if (id === "new") {
      setFormData((p) => {
        const u = { ...p };
        (b ? billingKeys : [...F]).forEach((k) => (u[k] = ""));
        return u;
      });
    } else {
      const a = (b ? savedBilling : savedShipping).find((x) => x.id === id);
      if (a) setFormData((p) => ({ ...p, ...applyAddr(a, b) }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name])
      setErrors((p) => {
        const n = { ...p };
        delete n[name];
        return n;
      });
  };

  const handlePlaceOrder = async () => {
    const newErrors = validateCheckoutForm(formData, useDifferentBilling);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      document
        .querySelector(".border-red-500")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    await checkout.placeOrder(formData, useDifferentBilling, shippingMethod);
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-300 mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20 font-poppins text-[#141718]">
      <div className="flex flex-col items-center justify-center mb-8">
        <h1 className="text-4xl md:text-[54px] font-medium mb-4">Check Out</h1>
        <CheckoutStepper step={2} />
      </div>
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 w-full">
        <div className="w-full lg:w-[65%] space-y-8">
          <ContactInfo
            formData={formData}
            errors={errors}
            onChange={handleInputChange}
          />
          <ShippingSection
            savedAddresses={savedShipping}
            selectedId={selShippingId}
            onSelect={(id) => handleSelect(id, "shipping")}
            formData={formData}
            errors={errors}
            onChange={handleInputChange}
            useDifferentBilling={useDifferentBilling}
            onBillingToggle={setUseDifferentBilling}
          />
          {useDifferentBilling && (
            <BillingSection
              savedAddresses={savedBilling}
              selectedId={selBillingId}
              onSelect={(id) => handleSelect(id, "billing")}
              formData={formData}
              errors={errors}
              onChange={handleInputChange}
            />
          )}
          <PaymentSection
            placing={checkout.placing}
            onPlaceOrder={handlePlaceOrder}
          />
        </div>
        <div className="w-full lg:w-[35%]">
          <OrderSummary
            cartItems={cartItems}
            updateQuantity={updateQuantity}
            subtotal={subtotal}
            shippingCost={shippingCost}
            shippingMethod={shippingMethod}
            discount={discount}
            total={total}
            couponCode={checkout.couponCode}
            setCouponCode={checkout.setCouponCode}
            onApplyCoupon={checkout.handleApplyCoupon}
            couponLoading={checkout.couponLoading}
            appliedCoupon={checkout.appliedCoupon}
            onRemoveCoupon={checkout.removeCoupon}
            placing={checkout.placing}
            onPlaceOrder={handlePlaceOrder}
          />
        </div>
      </div>
    </div>
  );
}
