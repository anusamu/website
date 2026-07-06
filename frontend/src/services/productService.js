import API from "../api";

// Add Product
export const addProduct = async (formData) => {
  return await API.post("/products/add", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Get All Products (Admin)
export const getProducts = async () => {
  return await API.get("/products/admin/all");
};

// Delete Product
export const deleteProduct = async (id) => {
  return await API.delete(`/products/delete/${id}`);
};

// Change Status
export const changeStatus = async (id, status) => {
  return await API.put(`/products/status/${id}`, {
    status,
  });
};

// Update Product
export const updateProduct = async (id, formData) => {
  return await API.put(`/products/update/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};