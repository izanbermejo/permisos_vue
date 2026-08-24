//<ButtonShortcut style="margin-left: 5px;" icon="fa-solid fa-download" :literal="$t('EXEMPLE.TITOL')" @click="exportarTaula(X)" />
/* 
const exportarTaula = (X) =>{
        const configuracioExcel = {
          dades: X.value,
          columnes: [
          { titol: t('EXEMPLE.NOMCOLUMNA'), valor: X => X.EXEMPLE, width: X }]
        };

        ExcelExporter.export({
          filename:  nomFitxer + '.xlsx',
          configuracioExcel
        });
      };
*/

import * as XLSX from 'xlsx';

export const ExcelExporter = {
  export({ filename, configuracioExcel, sheetName = 'Sheet1' }) {
    let columnes = [];
    let dades = [];
    
    if (Array.isArray(configuracioExcel)) {
      columnes = configuracioExcel;
    } else if (configuracioExcel && Array.isArray(configuracioExcel.columnes)) {
      columnes = configuracioExcel.columnes;
      dades = configuracioExcel.dades ?? [];
    } else {
      return;
    }

    const headers = columnes.map(col => ({
        v: col.titol,
        s: { font: { bold: true } }
    }));

    const aoa = [
        headers, ...dades.map(linia => columnes.map(col => {
            const value = col.valor(linia);

            if (col.format === 'numeric' && typeof value === 'number') {
                const decimals = col.decimals ?? 2;
                const format = '#,##0' + (decimals > 0 ? '.' + '0'.repeat(decimals) : '');
                return { v: value, t: 'n', z: format };
            }

            if (col.format === 'date' && value) {
                return { v: new Date(value), t: 'd' };
            }

            return value ?? '';
        }))
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    worksheet['!cols'] = columnes.map(col => ({ wch: col.width ?? 1 }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
  }
};
