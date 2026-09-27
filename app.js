let dataProduk = [];
let dataBahan = [];
let dataSupplier = [];
let dataBOM = [];
let dataProduksi = [];
let dataBiaya = [];
let dataGagal = [];

document.addEventListener("DOMContentLoaded", async function () {
    try {
        await bukaDatabase();

        pasangNavigasi();
        pasangForm();
        isiTanggalForm();
        await muatSemuaData();
        tampilkanSemua();
    } catch (error) {
        console.error("Database error:", error);
        alert("Database AI PRODUCTION gagal dibuka.");
    }
});

function pasangNavigasi() {
    const tombol = document.querySelectorAll(".nav-btn");

    tombol.forEach(function (button) {
        button.addEventListener("click", function () {
            const halaman = button.dataset.page;

            document.querySelectorAll(".page").forEach(function (page) {
                page.classList.remove("active");
            });

            document.querySelectorAll(".nav-btn").forEach(function (btn) {
                btn.classList.remove("active");
            });

            const target = document.getElementById(halaman);

            if (target) {
                target.classList.add("active");
                button.classList.add("active");
            }

            tampilkanSemua();
        });
    });
}

function pasangForm() {
    document.getElementById("produkForm")
        .addEventListener("submit", simpanProduk);

    document.getElementById("bahanForm")
        .addEventListener("submit", simpanBahan);

    document.getElementById("supplierForm")
        .addEventListener("submit", simpanSupplier);

    document.getElementById("bomForm")
        .addEventListener("submit", simpanBOM);

    document.getElementById("produksiForm")
        .addEventListener("submit", simpanProduksi);

    document.getElementById("biayaForm")
        .addEventListener("submit", simpanBiaya);

    document.getElementById("gagalForm")
        .addEventListener("submit", simpanGagal);
}

function isiTanggalForm() {
    const tanggal = tanggalHariIni();

    document.getElementById("produksiTanggal").value = tanggal;
    document.getElementById("biayaTanggal").value = tanggal;
    document.getElementById("gagalTanggal").value = tanggal;
}

async function muatSemuaData() {
    dataProduk = await ambilSemuaData("produk");
    dataBahan = await ambilSemuaData("bahan");
    dataSupplier = await ambilSemuaData("supplier");
    dataBOM = await ambilSemuaData("bom");
    dataProduksi = await ambilSemuaData("produksi");
    dataBiaya = await ambilSemuaData("biaya");
    dataGagal = await ambilSemuaData("gagal");
}

function tampilkanSemua() {
    tampilkanProduk();
    tampilkanBahan();
    tampilkanSupplier();
    tampilkanBOM();
    tampilkanProduksi();
    tampilkanStok();
    tampilkanBiaya();
    tampilkanGagal();
    tampilkanDashboard();
    tampilkanLaporan();
}

async function simpanProduk(event) {
    event.preventDefault();

    const id = document.getElementById("produkId").value;

    const data = {
        nama: document.getElementById("produkNama").value.trim(),
        harga: Number(document.getElementById("produkHarga").value),
        satuan: document.getElementById("produkSatuan").value.trim(),
        stok: Number(document.getElementById("produkStok").value) || 0,
        tanggal: tanggalHariIni()
    };

    if (id) {
        data.id = Number(id);
        await ubahData("produk", data);
    } else {
        await tambahData("produk", data);
    }

    event.target.reset();
    document.getElementById("produkId").value = "";

    await muatSemuaData();
    tampilkanSemua();
}

async function simpanBahan(event) {
    event.preventDefault();

    const id = document.getElementById("bahanId").value;

    const data = {
        nama: document.getElementById("bahanNama").value.trim(),
        satuan: document.getElementById("bahanSatuan").value.trim(),
        stok: Number(document.getElementById("bahanStok").value) || 0,
        harga: Number(document.getElementById("bahanHarga").value) || 0,
        supplier: document.getElementById("bahanSupplier").value.trim(),
        minimum: Number(document.getElementById("bahanMinimum").value) || 0,
        tanggal: tanggalHariIni()
    };

    if (id) {
        data.id = Number(id);
        await ubahData("bahan", data);
    } else {
        await tambahData("bahan", data);
    }

    event.target.reset();
    document.getElementById("bahanId").value = "";

    await muatSemuaData();
    tampilkanSemua();
}

