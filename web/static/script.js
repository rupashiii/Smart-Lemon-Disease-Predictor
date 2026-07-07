const DISEASE_INFO = {
    "Anthracnose": {
        description: "Anthracnose is a fungal disease that can cause dark lesions, leaf spotting, twig dieback, and fruit blemishes in humid conditions.",
        treatments: [
            "Remove and destroy infected leaves and fallen plant debris.",
            "Improve airflow through pruning and avoid overhead watering.",
            "Use a copper-based fungicide or locally recommended fungicide when symptoms persist."
        ]
    },
    "Bacterial Blight": {
        description: "Bacterial blight often appears as water-soaked spots that expand into brown lesions, especially after rain, wind, or leaf injury.",
        treatments: [
            "Prune infected shoots with disinfected tools.",
            "Avoid working with wet foliage to reduce spread.",
            "Apply copper-based bactericide according to local agricultural guidance."
        ]
    },
    "Citrus Canker": {
        description: "Citrus canker is a contagious bacterial disease that forms raised corky lesions with yellow halos on leaves, stems, and fruit.",
        treatments: [
            "Isolate affected plants and remove heavily infected material.",
            "Disinfect tools and avoid moving infected leaves between locations.",
            "Contact local extension services where canker is regulated."
        ]
    },
    "Curl Virus": {
        description: "Leaf curl symptoms can include curled, distorted, or stunted leaves and may be associated with viral infection or insect vectors.",
        treatments: [
            "Inspect for whiteflies, aphids, and other sap-feeding insects.",
            "Remove severely affected leaves or plants where spread is likely.",
            "Use insect netting, sticky traps, and recommended vector control."
        ]
    },
    "Deficiency Leaf": {
        description: "Nutrient deficiency can show as yellowing, pale patches, weak growth, or interveinal chlorosis depending on the missing nutrient.",
        treatments: [
            "Test soil pH and nutrient levels before fertilizing heavily.",
            "Apply a balanced citrus fertilizer with micronutrients.",
            "Maintain consistent watering so roots can absorb nutrients."
        ]
    },
    "Dry Leaf": {
        description: "Dry leaf symptoms often indicate water stress, heat stress, root issues, or severe environmental damage rather than an infectious disease.",
        treatments: [
            "Check soil moisture and irrigate deeply when the top soil dries.",
            "Mulch around the root zone while keeping mulch away from the trunk.",
            "Inspect roots and drainage if dryness continues after watering."
        ]
    },
    "Healthy Leaf": {
        description: "The model sees this leaf as healthy. Keep monitoring for early spots, curling, yellowing, or pest activity.",
        treatments: [
            "Keep a regular watering and citrus feeding schedule.",
            "Prune for airflow and remove fallen leaves.",
            "Recheck if new symptoms appear or spread."
        ]
    },
    "Sooty Mould": {
        description: "Sooty mould is a dark fungal growth that develops on honeydew from insects such as aphids, whiteflies, mealybugs, or scale.",
        treatments: [
            "Control sap-feeding insects first; the mould depends on honeydew.",
            "Wash leaves gently with water or mild insecticidal soap.",
            "Improve canopy airflow and monitor for returning pests."
        ]
    },
    "Spider Mites": {
        description: "Spider mite damage can cause fine speckling, bronzing, webbing, and leaf decline, especially in hot and dry conditions.",
        treatments: [
            "Spray foliage with water to dislodge mites and reduce dusty conditions.",
            "Use horticultural oil or miticide if infestation is active.",
            "Avoid broad-spectrum insecticides that harm beneficial predators."
        ]
    },
    "Not a lemon leaf": {
        description: "The uploaded image does not appear to contain a lemon leaf, so the disease model was not used.",
        treatments: [
            "Upload a clear close-up photo of a lemon leaf.",
            "Keep the leaf centered and avoid cluttered backgrounds.",
            "Use natural light where possible."
        ]
    }
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const API_URL = "http://127.0.0.1:7860/predict";

const input = document.querySelector("#imageInput");
const preview = document.querySelector("#preview");
const previewFrame = document.querySelector("#previewFrame");
const sendButton = document.querySelector("#analyze-image");
const helperText = document.querySelector("#helperText");
const dropZone = document.querySelector("#dropZone");
const apiStatus = document.querySelector("#apiStatus");
const resultTitle = document.querySelector("#resultTitle");
const confidenceValue = document.querySelector("#confidenceValue");
const diseaseDescription = document.querySelector("#diseaseDescription");
const treatmentList = document.querySelector("#treatmentList");
const scores = document.querySelector("#scores");

function setStatus(message, type = "neutral") {
    apiStatus.textContent = message;
    apiStatus.dataset.type = type;
}

function showError(message) {
    setStatus("Needs attention", "error");
    resultTitle.textContent = "Unable to analyze";
    confidenceValue.textContent = "--";
    diseaseDescription.textContent = message;
    treatmentList.innerHTML = "<li>Check the image and try again.</li>";
    scores.innerHTML = "";
    helperText.textContent = message;
}

function validateFile(file) {
    if (!file) return "Please choose an image before analyzing.";
    if (!file.type.startsWith("image/")) return "Please upload a valid image file.";
    if (file.size > MAX_FILE_SIZE) return "Please upload an image under 5 MB.";
    return "";
}

function updatePreview(file) {
    const error = validateFile(file);
    if (error) {
        input.value = "";
        preview.removeAttribute("src");
        previewFrame.style.display = "none";
        sendButton.style.display = "none";
        showError(error);
        return;
    }

    const reader = new FileReader();
    reader.onload = event => {
        preview.src = event.target.result;
        previewFrame.style.display = "block";
        sendButton.style.display = "inline-flex";
        helperText.textContent = "Image ready. Start analysis when the API is running.";
        setStatus("Ready", "neutral");
    };
    reader.readAsDataURL(file);
}

function renderTreatments(items) {
    treatmentList.innerHTML = "";
    items.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        treatmentList.appendChild(li);
    });
}

