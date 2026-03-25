from __future__ import annotations

import unittest

from doaj_metadata_dashboard.doaj_api import inject_doaj_api_key, sanitize_url


class DoajApiTests(unittest.TestCase):
    def test_inject_doaj_api_key_for_search_endpoint(self) -> None:
        url = "https://doaj.org/api/search/journals/andalas?page=1&pageSize=25"
        secured = inject_doaj_api_key(url, api_key="secret-token")
        self.assertIn("api_key=secret-token", secured)
        self.assertIn("page=1", secured)
        self.assertIn("pageSize=25", secured)

    def test_inject_doaj_api_key_skips_non_doaj_urls(self) -> None:
        url = "https://api.frankfurter.app/latest?from=USD&to=EUR"
        self.assertEqual(inject_doaj_api_key(url, api_key="secret-token"), url)

    def test_sanitize_url_masks_api_key(self) -> None:
        url = "https://doaj.org/api/search/journals/andalas?page=1&pageSize=25&api_key=secret-token"
        sanitized = sanitize_url(url)
        self.assertIn("api_key=%2A%2A%2A", sanitized)
        self.assertNotIn("secret-token", sanitized)


if __name__ == "__main__":
    unittest.main()
