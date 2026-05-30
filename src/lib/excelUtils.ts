import * as XLSX from 'xlsx';
import { EmployeeData } from '../types/employee';

export const exportTemplate = () => {
  const ws = XLSX.utils.json_to_sheet([
    {
      NOMOR: '1',
      NAMA: 'Fulan',
      NO_WA: '081234567890',
      GAJI: 3000000,
      BPD: 0,
      BPD_KE_DR: 'BPD JATENG',
      ZAKAT_PROFESI: 50000,
      KOPERASI_MAS: 0,
      KOPERASI_KE_DR: '',
      DANA_KORPRI: 20000,
      KESETIAKAWANAN: 10000,
      DWP_IURAN_ANGGOTA: 10000,
      DWP_ARISAN: 20000,
      DWP_TAB_SETDA: 25000,
      DWP_TAB_BAG_UMUM: 25000,
      DWP_KAS_UNSUR_PIMPINAN: 0,
      DWP_GNOTA: 0,
      TAB_LEBARAN: 0,
      GNOTA: 0,
      PMI: 0
    }
  ]);

  // Adjust column widths automatically
  const cols = [
    { wch: 10 }, { wch: 30 }, { wch: 15 }, { wch: 15 },
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 },
    { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 25 },
    { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 10 }
  ];
  ws['!cols'] = cols;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template_Gaji');
  XLSX.writeFile(wb, 'Template_Slip_Gaji.xlsx');
};

export const parseExcel = (file: File): Promise<EmployeeData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        const employees: EmployeeData[] = json.map((row: any, index) => {
          return {
            id: (index + 1).toString(),
            nomor: row['NOMOR']?.toString() || '',
            nama: row['NAMA'] || '',
            noWa: row['NO_WA']?.toString() || row['HO_HP']?.toString() || '',
            gaji: Number(row['GAJI']) || Number(row['GAJI_POKOK']) || 0,
            
            bpd: Number(row['BPD']) || Number(row['POTONGAN BPD']) || 0,
            bpdKeDr: row['BPD_KE_DR']?.toString() || row['BPD KE/DR']?.toString() || '',
            zakatProfesi: Number(row['ZAKAT_PROFESI']) || Number(row['ZAKAT PROFESI']) || 0,
            
            koperasiMas: Number(row['KOPERASI_MAS']) || Number(row['KOPERASI MAS']) || 0,
            koperasiKeDr: row['KOPERASI_KE_DR']?.toString() || row['KOPERASI KE/DR']?.toString() || '',
            
            danaKorpri: Number(row['DANA_KORPRI']) || Number(row['DANA KORPRI']) || 0,
            kesetiakawanan: Number(row['KESETIAKAWANAN']) || 0,
            dwpIuranAnggota: Number(row['DWP_IURAN_ANGGOTA']) || Number(row['DWP IURAN ANGGOTA']) || 0,
            dwpArisan: Number(row['DWP_ARISAN']) || Number(row['DWP ARISAN']) || 0,
            dwpTabSetda: Number(row['DWP_TAB_SETDA']) || Number(row['DWP TAB SETDA']) || 0,
            dwpTabBagUmum: Number(row['DWP_TAB_BAG_UMUM']) || Number(row['DWP TAB BAG UMUM']) || 0,
            dwpKasUnsurPimpinan: Number(row['DWP_KAS_UNSUR_PIMPINAN']) || Number(row['DWP KAS UNSUR PIMPINAN']) || 0,
            dwpGnota: Number(row['DWP_GNOTA']) || Number(row['DWP GNOTA']) || 0,
            tabLebaran: Number(row['TAB_LEBARAN']) || Number(row['TAB LEBARAN']) || 0,
            gnota: Number(row['GNOTA']) || 0,
            pmi: Number(row['PMI']) || 0,
          };
        });
        resolve(employees);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};
