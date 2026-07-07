from flask import Flask, request, jsonify
from flask_cors import CORS
from huggingface_hub import hf_hub_download
import tensorflow as tf
import numpy as np
from PIL import Image
import io

binary_model = None
main_model = None

LABELS = [
    "Anthracnose",
    "Bacterial Blight",
    "Citrus Canker",
    "Curl Virus",
    "Deficiency Leaf",
    "Dry Leaf",
    "Healthy Leaf",
    "Sooty Mould",
    "Spider Mites",
]

MAX_FILE_SIZE = 5 * 1024 * 1024

def ensure_model_loaded():
    global binary_model, main_model
    # Making sure binary_model is loaded
    if binary_model is None:
        print("Downloading Binary Model ... ")
        binary_model_path = hf_hub_download(repo_id="ishaquejunejo/lemon-disease-detector", filename="models/lemon-leaf-or-not.keras")
        print(f"Binary model downloaded to: {binary_model_path}")
        print("Loading Binary Model ... ")
        binary_model = tf.keras.models.load_model(binary_model_path)
    
    # Making sure main_model is loaded
    if main_model is None:
        print("Downloading Main Model ... ")
        main_model_path = hf_hub_download(repo_id="ishaquejunejo/lemon-disease-detector", filename="models/lemon-leaf-disease-detector.keras")
        print(f"Main Model downloaded to: {main_model_path}")
        print("Loading Main Model ... ")
        main_model = tf.keras.models.load_model(main_model_path)

IMG_SIZE = (224, 224)

# Processing the Image
def preprocess(image):
    image = image.resize(IMG_SIZE)
    image_array = np.array(image) / 255.0
    return np.expand_dims(image_array, axis=0)

# Method for prediction of the image
def predict_from_image_file(image_bytes):
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        return {"error": "Invalid image input. Please upload a readable JPG, PNG, or WebP image."}, 400

    input_data = preprocess(image)

    leaf_prob = float(binary_model.predict(input_data, verbose=0)[0][0])
    if leaf_prob < 0.5:
        return {
            "is_lemon_leaf": False,
            "prediction": "Not a lemon leaf",
            "confidence": round((1 - leaf_prob) * 100, 2),
            "lemon_leaf_confidence": round(leaf_prob * 100, 2),
            "message": "This image does not look like a lemon leaf. Try a clear, close-up photo of a single leaf.",
        }, 200

    disease_prob = main_model.predict(input_data, verbose=0)[0]
    scores = [
        {"label": label, "confidence": round(float(score) * 100, 2)}
        for label, score in zip(LABELS, disease_prob)
    ]
    scores.sort(key=lambda item: item["confidence"], reverse=True)

    return {
        "is_lemon_leaf": True,
        "prediction": scores[0]["label"],
        "confidence": scores[0]["confidence"],
        "lemon_leaf_confidence": round(leaf_prob * 100, 2),
        "scores": scores,
    }, 200

# Running the App
app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        ensure_model_loaded()
    except Exception as exc:
        app.logger.exception("Model loading failed")
        return jsonify({
            "error": "The prediction models could not be loaded. Check your internet connection and try again.",
            "details": str(exc),
        }), 503

    if "file" not in request.files:
        return jsonify({"error": "No image was uploaded."}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Please choose an image before analyzing."}), 400

    if file.mimetype and not file.mimetype.startswith("image/"):
        return jsonify({"error": "Unsupported file type. Please upload a JPG, PNG, or WebP image."}), 400

    image_bytes = file.read()
    if not image_bytes:
        return jsonify({"error": "The uploaded file was empty."}), 400

    if len(image_bytes) > MAX_FILE_SIZE:
        return jsonify({"error": "The image is too large. Please upload an image under 5 MB."}), 413

    result, status_code = predict_from_image_file(image_bytes)
    return jsonify(result), status_code

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7860)
