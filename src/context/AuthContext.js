"use client";

import {
  createContext,
  useEffect,
  useState,
} from "react";

import api from "@/lib/api";

export const AuthContext =
  createContext();

export function AuthProvider({
  children,
}) {

  const [user, setUser] =
    useState(null);

  const [permissions, setPermissions] =
    useState([]);

  const [roles, setRoles] =
    useState([]);

  const [ready, setReady] =
    useState(false);

  // LOAD USER
  const loadUser = async () => {

    const token =
      localStorage.getItem("token");

    if (!token) {

      setUser(null);

      setPermissions([]);

      setRoles([]);

      setReady(true);

      return;
    }

    api.defaults.headers.common.Authorization =
      `Bearer ${token}`;

    try {

      const res =
        await api.get("/me");

      setUser(res.data.user);

      setPermissions(
        res.data.permissions || []
      );

      setRoles(
        res.data.roles || []
      );

    } catch (err) {

      console.log(
        "AUTH ERROR:",
        err?.response?.data ||
        err.message
      );

      localStorage.removeItem("token");

      setUser(null);

      setPermissions([]);

      setRoles([]);

    } finally {

      setReady(true);
    }
  };

  // APP START
  useEffect(() => {

    loadUser();

  }, []);

  // REFRESH
  const refreshUser = async () => {

    setReady(false);

    await loadUser();
  };

  // SUPER ADMIN
  const isSuperAdmin =
    roles.includes("Super Admin");

  // CAN CHECK
  const can = (permission) => {

    if (!user) return false;

    if (isSuperAdmin) return true;

    return permissions.includes(
      permission
    );
  };

  return (

    <AuthContext.Provider
      value={{

        user,

        roles,

        permissions,

        ready,

        can,

        isSuperAdmin,

        loadUser,

        refreshUser,
      }}
    >

      {children}

    </AuthContext.Provider>
  );
}