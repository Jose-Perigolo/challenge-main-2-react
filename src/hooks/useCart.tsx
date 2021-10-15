import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const updatedCart = [...cart];
      const responseStock = await api.get<Stock>(`/stock/${productId}`);
      const productInCart = updatedCart.find((product) => product.id === productId);

      const currentAmount = productInCart ? productInCart.amount : 0;
      const newAmount = currentAmount + 1;

      if (newAmount > responseStock.data.amount) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }

      if (productInCart) {
        productInCart.amount = newAmount;
      } else {
        const responseProducts = await api.get(`/products/${productId}`);
        const newProduct = { ...responseProducts.data, amount: 1 };
        updatedCart.push(newProduct);
      }

      setCart(updatedCart);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updatedCart = [...cart];
      const removeFromCart = updatedCart.map((product) => product.id).indexOf(productId);

      if (removeFromCart >= 0) {
        updatedCart.splice(removeFromCart, 1);
      } else {
        throw new Error();
      }

      setCart(updatedCart);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({ productId, amount }: UpdateProductAmount) => {
    try {
      
      if (amount < 1) {
        return;
      }

      const updatedCart = [...cart]; //Necessário o spread operator para atualizar o estado depois

      const responseStock = await api.get<Stock>(`/stock/${productId}`);

      const productInCart = updatedCart.find((product) => product.id === productId);

      if (amount > responseStock.data.amount) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }
      
      if (productInCart) {
        productInCart.amount = amount;
        //Se updatedCart = cart sem o spread operator, a função setCart estaria recebendo cart (setCart(cart) === setCart(updatedCart)) e o DOM não iria atualizar
        setCart(updatedCart); 
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
      }

    } catch {
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  return (
    <CartContext.Provider value={{ cart, addProduct, removeProduct, updateProductAmount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
