
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
    const imagenes = [];
    const readerPromises = [];

    for (let file of formData.getAll("imagenes")) {
        const reader = new FileReader();
        const promise = new Promise(resolve => {
            reader.onload = () => resolve(reader.result);
        });
        reader.readAsDataURL(file);
        readerPromises.push(promise);
    }

    const videoFile = formData.get("video");
    const videoReader = new FileReader();
    const videoPromise = new Promise(resolve => {
        if (videoFile && videoFile.size > 0) {
            videoReader.onload = () => resolve(videoReader.result);
            videoReader.readAsDataURL(videoFile);
        } else {
            resolve(null);
        }
    });

    const firmaData = canvas.toDataURL();

    const imageResults = await Promise.all(readerPromises);
    const videoData = await videoPromise;

    const payload = {
        cliente: formData.get("cliente"),
        direccion: formData.get("direccion"),
        tecnico: formData.get("tecnico"),
        trabajo: formData.get("trabajo"),
        observaciones: formData.get("observaciones"),
        firma: firmaData,
        imagenes: imageResults,
        video: videoData
    };

    const response = await fetch("https://script.google.com/macros/s/AKfycbx93x6GE7lZpKYHd2nJGBdmL9HoordBFpN82lAe5YnOXZl4TzwpgLet1SqSWFIOSnDc/exec", {

        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (response.ok) {
        alert("Formulario enviado correctamente");
        form.reset();
        borrarFirma();
    } else {
        alert("Error al enviar formulario");
    }
});
