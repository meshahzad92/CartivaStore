"""PostEx courier API service."""

from __future__ import annotations

import logging
from typing import Any

import requests

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def _headers(token_override: str | None = None) -> dict[str, str]:
    token = token_override or get_settings().POSTEX_API_KEY
    return {
        "token": token,
        "Content-Type": "application/json",
    }


def _base() -> str:
    return get_settings().POSTEX_BASE_URL


def create_postex_order(order: dict, token_override: str | None = None) -> dict[str, Any]:
    """
    Send a single order to the PostEx API.

    Expected order dict fields:
      id, total_amount, full_name, phone, address, city, notes, items (list)

    Returns the raw PostEx JSON response.
    Raises requests.RequestException on network failure.
    """
    item_count = len(order.get("items", [])) or 1

    payload = {
        "orderRefNumber": str(order["id"]),
        "invoicePayment": int(round(order["total_amount"])),
        "orderDetail": order.get("notes") or "Order from Cartiva Store",
        "customerName": order["full_name"],
        "customerPhone": order["phone"],
        "deliveryAddress": order["address"],
        "cityName": order["city"],
        "invoiceDivision": 1,
        "items": item_count,
        "orderType": "Normal",
    }

    url = f"{_base()}/create-order"
    try:
        resp = requests.post(url, json=payload, headers=_headers(token_override), timeout=15)
        resp.raise_for_status()
        return resp.json()
    except requests.Timeout:
        logger.error("PostEx create-order timeout for order %s", order["id"])
        raise
    except requests.HTTPError as exc:
        logger.error("PostEx HTTP error %s for order %s: %s", exc.response.status_code, order["id"], exc.response.text)
        raise


def track_postex_order(tracking_number: str) -> dict[str, Any]:
    """
    Fetch tracking info for a given PostEx tracking number.
    Returns the raw PostEx JSON response.
    """
    url = f"https://api.postex.pk/services/integration/api/order/v3/tracking/{tracking_number}"
    try:
        resp = requests.get(url, headers=_headers(), timeout=10)
        resp.raise_for_status()
        return resp.json()
    except requests.Timeout:
        logger.error("PostEx track timeout for %s", tracking_number)
        raise
    except requests.HTTPError as exc:
        logger.error("PostEx track HTTP error for %s: %s", tracking_number, exc.response.text)
        raise
