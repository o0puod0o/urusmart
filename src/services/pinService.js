import * as SecureStore from "expo-secure-store";
import { SECURE_KEYS } from "../config";

export const savePin = (pin) =>
  SecureStore.setItemAsync(SECURE_KEYS.PIN, pin);

export const getPin = () =>
  SecureStore.getItemAsync(SECURE_KEYS.PIN);

export const verifyPin = async (pin) => {
  const stored = await getPin();
  return stored !== null && stored === pin;
};

export const hasPin = async () => {
  const pin = await getPin();
  return pin !== null && pin !== "";
};

export const clearPin = () =>
  SecureStore.deleteItemAsync(SECURE_KEYS.PIN);
