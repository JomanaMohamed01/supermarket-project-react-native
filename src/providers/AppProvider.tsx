import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/data/catalog";
import { getSupabase, hasSupabaseEnv } from "@/lib/supabase";
import type { Category, Product, Profile } from "@/lib/types";

type CartRow = {
  id: string;
  quantity: number;
  product: Product;
};

type SignupInput = {
  fullName: string;
  phone: string;
  address: string;
  email: string;
  password: string;
  avatarUri?: string | null;
};

type AppContextValue = {
  ready: boolean;
  usingMockData: boolean;
  user: Profile | null;
  categories: Category[];
  products: Product[];
  cartItems: CartRow[];
  cartCount: number;
  welcomeName: string | null;
  clearWelcome: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignupInput) => Promise<void>;
  signOut: () => Promise<void>;
  addToCart: (productId: string) => Promise<void>;
  updateCartQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  placeOrder: () => Promise<{ orderId: string; total: number }>;
  updateAddress: (address: string) => Promise<void>;
  updateAvatar: (uri: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  getCategory: (id: string) => Category | undefined;
  getProductsByCategory: (categoryId: string) => Product[];
};

const STORAGE_USER = "freshlane_user";
const STORAGE_CART = "freshlane_cart";
const STORAGE_USERS = "freshlane_users";

