import warnings
import os
import numpy as np

warnings.filterwarnings("ignore", category=UserWarning)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

_model = None
_feature_scaler = None
_model_loaded = False

def _load_models():
    global _model, _feature_scaler, _model_loaded
    if _model_loaded:
        return _model is not None

    try:
        import joblib
        model_path = os.path.join(BASE_DIR, "ml/models/biodiversity_model.pkl")
        scaler_path = os.path.join(BASE_DIR, "ml/models/feature_scaler.pkl")

        if not os.path.exists(model_path) or not os.path.exists(scaler_path):
            print(f"ML models not found at {model_path}")
            _model_loaded = True
            return False

        _model = joblib.load(model_path)
        _feature_scaler = joblib.load(scaler_path)
        _model_loaded = True
        print(f"ML model loaded: {type(_model).__name__}")
        return True
    except Exception as e:
        print(f"ML model load error: {e}")
        _model_loaded = True
        return False

def predict_biodiversity(ndvi: float, evi: float = None, area_ha: float = 1.0) -> dict:
    """
    Predict biodiversity score from vegetation indices.
    Returns dict with score (0-100), confidence, and status label.
    """
    if evi is None:
        evi = ndvi * 0.85

    # Feature vector matching training schema:
    # [ndvi, evi, ndre_approx, soil_adj, moisture_idx, canopy_rough, green_ndvi, red_edge]
    features = np.array([
        ndvi,
        evi,
        ndvi * 1.1,          # NDRE approximation
        min(ndvi * 0.9 + 0.1, 0.99),  # Soil-Adjusted Veg Index proxy
        evi * 0.7 + 0.1,     # Moisture index proxy
        ndvi * 0.6 + 0.15,   # Canopy roughness proxy
        ndvi * 0.95,         # Green NDVI
        ndvi * 0.85 + 0.05   # Red-edge proxy
    ]).reshape(1, -1)

    if _load_models() and _model is not None:
        try:
            scaled = _feature_scaler.transform(features)
            raw_score = float(_model.predict(scaled)[0])
            # Raw output is in 0-1 range → multiply by 100
            bio_score = round(min(max(raw_score * 100, 0), 100), 1)
            source = "ML GradientBoosting"
        except Exception as e:
            print(f"ML predict error: {e}")
            bio_score = _heuristic_score(ndvi)
            source = "Heuristic fallback"
    else:
        bio_score = _heuristic_score(ndvi)
        source = "Heuristic (model unavailable)"

    status = (
        "Excellent" if bio_score >= 80
        else "Good" if bio_score >= 60
        else "Moderate" if bio_score >= 40
        else "Low"
    )

    confidence = round(min(75 + ndvi * 30, 99.5), 1)

    return {
        "biodiversity_score": bio_score,
        "status": status,
        "confidence": confidence,
        "source": source
    }

def _heuristic_score(ndvi: float) -> float:
    """Simple NDVI-based heuristic when model is unavailable."""
    return round(min(max(ndvi * 95 + 10, 20), 96), 1)
