import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import XLSX from "xlsx";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const firebaseConfig = {
  apiKey: "AIzaSyCMXhgjBd6XoO45vYd_AAPgkmlxVrluKl8",
  authDomain: "al-fit-landing.firebaseapp.com",
  projectId: "al-fit-landing",
  storageBucket: "al-fit-landing.firebasestorage.app",
  messagingSenderId: "1058643358712",
  appId: "1:1058643358712:web:46aedb0922a55187d21c0d",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function exportSignups() {
  console.log("Fetching signups from Firestore...");

  const signupsRef = collection(db, "signups");
  const snapshot = await getDocs(signupsRef);

  if (snapshot.empty) {
    console.log("No signups found.");
    process.exit(0);
  }

  const rows = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    const timestamp = data.timestamp?.toDate
      ? data.timestamp.toDate().toISOString()
      : data.timestamp || "N/A";

    rows.push({
      Email: data.email || "",
      "Signed Up": timestamp,
      "User Agent": data.userAgent || "",
    });
  });

  rows.sort((a, b) => {
    if (a["Signed Up"] === "N/A") return 1;
    if (b["Signed Up"] === "N/A") return -1;
    return new Date(a["Signed Up"]) - new Date(b["Signed Up"]);
  });

  console.log(`Found ${rows.length} signup(s).`);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [{ wch: 35 }, { wch: 28 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, ws, "Signups");

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const outputPath = join(__dirname, "export", "AL-Fit-Signups.xlsx");
  XLSX.writeFile(wb, outputPath);

  console.log(`Exported to: ${outputPath}`);
  process.exit(0);
}

exportSignups().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