function renderScores(items = []) {
    scores.innerHTML = "";
    items.slice(0, 5).forEach(item => {
        const row = document.createElement("div");
        row.className = "score-row";
        row.innerHTML = `
            <span>${item.label}</span>
            <div class="score-track"><span style="width: ${Math.max(item.confidence, 2)}%"></span></div>
            <strong>${item.confidence.toFixed(2)}%</strong>
        `;
        scores.appendChild(row);
    });
}

function renderResult(data) {
    const prediction = data.prediction || "Unknown";
    const info = DISEASE_INFO[prediction] || {
        description: "The model returned a prediction, but no care guide is available for this label yet.",
        treatments: ["Consult a local agricultural expert for confirmation."]
    };

    setStatus("Analysis complete", "success");
    resultTitle.textContent = prediction;
    confidenceValue.textContent = `${Number(data.confidence || 0).toFixed(2)}%`;
    diseaseDescription.textContent = info.description;
    renderTreatments(info.treatments);
    renderScores(data.scores || []);
    helperText.textContent = data.message || `Lemon leaf confidence: ${Number(data.lemon_leaf_confidence || 0).toFixed(2)}%.`;
}

async function analyzeImage() {
    const file = input.files[0];
    const error = validateFile(file);
    if (error) {
        showError(error);
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    sendButton.disabled = true;
    setStatus("Analyzing", "working");
    helperText.textContent = "Analyzing leaf image...";

    try {
        const response = await fetch(API_URL, { method: "POST", body: formData });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.error || "The prediction service returned an error.");
        }

        renderResult(data);
    } catch (error) {
        showError(error.message || "Could not reach the prediction API. Make sure the Flask API is running.");
    } finally {
        sendButton.disabled = false;
    }
}

input.addEventListener("change", () => updatePreview(input.files[0]));
sendButton.addEventListener("click", analyzeImage);

["dragenter", "dragover"].forEach(eventName => {
    dropZone.addEventListener(eventName, event => {
        event.preventDefault();
        dropZone.classList.add("is-dragging");
    });
});

["dragleave", "drop"].forEach(eventName => {
    dropZone.addEventListener(eventName, event => {
        event.preventDefault();
        dropZone.classList.remove("is-dragging");
    });
});

dropZone.addEventListener("drop", event => {
    const file = event.dataTransfer.files[0];
    if (!file) return;
    input.files = event.dataTransfer.files;
    updatePreview(file);
});
