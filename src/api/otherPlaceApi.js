import API from "./axios";

export const createOtherPlace = (data) => {
  return API.post("/other-places", data);
};

export const getOtherPlaces = () => {
  return API.get("/other-places");
};

export const deleteOtherPlace = (id) => {
  return API.delete(`/other-places/${id}`);
};