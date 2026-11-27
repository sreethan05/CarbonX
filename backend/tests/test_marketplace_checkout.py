import unittest
from unittest.mock import MagicMock, patch

from app.main import MarketplaceBuyModel, buy_marketplace_credits


class MarketplaceCheckoutTests(unittest.TestCase):
    def setUp(self):
        client_patch = patch("app.main.db._client")
        client = client_patch.start()
        self.addCleanup(client_patch.stop)
        self.table = client.return_value.table.return_value
        self.listing = {"id": "parcel", "status": "Active", "total_credits": 2.5, "price_per_credit": 100}
        self.table.select.return_value.eq.return_value.execute.return_value.data = [self.listing]
        self.update = MagicMock()
        self.table.update.return_value = self.update
        self.update.eq.return_value = self.update

    def buy(self, credits):
        return buy_marketplace_credits(MarketplaceBuyModel(listing_id="parcel", credits=credits), {})

    def test_invalid_quantity_leaves_listing_alone(self):
        for quantity in (0, -1, 3):
            with self.subTest(quantity=quantity):
                self.assertFalse(self.buy(quantity)["success"])
        self.table.update.assert_not_called()

    def test_fractional_purchase_checks_original_inventory(self):
        self.update.execute.return_value.data = [self.listing]
        self.assertEqual(self.buy(0.5)["credits_purchased"], 0.5)
        self.assertEqual(self.table.update.call_args.args[0]["total_credits"], 2)
        self.update.eq.assert_any_call("status", "Active")
        self.update.eq.assert_any_call("total_credits", 2.5)

    def test_conflicting_sale_returns_no_certificate(self):
        self.update.execute.return_value.data = []
        result = self.buy(2.5)
        self.assertFalse(result["success"])
        self.assertNotIn("certificate_id", result)
