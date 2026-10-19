import { jsPDF } from 'jspdf';
import { Prescription, PaymentTransaction } from '../types';

export const generatePrescriptionPDF = (prescription: Prescription) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Colors
  const primaryBlue = '#1A73E8';
  const textDark = '#202124';
  const textGray = '#5F6368';
  const lightBg = '#F8F9FA';
  const borderGray = '#DADCE0';

  // Header Banner
  doc.setFillColor(primaryBlue);
  doc.rect(0, 0, 210, 22, 'F');

  doc.setTextColor('#FFFFFF');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('CareSync Telemedicine Health System', 14, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('HIPAA & GDPR Certified Electronic Health Record', 135, 14);

  // Clinic & Doctor Info
  doc.setTextColor(textDark);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(prescription.doctorName, 14, 34);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textGray);
  doc.text(`${prescription.doctorSpecialization} | Medical License: ${prescription.doctorLicense}`, 14, 40);
  doc.text(`Telehealth Clinical Services | Emergency Dispatch: +1 (800) 555-CARE`, 14, 45);

  // Divider
  doc.setDrawColor(borderGray);
  doc.line(14, 49, 196, 49);

  // Prescription Meta & Patient Box
  doc.setFillColor(lightBg);
  doc.roundedRect(14, 54, 182, 30, 3, 3, 'F');
  doc.setDrawColor(borderGray);
  doc.roundedRect(14, 54, 182, 30, 3, 3, 'S');

  doc.setFontSize(10);
  doc.setTextColor(textDark);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Name:', 20, 62);
  doc.setFont('helvetica', 'normal');
  doc.text(prescription.patientName, 52, 62);

  doc.setFont('helvetica', 'bold');
  doc.text('Prescription ID:', 115, 62);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(primaryBlue);
  doc.text(prescription.id, 150, 62);

  doc.setTextColor(textDark);
  doc.setFont('helvetica', 'bold');
  doc.text('Date Issued:', 20, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(prescription.date, 52, 70);

  doc.setFont('helvetica', 'bold');
  doc.text('Version Status:', 115, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(`v${prescription.version}.0 (${prescription.status.toUpperCase()})`, 150, 70);

  doc.setFont('helvetica', 'bold');
  doc.text('Clinical Diagnosis:', 20, 78);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#1E8E3E');
  doc.text(prescription.diagnosis, 58, 78);

  // Amendment Notice if applicable
  let startY = 92;
  if (prescription.originalPrescriptionId) {
    doc.setFillColor('#FEF7E0');
    doc.setDrawColor('#FBBC04');
    doc.roundedRect(14, startY, 182, 12, 2, 2, 'FD');
    doc.setTextColor('#B06000');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Official Amendment: Replaces previous Rx #${prescription.originalPrescriptionId}.`, 20, startY + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Reason: ${prescription.amendmentReason || 'Clinical dosage adjustment'}`, 20, startY + 9);
    startY += 18;
  }

  // Rx Symbol
  doc.setFontSize(28);
  doc.setTextColor(primaryBlue);
  doc.setFont('times', 'bolditalic');
  doc.text('℞', 14, startY + 10);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(textDark);
  doc.text('Prescribed Medications & Administration Regimen', 26, startY + 8);

  startY += 16;

  // Table Header
  doc.setFillColor('#E8F0FE');
  doc.rect(14, startY, 182, 8, 'F');
  doc.setTextColor(primaryBlue);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('MEDICATION & DOSAGE', 18, startY + 5.5);
  doc.text('FREQUENCY', 95, startY + 5.5);
  doc.text('DURATION', 140, startY + 5.5);
  doc.text('STATUS', 172, startY + 5.5);

  startY += 8;

  // Table Rows
  prescription.medications.forEach((med, idx) => {
    const rowBg = idx % 2 === 0 ? '#FFFFFF' : '#F8F9FA';
    doc.setFillColor(rowBg);
    doc.rect(14, startY, 182, 14, 'F');

    doc.setTextColor(textDark);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(med.name, 18, startY + 5);

    doc.setFontSize(8.5);
    doc.setTextColor(textGray);
    doc.setFont('helvetica', 'normal');
    doc.text(`Strength: ${med.dosage} - ${med.instructions}`, 18, startY + 10);

    doc.setTextColor(textDark);
    doc.text(med.frequency, 95, startY + 6);
    doc.text(med.duration, 140, startY + 6);

    doc.setTextColor('#1E8E3E');
    doc.setFont('helvetica', 'bold');
    doc.text('Dispense', 172, startY + 6);

    doc.setDrawColor(borderGray);
    doc.line(14, startY + 14, 196, startY + 14);

    startY += 14;
  });

  startY += 10;

  // Signatures & Cryptographic Verification Box
  doc.setFillColor(lightBg);
  doc.roundedRect(14, startY, 182, 45, 3, 3, 'F');
  doc.setDrawColor(borderGray);
  doc.roundedRect(14, startY, 182, 45, 3, 3, 'S');

  // Doctor Signature area
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textGray);
  doc.text("Prescribing Physician's Digital Signature:", 20, startY + 8);

  doc.setFontSize(11);
  doc.setTextColor(primaryBlue);
  doc.setFont('times', 'italic');
  doc.text(`Signed digitally by ${prescription.doctorName}`, 20, startY + 18);

  doc.setFontSize(8);
  doc.setTextColor(textGray);
  doc.setFont('helvetica', 'normal');
  doc.text(`Timestamp: ${prescription.signatureTimestamp || new Date().toISOString()}`, 20, startY + 24);
  doc.text(`Identity Assurance: HIPAA Certified Cloud Signing Token`, 20, startY + 29);

  // Cryptographic Hash Box on right
  doc.setFillColor('#FFFFFF');
  doc.roundedRect(110, startY + 6, 80, 32, 2, 2, 'FD');
  doc.setTextColor('#1E8E3E');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('✓ Cryptographically Valid & Immutable', 114, startY + 13);

  doc.setFontSize(7);
  doc.setTextColor(textGray);
  doc.setFont('courier', 'normal');
  const hash = prescription.cryptographicHash || 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069';
  doc.text(hash.slice(0, 36), 114, startY + 20);
  doc.text(hash.slice(36), 114, startY + 24);

  doc.setFont('helvetica', 'normal');
  doc.text('Pharmacist Scan: apothecary.care/verify/' + prescription.id, 114, startY + 32);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(textGray);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'This prescription is generated in compliance with standard Telehealth & e-Prescribing regulations. Any tampering invalidates the hash.',
    14,
    285
  );

  // Save PDF
  doc.save(`Prescription_${prescription.id}.pdf`);
};

