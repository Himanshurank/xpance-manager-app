import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import Toaster from "../../utils/toasterConfig";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  hasShownWelcome: boolean;
}

const initialState: AuthState = {
  user: null,
  session: null,
  loading: true,
  error: null,
  hasShownWelcome: false,
};

export const initializeAuth = createAsyncThunk("auth/initialize", async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
});

export const signInWithEmail = createAsyncThunk(
  "auth/signInWithEmail",
  async ({ email, password }: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        throw new Error("Invalid email or password");
      }
      throw error;
    }
    return data.session;
  }
);

export const signInWithGoogle = createAsyncThunk(
  "auth/signInWithGoogle",
  async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        skipBrowserRedirect: false,
        redirectTo: "http://localhost:8081/home",
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) throw error;
    return data;
  }
);

export const signOut = createAsyncThunk("auth/signOut", async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
});

export const updateUserMetadata = createAsyncThunk(
  "auth/updateUserMetadata",
  async (metadata: any, { dispatch }) => {
    const { data, error } = await supabase.auth.updateUser({
      data: metadata,
    });
    if (error) throw error;

    dispatch(updateUser(metadata));
    return data.user;
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession: (state, action) => {
      state.session = action.payload;
      state.user = action.payload?.user ?? null;
      state.loading = false;
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = {
          ...state.user,
          user_metadata: {
            ...state.user.user_metadata,
            ...action.payload,
          },
        };
      }
    },
    showWelcomeMessage: (state) => {
      if (!state.hasShownWelcome && state.user) {
        Toaster({
          type: "success",
          text1: "Welcome",
          text2: `Hello, ${state.user.user_metadata.name || "User"}!`,
        });
        state.hasShownWelcome = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.session = action.payload;
        state.user = action.payload?.user ?? null;
        state.loading = false;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to initialize auth";
      })
      .addCase(signInWithEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInWithEmail.fulfilled, (state, action) => {
        state.session = action.payload;
        state.user = action.payload?.user ?? null;
        state.loading = false;
        state.error = null;
      })
      .addCase(signInWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to sign in";
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.session = null;
        state.error = null;
        Toaster({
          type: "success",
          text1: "Signed out",
          text2: "Come back soon!",
        });
      })
      .addCase(signOut.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to sign out";
        Toaster({
          type: "error",
          text1: "Error",
          text2: state.error,
        });
      })
      .addCase(updateUserMetadata.fulfilled, (state, action) => {
        if (state.user) {
          state.user.user_metadata = {
            ...state.user.user_metadata,
            ...action.payload.user_metadata,
          };
        }
      });
  },
});

export const { setSession, updateUser, showWelcomeMessage } = authSlice.actions;
export default authSlice.reducer;
