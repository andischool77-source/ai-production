const STORAGE_PREFIX = "AI_PRODUCTION_";

function simpanPengaturan(nama, nilai) {
  localStorage.setItem(
    STORAGE_PREFIX + nama,
    JSON.stringify(nilai)
  );
}

function ambilPengaturan(nama, nilaiDefault = null) {
  const data = localStorage.getItem(
    STORAGE_PREFIX + nama
  );
  
  if (data === null) {
    return nilaiDefault;
  }
  
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}

function hapusPengaturan(nama) {
  localStorage.removeItem(
    STORAGE_PREFIX + nama
  );
}

function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(Number(angka) || 0);
}

function formatAngka(angka) {
  return new Intl.NumberFormat("id-ID").format(
    Number(angka) || 0
  );
}

function tanggalHariIni() {
  const sekarang = new Date();
  const tahun = sekarang.getFullYear();
  const bulan = String(
    sekarang.getMonth() + 1
  ).padStart(2, "0");
  const hari = String(
    sekarang.getDate()
  ).padStart(2, "0");
  
  return `${tahun}-${bulan}-${hari}`;
}

function escapeHTML(teks) {
  return String(teks ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function downloadFile(namaFile, isi, tipe) {
  const blob = new Blob([isi], {
    type: tipe
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.href = url;
  link.download = namaFile;
  document.body.appendChild(link);
  link.click();
  link.remove();
  
  URL.revokeObjectURL(url);
}

function arrayKeCSV(data) {
  if (!data || data.length === 0) {
    return "";
  }
  
  const kolom = Object.keys(data[0]);
  
  const header = kolom
    .map(k => `"${String(k).replace(/"/g, '""')}"`)
    .join(",");
  
  const baris = data.map(item => {
    return kolom.map(k => {
      let nilai = item[k];
      
      if (nilai === null || nilai === undefined) {
        nilai = "";
      }
      
      if (typeof nilai === "object") {
        nilai = JSON.stringify(nilai);
      }
      
      return `"${String(nilai).replace(/"/g, '""')}"`;
    }).join(",");
  });
  
  return [header, ...baris].join("\n");
}