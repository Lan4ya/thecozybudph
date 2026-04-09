import TopBar from "./components/TopBar";
import AddressSection from "./components/AddressSection";
import ShippingSection from "./components/ShippingSection";
import PaymentMethodsSection from "./components/PaymentMethodsSection";
import PaymentDetailsSection from "./components/PaymentDetailsSection";
import BottomBar from "./components/BottomBar";
import OrderSummary from "./components/OrderSummary";

const Checkout = () => {
  return (
    // <div className="min-h-screen pb-28">
    <div className="pb-28">
      <div className="custom-container max-w-7xl mx-auto pt-6 space-y-6">
        <TopBar />
        <AddressSection />
        <OrderSummary />
        <ShippingSection />
        <PaymentMethodsSection />
        <PaymentDetailsSection />
      </div>

      <BottomBar />
    </div>
  );
};

export default Checkout;
