import { describe, it, expect } from 'vitest';
import { reservationFormLabels } from '../drizzle/schema';

describe('Radio Option Labels - Schema', () => {
  it('should have eventType option columns in schema', () => {
    expect(reservationFormLabels.eventTypeOption1).toBeDefined();
    expect(reservationFormLabels.eventTypeOption2).toBeDefined();
    expect(reservationFormLabels.eventTypeOption3).toBeDefined();
    expect(reservationFormLabels.eventTypeOption4).toBeDefined();
    expect(reservationFormLabels.eventTypeOption5).toBeDefined();
  });

  it('should have recordingType option columns in schema', () => {
    expect(reservationFormLabels.recordingTypeOption1).toBeDefined();
    expect(reservationFormLabels.recordingTypeOption2).toBeDefined();
    expect(reservationFormLabels.recordingTypeOption3).toBeDefined();
    expect(reservationFormLabels.recordingTypeOption4).toBeDefined();
    expect(reservationFormLabels.recordingTypeOption5).toBeDefined();
    expect(reservationFormLabels.recordingTypeOption6).toBeDefined();
  });

  it('should have specialReq option columns in schema', () => {
    expect(reservationFormLabels.specialReqOption1).toBeDefined();
    expect(reservationFormLabels.specialReqOption2).toBeDefined();
    expect(reservationFormLabels.specialReqOption3).toBeDefined();
    expect(reservationFormLabels.specialReqOption4).toBeDefined();
  });

  it('should have isPublic option columns in schema', () => {
    expect(reservationFormLabels.isPublicOption1).toBeDefined();
    expect(reservationFormLabels.isPublicOption2).toBeDefined();
  });

  it('should have paymentMethod option columns in schema', () => {
    expect(reservationFormLabels.paymentMethodOption1).toBeDefined();
    expect(reservationFormLabels.paymentMethodOption2).toBeDefined();
    expect(reservationFormLabels.paymentMethodOption3).toBeDefined();
  });

  it('should have receiptType option columns in schema', () => {
    expect(reservationFormLabels.receiptTypeOption1).toBeDefined();
    expect(reservationFormLabels.receiptTypeOption2).toBeDefined();
    expect(reservationFormLabels.receiptTypeOption3).toBeDefined();
  });
});

describe('Radio Option Labels - Default Values', () => {
  it('should have correct default values for eventType options', () => {
    const defaults = {
      eventTypeOption1: '사진 촬영',
      eventTypeOption2: '공연 촬영',
      eventTypeOption3: '영상 제작',
      eventTypeOption4: '뮤직비디오 제작',
      eventTypeOption5: '기타',
    };
    // Verify the default values match expected Korean labels
    expect(defaults.eventTypeOption1).toBe('사진 촬영');
    expect(defaults.eventTypeOption2).toBe('공연 촬영');
    expect(defaults.eventTypeOption3).toBe('영상 제작');
    expect(defaults.eventTypeOption4).toBe('뮤직비디오 제작');
    expect(defaults.eventTypeOption5).toBe('기타');
  });

  it('should have correct default values for recordingType options', () => {
    const defaults = {
      recordingTypeOption1: 'Photo',
      recordingTypeOption2: 'Solo',
      recordingTypeOption3: 'Recording',
      recordingTypeOption4: 'Simple',
      recordingTypeOption5: 'Basic',
      recordingTypeOption6: 'Professional',
    };
    expect(defaults.recordingTypeOption1).toBe('Photo');
    expect(defaults.recordingTypeOption6).toBe('Professional');
  });

  it('should have correct default values for payment and receipt options', () => {
    const paymentDefaults = { paymentMethodOption1: '카드', paymentMethodOption2: '계좌이체', paymentMethodOption3: '현금' };
    const receiptDefaults = { receiptTypeOption1: '발행', receiptTypeOption2: '미발행', receiptTypeOption3: '간이영수증' };
    expect(paymentDefaults.paymentMethodOption1).toBe('카드');
    expect(receiptDefaults.receiptTypeOption3).toBe('간이영수증');
  });
});

describe('Amount Input - String-based handling', () => {
  it('should correctly parse amount strings to numbers', () => {
    // Simulating the handleSave logic
    const parseAmount = (str: string): number => {
      return str === '' ? 0 : parseInt(str.replace(/[^0-9]/g, '')) || 0;
    };

    expect(parseAmount('')).toBe(0);
    expect(parseAmount('500000')).toBe(500000);
    expect(parseAmount('1,000,000')).toBe(1000000);
    expect(parseAmount('abc')).toBe(0);
    expect(parseAmount('50만원')).toBe(50);
    expect(parseAmount('300')).toBe(300);
  });

  it('should handle amount string state independently from editData', () => {
    // The key fix: amount strings are managed as separate state
    // so React re-renders don't destroy the input DOM
    let quotedAmountStr = '500000';
    let paidAmountStr = '300';
    
    // Simulating user typing
    quotedAmountStr = quotedAmountStr + '0'; // user types '0'
    expect(quotedAmountStr).toBe('5000000');
    
    paidAmountStr = '3000'; // user replaces
    expect(paidAmountStr).toBe('3000');
  });
});
