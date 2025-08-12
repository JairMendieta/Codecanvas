"use client";

import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export const logout = async () => {
  await signOut(auth);
};
