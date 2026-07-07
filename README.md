# Smart Lemon Disease Predictor

Smart Lemon Disease Predictor is a web-based lemon leaf health assistant built from the open-source [Lemon Disease Detector](https://github.com/IshaqJunejo/Lemon-Disease-Detector) project by Muhammad Ishaque Junejo.

The app uses a two-model deep learning pipeline:

- A binary classifier checks whether the uploaded image appears to be a lemon leaf.
- A multi-class classifier predicts the most likely lemon leaf condition and returns confidence scores.

This version adds a redesigned user interface, prediction confidence, disease information, treatment suggestions, and clearer error handling around uploads and API failures.

## Features

- Lemon leaf disease prediction from an uploaded image
- Prediction confidence and top class probability breakdown
- Disease descriptions and practical treatment suggestions
- Drag-and-drop image upload with file type and size validation
- Friendly API and frontend error messages
- Responsive UI for desktop and mobile use

## Supported Classes

- Anthracnose
- Bacterial Blight
- Citrus Canker
- Curl Virus
- Deficiency Leaf
- Dry Leaf
- Healthy Leaf
- Sooty Mould
- Spider Mites

## Screenshots

Add screenshots of the updated interface here after running the app locally.

Suggested screenshots:

- Home screen before upload
- Uploaded leaf preview
- Prediction result with confidence and treatment suggestions
- Error state for unsupported input

## Project Structure

```text
api/                 Flask prediction API
core/                Training, evaluation, and reproducibility files from the original project
field-test/          Field test images and notes from the original project
Images/              Original demo and evaluation images
web/                 Static frontend client
LICENSE              Original CC BY-NC-SA 4.0 license
NOTICE               Attribution and adaptation notes
```

## Installation

Clone the repository:

```bash
git clone https://github.com/rupashiii/Smart-Lemon-Disease-Predictor.git
cd Smart-Lemon-Disease-Predictor
```

Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
```

On Windows:

```bash
python -m venv .venv
.venv\Scripts\activate
```

Install API dependencies:

```bash
pip install -r api/requirements.txt
```

## Running the App

Start the Flask prediction API:

```bash
cd api
python app.py
```

The API runs at:

```text
http://127.0.0.1:7860
```

In a second terminal, serve the frontend:

```bash
cd web
python -m http.server 8000
```

Open the frontend:

```text
http://127.0.0.1:8000
```

Upload a lemon leaf image and select **Analyze leaf**.

## Model Notes

The API downloads the trained models from Hugging Face on first use:

- `models/lemon-leaf-or-not.keras`
- `models/lemon-leaf-disease-detector.keras`

The first request may take longer while the models download and load. An internet connection is required unless the Hugging Face cache already contains the models.

## Troubleshooting

- If the frontend cannot connect, confirm the Flask API is running at `http://127.0.0.1:7860`.
- If model loading fails, check your internet connection and Hugging Face availability.
- If upload validation fails, use a JPG, PNG, or WebP image under 5 MB.
- If predictions look uncertain, retake the photo with better lighting, a single centered leaf, and a plain background.

## Attribution

This repository is adapted from:

- Original project: [IshaqJunejo/Lemon-Disease-Detector](https://github.com/IshaqJunejo/Lemon-Disease-Detector)
- Original author: Muhammad Ishaque Junejo
- DOI: [10.5281/zenodo.19428847](https://doi.org/10.5281/zenodo.19428847)
- Hugging Face model repository: [IshaqueJunejo/Lemon-Disease-Detector](https://huggingface.co/IshaqueJunejo/Lemon-Disease-Detector)
- Hugging Face Space: [Lemon Disease Detection](https://huggingface.co/spaces/IshaqueJunejo/Lemon-Disease-Detection)

Major changes in this adaptation include UI redesign, structured prediction responses, confidence display, disease information, treatment suggestions, and improved error handling.

## Citation

If you use the original model, code, or findings in research, cite the original work:

```bibtex
@misc{junejo_2026_lemon_disease_detector,
  author       = {Junejo, Muhammad Ishaque},
  title        = {A Dual-Model Deep Learning Pipeline for Disease Classification in Lemon Leaves},
  month        = apr,
  year         = 2026,
  publisher    = {Zenodo},
  version      = {1.0},
  doi          = {10.5281/zenodo.19428847},
  url          = {https://doi.org/10.5281/zenodo.19428847},
}
```

## License

This project preserves the original Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International license. See [LICENSE](LICENSE) for the full license text.

Because this is an adaptation of the original project, redistribution and modifications should follow the original license terms, including attribution, non-commercial use, and share-alike requirements.