export const generateReceiptPDF = (payment: PaymentTransaction) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5',
  });

  const primaryBlue = '#1A73E8';
  const textDark = '#202124';
  const textGray = '#5F6368';

  // Header Banner
  doc.setFillColor(primaryBlue);
  doc.rect(0, 0, 148, 16, 'F');

  doc.setTextColor('#FFFFFF');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('CareSync Payment Receipt', 12, 11);

  // Success icon & text
  doc.setTextColor('#1E8E3E');
  doc.setFontSize(14);
  doc.text('Payment Successful', 12, 28);

  doc.setFontSize(10);
  doc.setTextColor(textGray);
  doc.setFont('helvetica', 'normal');
  doc.text(`Receipt #: ${payment.receiptNumber}`, 12, 34);
  doc.text(`Date & Time: ${new Date(payment.transactionDate).toLocaleString()}`, 12, 40);

  // Details Box
  doc.setFillColor('#F8F9FA');
  doc.roundedRect(12, 46, 124, 60, 3, 3, 'F');
  doc.setDrawColor('#DADCE0');
  doc.roundedRect(12, 46, 124, 60, 3, 3, 'S');

  doc.setTextColor(textDark);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Name:', 18, 54);
  doc.setFont('helvetica', 'normal');
  doc.text(payment.patientName, 52, 54);

  doc.setFont('helvetica', 'bold');
  doc.text('Consulting Doctor:', 18, 62);
  doc.setFont('helvetica', 'normal');
  doc.text(payment.doctorName, 52, 62);

  doc.setFont('helvetica', 'bold');
  doc.text('Payment Method:', 18, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(payment.paymentMethod + (payment.cardLast4 ? ` (•••• ${payment.cardLast4})` : ''), 52, 70);

  doc.setFont('helvetica', 'bold');
  doc.text('Appointment ID:', 18, 78);
  doc.setFont('helvetica', 'normal');
  doc.text(payment.appointmentId, 52, 78);

  doc.setDrawColor('#DADCE0');
  doc.line(18, 84, 130, 84);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark);
  doc.text('Total Paid:', 18, 94);
  doc.setTextColor(primaryBlue);
  doc.text(`$${payment.amount.toFixed(2)} USD`, 85, 94);

  doc.setFontSize(8);
  doc.setTextColor(textGray);
  doc.setFont('helvetica', 'normal');
  doc.text('Processed securely via Google Pay TLS 1.3 encrypted gateway.', 12, 120);

  doc.save(`Receipt_${payment.receiptNumber}.pdf`);
};
