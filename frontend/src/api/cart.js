
import authenticatedApi from "../api/Authenticated";

const CART_BASE_URL = "http://127.0.0.1:8003/api/cart/";

export const getMyCart = async () => {
  const response = await authenticatedApi.get(
    `${CART_BASE_URL}my-cart/`
  );
  return response.data;
};

export const addToCartApi = async (productId, quantity = 1) => {
  const response = await authenticatedApi.post(
    `${CART_BASE_URL}my-cart/`,
    {
      product_id: productId,
      quantity,
    }
  );
  return response.data;
};

export const updateCartItemApi = async (itemId, quantity) => {
  const response = await authenticatedApi.patch(
    `${CART_BASE_URL}items/${itemId}/`,
    { quantity }
  );
  return response.data;
};

export const removeCartItemApi = async (itemId) => {
  await authenticatedApi.delete(
    `${CART_BASE_URL}items/${itemId}/`
  );
};
