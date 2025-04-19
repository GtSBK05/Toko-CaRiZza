let keranjang = JSON.parse(localStorage.getItem("keranjang")) || [];

document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(".btn-success");
  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      const parent = button.closest(".card-body");
      const namaProduk = parent.querySelector(".card-title").innerText;
      const select = parent.querySelector("select");
      const input = parent.querySelector("input");
      let detail = "";

      if (select) {
        detail = select.value;
      } else if (input) {
        detail = input.value + " butir";
        input.value = "";
      } else {
        detail = parent.querySelector(".form-control-plaintext")?.innerText || "";
      }

      const itemBaru = { nama: namaProduk, detail: detail, jumlah: 1 };
      const existingItem = keranjang.find(
        item => item.nama === itemBaru.nama && item.detail === itemBaru.detail
      );

      if (existingItem) {
        existingItem.jumlah += 1;
        alert(`${itemBaru.nama} ${itemBaru.detail} sudah ada, jumlah ditambah`);
      } else {
        keranjang.push(itemBaru);
        alert(`${itemBaru.nama} ${itemBaru.detail} ditambahkan ke keranjang`);
      }

      localStorage.setItem("keranjang", JSON.stringify(keranjang));
    });
  });

  const produkTextarea = document.getElementById("produk");
  if (produkTextarea) {
    produkTextarea.value = keranjang
      .map(item => `${item.nama} ${item.detail} x${item.jumlah}`)
      .join(", ");
  }

  const tbody = document.getElementById("tabel-body");
  if (tbody) {
    const dataPesanan = JSON.parse(localStorage.getItem("dataPesanan")) || [];
    tbody.innerHTML = dataPesanan.map((data, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${data.nama}</td>
        <td>${data.nohp}</td>
        <td>${data.alamat}</td>
        <td>${data.pesanan}</td>
        <td>
          <button class="btn btn-success btn-sm d-flex align-items-center gap-1" onclick="konfirmasiPesanan(${index})">
            <i class="bi bi-whatsapp"></i> Konfirmasi
          </button>
        </td>
      </tr>
    `).join('');
  }
});

function kirimPesanan() {
  const nama = document.getElementById("nama").value.trim();
  const nohp = document.getElementById("nohp").value.trim();
  const alamat = document.getElementById("alamat").value.trim();
  const opsi = document.getElementById("opsi").value;

  const pesanan = (opsi === "manual")
    ? document.getElementById("produk-manual").value.trim()
    : keranjang.map(item => `${item.nama} ${item.detail} x${item.jumlah}`).join(", ");

  document.getElementById("error-nama").textContent = "";
  document.getElementById("error-nohp").textContent = "";
  document.getElementById("error-alamat").textContent = "";

  let valid = true;

  if (!nama) {
    document.getElementById("error-nama").textContent = "Nama tidak boleh kosong.";
    valid = false;
  }

  if (!nohp) {
    document.getElementById("error-nohp").textContent = "No. HP harus diisi.";
    valid = false;
  } else if (!/^08[0-9]{8,11}$/.test(nohp)) {
    document.getElementById("error-nohp").textContent = "Format No. HP tidak valid.";
    valid = false;
  }

  if (!alamat) {
    document.getElementById("error-alamat").textContent = "Alamat wajib diisi.";
    valid = false;
  }

  if (!pesanan) {
    alert("Isi pesanan tidak boleh kosong.");
    valid = false;
  }

  if (!valid) return;

  const dataBaru = { nama, nohp, alamat, pesanan };
  const dataPesanan = JSON.parse(localStorage.getItem("dataPesanan")) || [];
  dataPesanan.push(dataBaru);
  localStorage.setItem("dataPesanan", JSON.stringify(dataPesanan));
  localStorage.removeItem("keranjang");
  window.location.href = "sukses.html";
}

function hapusKeranjang() {
  document.getElementById('produk').value = '';
  localStorage.removeItem('keranjang');
  keranjang = [];
  alert("Isi keranjang telah dihapus.");
}

function konfirmasiPesanan(index) {
  const dataPesanan = JSON.parse(localStorage.getItem("dataPesanan")) || [];
  const pesanan = dataPesanan[index];
  const nomorWA = pesanan.nohp.replace(/^0/, '62');
  const invoice = `Halo ${pesanan.nama},\n\nTerima kasih atas pesanan Anda:\n${pesanan.pesanan}\n\nMohon segera lakukan pembayaran agar pesanan bisa diproses.\n\nSalam,\nToko CaRiZza`;
  const urlWA = `https://wa.me/${nomorWA}?text=${encodeURIComponent(invoice)}`;
  window.open(urlWA, "_blank");
  dataPesanan.splice(index, 1);
  localStorage.setItem("dataPesanan", JSON.stringify(dataPesanan));
  setTimeout(() => {
    location.reload();
  }, 500);
}
