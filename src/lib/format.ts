import { EmployeeData } from '../types/employee';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const calculateTotalPotongan = (emp: EmployeeData) => {
  return (
    (emp.bpd || 0) +
    (emp.zakatProfesi || 0) +
    (emp.koperasiMas || 0) +
    (emp.danaKorpri || 0) +
    (emp.kesetiakawanan || 0) +
    (emp.dwpIuranAnggota || 0) +
    (emp.dwpArisan || 0) +
    (emp.dwpTabSetda || 0) +
    (emp.dwpTabBagUmum || 0) +
    (emp.dwpKasUnsurPimpinan || 0) +
    (emp.dwpGnota || 0) +
    (emp.tabLebaran || 0) +
    (emp.gnota || 0) +
    (emp.pmi || 0)
  );
};

export const calculateSisaGaji = (emp: EmployeeData) => {
  const totalPotongan = calculateTotalPotongan(emp);
  return (emp.gaji || 0) - totalPotongan;
};
