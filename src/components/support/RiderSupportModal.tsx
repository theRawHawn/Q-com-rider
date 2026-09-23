import React, { useState } from 'react';
import { Headphones, PhoneCall, HelpCircle, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface RiderSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerSos?: () => void;
}

export const RiderSupportModal: React.FC<RiderSupportModalProps> = ({
  isOpen,
  onClose,
  onTriggerSos,
}) => {
  const [ticketCreated, setTicketCreated] = useState(false);
  const [issueType, setIssueType] = useState<string>('');

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketCreated(true);
    setTimeout(() => {
      setTicketCreated(false);
      onClose();
    }, 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Partner Support 24/7"
      subtitle="Priority dispatch assistance for active shifts & deliveries"
      maxWidth="md"
    >
      {ticketCreated ? (
        <div className="py-8 text-center space-y-2">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
          <h4 className="text-base font-extrabold text-neutral-900">Support Ticket Raised!</h4>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">
            Our partner operations desk is reviewing your ticket. An agent will call you in ~2 mins.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Quick Call Button */}
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-900">Direct Partner Helpline</p>
              <p className="text-[11px] text-emerald-700 font-medium">Toll-free priority line for active delivery</p>
            </div>
            <a
              href="tel:18001239999"
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs font-extrabold rounded-xl hover:bg-emerald-700 transition cursor-pointer shrink-0"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Call Now
            </a>
          </div>

          <form onSubmit={handleSubmitTicket} className="space-y-3">
            <label className="text-xs font-bold text-neutral-800 block">Select Common Issue:</label>
            <div className="space-y-2">
              {[
                'Store closed or items out of stock',
                'Customer unreachable at drop location',
                'Wrong delivery address on map',
                'Vehicle breakdown / accident',
                'Payout or earnings issue',
              ].map((item) => (
                <label
                  key={item}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                    issueType === item
                      ? 'bg-[#EBF7FD] text-neutral-900 border-[#009DE0] ring-1 ring-[#009DE0]/20'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200/80 hover:bg-neutral-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="issue"
                    value={item}
                    checked={issueType === item}
                    onChange={() => setIssueType(item)}
                    className="hidden"
                  />
                  <HelpCircle
                    className={`w-4 h-4 shrink-0 ${
                      issueType === item ? 'text-[#009DE0]' : 'text-neutral-400'
                    }`}
                  />
                  <span className="truncate">{item}</span>
                </label>
              ))}
            </div>

            <div className="pt-2 flex gap-2">
              {onTriggerSos && (
                <Button
                  type="button"
                  variant="danger"
                  size="md"
                  onClick={() => {
                    onClose();
                    onTriggerSos();
                  }}
                  icon={<AlertTriangle className="w-3.5 h-3.5" />}
                >
                  SOS Alert
                </Button>
              )}

              <Button
                type="submit"
                variant="brand"
                fullWidth
                disabled={!issueType}
                icon={<ShieldCheck className="w-4 h-4" />}
              >
                Raise Support Ticket
              </Button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};
