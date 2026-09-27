const DB_NAME = "AI_PRODUCTION_DB";
const DB_VERSION = 1;

const STORES = [
  "produk",
  "bahan",
  "supplier",
  "bom",
  "produksi",
  "stok",
  "biaya",
  "gagal"
];

let db;

function bukaDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = function(event) {
      const database = event.target.result;
      
      STORES.forEach(function(storeName) {
        if (!database.objectStoreNames.contains(storeName)) {
          const store = database.createObjectStore(storeName, {
            keyPath: "id",
            autoIncrement: true
          });
          
          store.createIndex("tanggal", "tanggal", {
            unique: false
          });
        }
      });
    };
    
    request.onsuccess = function(event) {
      db = event.target.result;
      resolve(db);
    };
    
    request.onerror = function() {
      reject(request.error);
    };
  });
}

function tambahData(storeName, data) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    
    const request = store.add(data);
    
    request.onsuccess = function() {
      resolve(request.result);
    };
    
    request.onerror = function() {
      reject(request.error);
    };
  });
}

function ambilSemuaData(storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    
    const request = store.getAll();
    
    request.onsuccess = function() {
      resolve(request.result);
    };
    
    request.onerror = function() {
      reject(request.error);
    };
  });
}

function ambilData(storeName, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    
    const request = store.get(Number(id));
    
    request.onsuccess = function() {
      resolve(request.result);
    };
    
    request.onerror = function() {
      reject(request.error);
    };
  });
}

function ubahData(storeName, data) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    
    const request = store.put(data);
    
    request.onsuccess = function() {
      resolve(request.result);
    };
    
    request.onerror = function() {
      reject(request.error);
    };
  });
}

function hapusData(storeName, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    
    const request = store.delete(Number(id));
    
    request.onsuccess = function() {
      resolve();
    };
    
    request.onerror = function() {
      reject(request.error);
    };
  });
}

function hapusSemuaData(storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    
    const request = store.clear();
    
    request.onsuccess = function() {
      resolve();
    };
    
    request.onerror = function() {
      reject(request.error);
    };
  });
}

async function kosongkanDatabase() {
  for (const storeName of STORES) {
    await hapusSemuaData(storeName);
  }
}

async function exportDatabase() {
  const backup = {
    aplikasi: "AI PRODUCTION",
    versi: 1,
    tanggal: new Date().toISOString(),
    data: {}
  };
  
  for (const storeName of STORES) {
    backup.data[storeName] = await ambilSemuaData(storeName);
  }
  
  return backup;
}

async function importDatabase(backup) {
  if (
    !backup ||
    !backup.data ||
    typeof backup.data !== "object"
  ) {
    throw new Error("Format backup tidak valid.");
  }
  
  await kosongkanDatabase();
  
  for (const storeName of STORES) {
    const data = backup.data[storeName] || [];
    
    for (const item of data) {
      await tambahData(storeName, item);
    }
  }
  
  return true;
}