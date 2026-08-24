import api from "./api";
import { LRD_API_BASE_URL } from "../config";

const lrdUrl = (path) => `${LRD_API_BASE_URL.replace(/\/$/, "")}${path}`;

const withLrdConfig = (config = {}) => ({
  ...config,
  suppressAuthRedirect: config.suppressAuthRedirect ?? true,
});

export const LRD_ENDPOINTS = {
  session: "/api/info/session",
  register: "/api/info/lrd/researcher/register",
  faculties: "/api/info/lrd/facultys",
  branches: "/api/info/lrd/branchs",
  paperIndexes: "/api/info/lrd/paperindexs",
  projects: "/api/info/lrd/projects",
  papers: "/api/info/lrd/papers",
  researcherMe: "/api/info/lrd/researcher/me",
  educations: "/api/info/lrd/researcher/me/educations",
  expertises: "/api/info/lrd/researcher/me/expertises",
};

export const getLrd = (path, config) => api.get(lrdUrl(path), withLrdConfig(config));
export const postLrd = (path, data, config = {}) =>
  api.post(lrdUrl(path), data, withLrdConfig(config));

export const patchLrd = (path, data, config) =>
  data instanceof FormData
    ? (() => {
        data.append("_method", "PATCH");
        return postLrd(path, data, config);
      })()
    : postLrd(path, { ...data, _method: "PATCH" }, config);
export const deleteLrd = (path, config) => postLrd(path, { _method: "DELETE" }, config);
export const registerLrdResearcher = (config) => postLrd(LRD_ENDPOINTS.register, { x: 1 }, config);

export const getLrdErrorMessage = (error, fallback = "เชื่อมต่อ LRD ไม่สำเร็จ") => {
  const data = error?.response?.data;
  const validationMessage = data?.errors && Object.values(data.errors).flat()[0];
  return validationMessage || data?.message || error?.message || fallback;
};