const AppContext = createContext<AppContextValue | null>(null);

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<Profile | null>(null);
  const [cartItems, setCartItems] = useState<CartRow[]>([]);
  const [welcomeName, setWelcomeName] = useState<string | null>(null);
  const [categories] = useState<Category[]>(MOCK_CATEGORIES);
  const [products] = useState<Product[]>(MOCK_PRODUCTS);

  const usingMockData = !hasSupabaseEnv();

  useEffect(() => {
    async function hydrate() {
      try {
        const supabase = getSupabase();
        if (supabase) {
          // Supabase is connected — session hydration will be wired next.
          // For now fall through to local storage so UI still works.
        }

        const [rawUser, rawCart] = await Promise.all([
          AsyncStorage.getItem(STORAGE_USER),
          AsyncStorage.getItem(STORAGE_CART),
        ]);

        if (rawUser) {
          setUser(JSON.parse(rawUser) as Profile);
        }
        if (rawCart) {
          setCartItems(JSON.parse(rawCart) as CartRow[]);
        }
      } finally {
        setReady(true);
      }
    }

    void hydrate();
  }, []);

  const persistUser = useCallback(async (next: Profile | null) => {
    setUser(next);
    if (next) {
      await AsyncStorage.setItem(STORAGE_USER, JSON.stringify(next));
    } else {
      await AsyncStorage.removeItem(STORAGE_USER);
    }
  }, []);

  const persistCart = useCallback(async (next: CartRow[]) => {
    setCartItems(next);
    await AsyncStorage.setItem(STORAGE_CART, JSON.stringify(next));
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const supabase = getSupabase();
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        const authUser = data.user;
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, phone, address, avatar_url")
          .eq("id", authUser.id)
          .maybeSingle();

        const next: Profile = {
          id: authUser.id,
          email: authUser.email ?? email,
          full_name:
            profile?.full_name ??
            (typeof authUser.user_metadata?.full_name === "string"
              ? authUser.user_metadata.full_name
              : null),
          phone: profile?.phone ?? null,
          address: profile?.address ?? null,
          avatar_url: profile?.avatar_url ?? null,
        };

        await persistUser(next);
        setWelcomeName(
          (next.full_name?.trim() || next.email.split("@")[0] || "").split(
            /\s+/,
          )[0] || null,
        );
        return;
      }

      // Local mock auth (until Supabase is connected)
      const rawUsers = await AsyncStorage.getItem(STORAGE_USERS);
      const users = rawUsers ? (JSON.parse(rawUsers) as Array<Profile & { password: string }>) : [];
      const found = users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
      );
      if (!found) {
        throw new Error("Invalid login credentials");
      }

      const { password: _pw, ...profile } = found;
      await persistUser(profile);
      setWelcomeName(
        (profile.full_name?.trim() || profile.email.split("@")[0] || "").split(
          /\s+/,
        )[0] || null,
      );
    },
    [persistUser],
  );

  const signUp = useCallback(
    async (input: SignupInput) => {
      const supabase = getSupabase();
      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: input.email,
          password: input.password,
          options: { data: { full_name: input.fullName } },
        });
        if (error) throw error;
        if (!data.user) throw new Error("Could not create account");

        let avatarUrl: string | null = input.avatarUri ?? null;

        if (input.avatarUri && data.session) {
          // Avatar upload to Supabase storage can be wired when connecting.
          avatarUrl = input.avatarUri;
        }

        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: input.fullName.trim(),
          phone: input.phone.trim(),
          address: input.address.trim(),
          ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
        });

        await persistUser({
          id: data.user.id,
          email: input.email.trim(),
          full_name: input.fullName.trim(),
          phone: input.phone.trim(),
          address: input.address.trim(),
          avatar_url: avatarUrl,
        });
        return;
      }

      const rawUsers = await AsyncStorage.getItem(STORAGE_USERS);
      const users = rawUsers
        ? (JSON.parse(rawUsers) as Array<Profile & { password: string }>)
        : [];

      if (users.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase())) {
        throw new Error("An account with this email already exists");
      }

      const profile: Profile & { password: string } = {
        id: makeId("user"),
        email: input.email.trim(),
        full_name: input.fullName.trim(),
        phone: input.phone.trim(),
        address: input.address.trim(),
        avatar_url: input.avatarUri ?? null,
        password: input.password,
      };

      users.push(profile);
      await AsyncStorage.setItem(STORAGE_USERS, JSON.stringify(users));

      const { password: _pw, ...safe } = profile;
      await persistUser(safe);
    },
    [persistUser],
  );

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    await persistUser(null);
    await persistCart([]);
  }, [persistCart, persistUser]);

  const addToCart = useCallback(
    async (productId: string) => {
      if (!user) throw new Error("Please sign in first");

      const product = products.find((p) => p.id === productId);
      if (!product) throw new Error("Product not found");

      const supabase = getSupabase();
      if (supabase) {
        const { data: existing, error: existingError } = await supabase
          .from("cart_items")
          .select("id, quantity")
          .eq("user_id", user.id)
          .eq("product_id", productId)
          .maybeSingle();
        if (existingError) throw existingError;

        if (existing) {
          const { error } = await supabase
            .from("cart_items")
            .update({ quantity: existing.quantity + 1 })
            .eq("id", existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("cart_items").insert({
            user_id: user.id,
            product_id: productId,
            quantity: 1,
          });
          if (error) throw error;
        }
      }

      const existingLocal = cartItems.find((item) => item.product.id === productId);
      if (existingLocal) {
        await persistCart(
          cartItems.map((item) =>
            item.product.id === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        );
      } else {
        await persistCart([
          ...cartItems,
          { id: makeId("cart"), quantity: 1, product },
        ]);
      }
    },
    [cartItems, persistCart, products, user],
  );

  const updateCartQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      if (quantity < 1) {
        await persistCart(cartItems.filter((item) => item.id !== cartItemId));
        return;
      }

      const supabase = getSupabase();
      if (supabase) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity })
          .eq("id", cartItemId);
        if (error) throw error;
      }

      await persistCart(
        cartItems.map((item) =>
          item.id === cartItemId ? { ...item, quantity } : item,
        ),
      );
    },
    [cartItems, persistCart],
  );

  const removeFromCart = useCallback(
    async (cartItemId: string) => {
      const supabase = getSupabase();
      if (supabase) {
        const { error } = await supabase
          .from("cart_items")
          .delete()
          .eq("id", cartItemId);
        if (error) throw error;
      }

      await persistCart(cartItems.filter((item) => item.id !== cartItemId));
    },
    [cartItems, persistCart],
  );

  const placeOrder = useCallback(async () => {
    if (!user) throw new Error("Please sign in first");
    if (cartItems.length === 0) throw new Error("Your cart is empty.");

    const total = cartItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    );

    const supabase = getSupabase();
    if (supabase) {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          status: "pending",
          total_amount: total,
        })
        .select("id")
        .single();
      if (orderError) throw orderError;

      const orderItems = cartItems.map((item) => {
        const unitPrice = Number(item.product.price);
        return {
          order_id: order.id,
          product_id: item.product.id,
          product_name: item.product.name,
          unit_price: unitPrice,
          quantity: item.quantity,
          line_total: unitPrice * item.quantity,
        };
      });

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);
      if (itemsError) throw itemsError;

      const { error: clearError } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);
      if (clearError) throw clearError;

      await persistCart([]);
      return { orderId: order.id as string, total };
    }

    const orderId = makeId("order");
    await persistCart([]);
    return { orderId, total };
  }, [cartItems, persistCart, user]);

  const updateAddress = useCallback(
    async (address: string) => {
      if (!user) throw new Error("Please sign in first");

      const supabase = getSupabase();
      if (supabase) {
        const { error } = await supabase
          .from("profiles")
          .update({ address: address.trim() })
          .eq("id", user.id);
        if (error) throw error;
      }

      await persistUser({ ...user, address: address.trim() });
    },
    [persistUser, user],
  );

  const updateAvatar = useCallback(
    async (uri: string) => {
      if (!user) throw new Error("Please sign in first");

      const supabase = getSupabase();
      if (supabase) {
        // Upload to avatars bucket when connecting Supabase storage.
        const { error } = await supabase
          .from("profiles")
          .update({ avatar_url: uri })
          .eq("id", user.id);
        if (error) throw error;
      }

      // Also update local users registry for mock mode
      const rawUsers = await AsyncStorage.getItem(STORAGE_USERS);
      if (rawUsers) {
        const users = JSON.parse(rawUsers) as Array<Profile & { password: string }>;
        const nextUsers = users.map((u) =>
          u.id === user.id ? { ...u, avatar_url: uri } : u,
        );
        await AsyncStorage.setItem(STORAGE_USERS, JSON.stringify(nextUsers));
      }

      await persistUser({ ...user, avatar_url: uri });
    },
    [persistUser, user],
  );

  const deleteAccount = useCallback(async () => {
    if (!user) return;

    const supabase = getSupabase();
    if (supabase) {
      // Account deletion API can be wired when connecting Supabase.
      await supabase.auth.signOut();
    }

    const rawUsers = await AsyncStorage.getItem(STORAGE_USERS);
    if (rawUsers) {
      const users = JSON.parse(rawUsers) as Array<Profile & { password: string }>;
      await AsyncStorage.setItem(
        STORAGE_USERS,
        JSON.stringify(users.filter((u) => u.id !== user.id)),
      );
    }

    await persistUser(null);
    await persistCart([]);
  }, [persistCart, persistUser, user]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      usingMockData,
      user,
      categories,
      products,
      cartItems,
      cartCount,
      welcomeName,
      clearWelcome: () => setWelcomeName(null),
      signIn,
      signUp,
      signOut,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      placeOrder,
      updateAddress,
      updateAvatar,
      deleteAccount,
      getCategory: (id) => categories.find((c) => c.id === id),
      getProductsByCategory: (categoryId) =>
        products
          .filter((p) => p.category_id === categoryId)
          .sort((a, b) => a.name.localeCompare(b.name)),
    }),
    [
      ready,
      usingMockData,
      user,
      categories,
      products,
      cartItems,
      cartCount,
      welcomeName,
      signIn,
      signUp,
      signOut,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      placeOrder,
      updateAddress,
      updateAvatar,
      deleteAccount,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within AppProvider");
  }
  return ctx;
}
