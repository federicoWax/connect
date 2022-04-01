import { User, onIdTokenChanged } from "firebase/auth";
import { auth } from "../../firebase";

export const baseUrl = "https://us-central1-connect-4dee9.cloudfunctions.net/api/";

const getCurrentToken = () => new Promise<string>((resolve, reject) => {
  const uns = onIdTokenChanged(auth, async (user: User | null) => {
    uns();

    if (user) {
      const token = await user.getIdToken();
      resolve(token);
      return;
    }

    reject("");
  }, reject);
});

const getHeaders = (token: string) => ({
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Authorization": `Bearer ${token}`,
});

export const post = async (url: string, body: any) => {
  const token = await getCurrentToken();

  const response = await fetch(baseUrl + url, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(body)
  });

  return response.json();
}