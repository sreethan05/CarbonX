from app.services.pahani_parser import parse_pahani


def test_parse_pahani_returns_only_essential_fields():
    azure_result = {
        "content": "Document No: DOC-123\nDate of Issue: 01-01-2024\n",
        "pages": [
            {
                "lines": [
                    {"content": "Village: Malkajgiri"},
                    {"content": "Mandal: Medchal"},
                    {"content": "District: Hyderabad"},
                    {"content": "Survey No: 124/A"},
                    {"content": "Pattadar Name: Hasini"},
                    {"content": "Aadhaar: 1234-5678-9012"},
                    {"content": "Extent: 2.5 acres"},
                    {"content": "Crop: Rice"},
                    {"content": "Irrigation: Canal"},
                ]
            }
        ],
        "tables": [
            {
                "cells": [
                    {"row_index": 0, "column_index": 0, "content": "Village"},
                    {"row_index": 0, "column_index": 1, "content": "Malkajgiri"},
                    {"row_index": 1, "column_index": 0, "content": "District"},
                    {"row_index": 1, "column_index": 1, "content": "Hyderabad"},
                    {"row_index": 2, "column_index": 0, "content": "Survey No"},
                    {"row_index": 2, "column_index": 1, "content": "124/A"},
                    {"row_index": 3, "column_index": 0, "content": "Pattadar Name"},
                    {"row_index": 3, "column_index": 1, "content": "Hasini"},
                    {"row_index": 4, "column_index": 0, "content": "Aadhaar"},
                    {"row_index": 4, "column_index": 1, "content": "1234-5678-9012"},
                    {"row_index": 5, "column_index": 0, "content": "Extent"},
                    {"row_index": 5, "column_index": 1, "content": "2.5 acres"},
                    {"row_index": 6, "column_index": 0, "content": "Crop"},
                    {"row_index": 6, "column_index": 1, "content": "Rice"},
                    {"row_index": 7, "column_index": 0, "content": "Irrigation"},
                    {"row_index": 7, "column_index": 1, "content": "Canal"},
                ]
            }
        ],
    }

    parsed = parse_pahani(azure_result)
    fields = parsed["fields"]

    expected_keys = {
        "document_no",
        "date_of_issue",
        "survey_no",
        "village",
        "district",
        "mandal",
        "extent_acres",
        "extent_hectares",
        "pattadar_name",
        "aadhaar",
        "crop_name",
        "irrigation_source",
        "boundary_coords",
        "remarks",
    }

    assert set(fields.keys()) == expected_keys
    assert fields["survey_no"] == "124/A"
    assert fields["pattadar_name"] == "Hasini"
    assert fields["aadhaar"] == "1234-5678-9012"