async function simpanSupplier(event) {
    event.preventDefault();

    const id = document.getElementById("supplierId").value;

    const data = {
        nama: document.getElementById("supplierNama").value.trim(),
        kontak: document.getElementById("supplierKontak").value.trim(),
        alamat: document.getElementById("supplierAlamat").value.trim(),
        tanggal: tanggalHariIni()
    };

    if (id) {
        data.id = Number(id);
        await ubahData("supplier", data);
    } else {
        await tambahData("supplier", data);
    }

    event.target.reset();
    document.getElementById("supplierId").value = "";

    await muatSemuaData();
    tampilkanSemua();
}

async function simpanBOM(event) {
    event.preventDefault();

    const id = document.getElementById("bomId").value;

    const data = {
        produk: document.getElementById("bomProduk").value.trim(),
        bahan: document.getElementById("bomBahan").value.trim(),
        jumlah: Number(document.getElementById("bomJumlah").value),
        satuan: document.getElementById("bomSatuan").value.trim(),
        tanggal: tanggalHariIni()
    };

    if (id) {
        data.id = Number(id);
        await ubahData("bom", data);
    } else {
        await tambahData("bom", data);
    }

    event.target.reset();
    document.getElementById("bomId").value = "";

    await muatSemuaData();
    tampilkanSemua();
}

async function simpanProduksi(event) {
    event.preventDefault();

    const namaProduk = document
        .getElementById("produksiProduk")
        .value
        .trim();

    const qty = Number(
        document.getElementById("produksiQty").value
    );

    const tanggal = document
        .getElementById("produksiTanggal")
        .value;

    const produk = dataProduk.find(
        item => item.nama.toLowerCase() === namaProduk.toLowerCase()
    );

    if (!produk) {
        tampilkanPesanProduksi(
            "Produk tidak ditemukan.",
            false
        );
        return;
    }

    const resep = dataBOM.filter(
        item => item.produk.toLowerCase() === namaProduk.toLowerCase()
    );

    const kebutuhan = resep.map(item => {
        return {
            ...item,
            total: item.jumlah * qty
        };
    });

    for (const item of kebutuhan) {
        const bahan = dataBahan.find(
            b => b.nama.toLowerCase() === item.bahan.toLowerCase()
        );

        if (!bahan) {
            tampilkanPesanProduksi(
                `Bahan "${item.bahan}" tidak ditemukan.`,
                false
            );
            return;
        }

        if (Number(bahan.stok) < Number(item.total)) {
            tampilkanPesanProduksi(
                `Stok bahan "${bahan.nama}" tidak mencukupi.`,
                false
            );
            return;
        }
    }

    let totalBiaya = 0;

    for (const item of kebutuhan) {
        const bahan = dataBahan.find(
            b => b.nama.toLowerCase() === item.bahan.toLowerCase()
        );

        const biaya = Number(item.total) * Number(bahan.harga);

        totalBiaya += biaya;

        bahan.stok -= Number(item.total);

        await ubahData("bahan", bahan);
    }

    produk.stok += qty;

    await ubahData("produk", produk);

    const transaksi = {
        tanggal: tanggal,
        produk: produk.nama,
        qty: qty,
        biaya: totalBiaya,
        kebutuhan: kebutuhan,
        createdAt: new Date().toISOString()
    };

    await tambahData("produksi", transaksi);

    tampilkanPesanProduksi(
        `Produksi ${qty} ${produk.satuan} ${produk.nama} berhasil.`,
        true
    );

    event.target.reset();
    document.getElementById("produksiTanggal").value = tanggalHariIni();

    await muatSemuaData();
    tampilkanSemua();
}

async function simpanBiaya(event) {
    event.preventDefault();

    const id = document.getElementById("biayaId").value;

    const data = {
        keterangan: document.getElementById("biayaKeterangan").value.trim(),
        jumlah: Number(document.getElementById("biayaJumlah").value),
        tanggal: document.getElementById("biayaTanggal").value
    };

    if (id) {
        data.id = Number(id);
        await ubahData("biaya", data);
    } else {
        await tambahData("biaya", data);
    }

    event.target.reset();
    document.getElementById("biayaId").value = "";
    document.getElementById("biayaTanggal").value = tanggalHariIni();

    await muatSemuaData();
    tampilkanSemua();
}

