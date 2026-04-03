import TopBar from "./components/TopBar";
import AddressSection from "./components/Address";
import ShippingSection from "./components/Shipping";
import PaymentMethodsSection from "./components/PaymentMethods";
import PaymentDetailsSection from "./components/PaymentDetails";
import BottomBar from "./components/BottomBar";
import OrderItems from "./components/OrderItems";

const Checkout = () => {
  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="custom-container max-w-7xl mx-auto pt-6 space-y-6">
        <TopBar />
        <AddressSection />
        <OrderItems />
        <ShippingSection />
        <PaymentMethodsSection />
        <PaymentDetailsSection />
      </div>
      <BottomBar />
    </div>
  );
};

export default Checkout;
