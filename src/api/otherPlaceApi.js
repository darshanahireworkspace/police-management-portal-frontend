import API from "./axios";

export const createOtherPlace = (data) => {
  return API.post("/other-places", data);
};

export const getOtherPlaces = () => {
  return API.get("/other-places");
};

export const getSingleOtherPlace = (id) => {
  return API.get(`/other-places/${id}`);
};

export const updateOtherPlace = (id, data) => {
  return API.put(`/other-places/${id}`, data);
};

export const deleteOtherPlace = (id) => {
  return API.delete(`/other-places/${id}`);
};