async function simpanGagal(event) {
    event.preventDefault();

    const id = document.getElementById("gagalId").value;

    const data = {
        produk: document.getElementById("gagalProduk").value.trim(),
        qty: Number(document.getElementById("gagalQty").value),
        alasan: document.getElementById("gagalAlasan").value.trim(),
        tanggal: document.getElementById("gagalTanggal").value
    };

    if (id) {
        data.id = Number(id);
        await ubahData("gagal", data);
    } else {
        await tambahData("gagal", data);
    }

    event.target.reset();
    document.getElementById("gagalId").value = "";
    document.getElementById("gagalTanggal").value = tanggalHariIni();

    await muatSemuaData();
    tampilkanSemua();
}

function tampilkanProduk() {
    const table = document.getElementById("produkTable");

    if (dataProduk.length === 0) {
        table.innerHTML = `<tr><td colspan="5">Belum ada data produk.</td></tr>`;
        return;
    }

    table.innerHTML = dataProduk.map(item => `
        <tr>
            <td>${escapeHTML(item.nama)}</td>
            <td>${formatRupiah(item.harga)}</td>
            <td>${escapeHTML(item.satuan)}</td>
            <td>${formatAngka(item.stok)}</td>
            <td>
                <button onclick="editProduk(${item.id})">Edit</button>
                <button class="btn-danger" onclick="hapusProduk(${item.id})">Hapus</button>
            </td>
        </tr>
    `).join("");
}

function tampilkanBahan() {
    const table = document.getElementById("bahanTable");

    if (dataBahan.length === 0) {
        table.innerHTML = `<tr><td colspan="7">Belum ada data bahan.</td></tr>`;
        return;
    }

    table.innerHTML = dataBahan.map(item => `
        <tr>
            <td>${escapeHTML(item.nama)}</td>
            <td>${escapeHTML(item.satuan)}</td>
            <td>${formatAngka(item.stok)}</td>
            <td>${formatRupiah(item.harga)}</td>
            <td>${escapeHTML(item.supplier)}</td>
            <td>${formatAngka(item.minimum)}</td>
            <td>
                <button onclick="editBahan(${item.id})">Edit</button>
                <button class="btn-danger" onclick="hapusBahan(${item.id})">Hapus</button>
            </td>
        </tr>
    `).join("");
}

function tampilkanSupplier() {
    const table = document.getElementById("supplierTable");

    if (dataSupplier.length === 0) {
        table.innerHTML = `<tr><td colspan="4">Belum ada data supplier.</td></tr>`;
        return;
    }

    table.innerHTML = dataSupplier.map(item => `
        <tr>
            <td>${escapeHTML(item.nama)}</td>
            <td>${escapeHTML(item.kontak)}</td>
            <td>${escapeHTML(item.alamat)}</td>
            <td>
                <button onclick="editSupplier(${item.id})">Edit</button>
                <button class="btn-danger" onclick="hapusSupplier(${item.id})">Hapus</button>
            </td>
        </tr>
    `).join("");
}

function tampilkanBOM() {
    const table = document.getElementById("bomTable");

    if (dataBOM.length === 0) {
        table.innerHTML = `<tr><td colspan="5">Belum ada data BOM.</td></tr>`;
        return;
    }

    table.innerHTML = dataBOM.map(item => `
        <tr>
            <td>${escapeHTML(item.produk)}</td>
            <td>${escapeHTML(item.bahan)}</td>
            <td>${formatAngka(item.jumlah)}</td>
            <td>${escapeHTML(item.satuan)}</td>
            <td>
                <button onclick="editBOM(${item.id})">Edit</button>
                <button class="btn-danger" onclick="hapusBOM(${item.id})">Hapus</button>
            </td>
        </tr>
    `).join("");
}

function tampilkanProduksi() {
    const table = document.getElementById("produksiTable");

    if (dataProduksi.length === 0) {
        table.innerHTML = `<tr><td colspan="4">Belum ada produksi.</td></tr>`;
        return;
    }

    table.innerHTML = dataProduksi.map(item => `
        <tr>
            <td>${escapeHTML(item.tanggal)}</td>
            <td>${escapeHTML(item.produk)}</td>
            <td>${formatAngka(item.qty)}</td>
            <td>${formatRupiah(item.biaya)}</td>
        </tr>
    `).join("");
}

