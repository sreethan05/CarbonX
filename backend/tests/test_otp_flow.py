import os
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from app import redis_store
from app.main import app


class TestOtpFlow(unittest.TestCase):
    def setUp(self):
        os.environ["TEXTPLATE_API_TOKEN"] = "test"
        os.environ["TEXTPLATE_TEMPLATE_ID"] = "test"
        self.client = TestClient(app)
        self.phone = "9876543210"
        redis_store.clear_otp(self.phone)

    def tearDown(self):
        redis_store.clear_otp(self.phone)

    def test_send_and_verify_accepts_formatted_indian_phone(self):
        send_res = self.client.post("/send-otp", json={"phone": "+91 98765-43210"})
        self.assertEqual(send_res.status_code, 200)
        send_data = send_res.json()
        self.assertTrue(send_data.get("success"))
        otp = send_data.get("dev_otp")
        self.assertRegex(otp, r"^\d{6}$")

        verify_res = self.client.post(
            "/register/verify-otp",
            json={"phone": "9876543210", "otp": otp},
        )
        self.assertEqual(verify_res.status_code, 200)
        self.assertTrue(verify_res.json().get("success"))

    def test_fpo_login_verifies_otp_without_farmer_profile(self):
        send_res = self.client.post("/send-otp", json={"phone": self.phone})
        otp = send_res.json().get("dev_otp")

        login_res = self.client.post(
            "/fpo/login",
            json={
                "phone": self.phone,
                "fpo_name": "Yaadadri Laxmi Narsimha Farmers Producer Company (Mothkur)",
                "otp": otp,
            },
        )
        self.assertEqual(login_res.status_code, 200)
        login_data = login_res.json()
        self.assertTrue(login_data.get("success"))
        self.assertEqual(login_data.get("user", {}).get("role"), "fpo")
        self.assertTrue(login_data.get("token"))

    def test_provider_failure_clears_stale_otp(self):
        redis_store.store_otp(self.phone, "111111")
        with (
            patch("app.main.generate_otp", return_value="222222"),
            patch("app.main.send_phone_otp", return_value=(False, "provider rejected")),
            patch("app.main._sms_ready", return_value=True),
        ):
            send_res = self.client.post("/send-otp", json={"phone": self.phone})

        self.assertEqual(send_res.status_code, 200)
        self.assertFalse(send_res.json().get("success"))

        verify_res = self.client.post(
            "/register/verify-otp",
            json={"phone": self.phone, "otp": "111111"},
        )
        self.assertFalse(verify_res.json().get("success"))


if __name__ == "__main__":
    unittest.main()
