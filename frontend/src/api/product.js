
import axios from "axios";

const productApi = axios.create({
  baseURL: "http://127.0.0.1:8002/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function getProducts(params = {}) {
  const response = await productApi.get("products/", { params });
  return response.data;
}

export async function getCategories() {
  const response = await productApi.get("categories/");
  return response.data;
}

export async function getProductById(id) {
  const response = await productApi.get(`products/${id}/`);
  return response.data;
}