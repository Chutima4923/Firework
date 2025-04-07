function uploadImage() {
  const input = document.getElementById("imageInput");
  const resultDiv = document.getElementById("result");
  const preview = document.getElementById("preview");
  const socket = io("http://localhost:5000"); // ใช้ socket.io ถ้ามี realtime

  if (!input.files[0]) {
    resultDiv.innerHTML = "กรุณาเลือกภาพก่อน";
    return;
  }

  const file = input.files[0];
  const formData = new FormData();
  formData.append("image", file);

  // แสดงภาพที่เลือกไว้ล่วงหน้า
  preview.src = URL.createObjectURL(file);

  // ส่งข้อมูลไปยัง backend และรอผลการทำนาย
  fetch("http://localhost:5000/predict", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        resultDiv.innerHTML = `❌ ${data.error}`;
      } else {
        resultDiv.innerHTML = data.Fire
          ? `🔥 พบไฟไหม้! (ความมั่นใจ: ${data.Confidence})`
          : `✅ ไม่พบไฟไหม้ (ความมั่นใจ: ${data.Confidence})`;

        // ถ้ามีภาพ base64 ที่ได้จาก backend และต้องการแสดงผล:
        if (data.base64_image) {
          const resultImage = document.getElementById("resultImage");
          resultImage.src = `data:image/jpeg;base64,${data.base64_image}`;
        }

        // เล่นเสียงเตือนเมื่อพบไฟหรือควัน
        if (data.Fire || data.Smoke) {
          const audio = new Audio("fire.mp3"); // ใช้ไฟล์เสียงเตือนที่คุณมี
          audio.play();
        }
      }
    })
    .catch((err) => {
      resultDiv.innerHTML = "เกิดข้อผิดพลาด";
      console.error(err);
    });
}

// เชื่อมต่อ MQTT และ Subscribe หลายกล้อง
const client = mqtt.connect("ws://broker.emqx.io:8083/mqtt");

client.on("connect", () => {
  console.log("✅ Connected to MQTT broker");

  // Subscribe to multiple camera topics
  ["cam1", "cam2"].forEach(cam => {
    client.subscribe(`KukKukKai/DetectionStatus/${cam}`, (err) => {
      if (!err) {
        console.log(`📡 Subscribed to KukKukKai/DetectionStatus/${cam}`);
      } else {
        console.error(`❌ Subscribe error for ${cam}:`, err);
      }
    });
  });
});

client.on("message", (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    // Update UI based on the message data (Fire, Smoke, Timestamp)
    if (data.Fire || data.Smoke) {
      const audio = new Audio("fire.mp3");
      audio.play();
    }
  } catch (error) {
    console.error("❗ Error parsing MQTT message:", error);
  }
});

function uploadImage() {
  const input = document.getElementById("imageInput");
  const file = input.files[0];

  if (!file) {
    alert("กรุณาเลือกไฟล์ภาพ");
    return;
  }

  const formData = new FormData();
  formData.append("image", file);

  fetch("http://localhost:5000/predict", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.base64) {
        const imageElement = document.getElementById("detectionImage");
        imageElement.src = "data:image/jpeg;base64," + data.base64;
      } else {
        alert("ไม่พบผลการตรวจจับ");
      }
    })
    .catch((error) => {
      console.error("เกิดข้อผิดพลาด:", error);
    });
}


function downloadImage() {
  const image = document.getElementById("detectionImage");

  if (image.src) {
    const link = document.createElement("a");
    link.href = image.src;
    link.download = "detection_image.jpg"; // ตั้งชื่อไฟล์ที่ต้องการดาวน์โหลด
    link.click();
  } else {
    alert("ไม่พบภาพที่จะดาวน์โหลด");
  }
}
document.getElementById("save-button").addEventListener("click", () => {
  html2canvas(document.getElementById("detection-image")).then(canvas => {
    const link = document.createElement("a");
    link.download = "detection_image.png";
    link.href = canvas.toDataURL();
    link.click();
  });
});

const canvasElement = document.getElementById("fire-events-graph");
if (canvasElement) {
  const ctx = canvasElement.getContext("2d");
  new Chart(ctx,);
}

document.getElementById("detection-image").style.backgroundImage = "";
