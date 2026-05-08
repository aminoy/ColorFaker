import { motion } from "framer-motion";
import { Apple, CreditCard, Minus, Plus, Trash2 } from "lucide-react";
import { Header } from "../components/Header";
import { useApp } from "../context/AppContext";
import type { FulfilmentMode, PaymentMode } from "../types";

const fulfilmentOptions: { id: FulfilmentMode; label: string; sub: string }[] = [
  { id: "pickup", label: "Pickup", sub: "Ready in 12 min" },
  { id: "delivery", label: "Delivery", sub: "To your room" },
  { id: "table", label: "Table", sub: "Bring to table" },
];

const fulfilmentOptionsAr: typeof fulfilmentOptions = [
  { id: "pickup", label: "استلام", sub: "جاهز خلال 12 د" },
  { id: "delivery", label: "توصيل", sub: "إلى غرفتك" },
  { id: "table", label: "طاولة", sub: "تقديم للطاولة" },
];

export const CartScreen = () => {
  const {
    cart,
    updateQty,
    removeItem,
    cartTotal,
    cartCount,
    fulfilment,
    setFulfilment,
    payment,
    setPayment,
    placeOrder,
    language,
    navigate,
  } = useApp();

  const fees = cartCount > 0 ? 8 : 0;
  const vat = Math.round(cartTotal * 0.15);
  const total = cartTotal + fees + vat;
  const opts = language === "ar" ? fulfilmentOptionsAr : fulfilmentOptions;

  return (
    <div className="flex flex-col gap-4 pb-32">
      <Header
        variant="page"
        title={language === "ar" ? "السلة" : "Your Cart"}
        subtitle={
          cartCount > 0
            ? language === "ar"
              ? `${cartCount} عناصر`
              : `${cartCount} items`
            : language === "ar"
              ? "لا توجد عناصر بعد"
              : "Nothing here yet"
        }
        backTo="restaurant"
      />

      {cart.length === 0 ? (
        <div className="mx-5 rounded-2xl bg-white p-6 text-center shadow-soft">
          <p className="text-sm text-midnight-500">
            {language === "ar"
              ? "أضف وجبتك المفضلة لتظهر هنا."
              : "Add a dish and it will appear here."}
          </p>
          <button
            type="button"
            onClick={() => navigate("food")}
            className="mt-4 rounded-xl bg-emerald-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow"
          >
            {language === "ar" ? "تصفّح المطاعم" : "Browse food"}
          </button>
        </div>
      ) : (
        <>
          <section className="flex flex-col gap-3 px-5">
            {cart.map((c) => (
              <div
                key={c.itemId}
                className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-soft"
              >
                <div
                  className="grid h-14 w-14 place-items-center rounded-xl text-2xl text-white"
                  style={{
                    background: `linear-gradient(135deg, ${c.gradient[0]} 0%, ${c.gradient[1]} 100%)`,
                  }}
                >
                  {c.emoji}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink">{c.name}</p>
                  <p className="text-xs text-midnight-500">
                    {c.priceSar} SAR
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-cloud p-1">
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() =>
                      c.quantity === 1
                        ? removeItem(c.itemId)
                        : updateQty(c.itemId, -1)
                    }
                    className="grid h-7 w-7 place-items-center rounded-lg bg-white text-midnight-700 shadow-soft"
                    aria-label="decrease"
                  >
                    {c.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                  </motion.button>
                  <span className="min-w-[18px] text-center text-sm font-semibold">
                    {c.quantity}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => updateQty(c.itemId, 1)}
                    className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-gradient text-white shadow-glow"
                    aria-label="increase"
                  >
                    <Plus size={14} />
                  </motion.button>
                </div>
              </div>
            ))}
          </section>

          <section className="px-5">
            <h3 className="mb-2 text-sm font-semibold text-ink">
              {language === "ar" ? "طريقة الاستلام" : "Fulfilment"}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {opts.map((o) => {
                const active = o.id === fulfilment;
                return (
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    key={o.id}
                    type="button"
                    onClick={() => setFulfilment(o.id)}
                    className={`flex flex-col items-start gap-0.5 rounded-2xl p-3 text-start transition ${
                      active
                        ? "bg-midnight-700 text-white shadow-card"
                        : "bg-white text-midnight-700 shadow-soft"
                    }`}
                  >
                    <span className="text-sm font-semibold">{o.label}</span>
                    <span
                      className={`text-[10px] ${
                        active ? "text-white/75" : "text-midnight-500"
                      }`}
                    >
                      {o.sub}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </section>

          <section className="px-5">
            <h3 className="mb-2 text-sm font-semibold text-ink">
              {language === "ar" ? "طريقة الدفع" : "Payment"}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <PaymentOption
                id="card"
                label={language === "ar" ? "بطاقة" : "Card · •• 4421"}
                Icon={CreditCard}
                active={payment === "card"}
                onClick={() => setPayment("card")}
              />
              <PaymentOption
                id="applepay"
                label="Apple Pay"
                Icon={Apple}
                active={payment === "applepay"}
                onClick={() => setPayment("applepay")}
              />
            </div>
          </section>

          <section className="mx-5 rounded-2xl bg-white p-4 shadow-soft">
            <SummaryRow label={language === "ar" ? "المجموع" : "Subtotal"} value={`${cartTotal} SAR`} />
            <SummaryRow label={language === "ar" ? "رسوم الخدمة" : "Service fee"} value={`${fees} SAR`} />
            <SummaryRow label={language === "ar" ? "الضريبة" : "VAT (15%)"} value={`${vat} SAR`} />
            <div className="mt-2 border-t border-cloud pt-2">
              <SummaryRow
                label={language === "ar" ? "الإجمالي" : "Total"}
                value={`${total} SAR`}
                bold
              />
            </div>
          </section>

          <div className="absolute bottom-24 left-0 right-0 z-20 px-5">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={placeOrder}
              type="button"
              className="flex w-full items-center justify-between rounded-2xl bg-emerald-gradient px-5 py-4 text-white shadow-glow"
            >
              <span className="text-sm font-semibold">
                {language === "ar" ? "تأكيد الطلب" : "Place Order"}
              </span>
              <span className="text-sm font-semibold">
                {total} <span className="text-[11px] opacity-80">SAR</span>
              </span>
            </motion.button>
          </div>
        </>
      )}
    </div>
  );
};

const PaymentOption = ({
  label,
  Icon,
  active,
  onClick,
}: {
  id: PaymentMode;
  label: string;
  Icon: typeof CreditCard;
  active: boolean;
  onClick: () => void;
}) => (
  <motion.button
    whileTap={{ scale: 0.96 }}
    type="button"
    onClick={onClick}
    className={`flex items-center gap-2 rounded-2xl p-3 text-start transition ${
      active
        ? "bg-midnight-700 text-white shadow-card"
        : "bg-white text-midnight-700 shadow-soft"
    }`}
  >
    <span
      className={`grid h-9 w-9 place-items-center rounded-xl ${
        active ? "bg-white/20" : "bg-cloud"
      }`}
    >
      <Icon size={16} />
    </span>
    <span className="text-sm font-semibold">{label}</span>
  </motion.button>
);

const SummaryRow = ({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) => (
  <div className="flex items-center justify-between py-1 text-sm">
    <span className={bold ? "font-semibold text-ink" : "text-midnight-500"}>
      {label}
    </span>
    <span
      className={
        bold ? "text-base font-semibold text-ink" : "font-medium text-ink"
      }
    >
      {value}
    </span>
  </div>
);