function tampilkanStok() {
    const produkTable = document.getElementById("stokProdukTable");
    const bahanTable = document.getElementById("stokBahanTable");

    produkTable.innerHTML = dataProduk.length
        ? dataProduk.map(item => `
            <tr>
                <td>${escapeHTML(item.nama)}</td>
                <td>${formatAngka(item.stok)}</td>
                <td>${escapeHTML(item.satuan)}</td>
            </tr>
        `).join("")
        : `<tr><td colspan="3">Belum ada data.</td></tr>`;

    bahanTable.innerHTML = dataBahan.length
        ? dataBahan.map(item => {
            const rendah = Number(item.stok) <= Number(item.minimum);

            return `
                <tr>
                    <td>${escapeHTML(item.nama)}</td>
                    <td>${formatAngka(item.stok)}</td>
                    <td>${escapeHTML(item.satuan)}</td>
                    <td class="${rendah ? "low-stock" : "normal-stock"}">
                        ${rendah ? "Stok Minimum" : "Normal"}
                    </td>
                </tr>
            `;
        }).join("")
        : `<tr><td colspan="4">Belum ada data.</td></tr>`;
}

function tampilkanBiaya() {
    const table = document.getElementById("biayaTable");

    if (dataBiaya.length === 0) {
        table.innerHTML = `<tr><td colspan="4">Belum ada biaya.</td></tr>`;
        return;
    }

    table.innerHTML = dataBiaya.map(item => `
        <tr>
            <td>${escapeHTML(item.tanggal)}</td>
            <td>${escapeHTML(item.keterangan)}</td>
            <td>${formatRupiah(item.jumlah)}</td>
            <td>
                <button onclick="editBiaya(${item.id})">Edit</button>
                <button class="btn-danger" onclick="hapusBiaya(${item.id})">Hapus</button>
            </td>
        </tr>
    `).join("");
}

function tampilkanGagal() {
    const table = document.getElementById("gagalTable");

    if (dataGagal.length === 0) {
        table.innerHTML = `<tr><td colspan="5">Belum ada data.</td></tr>`;
        return;
    }

    table.innerHTML = dataGagal.map(item => `
        <tr>
            <td>${escapeHTML(item.tanggal)}</td>
            <td>${escapeHTML(item.produk)}</td>
            <td>${formatAngka(item.qty)}</td>
            <td>${escapeHTML(item.alasan)}</td>
            <td>
                <button onclick="editGagal(${item.id})">Edit</button>
                <button class="btn-danger" onclick="hapusGagal(${item.id})">Hapus</button>
            </td>
        </tr>
    `).join("");
}

function tampilkanDashboard() {
    const hariIni = tanggalHariIni();

    const produksiHariIni = dataProduksi
        .filter(item => item.tanggal === hariIni)
        .reduce((total, item) => total + Number(item.qty), 0);

    const totalBiaya = dataProduksi.reduce(
        (total, item) => total + Number(item.biaya || 0),
        0
    ) + dataBiaya.reduce(
        (total, item) => total + Number(item.jumlah || 0),
        0
    );

    const stokMinimum = dataBahan.filter(
        item => Number(item.stok) <= Number(item.minimum)
    ).length;

    const totalStokProduk = dataProduk.reduce(
        (total, item) => total + Number(item.stok || 0),
        0
    );

    document.getElementById("dashboardProduksi").textContent =
        formatAngka(produksiHariIni);

    document.getElementById("dashboardProduk").textContent =
        formatAngka(dataProduk.length);

    document.getElementById("dashboardBahan").textContent =
        formatAngka(dataBahan.length);

    document.getElementById("dashboardStok").textContent =
        formatAngka(totalStokProduk);

    document.getElementById("dashboardBiaya").textContent =
        formatRupiah(totalBiaya);

    document.getElementById("dashboardMinimum").textContent =
        formatAngka(stokMinimum);
}

function tampilkanLaporan() {
    const totalProduksi = dataProduksi.reduce(
        (total, item) => total + Number(item.qty || 0),
        0
    );

    const totalBiayaProduksi = dataProduksi.reduce(
        (total, item) => total + Number(item.biaya || 0),
        0
    );

    const totalBiayaLain = dataBiaya.reduce(
        (total, item) => total + Number(item.jumlah || 0),
        0
    );

    const totalGagal = dataGagal.reduce(
        (total, item) => total + Number(item.qty || 0),
        0
    );

    document.getElementById("laporanTotalProduksi").textContent =
        formatAngka(totalProduksi);

    document.getElementById("laporanTotalBiaya").textContent =
        formatRupiah(totalBiayaProduksi + totalBiayaLain);

    document.getElementById("laporanTotalGagal").textContent =
        formatAngka(totalGagal);

    document.getElementById("laporanContent").innerHTML = `
        <p><strong>Total produksi:</strong> ${formatAngka(totalProduksi)}</p>
        <p><strong>Biaya bahan produksi:</strong> ${formatRupiah(totalBiayaProduksi)}</p>
        <p><strong>Biaya lainnya:</strong> ${formatRupiah(totalBiayaLain)}</p>
        <p><strong>Total biaya:</strong> ${formatRupiah(totalBiayaProduksi + totalBiayaLain)}</p>
        <p><strong>Produk gagal/rusak:</strong> ${formatAngka(totalGagal)}</p>
    `;
}

