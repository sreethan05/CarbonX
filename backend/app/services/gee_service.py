import ee

ee.Initialize(project="carbonsetu-496709")

def get_satellite_features(longitude, latitude):
    point = ee.Geometry.Point([longitude, latitude])

    image = (
        ee.ImageCollection("COPERNICUS/S2_SR")
        .filterBounds(point)
        .filterDate("2024-01-01", "2024-12-31")
        .sort("CLOUDY_PIXEL_PERCENTAGE")
        .first()
    )

    ndvi = image.normalizedDifference(["B8", "B4"])

    ndvi_value = ndvi.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=point,
        scale=10
    ).getInfo()

    nd = ndvi_value.get("nd", 0.3)

    features = [
        nd,
        nd * 0.9,
        nd * 1.1,
        0.8,
        0.4,
        0.3,
        0.9,
        0.2
    ]

    return features