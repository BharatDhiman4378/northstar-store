
import requests

PRODUCT_SERVICE_URL = "http://127.0.0.1:8002/api/products"


class ProductServiceError(Exception):
    pass


def get_product(product_id):
    url = f"{PRODUCT_SERVICE_URL}/{product_id}/"

    try:
        response = requests.get(url, timeout=(3, 5))
    except requests.RequestException as exc:
        raise ProductServiceError(
            "The Product Service is unavailable. Please try again."
        ) from exc

    if response.status_code == 404:
        return None

    if response.status_code != 200:
        raise ProductServiceError(
            "The Product Service could not validate this product."
        )

    try:
        product = response.json()
    except ValueError as exc:
        raise ProductServiceError(
            "The Product Service returned an invalid response."
        ) from exc

    required_fields = {"id", "stock_quantity", "price", "is_active"}

    if not required_fields.issubset(product):
        raise ProductServiceError(
            "The Product Service response is missing required fields."
        )

    return product