function tampilkanPesanProduksi(pesan, berhasil) {
    const element = document.getElementById("produksiMessage");

    element.textContent = pesan;
    element.className = berhasil
        ? "message success"
        : "message error";
}

function editProduk(id) {
    const item = dataProduk.find(data => data.id === id);

    if (!item) return;

    document.getElementById("produkId").value = item.id;
    document.getElementById("produkNama").value = item.nama;
    document.getElementById("produkHarga").value = item.harga;
    document.getElementById("produkSatuan").value = item.satuan;
    document.getElementById("produkStok").value = item.stok;
}

async function hapusProduk(id) {
    if (!confirm("Hapus produk ini?")) return;

    await hapusData("produk", id);
    await muatSemuaData();
    tampilkanSemua();
}

function editBahan(id) {
    const item = dataBahan.find(data => data.id === id);

    if (!item) return;

    document.getElementById("bahanId").value = item.id;
    document.getElementById("bahanNama").value = item.nama;
    document.getElementById("bahanSatuan").value = item.satuan;
    document.getElementById("bahanStok").value = item.stok;
    document.getElementById("bahanHarga").value = item.harga;
    document.getElementById("bahanSupplier").value = item.supplier;
    document.getElementById("bahanMinimum").value = item.minimum;
}

async function hapusBahan(id) {
    if (!confirm("Hapus bahan ini?")) return;

    await hapusData("bahan", id);
    await muatSemuaData();
    tampilkanSemua();
}

function editSupplier(id) {
    const item = dataSupplier.find(data => data.id === id);

    if (!item) return;

    document.getElementById("supplierId").value = item.id;
    document.getElementById("supplierNama").value = item.nama;
    document.getElementById("supplierKontak").value = item.kontak;
    document.getElementById("supplierAlamat").value = item.alamat;
}

async function hapusSupplier(id) {
    if (!confirm("Hapus supplier ini?")) return;

    await hapusData("supplier", id);
    await muatSemuaData();
    tampilkanSemua();
}

function editBOM(id) {
    const item = dataBOM.find(data => data.id === id);

    if (!item) return;

    document.getElementById("bomId").value = item.id;
    document.getElementById("bomProduk").value = item.produk;
    document.getElementById("bomBahan").value = item.bahan;
    document.getElementById("bomJumlah").value = item.jumlah;
    document.getElementById("bomSatuan").value = item.satuan;
}

async function hapusBOM(id) {
    if (!confirm("Hapus BOM ini?")) return;

    await hapusData("bom", id);
    await muatSemuaData();
    tampilkanSemua();
}

function editBiaya(id) {
    const item = dataBiaya.find(data => data.id === id);

    if (!item) return;

    document.getElementById("biayaId").value = item.id;
    document.getElementById("biayaKeterangan").value = item.keterangan;
    document.getElementById("biayaJumlah").value = item.jumlah;
    document.getElementById("biayaTanggal").value = item.tanggal;
}

async function hapusBiaya(id) {
    if (!confirm("Hapus biaya ini?")) return;

    await hapusData("biaya", id);
    await muatSemuaData();
    tampilkanSemua();
}

function editGagal(id) {
    const item = dataGagal.find(data => data.id === id);

    if (!item) return;

    document.getElementById("gagalId").value = item.id;
    document.getElementById("gagalProduk").value = item.produk;
    document.getElementById("gagalQty").value = item.qty;
    document.getElementById("gagalAlasan").value = item.alasan;
    document.getElementById("gagalTanggal").value = item.tanggal;
}

async function hapusGagal(id) {
    if (!confirm("Hapus data produk gagal ini?")) return;

    await hapusData("gagal", id);
    await muatSemuaData();
    tampilkanSemua();
}

