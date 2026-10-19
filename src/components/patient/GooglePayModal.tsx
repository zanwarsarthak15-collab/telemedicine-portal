import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AppointmentSlot, PaymentTransaction } from '../../types';
import { generateReceiptPDF } from '../../utils/pdfGenerator';
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Download,
  X,
  ShieldCheck,
  Lock,
} from 'lucide-react';

interface GooglePayModalProps {
  isOpen: boolean;
  slot: AppointmentSlot | null;
  onClose: () => void;
  onSuccess: (tx: PaymentTransaction) => void;
}

export const GooglePayModal: React.FC<GooglePayModalProps> = ({
  isOpen,
  slot,
  onClose,
  onSuccess,
}) => {
  const { processPayment } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<'Google Pay' | 'Card (TLS 1.3)' | 'UPI Instant'>('Google Pay');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedTx, setCompletedTx] = useState<PaymentTransaction | null>(null);

  if (!isOpen || !slot) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setErrorMessage(null);

    setTimeout(() => {
      const result = processPayment(
        slot.id,
        paymentMethod,
        { cardLast4: '4092', upiId: 'user@okaxis' },
        simulateFailure
      );

      setIsProcessing(false);

      if (result.success && result.transaction) {
        setCompletedTx(result.transaction);
        onSuccess(result.transaction);
      } else {
        setErrorMessage(result.error || 'Payment failed. Please retry.');
      }
    }, 1200);
  };

  const handleResetAndRetry = () => {
    setSimulateFailure(false);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-google-3 border border-google-border max-w-md w-full overflow-hidden transition-all relative">
        {/* Google Pay Header Bar */}
        <div className="bg-google-canvas px-6 py-4 border-b border-google-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 font-bold text-base text-google-dark">
              <span className="text-google-blue">G</span>
              <span className="text-google-red">o</span>
              <span className="text-google-yellow">o</span>
              <span className="text-google-blue">g</span>
              <span className="text-google-green">l</span>
              <span className="text-google-red">e</span>
              <span className="ml-1 text-google-gray font-medium">Pay</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-google-blue">
              UPI / Card
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-google-surface text-google-gray hover:text-google-dark"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* If Payment Succeeded */}
          {completedTx ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-google-green flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-google-dark">Payment Confirmed</h3>
                <p className="text-xs text-google-gray mt-1">
                  Receipt #: <span className="font-mono font-bold text-google-dark">{completedTx.receiptNumber}</span>
                </p>
                <div className="mt-3 text-2xl font-bold text-google-green">
                  ₹{completedTx.amount}.00
                </div>
              </div>

              <div className="p-3 bg-google-canvas rounded-2xl border border-google-border text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-google-gray">Doctor:</span>
                  <span className="font-bold text-google-dark">{slot.doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-google-gray">Time:</span>
                  <span className="font-semibold text-google-dark">{slot.date} ({slot.timeSlot})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-google-gray">Method:</span>
                  <span className="font-semibold text-google-dark">{completedTx.paymentMethod}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => generateReceiptPDF(completedTx)}
                  className="flex-1 py-2.5 bg-google-blue-light text-google-blue hover:bg-blue-100 text-xs font-bold rounded-full flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Save Receipt PDF
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-google-green hover:bg-google-green-hover text-white text-xs font-bold rounded-full shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <div className="space-y-4">
              {/* Invoice Summary */}
              <div className="bg-google-canvas p-4 rounded-2xl border border-google-border">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-xs font-bold text-google-gray uppercase tracking-wider">Doctor Visit</h4>
                    <p className="text-sm font-bold text-google-dark">{slot.doctorName}</p>
                    <p className="text-xs text-google-gray">{slot.specialization}</p>
                  </div>
                  <span className="text-xl font-bold text-google-blue">₹{slot.fee}</span>
                </div>
                <div className="pt-2 border-t border-google-border text-[11px] text-google-gray flex justify-between">
                  <span>Slot: {slot.date} at {slot.timeSlot}</span>
                  <span className="font-bold text-google-green">Confirmed Hold</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-semibold text-google-gray mb-1.5">Choose Payment Option</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Google Pay')}
                    className={`py-2 px-2.5 rounded-2xl border text-xs font-bold text-center transition-all ${
                      paymentMethod === 'Google Pay'
                        ? 'border-google-blue bg-google-blue-light text-google-blue shadow-xs'
                        : 'border-google-border bg-white text-google-gray hover:bg-google-surface'
                    }`}
                  >
                    Google Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI Instant')}
                    className={`py-2 px-2.5 rounded-2xl border text-xs font-bold text-center transition-all ${
                      paymentMethod === 'UPI Instant'
                        ? 'border-google-blue bg-google-blue-light text-google-blue shadow-xs'
                        : 'border-google-border bg-white text-google-gray hover:bg-google-surface'
                    }`}
                  >
                    UPI / GPay
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Card (TLS 1.3)')}
                    className={`py-2 px-2.5 rounded-2xl border text-xs font-bold text-center transition-all ${
                      paymentMethod === 'Card (TLS 1.3)'
                        ? 'border-google-blue bg-google-blue-light text-google-blue shadow-xs'
                        : 'border-google-border bg-white text-google-gray hover:bg-google-surface'
                    }`}
                  >
                    Card
                  </button>
                </div>
              </div>

              {/* Simulation Toggle for Exception Flow 13 */}
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-amber-900 font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-google-yellow" />
                    Test Decline & Retry (Exp Flow 13):
                  </span>
                  <input
                    type="checkbox"
                    checked={simulateFailure}
                    onChange={(e) => setSimulateFailure(e.target.checked)}
                    className="w-4 h-4 text-google-blue rounded accent-google-blue"
                  />
                </div>
              </div>

              {/* Error Message & Retry Action */}
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-google-red-light border border-google-red/40 text-google-red text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Transaction Failed</strong>
                      <span>{errorMessage}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleResetAndRetry}
                      className="px-3 py-1 bg-white border border-google-red text-google-red rounded-full font-bold hover:bg-red-50 transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Retry Payment
                    </button>
                  </div>
                </div>
              )}

              {/* Pay Button */}
              <button
                type="button"
                onClick={handlePay}
                disabled={isProcessing}
                className="w-full py-3.5 bg-google-dark hover:bg-black text-white text-sm font-bold rounded-full shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-75"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-google-blue border-t-google-red border-r-google-yellow border-b-google-green rounded-full animate-spin"></div>
                    <span>Processing Secure Payment...</span>
                  </div>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-google-green" />
                    <span>Pay ₹{slot.fee}.00</span>
                  </>
                )}
              </button>

              <div className="text-center text-[10px] text-google-gray flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-google-green" />
                <span>Protected by Google Pay / UPI Security</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
