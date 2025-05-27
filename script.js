const form = document.getElementById("serviceForm");
const canvas = document.getElementById("firmaCanvas");
const ctx = canvas.getContext("2d");
let drawing = false;

canvas.addEventListener("mousedown", () => drawing = true);
canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mouseout", () => drawing = false);
canvas.addEventListener("mousemove", draw);

function draw(e) {
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#000";
  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function borrarFirma() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData(form);
  const finalData = new FormData();

  // Agrega los campos de texto
  finalData.append("cliente", formData.get("cliente"));
  finalData.append("direccion", formData.get("direccion"));
  finalData.append("tecnico", formData.get("tecnico"));
  finalData.append("trabajo", formData.get("trabajo"));
  finalData.append("observaciones", formData.get("observaciones"));

  // Agrega imágenes
  for (let file of formData.getAll("imagenes")) {
    finalData.append("imagenes", file);
  }

  // Agrega video si existe
  const videoFile = formData.get("video");
  if (videoFile && videoFile.size > 0) {
    finalData.append("video", videoFile);
  }

  // Firma como imagen
  const firmaBlob = await (await fetch(canvas.toDataURL())).blob();
  finalData.append("firma", firmaBlob, "firma.png");

  // Enviar datos
  const response = await fetch("https://script.google.com/macros/s/AKfycbx93x6GE7lZpKYHd2nJGBdmL9HoordBFpN82lAe5YnOXZl4TzwpgLet1SqSWFIOSnDc/exec", {
    method: "POST",
    body: finalData
  });

  if (response.ok) {
    alert("Formulario enviado correctamente");
    form.reset();
    borrarFirma();
  } else {
    alert("Error al enviar el formulario: " + response.status);
  }
});