function parsePerintahProduksi(perintah) {
    const pola = /produksi\s+(\d+(?:[.,]\d+)?)\s+(?:buah|botol|pcs|unit|kg|liter|liter|pack|pak)?\s*(.+?)(?:\s+hari\s+ini)?$/i;

    const hasil = perintah.trim().match(pola);

    if (!hasil) {
        return null;
    }

    const qty = Number(
        hasil[1].replace(",", ".")
    );

    const produk = hasil[2]
        .replace(/\s+hari\s+ini$/i, "")
        .trim();

    return {
        aktivitas: "Produksi",
        produk: produk,
        qty: qty,
        tanggal: tanggalHariIni()
    };
}

async function jalankanAI() {
    const command = document
        .getElementById("aiCommand")
        .value
        .trim();

    const result = document.getElementById("aiResult");

    if (!command) {
        result.textContent = "Masukkan perintah terlebih dahulu.";
        return;
    }

    const hasil = parsePerintahProduksi(command);

    if (!hasil) {
        result.innerHTML = `
            Perintah belum dikenali.<br>
            Gunakan format seperti:
            <strong>Produksi 100 botol Jus Mangga</strong>
        `;
        return;
    }

    result.innerHTML = `
        <strong>Perintah dikenali:</strong><br><br>
        Aktivitas: ${escapeHTML(hasil.aktivitas)}<br>
        Produk: ${escapeHTML(hasil.produk)}<br>
        Qty: ${formatAngka(hasil.qty)}<br>
        Tanggal: ${escapeHTML(hasil.tanggal)}
    `;

    const produk = dataProduk.find(
        item =>
            item.nama.toLowerCase() ===
            hasil.produk.toLowerCase()
    );

    if (!produk) {
        result.innerHTML += `
            <br><br>
            <span class="low-stock">
                Produk belum terdaftar di Master Produk.
            </span>
        `;
        return;
    }

    document.getElementById("produksiProduk").value =
        hasil.produk;

    document.getElementById("produksiQty").value =
        hasil.qty;

    document.getElementById("produksiTanggal").value =
        hasil.tanggal;

    result.innerHTML += `
        <br><br>
        <strong>Data produksi siap diproses.</strong>
    `;

    document.querySelector('[data-page="produksi"]').click();
}

async function backupData() {
    try {
        const backup = await exportDatabase();

        const isi = JSON.stringify(
            backup,
            null,
            2
        );

        const namaFile =
            `AI-PRODUCTION-BACKUP-${tanggalHariIni()}.json`;

        downloadFile(
            namaFile,
            isi,
            "application/json"
        );

        alert("Backup data berhasil dibuat.");
    } catch (error) {
        console.error(error);
        alert("Backup gagal.");
    }
}

async function restoreData() {
    const input = document.getElementById("restoreFile");

    if (!input.files || input.files.length === 0) {
        alert("Pilih file backup JSON terlebih dahulu.");
        return;
    }

    if (!confirm(
        "Restore akan mengganti data yang sekarang. Lanjutkan?"
    )) {
        return;
    }

    try {
        const file = input.files[0];
        const text = await file.text();
        const backup = JSON.parse(text);

        await importDatabase(backup);

        await muatSemuaData();
        tampilkanSemua();

        alert("Data berhasil di-restore.");
    } catch (error) {
        console.error(error);
        alert("File backup tidak valid atau restore gagal.");
    }
}

async function resetDatabase() {
    const konfirmasi = confirm(
        "PERINGATAN!\n\nSemua data AI PRODUCTION akan dihapus.\n\nLanjutkan?"
    );

    if (!konfirmasi) return;

    const konfirmasi2 = confirm(
        "Yakin ingin menghapus seluruh data?"
    );

    if (!konfirmasi2) return;

    try {
        await kosongkanDatabase();

        localStorage.clear();

        await muatSemuaData();
        tampilkanSemua();

        alert("Seluruh data berhasil direset.");
    } catch (error) {
        console.error(error);
        alert("Reset data gagal.");
    }
}

async function exportProduksiCSV() {
    try {
        const data = await ambilSemuaData("produksi");

        if (data.length === 0) {
            alert("Belum ada data produksi untuk diexport.");
            return;
        }

        const csv = arrayKeCSV(data);

        downloadFile(
            `AI-PRODUCTION-${tanggalHariIni()}.csv`,
            csv,
            "text/csv;charset=utf-8;"
        );
    } catch (error) {
        console.error(error);
        alert("Export CSV gagal.");
    }
}