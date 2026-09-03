import React from 'react';
import { SchoolLogo } from './SchoolLogo';
import { FeeTransaction, Student } from '../types';
import { useSiteContent } from '../context/SiteContentContext';
import { X, Printer, CheckCircle, ShieldCheck } from 'lucide-react';

interface PrintReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: FeeTransaction | null;
  student?: Student | null;
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
  student,
}) => {
  const { siteContent } = useSiteContent();
  const schoolPhone = siteContent?.school?.phone || '+91 9415754349';
  const schoolEmail = siteContent?.school?.email || 'sapublicschool21@gmail.com';

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptNo = transaction?.receiptNo || `REC-2025-${student?.rollNo || '01'}`;
  const studentName = transaction?.studentName || student?.name || 'Aarav Kumar Mishra';
  const studentId = transaction?.studentId || student?.studentId || 'SAPS-2025-1001';
  const studentClass = transaction?.class || student?.class || '10';
  const section = transaction?.section || student?.section || 'A';
  const rollNo = transaction?.rollNo || student?.rollNo || '01';
  const amountPaid = transaction?.amount || student?.feesPaid || 18000;
  const paymentDate = transaction?.paymentDate || student?.lastPaymentDate || new Date().toISOString().split('T')[0];
  const paymentMode = transaction?.paymentMode || 'UPI';
  const totalFees = student ? student.feesTotal : 18000;
  const remainingDue = student ? student.feesDue : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Top Bar */}
        <div className="bg-slate-800 text-white px-5 py-3 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">Official Fee Receipt</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
              Verified
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-[#F5B301] hover:bg-amber-400 text-[#0B1F4D] font-bold text-xs px-3 py-1.5 rounded-lg transition shadow"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </button>
            <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-6 md:p-8 overflow-y-auto bg-[#FFFDF9] text-slate-900 font-sans" id="printable-receipt-area">
          {/* Header */}
          <div className="border-b-2 border-[#0B1F4D] pb-4 mb-4 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <SchoolLogo size={70} />
              <div>
                <h1 className="font-serif font-black text-xl md:text-2xl text-[#0B1F4D] leading-tight">
                  SWAMI ADGADANAND PUBLIC SCHOOL
                </h1>
                <p className="text-xs font-bold text-amber-800 tracking-wide">
                  AFFILIATED TO U.P. BOARD, PRAYAGRAJ (AFFILIATION NO. UP-70412)
                </p>
                <p className="text-[11px] text-slate-600">
                  Campus: Main Road, Phulpur / Varanasi (U.P.) • Phone: {schoolPhone} • Email: {schoolEmail}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-block bg-[#0B1F4D] text-white text-[10px] font-bold px-2 py-1 rounded">
                STUDENT COPY
              </span>
            </div>
          </div>

          {/* Receipt Info Title */}
          <div className="flex items-center justify-between bg-slate-100 px-3 py-2 rounded-lg mb-4 text-xs font-semibold">
            <div>
              <span className="text-slate-500">Receipt No: </span>
              <span className="font-mono text-[#0B1F4D] font-bold">{receiptNo}</span>
            </div>
            <div>
              <span className="text-slate-500">Date: </span>
              <span className="text-slate-900 font-bold">{paymentDate}</span>
            </div>
            <div>
              <span className="text-slate-500">Academic Session: </span>
              <span className="text-[#0B1F4D] font-bold">2025-2026</span>
            </div>
          </div>

          {/* Student Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 text-xs mb-5">
            <div>
              <span className="text-slate-400 block text-[10px]">Student Name</span>
              <span className="font-bold text-slate-900">{studentName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Student ID / Roll No</span>
              <span className="font-bold text-slate-900">{studentId} (Roll {rollNo})</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Class & Section</span>
              <span className="font-bold text-[#0B1F4D]">Class {studentClass} - Sec {section}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Payment Mode</span>
              <span className="font-bold text-emerald-700">{paymentMode}</span>
            </div>
          </div>

          {/* Fee Breakdown Table */}
          <table className="w-full text-xs border border-slate-300 rounded-lg overflow-hidden mb-5">
            <thead className="bg-[#0B1F4D] text-white">
              <tr>
                <th className="py-2 px-3 text-left">S.No.</th>
                <th className="py-2 px-3 text-left">Fee Particulars</th>
                <th className="py-2 px-3 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="bg-white">
                <td className="py-2 px-3 text-slate-500">1</td>
                <td className="py-2 px-3 font-medium">Composite Tuition & Academic Facility Fee</td>
                <td className="py-2 px-3 text-right font-mono">₹ {(amountPaid * 0.7).toLocaleString('en-IN')}</td>
              </tr>
              <tr className="bg-slate-50">
                <td className="py-2 px-3 text-slate-500">2</td>
                <td className="py-2 px-3 font-medium">Annual Examination & Computer Lab Facility Charge</td>
                <td className="py-2 px-3 text-right font-mono">₹ {(amountPaid * 0.15).toLocaleString('en-IN')}</td>
              </tr>
              <tr className="bg-white">
                <td className="py-2 px-3 text-slate-500">3</td>
                <td className="py-2 px-3 font-medium">School Van / Transport & Activity Contribution</td>
                <td className="py-2 px-3 text-right font-mono">₹ {(amountPaid * 0.15).toLocaleString('en-IN')}</td>
              </tr>
              <tr className="bg-amber-50 font-bold">
                <td className="py-2.5 px-3" colSpan={2}>
                  TOTAL AMOUNT RECEIVED IN WORDS: <span className="font-semibold italic text-slate-800 text-[11px]">Rupees {amountPaid.toLocaleString('en-IN')} Only</span>
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-base text-[#0B1F4D]">
                  ₹ {amountPaid.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Account Summary Status */}
          <div className="grid grid-cols-3 gap-3 text-xs mb-6 bg-slate-100 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 text-[10px] block">Total Annual Fees:</span>
              <span className="font-bold">₹ {totalFees.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Total Paid So Far:</span>
              <span className="font-bold text-emerald-700">₹ {(student ? student.feesPaid : amountPaid).toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Current Outstanding Due:</span>
              <span className={`font-bold ${remainingDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                ₹ {remainingDue.toLocaleString('en-IN')} {remainingDue === 0 ? '(NIL)' : ''}
              </span>
            </div>
          </div>

          {/* Footer with Seal and Signature */}
          <div className="pt-4 flex items-end justify-between border-t border-slate-300 text-xs">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500">
                * Computer generated valid fee receipt issued by SAPS ERP System.
              </p>
              <div className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Authorized Accounts Transaction (SAPS/2025)</span>
              </div>
            </div>

            <div className="text-center">
              <div className="w-32 h-10 border-b border-slate-400 mb-1 flex items-center justify-center italic text-slate-400 font-serif text-[11px]">
                Accounts Dept.
              </div>
              <p className="font-bold text-slate-800 text-[11px]">Authorized Signatory</p>
              <p className="text-[10px] text-slate-500">Swami Adgadanand Public School</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
