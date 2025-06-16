import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js'
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  where
} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js'

const firebaseConfig = {
  apiKey: "AIzaSyDGYnq4VKq-YGu4RbfoI_ZHez9fishYjZo",
  authDomain: "insan-cemerlang-afd2f.firebaseapp.com",
  projectId: "insan-cemerlang-afd2f",
  storageBucket: "insan-cemerlang-afd2f.appspot.com",
  messagingSenderId: "686649580589",
  appId: "1:686649580589:web:61374bbbd68adb604eaca4",
  measurementId: "G-LNZTQBCE26"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection reference
const absensiCollection = collection(db, "absensi_siswa");

/**
 * Get all attendance records sorted by date (newest first)
 * @returns {Promise<Array>} Array of attendance records
 */
export async function ambilDaftarAbsensi() {
  try {
    const q = query(absensiCollection, orderBy("tanggal", "desc"));
    const querySnapshot = await getDocs(q);
    
    const absensiList = [];
    querySnapshot.forEach((doc) => {
      absensiList.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return absensiList;
  } catch (error) {
    console.error("Error getting attendance data: ", error);
    throw error;
  }
}

/**
 * Get attendance record by ID
 * @param {string} id - Document ID
 * @returns {Promise<Object>} Attendance record
 */
export async function ambilAbsensiById(id) {
  try {
    const docRef = doc(db, "absensi_siswa", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error("Document not found");
    }
  } catch (error) {
    console.error("Error getting attendance by ID: ", error);
    throw error;
  }
}

/**
 * Add new attendance record
 * @param {Object} data - Attendance data
 * @returns {Promise<string>} Document ID of the new record
 */
export async function tambahAbsensi(data) {
  try {
    // Validate required fields
    if (!data.tanggal || !data.nis || !data.nama || !data.kelas || !data.keterangan) {
      throw new Error("Required fields are missing");
    }
    
    // Add document to Firestore
    const docRef = await addDoc(absensiCollection, {
      tanggal: data.tanggal,
      nis: data.nis,
      nama: data.nama,
      kelas: data.kelas,
      alamat: data.alamat || "",
      notlpn: data.notlpn || "",
      keterangan: data.keterangan,
      createdAt: new Date().toISOString()
    });
    
    console.log("Attendance record added with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding attendance: ", error);
    throw error;
  }
}

/**
 * Update attendance record
 * @param {Object} data - Attendance data with ID
 * @returns {Promise<void>}
 */
export async function ubahAbsensi(data) {
  try {
    if (!data.id) {
      throw new Error("Document ID is required for update");
    }
    
    const docRef = doc(db, "absensi_siswa", data.id);
    await updateDoc(docRef, {
      tanggal: data.tanggal,
      nis: data.nis,
      nama: data.nama,
      kelas: data.kelas,
      alamat: data.alamat || "",
      notlpn: data.notlpn || "",
      keterangan: data.keterangan,
      updatedAt: new Date().toISOString()
    });
    
    console.log("Attendance record updated successfully");
  } catch (error) {
    console.error("Error updating attendance: ", error);
    throw error;
  }
}

/**
 * Delete attendance record
 * @param {string} id - Document ID to delete
 * @returns {Promise<void>}
 */
export async function hapusAbsensi(id) {
  try {
    await deleteDoc(doc(db, "absensi_siswa", id));
    console.log("Attendance record deleted successfully");
  } catch (error) {
    console.error("Error deleting attendance: ", error);
    throw error;
  }
}

/**
 * Get attendance statistics (count by status)
 * @returns {Promise<Object>} Object with counts for each status
 */
export async function ambilStatistikAbsensi() {
  try {
    const q = query(absensiCollection);
    const querySnapshot = await getDocs(q);
    
    const statistik = {
      hadir: 0,
      sakit: 0,
      izin: 0,
      tidak_hadir: 0,
      total: 0
    };
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const status = data.keterangan.toLowerCase().replace(' ', '_');
      
      if (statistik.hasOwnProperty(status)) {
        statistik[status]++;
      }
      statistik.total++;
    });
    
    return statistik;
  } catch (error) {
    console.error("Error getting attendance statistics: ", error);
    throw error;
  }
}

/**
 * Get attendance records by date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Array>} Array of attendance records
 */
export async function ambilAbsensiByDateRange(startDate, endDate) {
  try {
    const q = query(
      absensiCollection,
      where("tanggal", ">=", startDate),
      where("tanggal", "<=", endDate),
      orderBy("tanggal", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const absensiList = [];
    
    querySnapshot.forEach((doc) => {
      absensiList.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return absensiList;
  } catch (error) {
    console.error("Error getting attendance by date range: ", error);
    throw error;
  }
}

/**
 * Get attendance records by student NIS
 * @param {string} nis - Student NIS
 * @returns {Promise<Array>} Array of attendance records
 */
export async function ambilAbsensiByNis(nis) {
  try {
    const q = query(
      absensiCollection,
      where("nis", "==", nis),
      orderBy("tanggal", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const absensiList = [];
    
    querySnapshot.forEach((doc) => {
      absensiList.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return absensiList;
  } catch (error) {
    console.error("Error getting attendance by NIS: ", error);
    throw error;
  }
}