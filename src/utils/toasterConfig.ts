import Toast, { ToastShowParams } from "react-native-toast-message";

export default function Toaster(params: ToastShowParams) {
  return Toast.show({
    ...params,
    position: "top",
    topOffset: 50,
    text1Style: {
      fontSize: 16,
      fontWeight: "bold",
    },
    text2Style: {
      fontSize: 14,
    },
  });
}
